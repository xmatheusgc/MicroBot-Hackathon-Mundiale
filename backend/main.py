from fastapi import FastAPI, Body, WebSocket, WebSocketDisconnect, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Set
import google.generativeai as genai
import os
from dotenv import load_dotenv
from controllers import auth_controller
import uuid
from controllers.auth_dependencies import get_current_user
from typing import Optional
from models.chat_db import ChatDB
from models.message_db import MessageDB
from database import SessionLocal
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Gemini API key not found")

ia_status = {}
websocket_connections: Set[WebSocket] = set()

genai.configure(api_key=GEMINI_API_KEY)

system_instruction = """
Você é o MicroBot, o assistente virtual oficial da empresa Mundiale. Seu papel é atender usuários com empatia, clareza e simpatia, sempre focando exclusivamente em temas relacionados à Mundiale — como serviços, suporte, atendimento ao cliente e informações institucionais.

Use sempre português do Brasil, com um tom natural, leve e humano — como se fosse um atendente cordial e prestativo. Evite formalidade excessiva e linguagem robótica. Fale de forma simples, objetiva e acolhedora.

Siga cuidadosamente estas diretrizes:

- Nunca mencione que você é uma inteligência artificial.
- Nunca responda perguntas que não estejam relacionadas à Mundiale. Se isso acontecer, responda com educação e oriente o usuário a focar em assuntos da empresa.
- Não forneça informações sobre outras empresas, pessoas públicas, notícias, eventos históricos, curiosidades ou qualquer tema fora do universo da Mundiale.
- Dê preferência a respostas curtas e diretas quando o assunto for simples ou já conhecido, sem parecer fria ou apressada. Em perguntas mais complexas, seja claro e completo.
- Varie suas saudações e despedidas para soar mais natural e próximo.
- Evite respostas genéricas. Mostre atenção e interesse real na dúvida do usuário.
- Sempre que possível, finalize as respostas com uma mensagem gentil, agradecendo o contato ou se colocando à disposição.

Seu objetivo é oferecer uma experiência de atendimento clara, útil, acolhedora e eficiente para quem busca informações sobre a Mundiale.
"""

model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_instruction)

app = FastAPI()

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_controller.router)

class ChatRequest(BaseModel):
    chatId: Optional[str] = None
    prompt: str
    history: List[Dict[str, Any]] = []

@app.options("/chat")
async def chat_options(request: Request):
    return {}

@app.post("/set-ia-status")
async def set_ia_status(chatId: str = Body(...), iaOn: bool = Body(...)):
    ia_status[chatId] = iaOn
    return {"status": "ok", "iaOn": iaOn}

@app.get("/get-ia-status")
async def get_ia_status(chatId: str):
    return {"iaOn": ia_status.get(chatId, True)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_connections.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_connections.remove(websocket)

def notify_clients(message: dict):
    for ws in list(websocket_connections):
        try:
            import asyncio
            asyncio.create_task(ws.send_json(message))
        except Exception:
            pass

@app.post("/chat")
async def chat(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    chat_id = req.chatId or str(uuid.uuid4())
    prompt = req.prompt

    if not prompt:
        db.close()
        return {"error": "Prompt vazio."}

    # Busca ou cria o chat no banco
    chat = db.query(ChatDB).filter_by(id=chat_id, closed=False).first()
    if not chat:
        chat = ChatDB(
            id=chat_id,
            user_id=None, 
            username=current_user["username"],
            last_message=prompt,
            last_message_time=datetime.utcnow(),
            online=True,
            closed=False
        )
        db.add(chat)
        db.commit()
        notify_clients({"type": "new_chat", "chatId": chat_id})
    else:
        chat.last_message = prompt
        chat.last_message_time = datetime.utcnow()
        chat.online = True
        db.commit()

    user_msg = MessageDB(
        chat_id=chat_id,
        role="user",
        text=prompt
    )
    db.add(user_msg)
    db.commit()
    notify_clients({"type": "new_message", "chatId": chat_id})

    if not ia_status.get(chat_id, True):
        db.close()
        return {"result": "Aguarde, um atendente irá responder em instantes.", "chatId": chat_id}

    try:
        response = model.generate_content(prompt)
        result = response.text
        ia_msg = MessageDB(
            chat_id=chat_id,
            role="model",
            text=result
        )
        db.add(ia_msg)
        db.commit()
        notify_clients({"type": "new_message", "chatId": chat_id})
        db.close()
        return {"result": result, "chatId": chat_id}
    except Exception as e:
        db.close()
        print("Erro ao chamar Gemini:", e)
        return {"error": f"Erro ao chamar Gemini: {e}", "chatId": chat_id}

@app.get("/chats")
async def list_chats(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    if current_user["role"] in ["admin", "funcionario"]:
        chats = (
            db.query(ChatDB)
            .options(joinedload(ChatDB.messages))
            .filter(ChatDB.closed == False)
            .all()
        )
    else:
        chats = (
            db.query(ChatDB)
            .options(joinedload(ChatDB.messages))
            .filter(ChatDB.username == current_user["username"], ChatDB.closed == False)
            .all()
        )
    result = [
        {
            "chat_id": chat.id,
            "username": chat.username,
            "last_message": chat.last_message,
            "online": chat.online,
        }
        for chat in chats if chat.messages and len(chat.messages) > 0
    ]
    db.close()
    return {"chats": result}

@app.get("/history")
async def get_history(chatId: str, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    messages = db.query(MessageDB).filter_by(chat_id=chatId).order_by(MessageDB.timestamp).all()
    history = [
        {"role": msg.role, "parts": [{"text": msg.text}]}
        for msg in messages
    ]
    db.close()
    return {"history": history}

class ManualReplyRequest(BaseModel):
    chatId: str
    message: str

@app.post("/manual-reply")
async def manual_reply(req: ManualReplyRequest):
    db = SessionLocal()
    chat_id = req.chatId
    message = req.message

    agent_msg = MessageDB(
        chat_id=chat_id,
        role="agent",
        text=message
    )
    db.add(agent_msg)
    db.commit()
    db.close()

    notify_clients({"type": "new_message", "chatId": chat_id})

    return {"status": "ok"}

@app.post("/close-chat")
async def close_chat(chatId: str = Body(...)):
    db = SessionLocal()
    chat = db.query(ChatDB).filter_by(id=chatId, closed=False).first()
    if chat:
        chat.closed = True
        db.commit()
    db.close()
    return {"status": "ok"}

def close_inactive_chats():
    db = SessionLocal()
    now = datetime.utcnow()
    timeout = timedelta(minutes=30)
    chats = db.query(ChatDB).filter_by(closed=False).all()
    for chat in chats:
        if chat.last_message_time and now - chat.last_message_time > timeout:
            chat.closed = True
    db.commit()
    db.close()
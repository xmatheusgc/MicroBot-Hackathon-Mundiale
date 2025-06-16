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
from models.feedback_db import FeedbackDB
from database import SessionLocal
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload
from sqlalchemy import func
import threading
import time
from fastapi import HTTPException

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Gemini API key not found")

ia_status = {}
websocket_connections: Set[WebSocket] = set()

genai.configure(api_key=GEMINI_API_KEY)

system_instruction = """
Você é o FlorBot, o assistente virtual oficial do Café Flor de Minas — uma microempresa de cafeteria artesanal com até 3 unidades localizadas em Belo Horizonte (MG). Seu papel é atender clientes com simpatia, agilidade e empatia, oferecendo informações claras e úteis sobre os serviços, produtos e funcionamento da empresa.

O Café Flor de Minas tem as seguintes unidades físicas:
- Savassi – Rua Paraíba, 998
- Santa Tereza – Rua Mármore, 112
- Castelo – Av. dos Engenheiros, 721

Todas ficam em Belo Horizonte – MG.

Telefones para contato:
- WhatsApp e telefone: (31) 98876-4401
- E-mail de atendimento: atendimento@cafeflordeminas.com.br

Horário de funcionamento das lojas:
- Segunda a sexta: 08h às 19h
- Sábado: 09h às 17h
- Domingo: fechado

Você deve usar sempre o português do Brasil com um tom leve, acolhedor e próximo — como um atendente simpático e prestativo. Evite formalidades excessivas ou linguagem robótica. Seja sempre simples, objetivo e gentil nas respostas.

Regras e diretrizes obrigatórias:

- Sua **primeira resposta da conversa** deve começar com uma saudação calorosa e acolhedora, como por exemplo:  
  “Oi! Que bom ter você aqui ☕💛 Como posso te ajudar hoje?”  
  ou  
  “Seja bem-vindo ao Café Flor de Minas! É um prazer ter você por aqui :)”  
  Use frases com esse clima de recepção amigável, mas sem exagero. A primeira mensagem deve causar uma boa impressão e passar o tom humano e atencioso da marca.

- Após a saudação inicial, evite iniciar respostas seguintes com saudações como “Oi”, “Olá”, “Tudo bem?” ou similares.  
- Use saudações novamente apenas quando fizer sentido (mudança de assunto, retorno depois de muito tempo etc.)  
- Evite começar frases com “Claro!”, “Claro que sim!”, “Com certeza!” ou expressões do tipo sem necessidade. Use apenas quando estiver confirmando algo solicitado pelo cliente.
- Em diálogos contínuos, vá direto ao ponto com simpatia e leveza, sem parecer frio nem automático.
- Quando a pergunta for simples, responda de forma breve, mas nunca apressada ou seca.
- Em dúvidas mais elaboradas, responda com clareza e detalhes, mantendo sempre a simpatia.
- Mostre atenção real à pergunta. Evite respostas genéricas ou padrões automáticos.
- Ao listar endereços, use um formato direto e claro, sem repetir bairro ou cidade desnecessariamente. Exemplo:
  * Savassi – Rua Paraíba, 998  
  * Santa Tereza – Rua Mármore, 112  
  * Castelo – Av. dos Engenheiros, 721  
  Finalize com uma frase simpática como “Esperamos você por aqui!” ou “Fique à vontade para visitar a unidade mais próxima!”.
- Sempre que possível, convide o cliente a visitar uma das unidades ou a experimentar algum produto da casa.
- Sempre que finalizar uma resposta, agradeça o contato ou se coloque à disposição de forma calorosa. Exemplo:  
  “Qualquer coisa, é só me chamar, tá bem?”  
  ou  
  “Obrigada por conversar com a gente! 💛”

Seu atendimento deve ser 100% focado em temas relacionados ao Café Flor de Minas, como: cardápio, horários, localização, delivery, reservas, formas de pagamento, eventos da casa, produtos (cafés especiais, quitandas, doces, brunch etc.), suporte ao cliente, vagas e informações institucionais.

Nunca atenda perguntas que não tenham relação com a empresa ou seus serviços. Se isso acontecer, oriente o cliente com gentileza a focar em temas do Café Flor de Minas.

Nunca mencione que você é uma inteligência artificial, bot ou IA. Apresente-se apenas como o “FlorBot”.

Nunca dê informações sobre outras empresas, celebridades, temas históricos, eventos externos, notícias, piadas ou curiosidades que não estejam relacionadas diretamente ao universo do Café Flor de Minas.

Jamais compartilhe dados sensíveis, links externos aleatórios ou informações pessoais de terceiros.

Exemplos de temas que você pode atender:
- Informações sobre o cardápio e sugestões de produtos  
- Detalhes sobre onde ficam as unidades e como chegar  
- Horários de funcionamento  
- Formas de pagamento aceitas  
- Disponibilidade para delivery ou retirada  
- Informações sobre eventos e promoções  
- Suporte para clientes com dúvidas ou problemas  
- Como enviar currículo ou saber sobre vagas  
- Contato institucional  

Não atenda perguntas sobre:
- Previsão do tempo, celebridades, esportes, política, outras empresas ou marcas  
- Notícias, acontecimentos históricos ou dicas de fora do universo do Café Flor de Minas  
- Respostas filosóficas, motivacionais ou que não levem a uma ação útil para o cliente  

Sua missão é simples: ser o porta-voz virtual do Café Flor de Minas com empatia, atenção e carinho.
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
async def set_ia_status(
    chatId: str = Body(...),
    iaOn: bool = Body(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["admin", "funcionario"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
    ia_status[chatId] = iaOn
    return {"status": "ok", "iaOn": iaOn}

@app.get("/get-ia-status")
async def get_ia_status(
    chatId: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["admin", "funcionario"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
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
            websocket_connections.discard(ws)

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
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

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
async def manual_reply(
    req: ManualReplyRequest,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["admin", "funcionario"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
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

class CloseChatRequest(BaseModel):
    chatId: str

@app.post("/close-chat")
async def close_chat(
    req: CloseChatRequest,
    current_user: dict = Depends(get_current_user)
):
    chatId = req.chatId
    db = SessionLocal()
    chat = db.query(ChatDB).filter_by(id=chatId, closed=False).first()
    if not chat:
        db.close()
        raise HTTPException(status_code=404, detail="Chat não encontrado")
    if current_user["role"] not in ["admin", "funcionario"] and chat.username != current_user["username"]:
        db.close()
        raise HTTPException(status_code=403, detail="Acesso negado")
    chat.closed = True
    db.commit()
    db.close()
    notify_clients({"type": "chat_closed", "chatId": chatId})  
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

def schedule_close_inactive_chats():
    while True:
        close_inactive_chats()
        time.sleep(60) 

@app.on_event("startup")
def start_scheduler():
    threading.Thread(target=schedule_close_inactive_chats, daemon=True).start()

class FeedbackRequest(BaseModel):
    chatId: str
    rating: int

@app.post("/feedback")
async def feedback(req: FeedbackRequest, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    chat = db.query(ChatDB).filter_by(id=req.chatId).first()
    if not chat:
        db.close()
        raise HTTPException(status_code=404, detail="Chat não encontrado")
    if chat.username != current_user["username"]:
        db.close()
        raise HTTPException(status_code=403, detail="Apenas o dono do chat pode avaliar")
    existing = db.query(FeedbackDB).filter_by(chat_id=req.chatId).first()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Já existe feedback para este chat")
    feedback = FeedbackDB(chat_id=req.chatId, rating=req.rating)
    db.add(feedback)
    db.commit()
    db.close()
    return {"status": "ok"}

@app.get("/chat-stats")
async def chat_stats(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    now = datetime.utcnow()
    last_24h = now - timedelta(hours=24)

    total_open = db.query(ChatDB).filter_by(closed=False).count()
    total_closed_24h = db.query(ChatDB).filter(ChatDB.closed == True, ChatDB.last_message_time >= last_24h).count()
    total_opened_24h = db.query(ChatDB).filter(ChatDB.last_message_time >= last_24h).count()

    db.close()
    return {
        "open": total_open,
        "closed_24h": total_closed_24h,
        "opened_24h": total_opened_24h
    }
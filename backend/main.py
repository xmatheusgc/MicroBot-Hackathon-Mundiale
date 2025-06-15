from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Gemini API key not found")

chat_histories: Dict[str, List[Dict[str, Any]]] = {}
ia_status = {}  # Novo: guarda se a IA está ligada/desligada por chat

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

class ChatRequest(BaseModel):
    chatId: str
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
    return {"iaOn": ia_status.get(chatId, True)}  # Padrão: ligada

@app.post("/chat")
async def chat(req: ChatRequest):
    chat_id = req.chatId
    prompt = req.prompt

    if not prompt:
        return {"error": "Prompt vazio."}

    if chat_id not in chat_histories:
        chat_histories[chat_id] = []

    chat_histories[chat_id].append({
        "role": "user",
        "parts": [{"text": prompt}]
    })

    # Só responde se a IA estiver ligada
    if not ia_status.get(chat_id, True):
        return {"result": None}

    try:
        response = model.generate_content(prompt)
        result = response.text
        chat_histories[chat_id].append({
            "role": "model",
            "parts": [{"text": result}]
        })
        return {"result": result}
    except Exception as e:
        print("Erro ao chamar Gemini:", e)
        return {"error": f"Erro ao chamar Gemini: {e}"}

@app.get("/history")
async def get_history(chatId: str):
    return {"history": chat_histories.get(chatId, [])}

class ManualReplyRequest(BaseModel):
    chatId: str
    message: str

@app.post("/manual-reply")
async def manual_reply(req: ManualReplyRequest):
    chat_id = req.chatId
    message = req.message

    if chat_id not in chat_histories:
        chat_histories[chat_id] = []

    # Salva a mensagem como agente/admin
    chat_histories[chat_id].append({
        "role": "agent",
        "parts": [{"text": message}]
    })

    return {"status": "ok"}

@app.get("/chats")
async def list_chats():
    return {"chats": list(chat_histories.keys())}

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any  # Importamos tipos para o histórico
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("Chave da API do Gemini não foi encontrada")

genai.configure(api_key=GEMINI_API_KEY)

system_instruction = """
Você é o MicroBot, um assistente virtual amigável e prestativo da empresa Mundiale. 
Seu objetivo é ajudar os usuários com suas dúvidas de forma clara e objetiva.
Sempre responda em português do Brasil. Nunca mencione que você é uma inteligência artificial.
Seja sempre educado e termine suas respostas agradecendo o contato.
"""

model = genai.GenerativeModel(
    'gemini-1.5-flash',
    system_instruction=system_instruction
)

app = FastAPI()

origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: str
    history: List[Dict[str, Any]] = []


@app.post("/processar")
async def processar_chat(request: ChatRequest):
    """
    Recebe o prompt atual e o histórico da conversa, inicia um chat
    com a IA e retorna a nova resposta.
    """
    try:
        chat_session = model.start_chat(history=request.history)
        
        response = await chat_session.send_message_async(request.prompt)

        return {"resultado": response.text}

    except Exception as e:
        print(f"Erro na API do Gemini: {e}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao processar sua mensagem com a IA.")

@app.get("/")
def read_root():
    return {"status": "Servidor de Chat FastAPI está no ar!"}
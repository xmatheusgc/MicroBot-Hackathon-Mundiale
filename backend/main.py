from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv() 
app = FastAPI()

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

@app.get("/")
def home():
    return {"message": "Olá, mundo!"}
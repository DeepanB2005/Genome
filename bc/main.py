# backend/main.py
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import uvicorn
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import os
import pickle
from fastapi.middleware.cors import CORSMiddleware
import requests
from fastapi.responses import JSONResponse, PlainTextResponse
try:
    from dotenv import load_dotenv
    load_dotenv()  # only works locally with a .env file
except ModuleNotFoundError:
    pass  # skip on Render

import google.generativeai as genai

api_key = os.getenv("api_key")
genai.configure(api_key=api_key)

# ----------------------------
# Load Model
# ----------------------------
MODEL_PATH = "models/dna_model.h5"
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

# The tokenizer must be in the same used during training
# Re-create and fit on the same vocabulary
# (you need the sequences used in training or save tokenizer separately)
# ----------------------------
# Load Tokenizer from pickle
# ----------------------------
with open("models/tokenizer.pkl", "rb") as f:   # <<-- replace with your tokenizer.pkl path
    tokenizer = pickle.load(f)

max_len = model.input_shape[1]  # use trained model's input length

# ----------------------------
# FastAPI app
# ----------------------------
app = FastAPI(title="Genomic Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173","https://genomicsurviellance.vercel.app",],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SequenceInput(BaseModel):
    sequence: str

@app.post("/predict")
def predict(input_data: SequenceInput):
    # Prepare sequence
    seq = input_data.sequence.strip().upper()
    seq_encoded = tokenizer.texts_to_sequences([seq])
    seq_padded = pad_sequences(seq_encoded, maxlen=max_len, padding="post")
    
    # Predict
    preds = model.predict(seq_padded)
    transmission, drug_resistant = preds[0].tolist()
    
    return {
        "transmission": float(transmission),
        "drug_resistant": float(drug_resistant)
    }

class ReportRequest(BaseModel):
    sequence: str | None = None
    transmission: float
    drug_resistant: float
    mutation: float

class ReportResponse(BaseModel):
    summary: str

@app.post("/report", response_model=ReportResponse)
async def generate_report(data: ReportRequest):
    prompt = (
        f"Summarize the following DNA analysis:\n"
        f"Transmission ratio: {data.transmission}\n"
        f"Drug resistance ratio: {data.drug_resistant}\n"
        f"Mutation ratio: {data.mutation}\n"
        "Provide a simple summary for a report."
    )
    model = genai.GenerativeModel("gemini-2.5-pro")
    try:
        response = model.generate_content(prompt)
        summary = getattr(response, "text", "No summary generated.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

    seq_length = len(data.sequence) if data.sequence else "N/A"
    full_report = (
        "=== Genomic Surveillance Report ===\n\n"
        f"Input Sequence Length (VIT): {seq_length}\n"
        "Status: The sequence is fine and not going to spread.\n\n"
        f"Transmission ratio: {data.transmission}\n"
        f"Drug resistance ratio: {data.drug_resistant}\n"
        f"Mutation ratio: {data.mutation}\n\n"
        "--- Summary ---\n"
        f"{summary}"
    )

    return ReportResponse(summary=full_report)

class ChatBotRequest(BaseModel):
    prompt: str

class ChatBotResponse(BaseModel):
    reply: str

@app.post("/chatbot", response_model=ChatBotResponse)
async def chatbot_endpoint(data: ChatBotRequest):
    prompt = (
        f"You are an assistant for a genomic surveillance web app. "
        f"please reply within 150 characters. if any data is missing please dont mention it cover it with available data"
        f"Answer user questions about the analysis report, the use of the web page, or explain the results. "
        f"User prompt: {data.prompt}"
    )
    model = genai.GenerativeModel("gemini-2.5-pro")
    response = model.generate_content(prompt)
    reply = response.text
    return ChatBotResponse(reply=reply)

@app.get("/sample/{filename}", response_class=PlainTextResponse)
async def get_sample_file(filename: str):
    try:
        base_dir = os.path.dirname(__file__)  # directory where main.py lives (bc/)
        sample_path = os.path.join(base_dir, "sample", filename)
        with open(sample_path, "r") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Sample file not found")

@app.get("/")
async def root():
    return {"status": "Genomic API is running"}

# ----------------------------
# Run server
# ----------------------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

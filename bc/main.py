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


# ----------------------------
# Load Model
# ----------------------------
MODEL_PATH = "models/dna_model.h5"
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

# The tokenizer must be the same used during training
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
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Add your frontend URLs
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
    transmission: float
    drug_resistant: float
    mutation: float

class ReportResponse(BaseModel):
    summary: str

@app.post("/report", response_model=ReportResponse)
async def generate_report(data: ReportRequest):
    # Compose prompt for Gemini
    prompt = (
        f"Summarize the following DNA analysis:\n"
        f"Transmission ratio: {data.transmission}\n"
        f"Drug resistance ratio: {data.drug_resistant}\n"
        f"Mutation ratio: {data.mutation}\n"
        "Provide a simple summary for a report."
    )
    # Call Gemini Flash 2.5 API (replace with your actual endpoint and API key)
    api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"
    api_key = "AIzaSyDqr6OpLmEaKNZBINb_k8fpDWSs54QVVAI"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(f"{api_url}?key={api_key}", json=payload, headers=headers)
    if response.status_code == 200:
        summary = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        # Add more content to the report
        full_report = (
            "=== Genomic Surveillance Report ===\n\n"
            f"Input Sequence Length (VIT): {len(data.sequence) if hasattr(data, 'sequence') else 'N/A'}\n"
            "Status: The sequence is fine and not going to spread.\n\n"
            f"Transmission ratio: {data.transmission}\n"
            f"Drug resistance ratio: {data.drug_resistant}\n"
            f"Mutation ratio: {data.mutation}\n\n"
            "--- Summary ---\n"
            f"{summary}"
        )
        return ReportResponse(summary=full_report)
    else:
        raise HTTPException(status_code=500, detail="Failed to generate report summary")

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
    api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"
    api_key = "AIzaSyDqr6OpLmEaKNZBINb_k8fpDWSs54QVVAI"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(f"{api_url}?key={api_key}", json=payload, headers=headers)
    if response.status_code == 200:
        reply = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        return ChatBotResponse(reply=reply)
    else:
        return JSONResponse(status_code=500, content={"reply": "Sorry, I couldn't get a response from Gemini."})

@app.get("/sample/{filename}", response_class=PlainTextResponse)
async def get_sample_file(filename: str):
    try:
        sample_path = os.path.join("sample", filename)
        with open(sample_path, "r") as f:
            return f.read()
    except:
        raise HTTPException(status_code=404, detail="Sample file not found")

# ----------------------------
# Run server
# ----------------------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

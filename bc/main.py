# backend/main.py
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import os
import pickle
from fastapi.middleware.cors import CORSMiddleware


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

# ----------------------------
# Run server
# ----------------------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

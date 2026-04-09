# HumanSense AI: Real-Time Emotion, Intent and Behavior Intelligence System

HumanSense AI is a production-oriented, modular AI platform that detects user emotion, predicts behavioral intent, and adapts UI experience in real time.

## Core Modules

1. Emotion Detection Engine (Multimodal)
- Webcam emotion inference (OpenCV pipeline, FER-ready CNN training script)
- Text emotion inference (Transformer-based model)
- Optional voice emotion module (MFCC + LSTM scaffold)

2. Intent Prediction Engine (Behavioral AI)
- Continuous behavior telemetry capture
- Feature engineering: mouse velocity, click intervals, scroll bursts, typing latency
- Intent inference and baseline model training support

3. Behavior Recommendation Engine (Decision AI)
- Fusion of emotion + intent
- Rule-based adaptive actions
- RL-ready Q-learning adapter for future policy learning

## Architecture

User Input (Webcam, Mouse, Keyboard, Text)
-> React Frontend + Tracking Hooks
-> FastAPI Inference and Event Layer
-> Emotion Model + Intent Model
-> Fusion Engine
-> Decision Engine
-> Adaptive UI + Analytics Logging

Detailed docs:
- docs/architecture.md
- docs/api_contract.md
- docs/demo_script.md

## Project Structure

project/
- frontend/
  - components/
  - pages/
  - hooks/
  - services/
- backend/
  - routes/
  - controllers/
  - websocket/
  - utils/
- ml/
  - emotion_model/
  - intent_model/
  - fusion_engine/
  - training/
- data/
- docs/
- README.md

## Tech Stack

- Frontend: React, Tailwind CSS, Framer Motion
- Backend: FastAPI, WebSockets
- ML: PyTorch/TensorFlow, OpenCV, Transformers
- Database: MongoDB

## Setup (Local)

## 1) Start MongoDB

Option A: Local MongoDB service
- Ensure MongoDB is running on localhost:27017

Option B: Docker
- docker compose up mongodb -d

## 2) Backend

- cd backend
- python -m venv .venv
- .venv\\Scripts\\activate
- pip install -r requirements.txt
- copy .env.example .env
- cd ..
- set PYTHONPATH=%cd%
- uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

## 3) Frontend

- cd frontend
- npm install
- copy .env.example .env
- npm run dev

Frontend URL: http://localhost:5173
Backend URL: http://localhost:8000

## Full Stack with Docker Compose

- docker compose up --build

## Mandatory Demo Scenario

Scenario:
- Emotion = stressed
- Intent = confusion

System response:
- UI simplification
- Guided help popup
- Logged interaction in prediction_logs collection

Use docs/demo_script.md for step-by-step demonstration.

## Data and Training

Datasets:
- FER2013 for facial emotion
- GoEmotions for text emotion
- Custom behavior dataset from telemetry scripts

Run collection and labeling:
- python ml/training/collect_behavior_data.py
- python ml/training/label_behavior_data.py

Then train models:
- python ml/intent_model/train_intent_models.py
- python ml/emotion_model/train_face_cnn.py
- python ml/emotion_model/train_text_transformer.py

## Production Notes

- Keep WebSocket prediction loop stateless for horizontal scaling.
- Offload heavy model inference to dedicated inference workers for large load.
- Add auth, rate-limiting, and feature flags before public deployment.
- Persist RL policy table and include user-specific policy state for personalization.

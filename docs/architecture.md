# HumanSense AI Architecture

## 1. End-to-End Flow

1. Browser captures webcam frames, text, and behavior telemetry.
2. Frontend streams telemetry via WebSocket and periodically pushes logs over REST.
3. FastAPI runs emotion and intent pipelines, then fuses outputs.
4. Decision engine maps fused states to adaptive UI actions.
5. Action and predictions are streamed back to frontend in real time.
6. MongoDB stores behavior logs and predictions for analytics.
7. Admin dashboard pulls aggregated analytics and live logs.

## 2. Logical Components

- Emotion Detection Engine (multimodal)
  - Webcam branch: frame capture -> OpenCV preprocessing -> FER model/fallback inference.
  - Text branch: transformer sentiment-emotion classification.
  - Optional voice branch: MFCC feature extraction + LSTM classifier.
- Intent Prediction Engine
  - Feature engineering from mouse/click/scroll/typing/session signals.
  - Rule and baseline model inference for low-latency serving.
  - Sequence model training support (LSTM).
- Fusion Engine
  - Confidence-aware fusion across webcam, text, and behavior signals.
  - Risk score generation for adaptive policy control.
- Decision Engine
  - Rule-based decisions for deterministic adaptive UX.
  - RL adapter module for future policy optimization.

## 3. Scalability and Production Readiness

- Async FastAPI with non-blocking MongoDB driver (Motor).
- WebSocket live inference channel for low-latency updates.
- Stateless backend services for horizontal scaling.
- Separated model modules for independent retraining/deployment.
- Dedicated analytics route and dashboard for observability.
- Explicit data collection and labeling scripts for continuous model improvement.

## 4. Mandatory Demo Scenario Mapping

Given:
- Emotion = stressed
- Intent = confusion

Flow:
1. Fusion risk rises above threshold.
2. Decision engine returns guided_help action.
3. Frontend AdaptiveLayout simplifies visible modules.
4. GuidedHelpPopup appears with walkthrough call-to-action.
5. Prediction and action are logged in MongoDB for audit and analytics.

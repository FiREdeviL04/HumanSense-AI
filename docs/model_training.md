# Model Training Guide

## Emotion Models

### FER2013 Facial CNN
- Place FER images in data/raw/fer2013_images/<class_name>/...
- Run:
  python ml/emotion_model/train_face_cnn.py
- Output:
  ml/emotion_model/fer_cnn.keras

### GoEmotions Transformer
- Run:
  python ml/emotion_model/train_text_transformer.py
- Output:
  ml/emotion_model/text_transformer/

### Optional Voice Emotion (MFCC + LSTM)
- Build model using:
  python -c "from ml.emotion_model.voice_emotion import build_lstm_model; print(build_lstm_model().summary())"

## Intent Models

### Data Collection and Labeling
- Generate custom interaction stream:
  python ml/training/collect_behavior_data.py
- Label stream into intents:
  python ml/training/label_behavior_data.py

### Baseline Models (Random Forest + Logistic Regression)
- Train and export models:
  python ml/intent_model/train_intent_models.py
- Outputs:
  ml/intent_model/intent_rf.joblib
  ml/intent_model/intent_lr.joblib

### Sequence Model (LSTM)
- Network class available in:
  ml/intent_model/sequence_model.py
- Integrate into an epoch training loop with serialized behavior sequences.

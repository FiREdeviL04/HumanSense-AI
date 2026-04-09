import numpy as np
from tensorflow.keras import layers, models


def extract_mfcc_features(audio_signal: np.ndarray, sample_rate: int) -> np.ndarray:
    # Placeholder extractor for MFCC-like behavior until librosa pipeline is wired.
    frame = np.abs(np.fft.rfft(audio_signal[: sample_rate]))
    bins = np.array_split(frame, 40)
    return np.array([np.mean(b) for b in bins], dtype=np.float32)


def build_lstm_model(input_shape=(40, 1), classes=5):
    model = models.Sequential(
        [
            layers.Input(shape=input_shape),
            layers.LSTM(64, return_sequences=True),
            layers.LSTM(32),
            layers.Dense(64, activation="relu"),
            layers.Dense(classes, activation="softmax"),
        ]
    )
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    return model

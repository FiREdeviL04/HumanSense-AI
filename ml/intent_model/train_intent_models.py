import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score


FEATURE_COLS = [
    "mouse_velocity",
    "click_interval",
    "scroll_burst",
    "typing_latency",
    "session_duration",
    "click_count",
    "cursor_entropy",
    "typing_focus",
]


def train_baseline_models(dataset_path="data/processed/behavior_labeled.csv", model_dir="ml/intent_model"):
    df = pd.read_csv(dataset_path)
    X = df[FEATURE_COLS]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    rf = RandomForestClassifier(n_estimators=180, random_state=42)
    rf.fit(X_train, y_train)

    lr = LogisticRegression(max_iter=200)
    lr.fit(X_train, y_train)

    rf_train_acc = accuracy_score(y_train, rf.predict(X_train))
    rf_test_acc = accuracy_score(y_test, rf.predict(X_test))
    lr_train_acc = accuracy_score(y_train, lr.predict(X_train))
    lr_test_acc = accuracy_score(y_test, lr.predict(X_test))

    print(f"RandomForest train_accuracy={rf_train_acc:.4f} test_accuracy={rf_test_acc:.4f} gap={rf_train_acc-rf_test_acc:.4f}")
    print(f"LogisticRegression train_accuracy={lr_train_acc:.4f} test_accuracy={lr_test_acc:.4f} gap={lr_train_acc-lr_test_acc:.4f}")

    if rf_train_acc - rf_test_acc > 0.08:
        print("RandomForest: likely overfitting")
    elif rf_test_acc < 0.70:
        print("RandomForest: likely underfitting")
    else:
        print("RandomForest: fit looks balanced")

    if lr_train_acc - lr_test_acc > 0.08:
        print("LogisticRegression: likely overfitting")
    elif lr_test_acc < 0.70:
        print("LogisticRegression: likely underfitting")
    else:
        print("LogisticRegression: fit looks balanced")

    print("RandomForest report")
    print(classification_report(y_test, rf.predict(X_test)))

    print("LogisticRegression report")
    print(classification_report(y_test, lr.predict(X_test)))

    joblib.dump(rf, f"{model_dir}/intent_rf.joblib")
    joblib.dump(lr, f"{model_dir}/intent_lr.joblib")


if __name__ == "__main__":
    train_baseline_models()

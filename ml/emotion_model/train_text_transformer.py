from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import evaluate
import numpy as np

MODEL_NAME = "distilbert-base-uncased"


def preprocess(example, tokenizer):
    return tokenizer(example["text"], truncation=True, max_length=128)


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    acc = evaluate.load("accuracy")
    f1 = evaluate.load("f1")
    return {
        "accuracy": acc.compute(predictions=preds, references=labels)["accuracy"],
        "f1": f1.compute(predictions=preds, references=labels, average="weighted")["f1"],
    }


def train_goemotions(output_dir="ml/emotion_model/text_transformer"):
    dataset = load_dataset("go_emotions", "simplified")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    tokenized = dataset.map(lambda x: preprocess(x, tokenizer), batched=True)
    tokenized = tokenized.rename_column("labels", "label")
    tokenized.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])

    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=7)

    args = TrainingArguments(
        output_dir=output_dir,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        eval_strategy="epoch",
        save_strategy="epoch",
        num_train_epochs=3,
        learning_rate=2e-5,
        logging_steps=100,
        load_best_model_at_end=True,
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["validation"],
        tokenizer=tokenizer,
        compute_metrics=compute_metrics,
    )

    trainer.train()
    trainer.save_model(output_dir)


if __name__ == "__main__":
    train_goemotions()

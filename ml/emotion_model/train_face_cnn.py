from pathlib import Path
import tensorflow as tf


def build_fer_cnn(input_shape=(48, 48, 1), classes=5):
    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(shape=input_shape),
            tf.keras.layers.Conv2D(32, 3, activation="relu"),
            tf.keras.layers.MaxPool2D(),
            tf.keras.layers.Conv2D(64, 3, activation="relu"),
            tf.keras.layers.MaxPool2D(),
            tf.keras.layers.Conv2D(128, 3, activation="relu"),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(128, activation="relu"),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(classes, activation="softmax"),
        ]
    )
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    return model


def train_fer_model(data_dir: str, output_path: str):
    data_path = Path(data_dir)
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_path,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=(48, 48),
        color_mode="grayscale",
        batch_size=64,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_path,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=(48, 48),
        color_mode="grayscale",
        batch_size=64,
    )

    normalizer = tf.keras.layers.Rescaling(1.0 / 255)
    train_ds = train_ds.map(lambda x, y: (normalizer(x), tf.one_hot(y, depth=5)))
    val_ds = val_ds.map(lambda x, y: (normalizer(x), tf.one_hot(y, depth=5)))

    model = build_fer_cnn()
    model.fit(train_ds, validation_data=val_ds, epochs=20)
    model.save(output_path)


if __name__ == "__main__":
    train_fer_model(data_dir="data/raw/fer2013_images", output_path="ml/emotion_model/fer_cnn.keras")

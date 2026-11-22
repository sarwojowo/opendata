import tensorflow as tf
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetB0


def build_efficientnetb0(input_shape=(224, 224, 3), num_classes=1):
    inputs = tf.keras.Input(shape=input_shape)

    # Pretrained backbone
    base_model = EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_tensor=inputs
    )

    base_model.trainable = False  # freeze backbone (federated learning setup)

    x = base_model.output
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)

    outputs = layers.Dense(num_classes, activation="sigmoid")(x)

    model = tf.keras.Model(inputs, outputs)

    return model
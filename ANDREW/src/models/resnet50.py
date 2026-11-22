import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input


def build_resnet50(
    input_shape=(224, 224, 3),
    num_classes=2,
    trainable_base=False,
    dropout_rate=0.4,
    learning_rate=1e-4
):
    """
    Build ResNet50 transfer learning model.
    """

    base_model = ResNet50(
        include_top=False,
        weights="imagenet",
        input_shape=input_shape
    )

    base_model.trainable = trainable_base

    inputs = layers.Input(shape=input_shape)

    x = preprocess_input(inputs)

    x = base_model(x, training=False)

    x = layers.GlobalAveragePooling2D()(x)

    x = layers.Dropout(dropout_rate)(x)

    if num_classes == 2:
        outputs = layers.Dense(1, activation="sigmoid")(x)
        loss_fn = "binary_crossentropy"
    else:
        outputs = layers.Dense(num_classes, activation="softmax")(x)
        loss_fn = "sparse_categorical_crossentropy"

    model = models.Model(inputs, outputs)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss=loss_fn,
        metrics=["accuracy"]
    )

    return model


if __name__ == "__main__":
    model = build_resnet50()
    model.summary()
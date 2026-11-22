import tensorflow as tf
from tensorflow.keras import layers


def build_classifier_head(x, num_classes=1, dropout_rate=0.2):
    """
    Shared classification head for all backbone models
    (Ensures fair comparison in federated learning experiments)
    """

    # Global pooling (works with any backbone output shape)
    x = layers.GlobalAveragePooling2D()(x)

    # Regularization
    x = layers.Dropout(dropout_rate)(x)

    # Final prediction layer
    outputs = layers.Dense(num_classes, activation="sigmoid")(x)

    return outputs
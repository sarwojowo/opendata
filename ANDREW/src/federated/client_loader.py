import tensorflow as tf
import json
import numpy as np
import os

IMG_SIZE = (224, 224)
BATCH_SIZE = 8

def normalize_label(label: str) -> str:
    return label.strip().lower().replace(",", "").replace(" ", "_")

def load_client_map(path):
    with open(path, "r") as f:
        return json.load(f)

def preprocess_image(image_path, label):
    image = tf.io.read_file(image_path)
    image = tf.image.decode_jpeg(image, channels=3)
    image = tf.image.resize(image, IMG_SIZE)
    image = tf.cast(image, tf.float32) / 255.0
    return image, label

def augment(image, label):
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_brightness(image, 0.1)
    image = tf.image.random_contrast(image, 0.9, 1.1)
    return image, label

def create_tf_dataset(client_items, class_map, training=True):
    if not client_items:
        return None

    paths = [item["path"] for item in client_items]
    labels = [class_map[normalize_label(item["label"])] for item in client_items]

    dataset = tf.data.Dataset.from_tensor_slices((
        np.array(paths, dtype=str),
        np.array(labels, dtype=np.int32)
    ))

    dataset = dataset.map(preprocess_image, num_parallel_calls=tf.data.AUTOTUNE)

    if training:
        dataset = dataset.map(augment, num_parallel_calls=tf.data.AUTOTUNE)
        dataset = dataset.shuffle(max(10, len(paths)))

    dataset = dataset.batch(BATCH_SIZE)
    dataset = dataset.prefetch(tf.data.AUTOTUNE)
    return dataset

def get_client_data(client_id, split_type="iid"):
    path = f"data/federated_splits/{split_type}/client_maps.json"
    client_map = load_client_map(path)

    all_labels = []
    for items in client_map.values():
        for item in items:
            all_labels.append(normalize_label(item["label"]))

    class_map = {cls: idx for idx, cls in enumerate(sorted(set(all_labels)))}

    # ==========================================
    # THE BULLETPROOF JSON KEY EXTRACTION FIX
    # ==========================================
    keys = list(client_map.keys())
    
    # 1. Try exact string match (e.g., "0")
    if str(client_id) in client_map:
        target_key = str(client_id)
    # 2. Try prefixed match (e.g., "client_0")
    elif f"client_{client_id}" in client_map:
        target_key = f"client_{client_id}"
    # 3. Fallback: Use the ID as a mathematical index
    else:
        # If Flower passes "159aeeb20...", this safely maps it to a valid key index (0-9)
        # Assuming client_id is an integer if possible, otherwise hash it
        try:
            idx = int(client_id)
        except ValueError:
            idx = hash(str(client_id))
            
        target_key = keys[idx % len(keys)]
        
    client_items = client_map[target_key]

    print(f"[DEBUG] Client {client_id} mapped to JSON key '{target_key}' and loaded {len(client_items)} raw images.")

    if len(client_items) == 0:
        raise ValueError(f"Client {client_id} (Key: {target_key}) has 0 images! Training cannot proceed.")
    # ==========================================

    # Shuffle for a healthy 80/20 split
    np.random.seed(42 + int(hash(str(client_id)) % 10000))
    np.random.shuffle(client_items)

    split_idx = int(len(client_items) * 0.8)
    train_items = client_items[:split_idx]
    val_items = client_items[split_idx:]

    train_ds = create_tf_dataset(train_items, class_map, training=True)
    val_ds = create_tf_dataset(val_items, class_map, training=False)

    # Return exact counts to avoid iterating over the Dataset in client.py
    return train_ds, val_ds, len(train_items), len(val_items)
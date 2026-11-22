import json
import random
from pathlib import Path
from collections import defaultdict
import numpy as np

# =========================
# CONFIG
# =========================
NUM_CLIENTS = 10
SEED = 42

random.seed(SEED)
np.random.seed(SEED)


# =========================
# LOAD DATASET INDEX (FIXED)
# =========================
def load_index(data_dir="data/processed/images_224"):
    data_dir = Path(data_dir)
    index = []

    for img_path in data_dir.rglob("*.jpg"):
        parts = img_path.parts

        # Expected: images_224/domain/class/image.jpg
        if len(parts) >= 3:
            domain = parts[-3]
        else:
            domain = "unknown"

        label = f"{domain}/{img_path.parent.name}"

        index.append({
            "path": str(img_path),
            "label": label
        })

    return index


# =========================
# IID SPLIT
# =========================
def create_iid_split(index):
    random.shuffle(index)
    client_data = defaultdict(list)

    for i, item in enumerate(index):
        client_id = i % NUM_CLIENTS
        client_data[f"client_{client_id}"].append(item)

    return client_data


# =========================
# NON-IID SPLIT (Dirichlet)
# =========================
def create_noniid_split(index, alpha=0.5):
    label_map = defaultdict(list)

    for item in index:
        label_map[item["label"]].append(item)

    client_data = defaultdict(list)

    for label, items in label_map.items():
        proportions = np.random.dirichlet([alpha] * NUM_CLIENTS)

        start = 0
        for client_id, p in enumerate(proportions):
            n = int(p * len(items))
            client_data[f"client_{client_id}"].extend(items[start:start+n])
            start += n

    return client_data


# =========================
# CROSS-DOMAIN SPLIT (FIXED)
# =========================
def create_cross_domain_split(index):
    domains = {
        "cassava": [],
        "fruit": [],
        "plant": [],
        "rice": []
    }

    # Populate domains
    for item in index:
        label = item["label"]
        domain = label.split("/")[0]

        if domain in domains:
            domains[domain].append(item)

    # OPTIONAL DEBUG (you can delete later)
    print("Domain distribution:", {k: len(v) for k, v in domains.items()})

    # Shuffle each domain
    for d in domains:
        random.shuffle(domains[d])

    client_data = {}

    # Assign domain-specific clients
    client_data["client_0"] = domains["cassava"]
    client_data["client_1"] = domains["rice"]
    client_data["client_2"] = domains["fruit"]

    # Split plant domain across remaining clients
    plant_data = domains["plant"]
    random.shuffle(plant_data)

    splits = np.array_split(plant_data, NUM_CLIENTS - 3)

    for i in range(NUM_CLIENTS - 3):
        client_data[f"client_{i+3}"] = list(splits[i])

    return client_data


# =========================
# SAVE JSON
# =========================
def save_json(data, path):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w") as f:
        json.dump(data, f, indent=4)


# =========================
# MAIN
# =========================
if __name__ == "__main__":
    print("Loading dataset index...")
    index = load_index()

    print(f"Total samples: {len(index)}")

    print("Creating Cross-domain split...")
    cross = create_cross_domain_split(index)

    save_json(cross, "data/federated_splits/cross_domain/client_maps.json")

    print("\nSaved Cross-domain split!")

    print({k: len(v) for k, v in cross.items()})
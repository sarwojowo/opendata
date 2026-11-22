import os
from PIL import Image
from pathlib import Path
import json
from tqdm import tqdm

IMG_SIZE = (224, 224)

RAW_DIR = Path("data/raw")
OUT_DIR = Path("data/processed/images_224")
MAP_PATH = Path("data/processed/class_map.json")

SUPPORTED_EXT = (".jpg", ".jpeg", ".png")


def create_dir(path):
    path.mkdir(parents=True, exist_ok=True)


def process_image(img_path, save_path):
    try:
        img = Image.open(img_path).convert("RGB")
        img = img.resize(IMG_SIZE)
        img.save(save_path, quality=95)
    except Exception as e:
        print(f"[SKIP] {img_path} -> {e}")


def extract_dataset_name(folder_name):
    name = folder_name.lower()

    if "cassava" in name:
        return "cassava"
    elif "fruit" in name:
        return "fruit"
    elif "rice" in name:
        return "rice"
    else:
        return "plant"


def build_unified_dataset():
    class_map = {}
    class_id = 0

    print("Scanning datasets...")

    for dataset_folder in RAW_DIR.iterdir():
        if not dataset_folder.is_dir():
            continue

        dataset_name = extract_dataset_name(dataset_folder.name)

        print(f"\n📂 Processing dataset: {dataset_name}")

        for class_folder in dataset_folder.rglob("*"):
            if not class_folder.is_dir():
                continue

            images = list(class_folder.glob("*"))

            valid_images = [img for img in images if img.suffix.lower() in SUPPORTED_EXT]

            if len(valid_images) == 0:
                continue

            class_name = class_folder.name.lower().replace(" ", "_")

            key = f"{dataset_name}/{class_name}"

            if key not in class_map:
                class_map[key] = class_id
                class_id += 1

            save_class_dir = OUT_DIR / dataset_name / class_name
            create_dir(save_class_dir)

            print(f"  ↳ {key} ({len(valid_images)} images)")

            for img_path in tqdm(valid_images, desc=class_name):
                save_path = save_class_dir / img_path.name
                process_image(img_path, save_path)

    create_dir(MAP_PATH.parent)

    with open(MAP_PATH, "w") as f:
        json.dump(class_map, f, indent=4)

    print("\n✅ Dataset unification complete!")
    print(f"📁 Saved to: {OUT_DIR}")
    print(f"🧾 Class map saved to: {MAP_PATH}")


if __name__ == "__main__":
    build_unified_dataset()
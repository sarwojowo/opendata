from fastapi import FastAPI, File, UploadFile, HTTPException
from deepface import DeepFace
import shutil
import os
from uuid import uuid4
from typing import List
from scipy.spatial.distance import cosine
import cv2
import numpy as np

app = FastAPI()

MODEL_NAME = "Facenet512"
# MODEL_NAME = "ArcFace"
DETECTOR_BACKEND = "opencv"
THRESHOLD = 0.5

def is_face_present(image_path: str) -> bool:
    try:
        _ = DeepFace.extract_faces(
            img_path=image_path,
            enforce_detection=True
        )
        return True
    except Exception:
        return False

def save_upload(file: UploadFile) -> str:
    path = f"temp_{uuid4().hex}_{file.filename}"
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return path

def rotate_image(image: np.ndarray, angle: int) -> np.ndarray:
    if angle == 90:
        return cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
    elif angle == 180:
        return cv2.rotate(image, cv2.ROTATE_180)
    elif angle == 270:
        return cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE)
    else:
        return image

def try_rotations_for_embedding(image_path: str) -> List[float]:
    original = cv2.imread(image_path)
    rotations = [90, 180, 270]
    last_exception = None

    # Coba rotasi 90, 180, 270
    for angle in rotations:
        rotated = rotate_image(original, angle)
        temp_rotated_path = f"{image_path}_rotated_{angle}.jpg"
        cv2.imwrite(temp_rotated_path, rotated)

        try:
            embedding = DeepFace.represent(
                img_path=temp_rotated_path,
                model_name=MODEL_NAME,
                detector_backend=DETECTOR_BACKEND,
                enforce_detection=True
            )[0]["embedding"]

            os.remove(temp_rotated_path)
            return embedding

        except Exception as e:
            last_exception = e
            os.remove(temp_rotated_path)
            continue

    # Fallback: coba gambar original meskipun enforce_detection=False
    try:
        embedding = DeepFace.represent(
            img_path=image_path,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR_BACKEND,
            enforce_detection=False
        )[0]["embedding"]
        return embedding

    except Exception as e:
        raise Exception(f"Gagal mendeteksi wajah dari semua rotasi dan gambar asli: {str(last_exception or e)}")

    
@app.post("/check-face-presence")
async def check_face_presence(image: UploadFile = File(...)):
    filename = f"temp_{uuid4().hex}_{image.filename}"
    
    with open(filename, "wb") as f1:
        shutil.copyfileobj(image.file, f1)

    try:
        # Validasi wajah pada kedua gambar
        if not is_face_present(filename):
            raise HTTPException(status_code=400, detail="Gambar tidak mengandung wajah.")

        return {
            "detail": "oke",
        }

    except HTTPException as he:
        raise he

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

    finally:
        # Hapus file sementara
        os.remove(filename)
        
@app.post("/verify-face")
async def verify_face(
    photo: UploadFile = File(...),
    references: List[UploadFile] = File(...)
):
    input_path = save_upload(photo)
    ref_paths = [save_upload(ref) for ref in references]

    try:
        # Validasi wajah pada kedua gambar
        # if not is_face_present(input_path):
        #     raise HTTPException(status_code=400, detail="Foto tidak mengandung wajah/tidak jelas.")
        # for filename in ref_paths:
        #     if not is_face_present(filename):
        #         raise HTTPException(status_code=400, detail="Foto profil user tidak mengandung wajah/tidak jelas.")

        input_embedding = try_rotations_for_embedding(input_path)

        def process_reference(ref_path):
            ref_embedding = try_rotations_for_embedding(ref_path)
            dist = cosine(input_embedding, ref_embedding)
            return dist, ref_path

        results = map(process_reference, ref_paths)

        for distance, ref_path in results:
            if distance < THRESHOLD:
                return {"verified": True, "distance": distance}

        return {"verified": False, "distance": distance, "detail": "Wajah tidak cocok"}

    except HTTPException as he:
        raise he

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

    finally:
        # Hapus file sementara
        os.remove(input_path)
        for ref_path in ref_paths:
            os.remove(ref_path)


@app.get("/health")
async def test():
    return {
        "status": "oke"
    }

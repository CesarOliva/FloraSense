"""Demo básica de SAM 2 (Meta) con FastAPI.

Sube una imagen, haz clic sobre un objeto y SAM 2 devuelve la máscara.
- Clic izquierdo: punto positivo (incluir)
- Clic derecho: punto negativo (excluir)

Ejecutar:
    uvicorn app:app --reload --port 8001
y abrir http://localhost:8001
"""

from __future__ import annotations

import base64
import io
import os
import time
import uuid
from collections import OrderedDict
from pathlib import Path

import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from pydantic import BaseModel
from transformers import Sam2Model, Sam2Processor

MODEL_ID = os.getenv("SAM2_MODEL", "facebook/sam2.1-hiera-tiny")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MAX_SIDE = 1024  # redimensiona imágenes grandes para ir más rápido en CPU
CACHE_SIZE = 8  # nº de imágenes cuyos embeddings se guardan en memoria

STATIC_DIR = Path(__file__).parent / "static"

print(f"Cargando {MODEL_ID} en {DEVICE}...")
processor = Sam2Processor.from_pretrained(MODEL_ID)
model = Sam2Model.from_pretrained(MODEL_ID).to(DEVICE).eval()
print("Modelo listo.")

# image_id -> {"image", "embeddings", "original_sizes"}
_cache: OrderedDict[str, dict] = OrderedDict()

app = FastAPI(title="SAM 2 demo")


class Point(BaseModel):
    x: float
    y: float
    label: int  # 1 = positivo, 0 = negativo


class SegmentRequest(BaseModel):
    image_id: str
    points: list[Point]


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/info")
def info():
    return {"model": MODEL_ID, "device": DEVICE}


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    """Recibe la imagen y precalcula los embeddings (la parte costosa)."""
    try:
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    except Exception:
        raise HTTPException(400, "No se pudo leer la imagen.")

    image.thumbnail((MAX_SIDE, MAX_SIDE))

    t0 = time.perf_counter()
    inputs = processor(images=image, return_tensors="pt").to(DEVICE)
    with torch.inference_mode():
        embeddings = model.get_image_embeddings(inputs["pixel_values"])
    elapsed = time.perf_counter() - t0

    image_id = uuid.uuid4().hex
    _cache[image_id] = {
        "embeddings": embeddings,
        "original_sizes": inputs["original_sizes"],
    }
    while len(_cache) > CACHE_SIZE:
        _cache.popitem(last=False)

    return {
        "image_id": image_id,
        "width": image.width,
        "height": image.height,
        "embedding_seconds": round(elapsed, 2),
    }


@app.post("/segment")
def segment(req: SegmentRequest):
    """Usa los embeddings cacheados + los puntos para predecir la máscara."""
    entry = _cache.get(req.image_id)
    if entry is None:
        raise HTTPException(404, "Imagen no encontrada; vuelve a subirla.")
    if not req.points:
        raise HTTPException(400, "Añade al menos un punto.")

    # Formato: [imagen][objeto][punto][x, y]
    input_points = [[[[p.x, p.y] for p in req.points]]]
    input_labels = [[[p.label for p in req.points]]]

    t0 = time.perf_counter()
    prompt = processor(
        input_points=input_points,
        input_labels=input_labels,
        original_sizes=entry["original_sizes"],
        return_tensors="pt",
    ).to(DEVICE)
    with torch.inference_mode():
        outputs = model(
            input_points=prompt["input_points"],
            input_labels=prompt["input_labels"],
            image_embeddings=entry["embeddings"],
            multimask_output=True,
        )
    masks = processor.post_process_masks(
        outputs.pred_masks.cpu(), entry["original_sizes"]
    )[0]  # (objetos, 3, H, W)
    scores = outputs.iou_scores[0, 0].cpu()
    best = int(scores.argmax())
    mask = masks[0, best].numpy().astype(bool)
    elapsed = time.perf_counter() - t0

    return {
        "mask_png": _mask_to_png_b64(mask),
        "score": round(float(scores[best]), 3),
        "area_pct": round(100 * mask.mean(), 1),
        "seconds": round(elapsed, 2),
    }


def _mask_to_png_b64(mask: np.ndarray) -> str:
    """Máscara binaria -> PNG RGBA (verde semitransparente) en base64."""
    h, w = mask.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[mask] = (34, 197, 94, 140)
    buf = io.BytesIO()
    Image.fromarray(rgba, "RGBA").save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

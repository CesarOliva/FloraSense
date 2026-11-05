import os
import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter()

@router.post("/api/identify")
async def identify(images: list[UploadFile] = File(...)):
    api_key = os.getenv("PLANTNET_API_KEY")
    if not api_key:
        raise HTTPException(503, "PlantNet no está configurado")

    if not 1 <= len(images) <= 5:
        raise HTTPException(422, "Envía entre 1 y 5 imágenes")

    files = []

    for image in images:
        if image.content_type not in {"image/jpeg", "image/png"}:
            raise HTTPException(415, "Usa imágenes JPG o PNG")

        content = await image.read(5 * 1024 * 1024 + 1)

        if not content:
            raise HTTPException(422, "La imagen está vacía")

        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(413, "Cada imagen debe pesar como máximo 5 MB")

        files.append((
            "images",
            (image.filename or "plant.jpg", content, image.content_type),
        ))

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://my-api.plantnet.org/v2/identify/all",
                params={
                    "api-key": api_key,
                    "lang": "es",
                    "nb-results": 5,
                    "include-related-images": "true",
                },
                files=files,
            )
    except httpx.TimeoutException:
        raise HTTPException(504, "PlantNet tardó demasiado") from None
    except httpx.RequestError:
        raise HTTPException(502, "No se pudo conectar con PlantNet") from None

    if response.status_code == 404:
        return {"candidates": []}

    if response.status_code == 429:
        raise HTTPException(429, "Límite de solicitudes alcanzado")

    if response.status_code != 200:
        raise HTTPException(502, "PlantNet no pudo procesar la identificación")

    try:
        data = response.json()
        candidates = [
            {
                "scientificName": result["species"]["scientificNameWithoutAuthor"],
                "commonNames": result["species"].get("commonNames") or [],
                "score": result.get("score"),
                "relatedImages": [
                    {
                        "url": image["url"].get("m") or image["url"].get("o") or image["url"].get("s"),
                        "originalUrl": image["url"].get("o") or image["url"].get("m") or image["url"].get("s"),
                        "organ": image.get("organ"),
                    }
                    for image in (result.get("images") or [])
                    if isinstance(image, dict)
                    and isinstance(image.get("url"), dict)
                    and any(image["url"].get(size) for size in ("m", "o", "s"))
                ],
            }
            for result in data["results"]
        ]
    except (ValueError, KeyError, TypeError):
        raise HTTPException(502, "Respuesta inesperada de PlantNet") from None

    return {"candidates": candidates}
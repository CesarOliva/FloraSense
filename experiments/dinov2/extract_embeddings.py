
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torchvision import transforms


# =====================================
# CONFIGURACIÓN
# =====================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"
OUTPUT_DIR = BASE_DIR / "results"

SPLITS = {
    "train": "Train/Train",
    "validation": "Validation/Validation",
    "test": "Test/Test"
}

CLASSES = ["Healthy", "Powdery", "Rust"]

EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

BATCH_SIZE = 16


# =====================================
# DISPOSITIVO
# =====================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print(f"Dispositivo: {device}")


# =====================================
# CARGAR DINOV2
# =====================================

print("\nCargando DINOv2...")

model = torch.hub.load(
    "facebookresearch/dinov2",
    "dinov2_vits14"
)

model.eval()
model.to(device)

print("DINOv2 cargado correctamente.")


# =====================================
# TRANSFORMACIONES
# =====================================

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=(0.485, 0.456, 0.406),
        std=(0.229, 0.224, 0.225)
    )
])


# =====================================
# RECOPILAR IMÁGENES
# =====================================

records = []

for split_name, split_path in SPLITS.items():

    for category in CLASSES:

        folder = DATASET_DIR / split_path / category

        if not folder.exists():
            raise FileNotFoundError(
                f"No se encontró la carpeta: {folder}"
            )

        images = sorted([
            file for file in folder.iterdir()
            if file.is_file()
            and file.suffix.lower() in EXTENSIONS
        ])

        for image_path in images:
            records.append((
                image_path,
                category,
                split_name
            ))

print(f"\nTotal de imágenes: {len(records)}")


# =====================================
# EXTRAER EMBEDDINGS
# =====================================

features = []
labels = []
splits = []
paths = []

for start in range(0, len(records), BATCH_SIZE):

    batch_records = records[start:start + BATCH_SIZE]

    batch_images = []

    for image_path, category, split_name in batch_records:

        image = Image.open(image_path).convert("RGB")
        tensor = transform(image)

        batch_images.append(tensor)

    batch = torch.stack(batch_images).to(device)

    with torch.inference_mode():
        embeddings = model(batch)

    embeddings = embeddings.cpu().numpy()

    for i, record in enumerate(batch_records):

        image_path, category, split_name = record

        features.append(embeddings[i])
        labels.append(category)
        splits.append(split_name)

        paths.append(
            str(image_path.relative_to(DATASET_DIR))
        )

    processed = min(start + BATCH_SIZE, len(records))

    print(
        f"Procesadas: {processed}/{len(records)}"
    )


# =====================================
# GUARDAR RESULTADOS
# =====================================

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

output_file = OUTPUT_DIR / "dinov2_embeddings.npz"

np.savez_compressed(
    output_file,
    features=np.array(features, dtype=np.float32),
    labels=np.array(labels),
    splits=np.array(splits),
    paths=np.array(paths)
)

print("\nExtracción terminada.")
print(f"Forma de embeddings: {np.array(features).shape}")
print(f"Archivo guardado en: {output_file}")

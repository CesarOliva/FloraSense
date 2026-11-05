
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np

# Rutas
BASE_DIR = Path(__file__).resolve().parent
IMAGE_DIR = BASE_DIR / "images"
RESULTS_DIR = BASE_DIR / "results"

RESULTS_DIR.mkdir(exist_ok=True)

# Dispositivo
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Cargar modelo
print("Cargando DINOv2...")
model = torch.hub.load("facebookresearch/dinov2", "dinov2_vits14")
model.eval()
model.to(device)

# Transformaciones
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=(0.485, 0.456, 0.406),
        std=(0.229, 0.224, 0.225)
    )
])

# Obtener imágenes
image_paths = [
    p for p in IMAGE_DIR.iterdir()
    if p.suffix.lower() in [".jpg", ".jpeg", ".png"]
]

if len(image_paths) < 2:
    raise ValueError("Necesitas al menos 2 imágenes.")

embeddings = []

print(f"Analizando {len(image_paths)} imágenes...")

with torch.no_grad():
    for path in image_paths:
        image = Image.open(path).convert("RGB")
        tensor = transform(image).unsqueeze(0).to(device)

        features = model(tensor)
        features = F.normalize(features, dim=1)

        embeddings.append(features.cpu())

# Matriz de similitud
embeddings = torch.cat(embeddings)
similarity = embeddings @ embeddings.T

# Mostrar resultados
names = [p.name for p in image_paths]

print("\nSIMILITUD ENTRE IMÁGENES\n")

for i, name in enumerate(names):
    print(f"\n{name}")

    for j, other in enumerate(names):
        if i != j:
            score = similarity[i, j].item()
            print(f"  {other}: {score:.4f}")

# Crear gráfica
plt.figure(figsize=(10, 8))

plt.imshow(similarity.numpy(), cmap="viridis", vmin=0, vmax=1)
plt.colorbar(label="Similitud coseno")

plt.xticks(range(len(names)), names, rotation=45, ha="right")
plt.yticks(range(len(names)), names)

plt.title("Similitud visual entre imágenes - DINOv2")
plt.tight_layout()

output = RESULTS_DIR / "similarity_matrix.png"
plt.savefig(output, dpi=150)

print(f"\nGráfica guardada en: {output}")

plt.show()

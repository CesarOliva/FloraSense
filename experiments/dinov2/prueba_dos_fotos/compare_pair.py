
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
from pathlib import Path

# ==========================================
# 1. RUTAS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
IMAGE_DIR = BASE_DIR / "images"

healthy_path = IMAGE_DIR / "sana1.jpg"
healthy2_path = IMAGE_DIR / "sana2.jpg"
wilted_path = IMAGE_DIR / "marchita.jpg"


# ==========================================
# 2. CONFIGURAR DISPOSITIVO
# ==========================================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Dispositivo:", device)


# ==========================================
# 3. CARGAR DINOv2
# ==========================================

print("\nCargando DINOv2...")

model = torch.hub.load(
    "facebookresearch/dinov2",
    "dinov2_vits14"
)

model.eval()
model.to(device)


# ==========================================
# 4. TRANSFORMACIONES
# ==========================================

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=(0.485, 0.456, 0.406),
        std=(0.229, 0.224, 0.225)
    )
])


# ==========================================
# 5. EXTRAER CARACTERÍSTICAS
# ==========================================

def extract_features(image_path):

    image = Image.open(image_path).convert("RGB")

    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():

        # Representación global
        global_features = model(tensor)

        # Representaciones de cada región
        outputs = model.forward_features(tensor)

        patch_features = outputs["x_norm_patchtokens"]

    global_features = F.normalize(global_features, dim=1)

    patch_features = F.normalize(patch_features, dim=2)

    return global_features, patch_features


# ==========================================
# 6. VERIFICAR IMÁGENES
# ==========================================

image_paths = [
    healthy_path,
    healthy2_path,
    wilted_path
]

for path in image_paths:

    if not path.exists():
        raise FileNotFoundError(
            f"No se encontró la imagen: {path}"
        )


# ==========================================
# 7. ANALIZAR FOTOGRAFÍAS
# ==========================================

print("\nAnalizando fotografías...")

healthy_global, healthy_patches = extract_features(healthy_path)

healthy2_global, healthy2_patches = extract_features(healthy2_path)

wilted_global, wilted_patches = extract_features(wilted_path)


# ==========================================
# 8. ORGANIZAR RESULTADOS
# ==========================================

images = {
    "Sana 1": (healthy_global, healthy_patches),
    "Sana 2": (healthy2_global, healthy2_patches),
    "Marchita": (wilted_global, wilted_patches)
}


# ==========================================
# 9. COMPARACIÓN GLOBAL
# ==========================================

print("\n===== SIMILITUD GLOBAL =====")

for name1, (global1, _) in images.items():

    print(f"\n{name1}")

    for name2, (global2, _) in images.items():

        score = torch.sum(global1 * global2).item()

        print(f"  {name2}: {score:.4f}")


# ==========================================
# 10. COMPARACIÓN POR REGIONES
# ==========================================

print("\n===== SIMILITUD POR REGIONES =====")

for name1, (_, patches1) in images.items():

    print(f"\n{name1}")

    for name2, (_, patches2) in images.items():

        # Comparar cada región con la región
        # que ocupa la misma posición en la otra imagen.

        similarities = torch.sum(
            patches1 * patches2,
            dim=2
        )

        # Promedio de similitud de las 256 regiones
        score = similarities.mean().item()

        print(f"  {name2}: {score:.4f}")


# ==========================================
# 11. INFORMACIÓN DE LOS PATCH TOKENS
# ==========================================

print("\n===== INFORMACIÓN DE REGIONES =====")

print("Regiones por imagen:", healthy_patches.shape[1])
print("Dimensiones por región:", healthy_patches.shape[2])
print("Cuadrícula: 16 x 16")
print("Tamaño de cada región: 14 x 14 píxeles")

print("\nAnálisis finalizado.")

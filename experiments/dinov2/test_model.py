
import torch
import time

print("Dispositivo:", "CUDA" if torch.cuda.is_available() else "CPU")
print("Descargando/cargando DINOv2...")

inicio = time.time()

model = torch.hub.load(
    "facebookresearch/dinov2",
    "dinov2_vits14"
)

model.eval()

print("\n¡DINOv2 cargado correctamente!")
print("Modelo: dinov2_vits14")
print("Tiempo:", round(time.time() - inicio, 2), "segundos")

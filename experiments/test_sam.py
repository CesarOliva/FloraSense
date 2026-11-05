import cv2
import numpy as np
import torch
from PIL import Image
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor
from sam2.automatic_mask_generator import SAM2AutomaticMaskGenerator

# ============ CONFIGURACION ============
MODO = "auto"          # "puntos", "caja" o "auto"
IMAGEN = "planta.jpg"  # imagen de entrada (misma carpeta que este script)

CFG = "configs/sam2.1/sam2.1_hiera_t.yaml"
CKPT = r"C:\Users\admon\Documents\SAM\sam2\checkpoints\sam2.1_hiera_tiny.pt"

# Modo "puntos": [x, y] en pixeles de la imagen
PUNTOS_POSITIVOS = [[300, 200], [450, 320], [200, 400]]  # sobre cada hoja
PUNTOS_NEGATIVOS = []                                    # sobre lo que NO quieres

# Modo "caja": [x1, y1, x2, y2] (esquina sup. izquierda e inf. derecha)
CAJA = [100, 50, 700, 750]

# Modo "auto"
POINTS_PER_SIDE = 16      # 16 = rapido en CPU, 32 = mas detalle pero mucho mas lento
AREA_MIN = 500            # ignora mascaras mas pequenas (pixeles)
AREA_MAX_FRAC = 0.6       # ignora mascaras que cubren mas de 60% de la imagen (fondo)

# Contornos
COLOR_CONTORNO = (255, 0, 0)   # RGB: rojo. Amarillo = (255, 255, 0)
GROSOR_CONTORNO = 2
NUMERAR_HOJAS = False          # True para poner un numero en cada hoja

MAX_LADO = 1024           # reduce imagenes grandes para ir mas rapido en CPU
# =======================================


def cargar_imagen(ruta, max_lado):
    img = Image.open(ruta).convert("RGB")
    if max(img.size) > max_lado:
        escala = max_lado / max(img.size)
        img = img.resize((int(img.width * escala), int(img.height * escala)))
        print(f"Imagen reducida a {img.size}. Ajusta puntos/caja a este tamano.")
    return np.array(img)


# ---------- Modos: cada uno devuelve una LISTA de mascaras booleanas ----------

def modo_puntos(modelo, imagen):
    predictor = SAM2ImagePredictor(modelo)
    coords = np.array(PUNTOS_POSITIVOS + PUNTOS_NEGATIVOS)
    labels = np.array([1] * len(PUNTOS_POSITIVOS) + [0] * len(PUNTOS_NEGATIVOS))
    with torch.inference_mode():
        predictor.set_image(imagen)
        masks, scores, _ = predictor.predict(
            point_coords=coords,
            point_labels=labels,
            multimask_output=False,
        )
    print("Puntaje:", scores)
    return [masks[0].astype(bool)]


def modo_caja(modelo, imagen):
    predictor = SAM2ImagePredictor(modelo)
    coords, labels = None, None
    if PUNTOS_NEGATIVOS:
        coords = np.array(PUNTOS_POSITIVOS + PUNTOS_NEGATIVOS)
        labels = np.array([1] * len(PUNTOS_POSITIVOS) + [0] * len(PUNTOS_NEGATIVOS))
    with torch.inference_mode():
        predictor.set_image(imagen)
        masks, scores, _ = predictor.predict(
            box=np.array(CAJA),
            point_coords=coords,
            point_labels=labels,
            multimask_output=False,
        )
    print("Puntaje:", scores)
    return [masks[0].astype(bool)]


def modo_auto(modelo, imagen):
    generador = SAM2AutomaticMaskGenerator(modelo, points_per_side=POINTS_PER_SIDE)
    with torch.inference_mode():
        resultados = generador.generate(imagen)

    area_total = imagen.shape[0] * imagen.shape[1]
    filtradas = [
        r for r in resultados
        if AREA_MIN <= r["area"] <= AREA_MAX_FRAC * area_total
    ]
    filtradas.sort(key=lambda r: r["area"], reverse=True)
    print(f"Mascaras encontradas: {len(resultados)} | despues de filtrar: {len(filtradas)}")
    return [r["segmentation"].astype(bool) for r in filtradas]


# ---------- Salidas ----------

def union_mascaras(imagen, mascaras):
    union = np.zeros(imagen.shape[:2], dtype=bool)
    for m in mascaras:
        union |= m
    return union


def dibujar_contornos(imagen, mascaras, grosor=2, color=(255, 0, 0), numerar=False):
    """Dibuja solo el borde de cada mascara; el interior conserva su color original."""
    salida = imagen.copy()
    for i, m in enumerate(mascaras, start=1):
        contornos, _ = cv2.findContours(
            m.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        cv2.drawContours(salida, contornos, -1, color, grosor)
        if numerar and contornos:
            M = cv2.moments(max(contornos, key=cv2.contourArea))
            if M["m00"] > 0:
                cx, cy = int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"])
                cv2.putText(salida, str(i), (cx, cy),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    return salida


def guardar_todo(imagen, mascaras):
    union = union_mascaras(imagen, mascaras)

    # 1. Mascara en blanco y negro
    Image.fromarray((union * 255).astype(np.uint8)).save("mascara.png")

    # 2. Foto original con el borde de cada hoja
    contornos = dibujar_contornos(
        imagen, mascaras, GROSOR_CONTORNO, COLOR_CONTORNO, NUMERAR_HOJAS
    )
    Image.fromarray(contornos).save("contornos.png")

    # 3. Solo las hojas con su color original, fondo negro
    aisladas = np.zeros_like(imagen)
    aisladas[union] = imagen[union]
    Image.fromarray(aisladas).save("hojas_aisladas.png")

    # 4. Solo las hojas con su color original, fondo transparente
    rgba = np.dstack([imagen, (union * 255).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save("hojas_transparente.png")

    print(f"Hojas/objetos detectados: {len(mascaras)}")
    print("Guardados: mascara.png, contornos.png, hojas_aisladas.png, hojas_transparente.png")


def main():
    imagen = cargar_imagen(IMAGEN, MAX_LADO)
    modelo = build_sam2(CFG, CKPT, device="cpu")

    if MODO == "puntos":
        mascaras = modo_puntos(modelo, imagen)
    elif MODO == "caja":
        mascaras = modo_caja(modelo, imagen)
    elif MODO == "auto":
        mascaras = modo_auto(modelo, imagen)
    else:
        raise ValueError('MODO debe ser "puntos", "caja" o "auto"')

    if not mascaras:
        print("No se encontraron mascaras. Baja AREA_MIN o sube POINTS_PER_SIDE.")
        return

    guardar_todo(imagen, mascaras)


if __name__ == "__main__":
    main()
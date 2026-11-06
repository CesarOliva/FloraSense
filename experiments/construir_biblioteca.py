"""
Construye la "biblioteca" de referencia para clasificar hojas por vecinos (kNN) con DINOv2.

Espera una carpeta con esta estructura (puede venir anidada, por ejemplo Train/Train/Healthy):

    <RAIZ>/
        Train/       Healthy/  Powdery/  Rust/
        Validation/  Healthy/  Powdery/  Rust/
        Test/        Healthy/  Powdery/  Rust/

Que hace:
    1. Convierte cada imagen en su embedding con DINOv2 (se guarda en cache).
    2. Elige el mejor k usando Validation (biblioteca = Train).
    3. Evalua en Test (imagenes que el sistema no ha visto) y muestra el resultado.
    4. Calcula un umbral de similitud para decir "no estoy seguro".
    5. Guarda biblioteca.npz (Train + Validation) para usarla con predecir_knn.py.

Instalacion (una vez):
    pip install transformers pillow numpy

Uso:
    python construir_biblioteca.py "C:\\ruta\\a\\la\\carpeta\\que\\contiene\\Train"
    (si no pasas ruta, busca una carpeta 'dataset' junto a este script)
"""
import sys
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModel

# ============ CONFIGURACION ============
MODELO = "facebook/dinov2-small"    # mas precision y mas lento: "facebook/dinov2-base"
EXTENSIONES = {".jpg", ".jpeg", ".png", ".webp"}
CLASES = ["Healthy", "Powdery", "Rust"]    # Healthy debe ir primero (indice 0 = sana)
SPLITS = {"train": "train", "validation": "val", "valid": "val", "val": "val", "test": "test"}
VALORES_K = [1, 3, 5, 7, 9, 11, 15]
BATCH = 16
CACHE = "cache_embeddings.npz"
SALIDA = "biblioteca.npz"
# =======================================


def abrir_imagen(ruta):
    """Abre la imagen; si es un JPEG grande, la decodifica a menor tamano (mucho mas rapido en CPU)."""
    img = Image.open(ruta)
    img.draft("RGB", (512, 512))
    return img.convert("RGB")


def cargar_dino():
    processor = AutoImageProcessor.from_pretrained(MODELO)
    dino = AutoModel.from_pretrained(MODELO).eval()
    return processor, dino


def calcular_embeddings(rutas, processor, dino):
    """Lista de rutas -> matriz (N, 768) con embeddings normalizados."""
    salidas = []
    for i in range(0, len(rutas), BATCH):
        lote = [abrir_imagen(r) for r in rutas[i:i + BATCH]]
        inputs = processor(images=lote, return_tensors="pt")
        with torch.inference_mode():
            h = dino(**inputs).last_hidden_state
        emb = torch.cat([h[:, 0], h[:, 1:].mean(dim=1)], dim=1)   # resumen global + promedio de parches
        emb = torch.nn.functional.normalize(emb, dim=1)
        salidas.append(emb.numpy())
        if (i // BATCH) % 10 == 0:
            print(f"  {min(i + BATCH, len(rutas))}/{len(rutas)}")
    return np.concatenate(salidas)


def votar(sims_fila, yl, k):
    """Toma los k vecinos mas parecidos y vota. Devuelve (clase ganadora, conteo por clase, indices)."""
    idx = np.argsort(-sims_fila)[:k]
    conteo = np.bincount(yl[idx], minlength=len(CLASES)).astype(float)
    suma_sim = np.zeros(len(CLASES))
    np.add.at(suma_sim, yl[idx], sims_fila[idx])
    pred = int(np.argmax(conteo + 0.001 * suma_sim))   # desempata con la similitud
    return pred, conteo, idx


def clasificar_lote(Xq, Xl, yl, k):
    """Clasifica varias consultas. Devuelve (predicciones, similitud con el vecino mas cercano)."""
    sims = Xq @ Xl.T    # embeddings normalizados -> producto punto = similitud coseno
    preds = [votar(sims[i], yl, k)[0] for i in range(len(Xq))]
    return np.array(preds), sims.max(axis=1)


def listar_imagenes(raiz):
    items = []
    for p in sorted(raiz.rglob("*")):
        if p.suffix.lower() not in EXTENSIONES:
            continue
        partes = [x.lower() for x in p.relative_to(raiz).parts[:-1]]
        split = next((SPLITS[x] for x in partes if x in SPLITS), None)
        clase = next((c for c in CLASES if c.lower() in partes), None)
        if split and clase:
            items.append((p, split, CLASES.index(clase)))
    return items


def informe(y_real, y_pred):
    n = len(CLASES)
    cm = np.zeros((n, n), dtype=int)
    for r, p in zip(y_real, y_pred):
        cm[r, p] += 1
    print("Matriz de confusion (filas = real, columnas = predicho):")
    print(" " * 10 + "".join(f"{c:>10s}" for c in CLASES))
    for i, c in enumerate(CLASES):
        print(f"{c:>10s}" + "".join(f"{v:10d}" for v in cm[i]))
    for i, c in enumerate(CLASES):
        tp = cm[i, i]
        prec = tp / max(cm[:, i].sum(), 1)
        rec = tp / max(cm[i].sum(), 1)
        print(f"  {c}: precision {prec:.2f} | recall {rec:.2f}")
    print(f"Exactitud total: {np.trace(cm) / cm.sum():.3f}")
    real_b, pred_b = y_real != 0, y_pred != 0    # 0 = Healthy; el resto = enferma
    print(f"Sana vs enferma (Powdery + Rust juntas): {(real_b == pred_b).mean():.3f}")


def main():
    raiz = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "dataset"
    if not raiz.exists():
        raise SystemExit(f"No existe la carpeta {raiz}\n"
                         "Uso: python construir_biblioteca.py RUTA_DE_LA_CARPETA_QUE_CONTIENE_Train_Test_Validation")

    items = listar_imagenes(raiz)
    if not items:
        raise SystemExit("No encontre imagenes en carpetas Train/Validation/Test con subcarpetas "
                         "Healthy/Powdery/Rust. Revisa la ruta.")

    rutas = [str(p) for p, _, _ in items]
    splits = np.array([s for _, s, _ in items])
    y = np.array([c for _, _, c in items])
    for s in ("train", "val", "test"):
        cuenta = ", ".join(f"{CLASES[c]}: {int(((splits == s) & (y == c)).sum())}" for c in range(len(CLASES)))
        print(f"{s:6s} {int((splits == s).sum()):5d} imagenes  ({cuenta})")
        if (splits == s).sum() == 0:
            raise SystemExit(f"Falta el conjunto '{s}'.")

    # Embeddings (con cache para no recalcular)
    X = None
    cache = Path(CACHE)
    if cache.exists():
        d = np.load(cache)
        if list(d["rutas"]) == rutas and str(d["modelo"]) == MODELO:
            X = d["X"]
            print("\nEmbeddings cargados desde cache.")
    if X is None:
        print("\nCalculando embeddings con DINOv2 (en CPU tarda unos minutos, solo la primera vez)...")
        processor, dino = cargar_dino()
        X = calcular_embeddings(rutas, processor, dino)
        np.savez(cache, X=X, rutas=np.array(rutas), modelo=MODELO)

    Xtr, ytr = X[splits == "train"], y[splits == "train"]
    Xva, yva = X[splits == "val"], y[splits == "val"]
    Xte, yte = X[splits == "test"], y[splits == "test"]

    # 1) Elegir k con Validation (biblioteca = Train)
    print("\nElegiendo k con Validation (biblioteca = Train):")
    mejor_k, mejor_acc = VALORES_K[0], -1.0
    for k in VALORES_K:
        if k > len(Xtr):
            continue
        pred, _ = clasificar_lote(Xva, Xtr, ytr, k)
        acc = float((pred == yva).mean())
        print(f"  k={k:2d}: exactitud {acc:.3f}")
        if acc > mejor_acc:
            mejor_k, mejor_acc = k, acc
    print(f"-> k elegido: {mejor_k}")

    # 2) Evaluar en Test (imagenes que el sistema no vio)
    print("\n=== Resultado en Test ===")
    pred_te, top1_te = clasificar_lote(Xte, Xtr, ytr, mejor_k)
    informe(yte, pred_te)

    # 3) Umbral de "no estoy seguro": percentil 5 de la similitud del vecino mas cercano en Validation
    _, top1_va = clasificar_lote(Xva, Xtr, ytr, mejor_k)
    umbral = float(np.percentile(top1_va, 5))
    print(f"\nUmbral de similitud para 'no estoy seguro': {umbral:.3f}")
    print(f"En Test, {int((top1_te < umbral).sum())} de {len(top1_te)} imagenes quedarian como 'incierto'.")

    # 4) Biblioteca final = Train + Validation (Test se queda solo para evaluar)
    mask = splits != "test"
    np.savez(
        SALIDA,
        X=X[mask],
        y=y[mask],
        rutas=np.array([r for r, m in zip(rutas, mask) if m]),
        clases=np.array(CLASES),
        k=mejor_k,
        umbral=umbral,
        modelo=MODELO,
    )
    print(f"\nBiblioteca guardada en {SALIDA} ({int(mask.sum())} imagenes de referencia).")


if __name__ == "__main__":
    main()
"""
Clasifica fotos nuevas comparandolas con la biblioteca (kNN sobre embeddings de DINOv2).

Primero ejecuta construir_biblioteca.py para generar biblioteca.npz.

Uso:
    python predecir_knn.py foto1.jpg foto2.jpg ...

Por cada foto muestra: el resultado, el veredicto sana/enferma, los vecinos mas parecidos
y guarda vecinos_<nombre>.png con tu foto junto a esos vecinos.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

from construir_biblioteca import abrir_imagen, calcular_embeddings, cargar_dino, votar

ARCHIVO = "biblioteca.npz"
GUARDAR_COLLAGE = True


def guardar_collage(ruta_consulta, vecinos, salida, tam=224):
    """vecinos: lista de (ruta, etiqueta, similitud)."""
    lienzo = Image.new("RGB", (tam * (len(vecinos) + 1), tam + 24), "white")
    dibujo = ImageDraw.Draw(lienzo)
    lienzo.paste(ImageOps.fit(abrir_imagen(ruta_consulta), (tam, tam)), (0, 24))
    dibujo.text((6, 6), "Tu foto", fill="black")
    for i, (ruta, etiqueta, sim) in enumerate(vecinos, start=1):
        try:
            lienzo.paste(ImageOps.fit(abrir_imagen(ruta), (tam, tam)), (i * tam, 24))
        except Exception:
            pass    # si moviste el dataset, esa miniatura se omite
        dibujo.text((i * tam + 6, 6), f"{etiqueta}  {sim:.2f}", fill="black")
    lienzo.save(salida)


def main():
    fotos = sys.argv[1:]
    if not fotos:
        raise SystemExit("Uso: python predecir_knn.py foto1.jpg [foto2.jpg ...]")
    if not Path(ARCHIVO).exists():
        raise SystemExit(f"No existe {ARCHIVO}. Ejecuta primero: python construir_biblioteca.py RUTA")

    lib = np.load(ARCHIVO)
    Xl, yl = lib["X"], lib["y"]
    rutas_lib = [str(r) for r in lib["rutas"]]
    clases = [str(c) for c in lib["clases"]]
    k, umbral = int(lib["k"]), float(lib["umbral"])

    processor, dino = cargar_dino()
    X = calcular_embeddings(fotos, processor, dino)
    sims = X @ Xl.T

    for i, foto in enumerate(fotos):
        pred, conteo, idx = votar(sims[i], yl, k)
        top1 = float(sims[i, idx[0]])
        sanos = int(conteo[0])             # indice 0 = Healthy
        enfermos = k - sanos
        veredicto = "sana" if sanos > enfermos else "enferma"

        print(f"\n=== {foto} ===")
        if top1 < umbral:
            print(f"NO ESTOY SEGURO: ninguna hoja de la biblioteca se parece lo suficiente "
                  f"(similitud maxima {top1:.2f} < umbral {umbral:.2f}).")
        print(f"Resultado: {clases[pred]} ({int(conteo[pred])}/{k} vecinos)")
        print(f"Veredicto: {veredicto} ({sanos} sanas vs {enfermos} enfermas entre los {k} vecinos)")
        print("Vecinos mas parecidos:")
        vecinos = []
        for n, j in enumerate(idx, start=1):
            etiqueta = clases[yl[j]]
            sim = float(sims[i, j])
            vecinos.append((rutas_lib[j], etiqueta, sim))
            print(f"  {n}. {etiqueta:8s} similitud {sim:.2f}  {Path(rutas_lib[j]).name}")

        if GUARDAR_COLLAGE:
            salida = f"vecinos_{Path(foto).stem}.png"
            guardar_collage(foto, vecinos[:5], salida)
            print(f"Guardado: {salida}")


if __name__ == "__main__":
    main()
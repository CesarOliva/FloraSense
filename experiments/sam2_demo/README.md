# Demo SAM 2

Demo mínima de [SAM 2.1](https://github.com/facebookresearch/sam2) (Meta) vía Hugging Face `transformers`.
Página en blanco: adjuntas una foto, haces clic sobre un objeto y se dibuja la máscara.

- **Clic izquierdo**: punto positivo (incluir)
- **Clic derecho**: punto negativo (excluir)

## Instalación

```bash
cd experiments/sam2_demo
python -m venv .venv
.venv\Scripts\activate            # Windows  (Linux/Mac: source .venv/bin/activate)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu   # o la build CUDA
pip install -r requirements.txt
```

## Uso

```bash
uvicorn app:app --port 8001
```

Abrir http://localhost:8001. La primera vez descarga el modelo (~150 MB) a la caché de Hugging Face.

## Cómo funciona

1. `POST /upload` — redimensiona la imagen (máx. 1024 px) y calcula los embeddings del encoder (lo costoso: ~3 s en CPU). Se guardan en memoria.
2. `POST /segment` — con los embeddings guardados + los puntos, el decoder predice 3 máscaras y se devuelve la de mayor IoU estimado (~0.1–0.2 s en CPU).

Para otro tamaño de modelo: `SAM2_MODEL=facebook/sam2.1-hiera-large uvicorn app:app --port 8001`
(`tiny`, `small`, `base-plus`, `large`).

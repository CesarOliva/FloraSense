# FloraSense

MVP para identificar plantas ornamentales a partir de fotos, analizar visualmente su ambiente y proponer cuidados contextualizados. Ver `docs/FloraSense_Plan_Implementacion_8_Dias.md` para el plan completo, contratos de API y cronograma.

## Estructura del monorepo

```
FloraSense/
├── frontend/          # Next.js + TypeScript + Tailwind + shadcn/ui (App Router)
├── backend/           # FastAPI + Pydantic
│   ├── api/           # Routers de endpoints (/health, /api/identify, /api/analyze, /api/plants, /api/segment)
│   ├── schemas/       # DTOs Pydantic (EnvironmentContext, SpeciesCandidate, Symptom, Recommendation, AnalysisResult)
│   ├── services/      # plantnet.py, vision.py, recommendations.py, segmentation.py
│   ├── data/          # plants.json (catálogo 15–20 especies) y fixtures
│   ├── tests/         # Pruebas y fixtures mock
│   ├── uploads/       # Archivos temporales (no se persisten)
│   └── main.py        # Punto de entrada FastAPI
├── experiments/       # Notebook/CLI reproducible Grounding DINO + SAM 2 (P1)
├── docs/              # Plan de implementación y documentación
└── README.md
```

## Stack

- **Frontend:** Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend:** Python 3.10+, FastAPI, Pydantic
- **IA:** Pl@ntNet API (identificación), VLM por API (análisis visual), Grounding DINO + SAM 2 (experimental)
- **Deploy previsto:** frontend en Vercel; API en hosting Python

## Configuración inicial

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
cp .env.example .env.local   # configurar NEXT_PUBLIC_API_BASE_URL
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env          # completar claves de API
uvicorn main:app --reload     # http://localhost:8000
```

## Convenciones

- Claves de API **solo en el backend**; prohibido en variables `NEXT_PUBLIC_*`.
- Contratos de API congelados al cierre del Día 1 (ver `docs/`).
- Ramas: `feat/frontend-*`, `feat/api-*`, `feat/ai-*`, `feat/segmentation-*`.
- Respuestas mock desde el Día 1; el frontend nunca depende de APIs activas.
- Sin base de datos en el MVP; imágenes temporales.

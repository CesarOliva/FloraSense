# FotoSinDisease — Frontend

Next.js (App Router) + TypeScript + Tailwind 4 + shadcn/ui.

## Ejecutar

```bash
npm install
cp .env.example .env.local
npm run dev        # http://192.168.1.103:3000
```

Por defecto la app usa **respuestas simuladas** (`src/lib/mocks.ts`), así que funciona sin backend.
Para conectarla a FastAPI, en `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://192.168.1.103:8000
NEXT_PUBLIC_USE_MOCKS=false
```

## Pantallas

| Ruta | Herramienta | Qué hace |
|---|---|---|
| `/` | Inicio | Las 4 herramientas de cuidado y "Mis plantas" |
| `/diagnosticar` | Diagnosticar | Fotos (1–3) → confirmar especie → entorno → salud, recomendaciones, ficha y segmentación |
| `/identificar` | Identificar | Una foto → especie + ficha de cuidados → "Agregar a mis plantas" |
| `/calculadora-agua` | Calculadora de agua | Planta guardada o foto nueva → maceta y entorno → cantidad y frecuencia de riego |
| `/recordatorios` | Recordatorios | Próximo riego de cada planta guardada, "La regué hoy" y ajuste de frecuencia |

En Diagnosticar, tras `POST /api/analyze` se pide `POST /api/segment` (Grounding DINO + SAM 2);
si falla, el resto de resultados no se ve afectado.

**Mis plantas** se guardan en el navegador (`localStorage`, ver `src/lib/plants-store.ts`) porque
el MVP no tiene cuentas ni base de datos. La calculadora de agua (`src/lib/water.ts`) es una
estimación orientativa en el cliente.

## Estructura

```
src/
├── app/                 layout y página principal
├── components/
│   ├── flow/            Diagnosticar: pasos del asistente y orquestador (analysis-flow.tsx)
│   ├── results/         salud, recomendaciones, ficha, visor con segmentación
│   ├── identify/        Identificar: hook de identificación + panel (también lo usa la calculadora)
│   ├── water/           Calculadora de agua
│   ├── reminders/       Recordatorios
│   ├── home/            Mis plantas en el inicio
│   ├── photo/, plants/  captura de foto y miniatura de planta compartidas
│   └── ui/              componentes shadcn
└── lib/
    ├── types.ts         contrato con el backend (equivalente a los schemas Pydantic)
    ├── api.ts           cliente HTTP, timeouts y mensajes de error
    ├── mocks.ts         respuestas simuladas
    ├── labels.ts        textos en español para los enums
    ├── plants-store.ts  Mis plantas (localStorage) y cálculo del próximo riego
    ├── water.ts         estimación de cantidad y frecuencia de riego
    └── validation.ts    tipos y tamaño de imagen permitidos
```

## Contrato con el backend

- `POST /api/identify` — campo `images` (1–3 archivos) → `{ candidates: SpeciesCandidate[] }`
- `POST /api/analyze` — `images`, `species` (JSON de `SelectedSpecies`), `context` (JSON de `EnvironmentContext`) → `AnalysisResult`
- `POST /api/segment` — campo `image` → `{ available, overlayUrl?, note? }`
- `GET /api/plants/{id}` → `PlantProfile` o 404

`PlantProfile` en `src/lib/types.ts` es la forma propuesta para las entradas de `plants.json`
(incluye `sunExposure`, `waterNeeds` y `prevention`); acordarla con el responsable del catálogo.

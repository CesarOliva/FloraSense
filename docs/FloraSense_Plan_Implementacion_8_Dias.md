# FloraSense — Plan de implementación del MVP

**Proyecto:** FloraSense / PhytoLens (nombre comercial por definir)  
**Duración:** 8 días hábiles  
**Equipo:** 4 desarrolladores  
**Público:** personas que cuidan plantas ornamentales en el hogar  
**Infraestructura de IA:** híbrida (APIs externas + modelos abiertos)  
**Objetivo:** entregar una aplicación web funcional para identificar plantas a partir de fotos, analizar visualmente su ambiente y posibles problemas, y proponer cuidados contextualizados, acompañada de una demostración reproducible de detección/segmentación con Grounding DINO y SAM 2.

> **Principio de alcance:** en ocho días se prioriza un flujo confiable de extremo a extremo. La segmentación integrada es una meta condicionada a la disponibilidad de cómputo; la demostración reproducible de Grounding DINO + SAM 2 sí es parte del alcance del equipo. El sistema no emitirá diagnósticos botánicos definitivos a partir de una fotografía.

---

## 1. Alcance del MVP

### Funciones obligatorias (P0)

1. Subir **1–3 fotografías** de **una misma planta** (planta completa y, opcionalmente, hoja y zona afectada).
2. Validar archivos (JPG/PNG/WebP, tamaño máximo configurable, límites y tipos seguros).
3. Consultar identificación botánica con **Pl@ntNet** y mostrar hasta tres especies candidatas.
4. Permitir **confirmar o corregir** la especie identificada antes de las recomendaciones.
5. Registrar contexto mínimo: interior/exterior (sugerido y editable), luz, último riego y drenaje. Ciudad opcional, de forma manual.
6. Consultar ficha botánica estructurada de una selección inicial de **15–20 especies ornamentales**.
7. Analizar fotografías con un **VLM** para describir entorno, síntomas visibles e incertidumbre.
8. Generar recomendaciones fundamentadas en ficha botánica, contexto confirmado y síntomas observados (ubicación, luz, riego, sustrato, drenaje y humedad).
9. Mostrar resultados en una interfaz responsiva: especie, cuidados, observaciones, hipótesis y acciones sugeridas.
10. Manejar respuestas vacías, baja confianza, errores de APIs y datos no disponibles.
11. Entregar aplicación principal desplegada o reproducible mediante instrucciones claras, pruebas y README.

### Funciones experimentales (P1)

1. Pipeline reproducible **Grounding DINO → SAM 2** para localizar y segmentar plantas u hojas en imágenes reales.
2. Guardar máscaras/superposiciones de ejemplo y registrar condiciones de ejecución.
3. Integrar `POST /api/segment` con la web **solo si** la inferencia es viable dentro del plazo; en caso contrario, conservar el notebook/CLI y una visualización de ejemplo claramente etiquetada.

### Fuera del MVP (P2 / posterior)

- Cuentas, autenticación, base de datos persistente e historial.
- Recordatorios, notificaciones, monitoreo temporal, sensores IoT.
- Entrenamiento/fine-tuning de modelos botánicos.
- Diagnóstico confirmatorio de enfermedades y plagas específicas.
- Cálculo robusto de porcentaje de superficie dañada en cualquier escenario.
- RAG y base vectorial; clima en tiempo real o geolocalización automática.
- Segmentación multihoja exhaustiva de escenas complejas.

---

## 2. Equipo y responsabilidades

Los integrantes se identificarán inicialmente como **Dev A, B, C y D**; sustituir por nombres al iniciar.

| Integrante | Rol principal | Propiedad de código | Entregable central |
|---|---|---|---|
| **Dev A** | Frontend / UX | `frontend/` | Captura, flujo guiado, confirmación de especie y dashboard responsivo |
| **Dev B** | Backend / integración | `backend/api/`, `backend/schemas/`, `backend/main.py` | Endpoints, contratos, validaciones, orquestación, manejo de errores y despliegue |
| **Dev C** | IA multimodal / botánica | `backend/services/plantnet.py`, `vision.py`, `recommendations.py`, `backend/data/` | Identificación, análisis con VLM, catálogo y recomendaciones basadas en reglas |
| **Dev D** | Visión por computadora / calidad | `experiments/`, `backend/services/segmentation.py`, `backend/tests/` | Pipeline DINO + SAM, evaluación visual, pruebas y demostración reproducible |

### Responsabilidades compartidas

- **Dev B** es responsable de integrar cambios entre módulos; cada desarrollador mantiene sus propias pruebas.
- **Dev A + B:** contrato frontend ↔ backend, manejo de progreso, estados vacíos y fallos.
- **Dev B + C:** schemas Pydantic y validación de respuestas externas.
- **Dev C + D:** vocabulario de síntomas, imágenes de evaluación y límites de interpretación.
- **Todos:** revisión de PRs, pruebas del flujo principal, README y demostración final.

### Reglas para trabajar en paralelo

- Monorepo con carpetas separadas y **contratos congelados al terminar el Día 1**.
- Ramas `feat/frontend-*`, `feat/api-*`, `feat/ai-*`, `feat/segmentation-*` y PRs cortos.
- Un revisor por PR; no modificar directamente áreas de otro responsable sin coordinación.
- Respuestas **mock** desde el Día 1 para que el frontend nunca dependa de APIs activas.
- Reunión diaria breve (15 min): avances, impedimentos y decisiones.
- Integración al repositorio principal **cada día**, no esperar al final.
- Las claves de API estarán únicamente en el backend, nunca en variables `NEXT_PUBLIC_*`.

---

## 3. Arquitectura

```mermaid
flowchart TD
  U[Usuario: fotografías y contexto] --> FE[Next.js + TypeScript]
  FE --> API[FastAPI + Pydantic]
  API --> PN[Pl@ntNet: especies candidatas]
  API --> VLM[API VLM: escena y síntomas]
  API --> CAT[Catálogo JSON: fichas botánicas]
  API --> REC[Motor de reglas y recomendaciones]
  API -. opcional .-> SEG[Grounding DINO + SAM 2]
  PN --> API
  VLM --> API
  CAT --> REC
  REC --> API
  SEG --> API
  API --> FE
```

### Tecnologías

| Parte | Stack | Decisión |
|---|---|---|
| UI | Next.js, TypeScript, TailwindCSS, shadcn/ui | App Router, componentes reutilizables |
| API | Python, FastAPI, Pydantic | Backend único y modular, sin microservicios |
| Identificación | Pl@ntNet API | Candidatos y confirmación por el usuario |
| Interpretación visual | VLM por API (p. ej., Gemini, sujeto a acceso/cuotas) | Salida JSON validada por Pydantic |
| Detección | Grounding DINO | Cajas de objetos/hojas por prompts |
| Segmentación | SAM 2 | Máscaras sobre regiones identificadas |
| Utilidades de imagen | Pillow, OpenCV | Preparación y superposición de máscaras |
| Conocimiento | `plants.json` | Fichas verificadas y controladas por el equipo |
| Persistencia | Sin DB en MVP | Imágenes temporales y respuesta no persistente |
| Deploy | Frontend en Vercel; API en hosting Python adecuado | Inferencia GPU desacoplada si aplica |

**Límites técnicos:** la foto no mide humedad real del sustrato, pH, nutrientes ni horas exactas de luz. El VLM devuelve observaciones e hipótesis, no mediciones físicas. La ciudad es opcional y no se debe utilizar para inferir condiciones de una habitación.

### Flujo de análisis

1. Usuario sube fotografías, con vista previa y validación.
2. `POST /api/identify` consulta Pl@ntNet y entrega candidatos.
3. Usuario confirma la especie; si no hay coincidencia fiable, puede continuar con recomendaciones generales, marcadas como provisionales.
4. Usuario confirma/corrige el contexto sugerido (interior/exterior, luz, riego, drenaje).
5. `POST /api/analyze` envía imágenes, especie y contexto a la API.
6. Backend combina VLM, ficha botánica y motor de reglas para obtener respuesta estructurada.
7. Frontend presenta cuidados, síntomas, nivel de incertidumbre y acciones priorizadas.
8. Como módulo independiente, `POST /api/segment` o notebook aplica DINO + SAM 2 y genera una imagen con superposición, cuando esté disponible.

---

## 4. Contratos de API (base del Día 1)

| Método | Ruta | Entrada | Salida |
|---|---|---|---|
| GET | `/health` | Ninguna | Estado de API |
| POST | `/api/identify` | `multipart/form-data` con 1–3 imágenes | Candidatos botánicos y puntuaciones originales |
| POST | `/api/analyze` | `multipart/form-data`: imágenes, especie confirmada y contexto JSON | Ficha, observaciones, hipótesis y recomendaciones |
| GET | `/api/plants/{id}` | Identificador del catálogo | Ficha botánica o 404 |
| POST | `/api/segment` | Una imagen | Máscara/superposición y metadatos (P1, optativo para producción) |

### DTOs mínimos

```ts
type EnvironmentContext = {
  locationType: 'indoor' | 'outdoor' | 'unknown';
  light: 'direct' | 'indirect' | 'low' | 'unknown';
  lastWatered: 'today_yesterday' | '2_4_days' | '5_7_days' | 'over_7_days' | 'unknown';
  hasDrainage: 'yes' | 'no' | 'unknown';
  city?: string;
};

type SpeciesCandidate = {
  scientificName: string;
  commonNames: string[];
  score: number | null; // puntuación original de Pl@ntNet; no probabilidad clínica
  catalogId?: string;
};

type Symptom = {
  type: 'yellowing' | 'brown_spots' | 'wilting' | 'dry_edges' | 'other';
  description: string;
  severity: 'mild' | 'moderate' | 'high' | 'unknown';
  visibleEvidence: string;
};

type Recommendation = {
  category: 'placement' | 'lighting' | 'watering' | 'substrate' | 'drainage' | 'humidity' | 'monitoring';
  priority: 'high' | 'medium' | 'low';
  action: string;
  rationale: string;
  source: 'plant_profile' | 'context_rule' | 'visual_observation';
};

type AnalysisResult = {
  species: { scientificName: string; commonName?: string; confirmed: boolean };
  environment: { suggestedLocationType: string; observations: string[] };
  plantProfile: Record<string, unknown> | null;
  health: {
    status: 'no_obvious_issues' | 'review_needed' | 'insufficient_evidence';
    symptoms: Symptom[];
    possibleCauses: string[];
    disclaimer: string;
  };
  recommendations: Recommendation[];
  segmentation?: { available: boolean; overlayUrl?: string; note?: string };
};
```

> El contrato TypeScript anterior sirve de referencia; Dev B mantendrá un esquema equivalente en Pydantic y Dev A los tipos del frontend. No duplicar lógica de negocio entre ambos lados.

### Convenciones de errores

- `400`: contexto inválido o datos faltantes.
- `413`: archivo demasiado grande.
- `415`: formato no admitido.
- `422`: esquema inválido.
- `429`: proveedor externo con límite de solicitudes.
- `502/503`: proveedor externo no disponible; exponer mensaje entendible y reintento.
- El frontend debe permitir continuar cuando el módulo de segmentación no esté disponible.

### Catálogo botánico

- Crear inicialmente **15–20 especies ornamentales frecuentes**.
- Para cada entrada: `id`, nombres científico/común, familia, luz, criterio general de riego, temperatura orientativa, humedad, tipo de sustrato, drenaje, tamaño aproximado, advertencias y fuentes.
- Guardar recomendaciones como rangos y condiciones, **no calendarios universales** (por ejemplo: comprobar sequedad del sustrato antes de regar en vez de regar cada X días).
- Resolver coincidencia por nombre científico normalizado; mantener alias/sinónimos cuando se conozcan.
- Si una especie no existe en el catálogo: respuesta limitada, sin inventar parámetros.

---

## 5. Cronograma paralelo: 8 días hábiles

> Fechas de referencia si se inicia el **lunes 2 de noviembre de 2026** y se trabaja de lunes a viernes, sin considerar feriados: entrega el **miércoles 11 de noviembre de 2026**. Si el inicio cambia, conservar la secuencia D1–D8.

| Día | Dev A — Frontend | Dev B — Backend | Dev C — IA y botánica | Dev D — DINO/SAM y QA | Hito común |
|---|---|---|---|---|---|
| **D1 — Lun 2** | Inicializar Next.js; wireframe; carga mock | Inicializar FastAPI; DTOs; endpoints mock; CORS | Definir esquema botánico y prompts; acceso a APIs | Evaluar entorno GPU; dataset de pruebas; notebook base | **Contratos API y mocks congelados** |
| **D2 — Mar 3** | Flujo de upload, previews y selector de candidatos | `POST /api/identify`, validación y errores | Integrar Pl@ntNet y normalizar candidatos; primeras fichas | Cargar modelos/demos; detectar planta en imágenes | **Identificación extremo a extremo** |
| **D3 — Mié 4** | Formulario de ambiente y ficha botánica | `GET /api/plants/{id}`; esquema de análisis | Completar catálogo 15–20 plantas; reglas de cuidados | Grounding DINO: cajas de planta/hoja, ajustes de prompts | **Catálogo y formulario operativos** |
| **D4 — Jue 5** | Componentes de síntomas, recomendaciones y estados | Integrar `POST /api/analyze`; Pydantic; proveedor VLM | Prompt VLM, parsing JSON, incertidumbre y reglas | SAM 2: máscaras y superposición sobre al menos una imagen | **Análisis multimodal funcional; máscara inicial** |
| **D5 — Vie 6** | Conectar pantalla de resultados a API real | Orquestar análisis; timeout/reintentos controlados | Probar 10–15 imágenes y ajustar recomendaciones | Notebook reproducible DINO → SAM 2; guardar outputs | **Flujo central integrado + demo segmentación** |
| **D6 — Lun 9** | UX completa; responsive; errores y carga | Adaptador `/api/segment` si viable; integración estable | Revisar resultados confusos; fallback sin ficha | Integrar segmentación si hay infraestructura; pruebas API | **Decisión go/no-go de segmentación web** |
| **D7 — Mar 10** | Pulido de interfaz y accesibilidad | Deploy frontend/API; revisar secretos y CORS | Validación de contenido y documentación de modelos | Smoke tests, regresión, evaluación de máscaras | **Release candidate congelada** |
| **D8 — Mié 11** | Correcciones P0; demo UX | Correcciones P0; verificar deploy | Validación final y limitaciones | QA final, reproducibilidad de notebook y evidencias | **MVP entregado, README y demo** |

### Puntos de control obligatorios

- **Cierre de D1:** las rutas y DTOs están definidos; cada área puede trabajar con mocks.
- **Cierre de D2:** usuario sube fotografías y recibe candidatos botánicos reales o respuesta controlada ante fallo.
- **Cierre de D4:** API devuelve análisis contextual estructurado validado con Pydantic.
- **Cierre de D5:** flujo principal completo + una máscara real generada en notebook.
- **Mediodía de D6:** decidir si segmentación se conecta a web. Si no hay resultado estable, **se cierra esa integración**, se conserva demo y se prioriza el MVP.
- **Cierre de D7:** no iniciar nuevas funciones; únicamente corregir bugs críticos.
- **D8:** entrega, pruebas finales y demostración.

---

## 6. Backlog distribuido por épicas

### EP-01 — Experiencia de usuario (Dev A)

- [ ] Crear página de carga y previsualización de imágenes.
- [ ] Validar cantidad/tamaño/tipo en cliente y mostrar errores claros.
- [ ] Crear lista de candidatos con selección de especie.
- [ ] Construir formulario de entorno y ubicación opcional.
- [ ] Crear vista de resultados con secciones: especie, cuidados, salud y recomendaciones.
- [ ] Añadir estados `loading`, `empty`, `error` y `success`.
- [ ] Asegurar diseño responsivo básico y accesibilidad.

### EP-02 — API y orquestación (Dev B)

- [ ] Preparar FastAPI, CORS y configuración `.env`.
- [ ] Implementar validación de archivos y protección de claves.
- [ ] Definir schemas Pydantic y respuesta estándar de errores.
- [ ] Implementar `/health`, `/api/identify`, `/api/analyze`, `/api/plants/{id}`.
- [ ] Coordinar contratos con A y C; incluir fixtures mock.
- [ ] Añadir timeouts, logs sin datos sensibles y manejo de `429`.
- [ ] Desplegar API principal y probar consumo desde frontend.

### EP-03 — Identificación, VLM y recomendaciones (Dev C)

- [ ] Configurar Pl@ntNet y normalizar nombres científicos/candidatos.
- [ ] Preparar catálogo de 15–20 plantas y registrar fuentes.
- [ ] Implementar integración VLM y prompt con JSON estructurado.
- [ ] Evitar instrucciones peligrosas o conclusiones absolutas; describir incertidumbre.
- [ ] Implementar motor de reglas de luz, riego, ubicación y drenaje.
- [ ] Definir comportamiento ante especie no encontrada.
- [ ] Probar recomendaciones con imágenes sanas y casos de daño visible.

### EP-04 — Segmentación, evaluación y calidad (Dev D)

- [ ] Documentar instalación del entorno (versiones, GPU, dependencias).
- [ ] Preparar conjunto de imágenes con plantas completas y hojas visibles.
- [ ] Aplicar Grounding DINO para detectar planta/hojas.
- [ ] Pasar cajas a SAM 2 y obtener máscaras sobre ejemplos reales.
- [ ] Exportar superposición visual, imágenes y parámetros de prueba.
- [ ] Preparar CLI/notebook que otro desarrollador pueda repetir.
- [ ] Integrar adaptador a backend solo si inferencia y tiempo lo permiten.
- [ ] Coordinar pruebas de endpoints, errores y flujo completo.

---

## 7. Estrategia de pruebas

### Set mínimo de validación

Preparar **15–20 fotografías** (propias o con licencia compatible), buscando variedad de:

- Plantas ornamentales sanas y con síntomas visibles.
- Fotografías de planta completa y acercamientos de hojas.
- Ambientes interior/exterior, luz fuerte y luz escasa.
- Fondos complejos, varias hojas superpuestas y macetas distintas.
- Al menos algunos ejemplos de imágenes poco claras y especies fuera del catálogo.

Registrar por imagen: identificación esperada si se conoce, resultado de Pl@ntNet, confirmación manual, observaciones VLM, respuesta de cuidado, errores y tiempo aproximado. No convertir salidas de IA en etiquetas de verdad sin verificación.

### Pruebas P0

- [ ] Una foto válida produce candidatos o un error manejado.
- [ ] Tres fotos válidas son aceptadas; cuatro se rechazan.
- [ ] Archivo no permitido y tamaño excesivo se rechazan correctamente.
- [ ] Un usuario puede corregir el ambiente detectado y la especie propuesta.
- [ ] El análisis no afirma diagnosticar una enfermedad sin evidencia suficiente.
- [ ] Si no hay ficha de especie, se indica expresamente la limitación.
- [ ] La UI muestra estados adecuados ante timeout y cuota excedida.
- [ ] El frontend no contiene API keys de terceros.
- [ ] El flujo principal funciona sin el servicio de segmentación.

### Métricas de seguimiento

- **Identificación:** Top-1/Top-3 en imágenes donde haya referencia confiable.
- **Salud:** revisión cualitativa de síntomas y posibles falsos positivos.
- **Segmentación:** presencia de máscara válida, ejemplos de fallo; IoU/Dice solo si se crean máscaras de referencia.
- **Operación:** tasa de flujos completados, errores externos y latencia observada.

---

## 8. Riesgos y contingencias

| Riesgo | Señal de alerta | Mitigación / decisión |
|---|---|---|
| APIs sin clave, créditos o cuota | No hay respuesta real en D2/D4 | Probar acceso desde D1; mocks para desarrollo; fallback informado en UI |
| Respuesta VLM inválida | JSON no pasa Pydantic | Schema estricto, validación, reintento limitado y mensaje de error |
| Especie ambigua | Candidatos muy similares o baja confianza | Confirmación manual; recomendaciones provisionales |
| Recomendaciones inexactas | Discrepancia con la ficha o contexto | Reglas basadas en catálogo, evidencias y limitaciones explícitas |
| GPU no disponible o inferencia muy lenta | Notebook no entrega máscaras en D4/D5 | Demo con entorno GPU disponible; no bloquear API principal |
| Integración tardía | Frontend y API difieren en DTO | Congelar contratos en D1 y validar diariamente con fixtures |
| Poco tiempo para QA | Bugs P0 al cierre de D6 | Congelar alcance en D6, release candidate en D7 |
| Privacidad de imágenes/ubicación | Exposición en logs o almacenamiento | No persistir por defecto; minimizar datos; ubicación manual opcional |

---

## 9. Definition of Done (entrega final)

### Producto

- [ ] La interfaz permite subir de 1 a 3 fotos de una misma planta.
- [ ] Se presentan especies candidatas y se permite confirmación/corrección.
- [ ] El usuario indica contexto real del entorno.
- [ ] Se muestra una ficha botánica de una especie del catálogo.
- [ ] Se identifican y describen posibles síntomas visuales con incertidumbre explícita.
- [ ] Las recomendaciones explican **qué hacer** y **por qué**.
- [ ] Existen estados de carga y recuperación ante fallos externos.
- [ ] La aplicación principal funciona sin dependencia de inferencia GPU.

### Componente de investigación

- [ ] Pipeline DINO → SAM 2 reproducible al menos con una imagen real.
- [ ] Se entrega una máscara/superposición visual y un registro del entorno usado.
- [ ] Se documenta claramente si `/api/segment` quedó integrado o solo experimental.

### Ingeniería

- [ ] README con instalación, ejecución, credenciales necesarias y arquitectura.
- [ ] `.env.example` sin secretos reales.
- [ ] Contratos API descritos y colección de ejemplos/fixtures.
- [ ] Tests básicos y checklist de QA completados.
- [ ] Demo de 3–5 minutos del flujo completo.
- [ ] Lista explícita de limitaciones y backlog siguiente.

---

## 10. Demo propuesta

1. Abrir FloraSense y subir dos fotografías de una planta ornamental.
2. Mostrar candidatos de Pl@ntNet y seleccionar el correcto.
3. Confirmar que está en interior, cerca de una ventana, e indicar el riego reciente y el drenaje.
4. Ejecutar análisis y explicar el resultado del VLM sin confundir síntomas con diagnóstico.
5. Presentar ficha botánica y tres recomendaciones priorizadas.
6. Mostrar una superposición DINO + SAM 2 generada con una fotografía real (en la web si se logró integrar; de lo contrario, desde el notebook y resultados guardados).
7. Cerrar con alcances, límites y siguientes pasos.

## 11. Extensiones posteriores

1. Persistencia de plantas, fotografías e historial por usuario.
2. Seguimiento temporal de anomalías y cambios en superficie afectada.
3. Clima local cuando el usuario lo habilite.
4. Sensores de humedad del suelo, iluminación y temperatura.
5. Validación de enfermedades específicas con un dataset y evaluación apropiados.
6. Servicio de segmentación GPU escalable y análisis de varias hojas.
7. Notificaciones y recomendaciones basadas en evolución y mediciones reales.

---

**Regla principal de ejecución:** cada integrante produce una pieza funcional y comprobable desde los primeros días. Si una función avanzada bloquea una integración, se preserva el flujo principal de identificación → contexto → análisis → recomendaciones y se entrega el componente avanzado como experimento separado y documentado.

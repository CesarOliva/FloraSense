import {
    mockAnalyze,
    mockIdentify,
    mockProfiles,
    mockSegment,
} from "@/lib/mocks";
import type {
    AnalysisResult,
    EnvironmentContext,
    IdentifyResponse,
    PlantProfile,
    SegmentationResult,
    SelectedSpecies,
} from "@/lib/types";

import { MAX_UPLOAD_SIZE_MB } from "@/lib/validation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

const IDENTIFY_TIMEOUT_MS = 30_000;
const ANALYZE_TIMEOUT_MS = 90_000;
const SEGMENT_TIMEOUT_MS = 60_000;
const PROFILE_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number | null
    ) {
        super(message);
        this.name = "ApiError";
    }
}

function messageForStatus(status: number): string {
    switch (status) {
        case 400:
        case 422:
            return "Faltan datos o no son válidos. Revisa las fotos y el formulario.";

        case 404:
            return "No encontramos la información solicitada.";

        case 413:
            return `Una de las fotos es demasiado grande (máximo ${MAX_UPLOAD_SIZE_MB} MB).`;

        case 415:
            return "Formato no admitido. Usa fotos JPG o PNG.";

        case 429:
            return "El servicio recibió demasiadas solicitudes. Espera un minuto y vuelve a intentarlo.";

        case 502:
        case 503:
        case 504:
            return "El servicio de análisis no está disponible en este momento. Inténtalo de nuevo en unos minutos.";

        default:
            return "Ocurrió un error inesperado. Inténtalo de nuevo.";
    }
}

async function request<T>(
    path: string,
    init: RequestInit,
    timeoutMs: number
): Promise<T> {
    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...init,
            signal: AbortSignal.timeout(timeoutMs),
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "TimeoutError") {
            throw new ApiError(
                "La solicitud está tardando demasiado. Inténtalo de nuevo.",
                null
            );
        }

        throw new ApiError(
            "No pudimos conectar con el servidor. Revisa tu conexión.",
            null
        );
    }

    if (!response.ok) {
        throw new ApiError(messageForStatus(response.status), response.status);
    }

    return (await response.json()) as T;
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function imagesForm(files: File[]) {
    const form = new FormData();
    for (const file of files) form.append("images", file);

    return form;
}

export function resolveApiUrl(url: string) {
    return url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
}

export async function identifyPlant(files: File[]): Promise<IdentifyResponse> {
    if (USE_MOCKS) {
        await delay(1200);
        return mockIdentify;
    }

    return request<IdentifyResponse>(
        "/api/identify",
        { method: "POST", body: imagesForm(files) },
        IDENTIFY_TIMEOUT_MS
    );
}

export async function analyzePlant(
    files: File[],
    species: SelectedSpecies,
    context: EnvironmentContext
): Promise<AnalysisResult> {
    if (USE_MOCKS) {
        await delay(2200);

        return mockAnalyze(species, context);
    }

    const form = imagesForm(files);
    form.append("species", JSON.stringify(species));
    form.append("context", JSON.stringify(context));

    return request<AnalysisResult>(
        "/api/analyze",
        { method: "POST", body: form },
        ANALYZE_TIMEOUT_MS
    );
}

export async function segmentPlant(file: File): Promise<SegmentationResult> {
    if (USE_MOCKS) {
        await delay(1500);
        return mockSegment;
    }
    const form = new FormData();
    form.append("image", file);

    return request<SegmentationResult>(
        "/api/segment",
        { method: "POST", body: form },
        SEGMENT_TIMEOUT_MS
    );
}

/** Ficha del catálogo, o null si la especie no está en él. */
export async function getPlantProfile(
    catalogId: string
): Promise<PlantProfile | null> {
    if (USE_MOCKS) {
        await delay(500);

        return mockProfiles[catalogId] ?? null;
    }
    try {
        return await request<PlantProfile>(
            `/api/plants/${encodeURIComponent(catalogId)}`,
            {},
            PROFILE_TIMEOUT_MS
        );
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}
// "Mis plantas": se guardan en el navegador (localStorage) porque el MVP no
// tiene cuentas ni base de datos. Cuando exista backend, sustituir este módulo.

import { useSyncExternalStore } from "react";
import type { PlantProfile } from "@/lib/types";

export type SavedPlant = {
  id: string;
  scientificName: string;
  commonName?: string;
  catalogId?: string;
  profile: PlantProfile | null;
  photo?: string; // miniatura en data URL
  addedAt: string; // YYYY-MM-DD
  lastWateredAt?: string; // YYYY-MM-DD
  wateringIntervalDays: number;
  waterAmountMl?: number;
};

const STORAGE_KEY = "florasense:plants:v1";
const EMPTY: SavedPlant[] = [];

let cache: SavedPlant[] | null = null;
const listeners = new Set<() => void>();

function read(): SavedPlant[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as SavedPlant[]) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: SavedPlant[]) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Almacenamiento lleno o bloqueado: se mantiene en memoria esta sesión.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedPlants() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

function newId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

export type NewPlant = Omit<SavedPlant, "id" | "addedAt">;

export function addPlant(plant: NewPlant): SavedPlant {
  const saved = { ...plant, id: newId(), addedAt: todayISO() };
  write([...read(), saved]);
  return saved;
}

export function updatePlant(id: string, patch: Partial<SavedPlant>) {
  write(read().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function removePlant(id: string) {
  write(read().filter((p) => p.id !== id));
}

export function plantName(plant: Pick<SavedPlant, "commonName" | "scientificName">) {
  return plant.commonName || plant.scientificName || "Planta sin nombre";
}

// Fechas en formato local YYYY-MM-DD para no depender de la zona horaria.
export function todayISO() {
  return daysAgoISO(0);
}

export function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayNumber(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** Días hasta el próximo riego (negativo si está atrasado), o null sin riego registrado. */
export function daysUntilWatering(plant: SavedPlant): number | null {
  if (!plant.lastWateredAt) return null;
  return (
    dayNumber(plant.lastWateredAt) +
    plant.wateringIntervalDays -
    dayNumber(todayISO())
  );
}

export function wateringLabel(days: number | null) {
  if (days === null) return "Registra su último riego";
  if (days < 0) return `Atrasada ${-days} ${days === -1 ? "día" : "días"}`;
  if (days === 0) return "Toca regar hoy";
  if (days === 1) return "Regar mañana";
  return `Regar en ${days} días`;
}

export function needsWater(plant: SavedPlant) {
  const days = daysUntilWatering(plant);
  return days !== null && days <= 0;
}

import { useRef, useState } from "react";
import type { Photo } from "@/components/photo/photo-slot";
import { ApiError, getPlantProfile, identifyPlant } from "@/lib/api";
import type { PlantProfile, SpeciesCandidate } from "@/lib/types";
import { validateImage } from "@/lib/validation";

export type IdentifyState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }  
  | { status: "success"; candidates: SpeciesCandidate[] };

export type ProfileState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; profile: PlantProfile | null };

/** Foto única → candidatos de Pl@ntNet → ficha del candidato elegido. */
export function usePlantIdentification() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [identify, setIdentify] = useState<IdentifyState>({ status: "idle" });
  const [selected, setSelected] = useState(0);
  const [profiles, setProfiles] = useState<Record<string, ProfileState>>({});
  const requestId = useRef(0);
  const requestedProfiles = useRef(new Set<string>());

  async function loadProfile(catalogId: string) {
    if (requestedProfiles.current.has(catalogId)) return;
    requestedProfiles.current.add(catalogId);
    setProfiles((prev) => ({ ...prev, [catalogId]: { status: "loading" } }));
    try {
      const profile = await getPlantProfile(catalogId);
      setProfiles((prev) => ({
        ...prev,
        [catalogId]: { status: "success", profile },
      }));
    } catch {
      requestedProfiles.current.delete(catalogId);
      setProfiles((prev) => ({ ...prev, [catalogId]: { status: "error" } }));
    }
  }

  async function identifyFile(file: File) {
    const id = ++requestId.current;
    setIdentify({ status: "loading" });
    setSelected(0);
    try {
      const { candidates } = await identifyPlant([file]);
      if (id !== requestId.current) return;
      setIdentify({ status: "success", candidates });
      const catalogId = candidates[0]?.catalogId;
      if (catalogId) void loadProfile(catalogId);
    } catch (error) {
      if (id !== requestId.current) return;
      setIdentify({
        status: "error",
        error:
          error instanceof ApiError
            ? error.message
            : "No pudimos identificar la planta. Inténtalo de nuevo.",
      });
    }
  }

  function selectPhoto(file: File) {
    const error = validateImage(file);
    if (error) {
      setPhotoError(error);
      return;
    }
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto({ file, url: URL.createObjectURL(file) });
    setPhotoError(null);
    void identifyFile(file);
  }

  function choose(index: number) {
    setSelected(index);
    if (identify.status !== "success") return;
    const catalogId = identify.candidates[index]?.catalogId;
    if (catalogId) void loadProfile(catalogId);
  }

  function reset() {
    requestId.current++;
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto(null);
    setPhotoError(null);
    setIdentify({ status: "idle" });
    setSelected(0);
  }

  const candidate =
    identify.status === "success" ? identify.candidates[selected] : undefined;
  const profileState: ProfileState | undefined = !candidate
    ? undefined
    : candidate.catalogId
      ? (profiles[candidate.catalogId] ?? { status: "loading" })
      : { status: "success", profile: null };

  return {
    photo,
    photoError,
    identify,
    selected,
    candidate,
    profileState,
    selectPhoto,
    choose,
    retry: () => photo && void identifyFile(photo.file),
    retryProfile: () => candidate?.catalogId && void loadProfile(candidate.catalogId),
    reset,
  };
}

export type PlantIdentification = ReturnType<typeof usePlantIdentification>;

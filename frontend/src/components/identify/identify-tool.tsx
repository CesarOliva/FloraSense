"use client";

import { BookX, CircleAlert, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LoadingPanel } from "@/components/flow/status-panels";
import { IdentificationPanel } from "@/components/identify/identification-panel";
import { usePlantIdentification } from "@/components/identify/use-plant-identification";
import { AddPlantButton } from "@/components/plants/add-plant-button";
import { CareProfile, PreventionCard } from "@/components/results/care-profile";
import { makeThumbnail } from "@/lib/image";
import { BASE_INTERVAL_DAYS } from "@/lib/water";

export function IdentifyTool() {
    const identification = usePlantIdentification();
    const { photo, candidate, profileState } = identification;
    const profile = profileState?.status === "success" ? profileState.profile : null;

    const addAction = candidate && photo && (
        <div className="pt-1">
            <AddPlantButton
                plantKey={candidate.scientificName}
                disabled={profileState?.status === "loading"}
                buildPlant={async () => ({
                    scientificName: candidate.scientificName,
                    commonName: candidate.commonNames[0],
                    catalogId: candidate.catalogId,
                    profile,
                    photo: await makeThumbnail(photo.file),
                    wateringIntervalDays: BASE_INTERVAL_DAYS[profile?.waterNeeds ?? "medium"],
                })}
            />
        </div>
    );

    return (
        <section>
            <IdentificationPanel identification={identification} action={addAction} />

            {candidate && profileState && (
                <div className="mt-6 space-y-6">
                    {profileState.status === "loading" && (
                        <LoadingPanel title="Cargando ficha de cuidados…" />
                    )}

                    {profileState.status === "error" && (
                        <Alert variant="destructive">
                            <CircleAlert aria-hidden />
                            <AlertTitle>No pudimos cargar la ficha de cuidados</AlertTitle>
                            <AlertDescription>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-1"
                                    onClick={identification.retryProfile}
                                >
                                    Reintentar
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {profileState.status === "success" && !profile && (
                        <Alert>
                            <BookX aria-hidden />
                            <AlertTitle>Aún no tenemos la ficha de esta especie</AlertTitle>
                            <AlertDescription>
                                Puedes agregarla a tus plantas igualmente; usaremos un riego
                                semanal como punto de partida. Para un consejo más preciso usa
                                Diagnosticar.
                            </AlertDescription>
                        </Alert>
                    )}

                    {profile && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            <CareProfile profile={profile} />
                            {profile.prevention.length > 0 && (
                                <PreventionCard tips={profile.prevention} />
                            )}
                        </div>
                    )}

                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={identification.reset}
                        >
                        <RotateCcw data-icon="inline-start" aria-hidden />
                            Identificar otra planta
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}
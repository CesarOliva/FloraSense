import { BookOpen, Cloud, Droplets, Funnel, Ruler, ShieldCheck, Shovel, Sun, Thermometer, TriangleAlert, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sunExposureLabels } from "@/lib/labels";
import type { PlantProfile } from "@/lib/types";

function CareRow({
    icon: Icon,
    label,
    children,
}: {
    icon: LucideIcon;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-3">
            <Icon className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
                <dt className="font-medium">{label}</dt>
                <dd className="text-muted-foreground">{children}</dd>
            </div>
        </div>
    );
}

export function CareProfile({ profile }: { profile: PlantProfile }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="size-5 text-primary" aria-hidden />
                    Ficha de cuidados
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
                <dl className="space-y-4">
                    <CareRow icon={Sun} label={sunExposureLabels[profile.sunExposure]}>
                        {profile.light}
                    </CareRow>

                    <CareRow icon={Droplets} label="Riego">
                        {profile.watering.criterion}
                        {profile.watering.frequencyHint && (
                        <span className="mt-1 block">{profile.watering.frequencyHint}</span>
                        )}
                    </CareRow>

                    <CareRow icon={Thermometer} label="Temperatura">
                        Entre {profile.temperature.minC} y {profile.temperature.maxC} °C
                    </CareRow>

                    <CareRow icon={Cloud} label="Humedad">
                        {profile.humidity}
                    </CareRow>

                    <CareRow icon={Shovel} label="Sustrato">
                        {profile.substrate}
                    </CareRow>

                    <CareRow icon={Funnel} label="Drenaje">
                        {profile.drainage}
                    </CareRow>

                    {profile.size && (
                        <CareRow icon={Ruler} label="Tamaño">
                            {profile.size}
                        </CareRow>
                    )}
                </dl>

                {profile.warnings.length > 0 && (
                    <div className="rounded-lg bg-warning p-3 text-warning-foreground">
                        <p className="flex items-center gap-2 font-medium">
                            <TriangleAlert className="size-4" aria-hidden /> Precauciones
                        </p>

                        <ul className="mt-1 space-y-1">
                            {profile.warnings.map((w) => (
                                <li key={w}>{w}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {profile.sources.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        Fuentes: {profile.sources.join(" · ")}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export function PreventionCard({ tips }: { tips: string[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="size-5 text-primary" aria-hidden />
                    Prevención de enfermedades
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2.5">
                    {tips.map((tip) => (
                        <li key={tip} className="flex gap-2.5">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                            {tip}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
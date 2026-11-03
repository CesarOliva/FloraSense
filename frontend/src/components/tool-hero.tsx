import { cn } from "cn";
import { BackLink } from "@/components/back-link";
import { LeafDecor } from "@/components/illustrations";
import { getTool, type ToolId } from "@/components/tools";

/** Encabezado de color de cada herramienta. */
export function ToolHero({ toolId }: { toolId: ToolId }) {
	const { title, tagline, icon: Icon, surface } = getTool(toolId);

	return (
		<div className="mb-8">
			<BackLink />
			<div
				className={cn(
					"relative overflow-hidden rounded-3xl p-5 duration-500 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 sm:p-7",
					surface
				)}
			>
				<LeafDecor className="absolute -right-4 -bottom-16 h-52 rotate-[-25deg] opacity-15 sm:-bottom-24 sm:h-72" />
				
				<div className="relative flex items-center gap-4">
					<span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-card/80 shadow-sm">
						<Icon className="size-7" aria-hidden />
					</span>
					<div>
						<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
						<p className="mt-0.5 text-sm opacity-85 sm:text-base">{tagline}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
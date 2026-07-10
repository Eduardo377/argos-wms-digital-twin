"use client";

import type { Slot } from "@/lib/yard";
import { GRID_SIZE } from "@/lib/yard";
import { Box, Crosshair, MapPin } from "lucide-react";

type YardMapProps = {
  slots: Slot[];
  targetId: string | null;
  occupiedId: string | null;
  containerId: string;
  onDropSlot: (slotId: string) => void;
};

export function YardMap({
  slots,
  targetId,
  occupiedId,
  containerId,
  onDropSlot,
}: YardMapProps) {
  return (
    <section
      aria-label="Mapa do pátio"
      className="flex flex-col rounded-xl border border-border bg-card/60 p-6"
    >
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold leading-tight text-foreground">
              Mapa do Pátio
            </h2>
            <p className="text-sm text-muted-foreground">
              {GRID_SIZE} x {GRID_SIZE} vagas de alocação
            </p>
          </div>
        </div>
        {targetId && (
          <span className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Crosshair className="size-3.5" aria-hidden="true" />
            Alvo IA: {targetId}
          </span>
        )}
      </header>

      <div
        className="grid flex-1 gap-3"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        role="grid"
        aria-label="Vagas do pátio"
      >
        {slots.map((slot) => {
          const isTarget = slot.id === targetId;
          const isNewlyOccupied = slot.id === occupiedId; // Ocupada agora pelo drag and drop
          const isHistoricallyOccupied = slot.status === "Ocupado"; // Ocupada lá na planilha

          // A vaga está indisponível se acabou de receber um contêiner OU se já tinha um
          const isOccupied = isNewlyOccupied || isHistoricallyOccupied;

          return (
            <div
              key={slot.id}
              role="gridcell"
              aria-label={`Vaga ${slot.label}${isTarget ? " (alvo da IA)" : ""}${
                isOccupied ? " (ocupada)" : ""
              }`}
              onDragOver={(e) => {
                if (!isOccupied) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (!isOccupied) onDropSlot(slot.id);
              }}
              className={[
                "relative flex aspect-square flex-col items-center justify-center rounded-lg border text-center transition-colors",
                isOccupied
                  ? "border-primary bg-primary/20"
                  : isTarget
                    ? "animate-target-pulse border-primary bg-primary/5"
                    : "border-border bg-background/40 hover:border-primary/40 hover:bg-background/70",
              ].join(" ")}
            >
              {isOccupied ? (
                <>
                  <Box
                    className="mb-1 size-6 text-primary"
                    aria-hidden="true"
                  />
                  <span className="max-w-full truncate px-1 font-mono text-[10px] font-semibold text-foreground">
                    {/* Mostra o ID que vc arrastou OU o ID que veio da planilha */}
                    {isNewlyOccupied
                      ? containerId
                      : slot.containerId || "OCUPADA"}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-mono text-xs font-medium text-muted-foreground">
                    {slot.label}
                  </span>
                  {isTarget && (
                    <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-primary">
                      Alvo
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

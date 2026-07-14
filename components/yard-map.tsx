"use client";

import { useState, useEffect } from "react";
import type { Slot } from "@/lib/yard";
import { ROWS_COUNT, LEVELS_COUNT } from "@/lib/yard";
import { Box, Crosshair, MapPin, Layers } from "lucide-react";

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
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  useEffect(() => {
    if (targetId) {
      const match = targetId.match(/-N(\d+)/);
      if (match && match[1]) {
        setSelectedLevel(Number(match[1]));
      }
    }
  }, [targetId]);

  const visibleSlots = slots.filter((slot) =>
    slot.id.endsWith(`-N${selectedLevel}`),
  );

  const gridColumns = ROWS_COUNT || 5;
  const totalLevels = LEVELS_COUNT || 7;

  return (
    <section
      aria-label="Matriz do Armazém"
      className="flex flex-col rounded-xl border border-border bg-card/60 p-6"
    >
      <header className="mb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Layers className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold leading-tight text-foreground">
                Matriz Autoportante
              </h2>
              <p className="text-sm text-muted-foreground">
                Visualizando Nível {selectedLevel}
              </p>
            </div>
          </div>
          {targetId && (
            <span className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-sm">
              <Crosshair className="size-3.5" aria-hidden="true" />
              Alvo IA: {targetId}
            </span>
          )}
        </div>

        {/* Navegação por Andares (Eixo Z) */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {Array.from({ length: totalLevels }).map((_, i) => {
            const level = i + 1;
            const isSelected = selectedLevel === level;

            // Verifica se o andar tem o slot alvo para colocar um pontinho de aviso (Notification Dot)
            const hasTarget = targetId?.endsWith(`-N${level}`);

            return (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedLevel(level)}
                className={`relative flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Nível {level}
                {hasTarget && !isSelected && (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-orange-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      <div
        className="grid flex-1 gap-3"
        style={{
          gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
        }}
        role="grid"
        aria-label={`Vagas do Nível ${selectedLevel}`}
      >
        {visibleSlots.map((slot) => {
          const isTarget = slot.id === targetId;
          const isNewlyOccupied = slot.id === occupiedId;
          const isHistoricallyOccupied = slot.status === "Ocupado";

          const isOccupied = isNewlyOccupied || isHistoricallyOccupied;
          const isHazardous = slot.isIMO;

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
                  ? isHazardous
                    ? "border-destructive bg-destructive/20"
                    : "border-primary bg-primary/20"
                  : isTarget
                    ? "animate-target-pulse border-primary bg-primary/5"
                    : "border-border bg-background/40 hover:border-primary/40 hover:bg-background/70",
              ].join(" ")}
            >
              {isOccupied ? (
                <>
                  <Box
                    className={`mb-1 size-6 ${isHazardous ? "text-destructive" : "text-primary"}`}
                    aria-hidden="true"
                  />
                  <span className="max-w-full truncate px-1 font-mono text-[10px] font-semibold text-foreground">
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

"use client";

import { useState, useEffect } from "react";
import type { Slot } from "@/lib/yard";
import { ROWS_COUNT, LEVELS_COUNT } from "@/lib/yard";
import { Crosshair, Layers } from "lucide-react";

type YardMapProps = {
  slots: Slot[];
  targetId: string | null;
  occupiedId: string | null;
  containerId: string;
  isGrabbed: boolean;
  onDropSlot: (slotId: string) => void;
};

export function YardMap({
  slots,
  targetId,
  occupiedId,
  containerId,
  isGrabbed,
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

  const zoneBgColors: Record<string, string> = {
    HOT: "border-red-500/50 bg-red-500/20",
    WARM: "border-orange-500/50 bg-orange-500/20",
    COLD: "border-sky-500/50 bg-sky-500/20",
    FROZEN: "border-cyan-400/60 bg-cyan-400/20",
  };

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

        {/* Navegação por Andares */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {Array.from({ length: totalLevels }).map((_, i) => {
            const level = i + 1;
            const isSelected = selectedLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedLevel(level)}
                className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Nível {level}
              </button>
            );
          })}
        </div>
      </header>

      {/* Grid de Slots */}
      <div
        className="grid flex-1 gap-3"
        style={{
          gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
        }}
      >
        {visibleSlots.map((slot) => {
          const isTarget = slot.id === targetId;
          const isNewlyOccupied = slot.id === occupiedId;
          const isHistoricallyOccupied = slot.status === "Ocupado";
          const isOccupied = isNewlyOccupied || isHistoricallyOccupied;
          const isHazardous = slot.isIMO;

          let statusClasses =
            "border-border bg-background/40 hover:border-primary/40";

          if (isTarget) {
            statusClasses = "animate-target-pulse border-primary bg-primary/5";
          }

          if (isOccupied) {
            statusClasses = isHazardous
              ? "border-destructive bg-destructive/30"
              : zoneBgColors[slot.zone?.toUpperCase() || "HOT"] ||
                "border-primary bg-primary/20";
          }

          return (
            <div
              key={slot.id}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-center transition-colors ${statusClasses}`}
              onClick={(e) => {
                e.preventDefault();
                if (!isOccupied && isGrabbed) {
                  onDropSlot(slot.id);
                }
              }}
            >
              {isOccupied ? (
                <div className="flex h-full w-full flex-col p-2 overflow-hidden text-left">
                  <span className="w-full truncate font-mono text-[14px] font-bold text-white border-white/10 pb-1 mb-1">
                    {slot.label}{" "}
                  </span>
                  <span className="w-full truncate font-mono text-[14px] font-bold text-white border-b border-white/10 pb-1 mb-1">
                    {isNewlyOccupied ? containerId : slot.containerId}
                  </span>

                  <div className="mt-1 flex flex-col gap-[2px]">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-muted-foreground">Peso:</span>
                      <span className="font-mono text-foreground">
                        {slot.peso || "0"}t
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-muted-foreground">Chegada:</span>
                      <span className="font-mono text-foreground">
                        {slot.dataSaida?.substring(0, 30) || "--"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-muted-foreground">Saída:</span>
                      <span className="font-mono text-foreground">
                        {slot.zone || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  {slot.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

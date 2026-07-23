"use client";
import { useState, useEffect } from "react";
import type { Slot } from "@/lib/yard";
import { ROWS_COUNT, LEVELS_COUNT } from "@/lib/yard";
import { Crosshair, Layers, AlertTriangle, Package } from "lucide-react";
import type { FilterState } from "@/components/yard-filters";

type YardMapProps = {
  slots: Slot[];
  targetId: string | null;
  occupiedId: string | null;
  containerId: string;
  isGrabbed: boolean;
  onDropSlot: (slotId: string) => void;
  filters: FilterState;
};

export function YardMap({
  slots,
  targetId,
  occupiedId,
  containerId,
  isGrabbed,
  onDropSlot,
  filters,
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

      {/* Wrapper de Rolagem Vertical (Exibe ~25 vagas) */}
      <div className="max-h-[640px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
        {/* Grid Fixo com Dimming (Esmaecimento) */}
        <div
          className="grid flex-1 gap-3"
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
          }}
        >
          {visibleSlots.map((slot) => {
            const isTarget = slot.id === targetId;
            const isNewlyOccupied = slot.id === occupiedId;
            const isHistoricallyOccupied =
              slot.status === "Ocupado" ||
              slot.status === "Alocado" ||
              slot.status === "Realocado";
            const isOccupied = isNewlyOccupied || isHistoricallyOccupied;

            // Tratamento estrito do IMO vindo da planilha
            const isHazardous = slot.isIMO === true;

            // 1. Processamento Multi-Filtros para o Dimming
            const matchesSearch =
              filters.searchId === "" ||
              slot.containerId
                ?.toLowerCase()
                .includes(filters.searchId.toLowerCase()) ||
              slot.id.toLowerCase().includes(filters.searchId.toLowerCase());

            const matchesPeso =
              filters.peso === "" || (slot.peso && slot.peso === filters.peso);

            const matchesIMO =
              filters.isIMO === "Todos" ||
              (filters.isIMO === "Sim" && isHazardous) ||
              (filters.isIMO === "Nao" && !isHazardous);

            const matchesZone =
              filters.zone === "Todas" ||
              slot.zone?.toUpperCase() === filters.zone.toUpperCase();

            const matchesStatus =
              filters.status === "Todos" ||
              (filters.status === "Vazio" && !isOccupied) ||
              (filters.status === "Livre" && !isOccupied) ||
              (isOccupied &&
                (filters.status === "Ocupado" ||
                  (filters.status === "Alocado" && slot.status === "Alocado") ||
                  (filters.status === "Realocado" &&
                    slot.status === "Realocado")));

            // Validação de Período por Intervalo de Dias (YYYY-MM-DD)
            let matchesPeriodo = true;
            const hasPeriodFilter = Boolean(
              filters.dataInicio || filters.dataFim,
            );

            if (hasPeriodFilter) {
              const targetDate = slot.dataChegada;

              if (!targetDate || !targetDate.includes("/")) {
                matchesPeriodo = false; // Vagas vazias ou sem data válida caem fora
              } else {
                const parts = targetDate.trim().split(" ");
                const [datePart] = parts; // "10/07/2026"
                const [day, month, year] = datePart.split("/");

                const slotDateStr = `${year}-${month}-${day}`; // "2026-07-10"
                const startDateStr = filters.dataInicio || ""; // "2026-07-09"
                const endDateStr = filters.dataFim || ""; // "2026-07-11"

                const isAfterOrEqualStart =
                  startDateStr === "" || slotDateStr >= startDateStr;
                const isBeforeOrEqualEnd =
                  endDateStr === "" || slotDateStr <= endDateStr;

                matchesPeriodo = isAfterOrEqualStart && isBeforeOrEqualEnd;
              }
            }

            const isFilteredOut = !(
              matchesSearch &&
              matchesPeso &&
              matchesIMO &&
              matchesZone &&
              matchesStatus &&
              matchesPeriodo
            );

            // 2. Cores da Vaga
            let statusClasses =
              "border-border bg-background/40 hover:border-primary/40";

            if (isTarget) {
              statusClasses =
                "animate-target-pulse border-primary bg-primary/5";
            }

            if (isOccupied) {
              statusClasses =
                zoneBgColors[slot.zone?.toUpperCase() || "HOT"] ||
                "border-primary bg-primary/20";
            }

            // 3. Aplicação do Dimming
            const opacityClass = isFilteredOut
              ? "opacity-15 grayscale transition-opacity duration-300 pointer-events-none"
              : "opacity-100 transition-opacity duration-300";

            return (
              <div
                key={slot.id}
                className={`relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg border text-center transition-colors ${statusClasses} ${opacityClass}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isOccupied && isGrabbed && !isFilteredOut) {
                    onDropSlot(slot.id);
                  }
                }}
              >
                {/* Marca d'água de Contêiner (Cubo) no centro */}
                {isOccupied && (
                  <Package
                    className="pointer-events-none absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-white/10"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                )}

                {/* Marca d'água de Carga Perigosa (IMO) no canto inferior direito */}
                {isOccupied && isHazardous && (
                  <AlertTriangle
                    className="pointer-events-none absolute bottom-1 right-2 size-8 text-yellow-500/25"
                    fill="currentColor"
                    aria-hidden="true"
                  />
                )}

                {isOccupied ? (
                  <div className="relative z-10 flex h-full w-full flex-col justify-between p-2 text-left">
                    {/* Cabeçalho: Endereço, Peso e ID */}
                    <div className="mb-1 border-b border-white/10 pb-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-muted-foreground/80">
                          {slot.label}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground/80">
                          {slot.peso || "0"}t
                        </span>
                      </div>
                      <div className="mt-0.5 w-full truncate font-mono text-[13px] font-bold text-white">
                        {isNewlyOccupied ? containerId : slot.containerId}
                      </div>
                    </div>

                    {/* Metadados: Chegada e Saída */}
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-col text-[9px] leading-tight">
                        <span className="text-muted-foreground/70">
                          Chegada:
                        </span>
                        <span className="truncate font-mono text-foreground">
                          {slot.dataChegada?.substring(0, 30) || "--"}
                        </span>
                      </div>
                      <div className="flex flex-col text-[9px] leading-tight">
                        <span className="text-muted-foreground/70">Saída:</span>
                        <span className="truncate font-mono text-foreground">
                          {slot.dataSaida?.substring(0, 30) || "--"}
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
      </div>
    </section>
  );
}

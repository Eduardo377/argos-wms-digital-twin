"use client"

import type { MovementData, Zone } from "@/lib/yard"
import { ZONE_OPTIONS } from "@/lib/yard"
import { BrainCircuit, Container, Loader2, Thermometer } from "lucide-react"

type MovementFormProps = {
  data: MovementData
  loading: boolean
  onChange: (patch: Partial<MovementData>) => void
  onConsult: () => void
}

const zoneAccent: Record<Zone, string> = {
  Hot: "text-red-400",
  Warm: "text-orange-400",
  Cold: "text-sky-400",
}

export function MovementForm({ data, loading, onChange, onConsult }: MovementFormProps) {
  return (
    <section
      aria-label="Nova movimentação"
      className="flex flex-col rounded-xl border border-border bg-card/60 p-6"
    >
      <header className="mb-6 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Container className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold leading-tight text-foreground">Nova Movimentação</h2>
          <p className="text-sm text-muted-foreground">Registro de entrada no pátio</p>
        </div>
      </header>

      <form
        className="flex flex-1 flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          onConsult()
        }}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="containerId" className="text-sm font-medium text-foreground">
            ID do Contêiner
          </label>
          <input
            id="containerId"
            type="text"
            required
            placeholder="MSCU-778120-3"
            value={data.containerId}
            onChange={(e) => onChange({ containerId: e.target.value })}
            className="h-11 rounded-lg border border-input bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="weight" className="text-sm font-medium text-foreground">
              Peso (tons)
            </label>
            <input
              id="weight"
              type="number"
              min="0"
              step="0.1"
              placeholder="24.5"
              value={data.weight}
              onChange={(e) => onChange({ weight: e.target.value })}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="departure" className="text-sm font-medium text-foreground">
              Previsão de Saída
            </label>
            <input
              id="departure"
              type="date"
              value={data.departure}
              onChange={(e) => onChange({ departure: e.target.value })}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground [color-scheme:dark] focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="zone" className="text-sm font-medium text-foreground">
            Zona Alvo
          </label>
          <div className="relative">
            <Thermometer
              className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${zoneAccent[data.zone]}`}
              aria-hidden="true"
            />
            <select
              id="zone"
              value={data.zone}
              onChange={(e) => onChange({ zone: e.target.value as Zone })}
              className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              {ZONE_OPTIONS.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Processando roteirização...
            </>
          ) : (
            <>
              <BrainCircuit className="size-5" aria-hidden="true" />
              Consultar Cérebro IA
            </>
          )}
        </button>
      </form>
    </section>
  )
}

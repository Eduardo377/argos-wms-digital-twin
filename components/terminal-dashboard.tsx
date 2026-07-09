"use client"

import { useMemo, useRef, useState } from "react"
import type { MovementData } from "@/lib/yard"
import { buildSlots } from "@/lib/yard"
import { MovementForm } from "@/components/movement-form"
import { YardMap } from "@/components/yard-map"
import { AlertTriangle, Anchor, CheckCircle2, GripVertical, Package, X } from "lucide-react"

type Result = { kind: "success" | "risk"; slot: string } | null

export function TerminalDashboard() {
  const slots = useMemo(() => buildSlots(), [])

  const [data, setData] = useState<MovementData>({
    containerId: "",
    weight: "",
    departure: "",
    zone: "Hot",
  })
  const [loading, setLoading] = useState(false)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [occupiedId, setOccupiedId] = useState<string | null>(null)
  const [containerReady, setContainerReady] = useState(false)
  const [result, setResult] = useState<Result>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const displayId = data.containerId.trim() || "CTNR-0000"

  function handleChange(patch: Partial<MovementData>) {
    setData((prev) => ({ ...prev, ...patch }))
  }

  function handleConsult() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setLoading(true)
    setResult(null)
    setOccupiedId(null)
    setTargetId(null)
    setContainerReady(false)

    // Simulate the AI routing engine thinking for ~1s.
    timerRef.current = setTimeout(() => {
      const chosen = slots[Math.floor(Math.random() * slots.length)]
      setTargetId(chosen.id)
      setContainerReady(true)
      setLoading(false)
    }, 1000)
  }

  function handleDropSlot(slotId: string) {
    if (!containerReady || occupiedId) return
    setOccupiedId(slotId)
    setContainerReady(false)
    setResult({
      kind: slotId === targetId ? "success" : "risk",
      slot: slotId,
    })
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {result && (
        <div
          role="status"
          aria-live="polite"
          className={[
            "flex items-start gap-3 rounded-xl border px-4 py-3.5",
            result.kind === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/40 bg-red-500/10 text-red-300",
          ].join(" ")}
        >
          {result.kind === "success" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          )}
          <div className="flex-1">
            <p className="font-semibold">
              {result.kind === "success"
                ? "Sucesso: Alocado conforme roteirização da IA"
                : "Risco: Divergência de Pátio identificada"}
            </p>
            <p className="text-sm opacity-80">
              {result.kind === "success"
                ? `Contêiner ${displayId} posicionado na vaga alvo ${result.slot}.`
                : `Contêiner ${displayId} alocado em ${result.slot}, fora da vaga recomendada (${targetId}).`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResult(null)}
            aria-label="Fechar aviso"
            className="rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {containerReady && (
        <div className="rounded-xl border border-dashed border-primary/50 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="size-4 text-primary" aria-hidden="true" />
            Contêiner aguardando alocação — arraste até uma vaga do pátio
          </div>
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move"
              e.dataTransfer.setData("text/plain", displayId)
            }}
            className="inline-flex cursor-grab items-center gap-3 rounded-lg border border-primary bg-primary/15 px-4 py-3 text-foreground active:cursor-grabbing"
            role="button"
            aria-label={`Contêiner ${displayId}, arrastável`}
          >
            <GripVertical className="size-5 text-primary" aria-hidden="true" />
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Package className="size-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="font-mono text-sm font-semibold">{displayId}</p>
              <p className="text-xs text-muted-foreground">
                {data.weight ? `${data.weight} t` : "peso n/d"} · Zona {data.zone}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <MovementForm data={data} loading={loading} onChange={handleChange} onConsult={handleConsult} />
        <YardMap
          slots={slots}
          targetId={targetId}
          occupiedId={occupiedId}
          containerId={displayId}
          onDropSlot={handleDropSlot}
        />
      </div>

      <footer className="flex items-center gap-2 text-xs text-muted-foreground">
        <Anchor className="size-3.5" aria-hidden="true" />
        Sistema de roteirização de pátio · simulação de alocação assistida por IA
      </footer>
    </div>
  )
}

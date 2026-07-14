"use client";

import { useEffect, useRef, useState } from "react";
import type { MovementData, Slot } from "@/lib/yard";
import { buildSlots } from "@/lib/yard";
import { MovementForm } from "@/components/movement-form";
import { YardMap } from "@/components/yard-map";
import {
  AlertTriangle,
  Anchor,
  CheckCircle2,
  GripVertical,
  Package,
  X,
} from "lucide-react";

type Result = { kind: "success" | "risk"; slot: string } | null;

export function TerminalDashboard() {
  const [slots, setSlots] = useState<Slot[]>([]);

  const [data, setData] = useState<MovementData>({
    containerId: "",
    weight: "",
    departure: "",
    zone: "Hot",
  });
  const [loading, setLoading] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [occupiedId, setOccupiedId] = useState<string | null>(null);
  const [containerReady, setContainerReady] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayId = data.containerId.trim() || "CTNR-0000";

  function handleChange(patch: Partial<MovementData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  useEffect(() => {
    async function fetchYardMap() {
      try {
        // IMPORTANTE: Cole o seu link CSV do Google Sheets aqui dentro das aspas!
        const response = await fetch(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vQiWqZ_iQc_mtpeubCXFk4MNDo48NWuxEkS27L4Mw6tTAFWlrnvBOHZY4kKWPMij06E44nKWiH1dhvg/pub?gid=0&single=true&output=csv",
        );
        const csvText = await response.text();

        // Divide o texto por linhas e pula o cabeçalho
        const rows = csvText.split("\n").slice(1);

        const loadedSlots = rows
          .map((row) => {
            const [posId, status, idContainer, peso, data, saida, zona] =
              row.split(",");
            return {
              id: posId?.trim(),
              label: posId?.trim(),
              status: status?.trim(),
              containerId: idContainer?.trim(),
              zone: zona?.trim(),
            };
          })
          .filter((s) => s.id); // Ignora linhas vazias

        setSlots(loadedSlots);
      } catch (error) {
        console.error("Erro ao carregar o pátio:", error);
      }
    }

    fetchYardMap();
  }, []);

  async function handleConsult() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(true);
    setResult(null);
    setOccupiedId(null);
    setTargetId(null);
    setContainerReady(false);

    try {
      // Faz a requisição POST real para o Webhook do Make.com
      const response = await fetch(
        "https://hook.us2.make.com/6bm9v22mgy79tivdm8pxf87og8pwfcae",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // O estado 'data' já contém as chaves: containerId, weight, departure e zone
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error("Falha na comunicação com a Torre de Controle");
      }

      // O Make.com deve devolver um JSON de resposta (Webhook Response)
      const responseData = await response.json();

      // Assumindo que o Make retorna algo como: { "targetSlot": "B2-N1" }
      const chosenSlotId = responseData.targetSlot;

      // Verifica se a vaga que a IA escolheu realmente existe no mapa
      const chosen = slots.find((s) => s.id === chosenSlotId);

      if (chosen) {
        setTargetId(chosen.id);
        setContainerReady(true);
      } else {
        console.error(
          "Risco: A IA alucinou uma vaga inexistente no pátio:",
          chosenSlotId,
        );
      }
    } catch (error) {
      console.error("Erro de Integração:", error);
      alert(
        "Erro ao conectar com o Cérebro IA. Verifique se o Webhook está rodando.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDropSlot(slotId: string) {
    if (!containerReady || occupiedId) return;
    setOccupiedId(slotId);
    setContainerReady(false);
    setResult({
      kind: slotId === targetId ? "success" : "risk",
      slot: slotId,
    });
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
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
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
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", displayId);
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
                {data.weight ? `${data.weight} t` : "peso n/d"} · Zona{" "}
                {data.zone}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* Esta div "sticky" faz o formulário (e o botão) acompanharem a rolagem da tela */}
        <div className="sticky top-6 z-10">
          <MovementForm
            data={data}
            loading={loading}
            onChange={handleChange}
            onConsult={handleConsult}
          />
        </div>

        {/* O YardMap continua logo abaixo, do jeito que estava */}
        <YardMap
          slots={slots}
          targetId={targetId}
          occupiedId={occupiedId}
          containerId={displayId}
          onDropSlot={handleDropSlot}
        />
      </div>

      <footer className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Anchor className="size-3.5" aria-hidden="true" />
          Sistema de roteirização para armazéns · simulação de alocação
          assistida por IA
        </div>
        <div className="font-mono opacity-50">Build v2.0.0</div>
      </footer>
    </div>
  );
}

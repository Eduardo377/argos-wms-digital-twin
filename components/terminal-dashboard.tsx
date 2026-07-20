"use client";

import { useEffect, useRef, useState } from "react";
import type { MovementData, Slot } from "@/lib/yard";
import { MovementForm } from "@/components/movement-form";
import { YardMap } from "@/components/yard-map";
import { Footer } from "@/components/footer";
import {
  AlertTriangle,
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
    isIMO: false,
  });
  const [loading, setLoading] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [occupiedId, setOccupiedId] = useState<string | null>(null);
  const [containerReady, setContainerReady] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [allocationError, setAllocationError] = useState<string | null>(null);

  // Estados do Guindaste (Sticky Drag)
  const [isGrabbed, setIsGrabbed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayId = data.containerId.trim() || "CTNR-0000";

  const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL!;
  const MAPA_PATIO_CSV_URL = process.env.NEXT_PUBLIC_MAPA_PATIO_CSV_URL!;

  function handleChange(patch: Partial<MovementData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  // Efeito para rastrear o mouse APENAS quando a caixa for "fisgada"
  useEffect(() => {
    if (!isGrabbed) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isGrabbed]);

  useEffect(() => {
    async function fetchYardMap() {
      try {
        const response = await fetch(MAPA_PATIO_CSV_URL);
        const csvText = await response.text();
        const rows = csvText.split("\n").slice(1);
        const loadedSlots = rows
          .map((row) => {
            const [
              posId,
              status,
              idContainer,
              peso,
              dataHora,
              saidaPrevista,
              zona,
              imo,
            ] = row.split(",");
            return {
              id: posId?.trim(),
              label: posId?.trim(),
              status: status?.trim(),
              containerId: idContainer?.replace(/"/g, "").trim(),
              peso: peso?.replace(/"/g, "").trim(),
              dataChegada: dataHora?.replace(/"/g, "").trim(),
              dataSaida: saidaPrevista?.replace(/"/g, "").trim(),
              zone: zona?.replace(/"/g, "").trim(),
              isIMO: imo?.replace(/"/g, "").trim() === "TRUE",
            };
          })
          .filter((s) => s.id);
        setSlots(loadedSlots);
      } catch (error) {
        console.error("Erro ao carregar o pátio:", error);
      }
    }
    fetchYardMap();
  }, []);

  // 1. Clean Code: Tipagem estrita para a resposta do Cérebro IA (Make.com)
  type WebhookResponse = {
    targetSlot?: string;
    justificativa?: string;
    Status?: string;
  };

  async function handleConsult() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(true);
    setResult(null);
    setAllocationError(null);
    setOccupiedId(null);
    setTargetId(null);
    setContainerReady(false);
    setIsGrabbed(false);

    try {
      const payload = {
        id_conteiner: data.containerId,
        peso_ton: Number(data.weight),
        data_saida_prevista: data.departure,
        IMO: data.isIMO,
      };

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const textResponse = await response.text();
      let responseData: WebhookResponse = {};

      try {
        if (textResponse) {
          const cleanedText = textResponse
            .replace(/```(?:json)?\n?|```/g, "")
            .trim();
          responseData = JSON.parse(cleanedText) as WebhookResponse;
        }
      } catch (parseError) {
        console.warn("Resposta não-JSON recebida da API:", textResponse);
        if (!response.ok) {
          throw new Error(textResponse || `Erro HTTP: ${response.status}`);
        }
      }

      if (!response.ok) {
        if (textResponse.includes("Too many")) {
          setAllocationError(
            "Limite de tráfego atingido. Aguarde alguns segundos e tente novamente.",
          );
          return;
        }

        setAllocationError(
          responseData.justificativa ||
            "Falha na comunicação com a Torre de Controle.",
        );
        return;
      }

      const chosenSlotId = responseData.targetSlot;
      const chosen = slots.find((s) => s.id === chosenSlotId);

      if (chosen) {
        setTargetId(chosen.id);
        setContainerReady(true);
      } else {
        setAllocationError(
          responseData.justificativa || "A IA não encontrou uma vaga válida.",
        );
      }
    } catch (error: unknown) {
      console.error("Erro de Integração:", error);

      // 2. Clean Code: Tratamento de erro seguro usando 'instanceof'
      const isError = error instanceof Error;
      const errorMessage = isError ? error.message : "";

      if (errorMessage.includes("Too many")) {
        setAllocationError(
          "Servidor ocupado (Muitas requisições simultâneas). Tente novamente em instantes.",
        );
      } else {
        setAllocationError("Erro de conexão com a infraestrutura do sistema.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDropSlot(slotId: string) {
    if (!containerReady || occupiedId) return;

    // 1. Atualização Otimista: Muda a UI imediatamente (UX perfeita)
    setOccupiedId(slotId);
    setContainerReady(false);
    setIsGrabbed(false); // Solta a caixa do mouse
    setResult({
      kind: slotId === targetId ? "success" : "risk",
      slot: slotId,
    });

    // 2. O Braço: Envia os dados silenciosamente para o Make.com gravar
    try {
      const payloadGravacao = {
        vaga_confirmada: slotId,
        id_conteiner: displayId,
        peso_ton: Number(data.weight),
        data_saida_prevista: data.departure,
        IMO: data.isIMO,
        zona: data.zone,
        status: "Ocupado",
      };

      const WEBHOOK_GRAVACAO = process.env.NEXT_PUBLIC_WEBHOOK_GRAVACAO_URL!;

      if (!WEBHOOK_GRAVACAO) {
        console.warn("URL de gravação não configurada no .env");
        return;
      }

      // Dispara o POST sem travar a tela do usuário
      await fetch(WEBHOOK_GRAVACAO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadGravacao),
      });

      console.log("Sucesso: Movimentação registrada na Torre de Controle.");
    } catch (error) {
      console.error("Falha ao gravar movimentação no banco:", error);
      // Aqui você poderia até adicionar um Toast (alerta) de erro de rede se quisesse
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Exibição de Resultado */}
      {result && (
        <div
          className={[
            "flex items-start gap-3 rounded-xl border px-4 py-3.5",
            result.kind === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/40 bg-red-500/10 text-red-300",
          ].join(" ")}
        >
          {result.kind === "success" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-semibold">
              {result.kind === "success"
                ? "Sucesso: Alocado"
                : "Risco: Divergência de Pátio"}
            </p>
            <p className="text-sm opacity-80">
              {result.kind === "success"
                ? `Posicionado na vaga ${result.slot}.`
                : `Alocado em ${result.slot}, fora da vaga recomendada (${targetId}).`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="rounded-md p-1 opacity-70 hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Exibição da Justificativa de Erro da IA */}
      {allocationError && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/5 p-4 text-red-200">
          <h3 className="font-bold flex items-center gap-2">
            <AlertTriangle className="size-5" />
            Análise Logística: Impedimento
          </h3>
          <p className="text-sm mt-2 opacity-90 leading-relaxed">
            {allocationError}
          </p>
        </div>
      )}

      {/* Contêiner pronto para Fisgar */}
      {containerReady && (
        <div className="rounded-xl border border-dashed border-primary/50 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="size-4 text-primary" />
            Clique para fisgar o contêiner
          </div>
          <div
            onClick={() => setIsGrabbed(true)}
            className={`inline-flex items-center gap-3 rounded-lg border border-primary px-4 py-3 text-foreground transition-all ${
              isGrabbed
                ? "bg-primary/30 opacity-50 cursor-grabbing"
                : "bg-primary/15 hover:bg-primary/20 cursor-pointer"
            }`}
          >
            <GripVertical className="size-5 text-primary" />
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Package className="size-5" />
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
        <div className="sticky top-6 z-10">
          <MovementForm
            data={data}
            loading={loading}
            onChange={handleChange}
            onConsult={handleConsult}
          />
        </div>

        <YardMap
          slots={slots}
          targetId={targetId}
          occupiedId={occupiedId}
          containerId={displayId}
          onDropSlot={handleDropSlot}
          // Passamos a informação para o mapa saber se estamos segurando algo
          isGrabbed={isGrabbed}
        />
      </div>

      {/* O Contêiner Fantasma que segue o mouse */}
      {isGrabbed && (
        <div
          className="fixed z-[9999] opacity-90 shadow-2xl pointer-events-none"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="inline-flex items-center gap-3 rounded-lg border border-primary bg-primary/30 px-4 py-3 text-foreground backdrop-blur-sm">
            <Package className="size-5 text-primary" />
            <div className="leading-tight">
              <span className="font-mono font-bold text-sm">{displayId}</span>
              <p className="text-xs opacity-80">Solte na vaga...</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

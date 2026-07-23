"use client";

import { useEffect, useRef, useState } from "react";
import type { MovementData, Slot } from "@/lib/yard";
import { MovementForm } from "@/components/movement-form";
import { YardMap } from "@/components/yard-map";
import { Footer } from "@/components/footer";
import { GhostContainer } from "@/components/ghost-container";
import { ContainerGrabber } from "@/components/container-grabber";
import { StatusAlerts } from "@/components/status-alerts";
import { YardFilters, type FilterState } from "@/components/yard-filters";
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

  const [filters, setFilters] = useState<FilterState>({
    searchId: "",
    peso: "",
    status: "Todos",
    zone: "Todas",
    isIMO: "Todos",
    dataInicio: "",
    dataFim: "",
  });

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
            const cols = row.split(",").map((c) => c.replace(/"/g, "").trim());
            const posId = cols[0];

            if (!posId) return null;

            const status = cols[1];
            const idContainer = cols[2];

            // Correção do split para pesos com vírgula (ex: "24,5" cortado em "24" e "5")
            let peso = cols[3];
            let offset = 0;

            // Se a próxima coluna for um número pequeno sem barra de data, o peso foi dividido
            if (cols[4] && !cols[4].includes("/")) {
              peso = `${cols[3]},${cols[4]}`;
              offset = 1; // Empurra a leitura das datas uma casa pra frente
            }

            const dataHora = cols[4 + offset];
            const saidaPrevista = cols[5 + offset];
            const zona = cols[6 + offset];
            const imoCol = cols[7 + offset] || "";

            const isImoTrue =
              imoCol.toUpperCase() === "SIM" ||
              imoCol.toUpperCase() === "TRUE" ||
              imoCol === "1";

            return {
              id: posId,
              label: posId,
              status: status,
              containerId: idContainer,
              peso: peso,
              dataChegada: dataHora,
              dataSaida: saidaPrevista,
              zone: zona,
              isIMO: isImoTrue,
            };
          })
          .filter((s): s is NonNullable<typeof s> => s !== null && !!s.id);

        setSlots(loadedSlots as Slot[]);
      } catch (error) {
        console.error("Erro ao carregar o pátio:", error);
      }
    }
    fetchYardMap();
  }, [MAPA_PATIO_CSV_URL]);
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

    setOccupiedId(slotId);
    setContainerReady(false);
    setIsGrabbed(false);
    setResult({
      kind: slotId === targetId ? "success" : "risk",
      slot: slotId,
    });

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

      await fetch(WEBHOOK_GRAVACAO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadGravacao),
      });

      console.log("Sucesso: Movimentação registrada na Torre de Controle.");
    } catch (error) {
      console.error("Falha ao gravar movimentação no banco:", error);
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <StatusAlerts
        result={result}
        targetId={targetId}
        allocationError={allocationError}
        onClearResult={() => setResult(null)}
      />

      <ContainerGrabber
        containerReady={containerReady}
        isGrabbed={isGrabbed}
        displayId={displayId}
        weight={data.weight}
        zone={data.zone}
        onGrab={() => setIsGrabbed(true)}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="sticky top-6 z-10">
          <MovementForm
            data={data}
            loading={loading}
            onChange={handleChange}
            onConsult={handleConsult}
          />
        </div>

        <div className="flex flex-col gap-6">
          <YardFilters
            filters={filters}
            onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          />
          <YardMap
            slots={slots}
            targetId={targetId}
            occupiedId={occupiedId}
            containerId={displayId}
            onDropSlot={handleDropSlot}
            isGrabbed={isGrabbed}
            filters={filters}
          />
        </div>
      </div>

      <GhostContainer
        isGrabbed={isGrabbed}
        mousePos={mousePos}
        displayId={displayId}
      />

      <Footer />
    </div>
  );
}

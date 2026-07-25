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
import { DashboardMetrics } from "@/components/dashboard-metrics";

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

  const [aiJustification, setAiJustification] = useState<string | null>(null);

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
  // ... (estado anterior)

  // 1. [TUTORIAL] MATEMÁTICA/LÓGICA DO "GUINDASTE" (Mouse Tracking)
  // Este hook é responsável por fazer o componente `<GhostContainer />` seguir o ponteiro.
  // Por questão de performance, só adicionamos o 'event listener' ao objeto window
  // SE o usuário efetivamente "fisgar" o contêiner (isGrabbed === true).
  // Isso evita que o navegador fique processando a posição X/Y do mouse o tempo todo à toa.
  useEffect(() => {
    if (!isGrabbed) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Atualizamos o estado com as coordenadas exatas da tela (clientX e clientY)
      // O GhostContainer usará transform: translate(-50%, -50%) para centralizar no cursor.
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    // Cleanup function: remove o listener quando o contêiner for solto ou componente desmontado
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

            let peso = cols[3];
            let offset = 0;

            if (cols[4] && !cols[4].includes("/")) {
              peso = `${cols[3]},${cols[4]}`;
              offset = 1;
            }

            const dataHora = cols[4 + offset];
            const saidaPrevista = cols[5 + offset];
            const zona = cols[6 + offset];
            const imoCol = cols[7 + offset] || "";
            const isImoTrue =
              imoCol.toUpperCase() === "SIM" ||
              imoCol.toUpperCase() === "TRUE" ||
              imoCol === "1";
            const justificativaCol = cols[9 + offset] || "";
            const observacaoCol = cols[10 + offset] || "";

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
              justificativa: justificativaCol,
              observacao: observacaoCol,
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
  // ... (carregamento CSV anterior)

  // 2. [TUTORIAL] FETCH E TRATAMENTO TEXTUAL DA IA
  async function handleConsult() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(true);
    setResult(null);
    setAllocationError(null);
    setOccupiedId(null);
    setTargetId(null);
    setContainerReady(false);
    setIsGrabbed(false);
    setAiJustification(null);

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

      // Passo 1: Pegamos a resposta como TEXTO BRUTO (.text()) ao invés de .json().
      // Por quê? IAs generativas são imprevisíveis. Às vezes respondem com o JSON limpo,
      // mas às vezes injetam formatação Markdown (ex: ```json { ... } ```).
      const textResponse = await response.text();
      let responseData: WebhookResponse = {};

      try {
        if (textResponse) {
          // Passo 2: Expressão Regular (Regex) que "limpa" a resposta.
          // Ela procura e remove crases de formatação Markdown antes de tentar o parse.
          const cleanedText = textResponse
            .replace(/```(?:json)?\n?|```/g, "")
            .trim();
          responseData = JSON.parse(cleanedText) as WebhookResponse;
        }
      } catch (parseError) {
        // Fallback: se mesmo após a limpeza o JSON for inválido, cai neste bloco.
        console.warn("Resposta não-JSON recebida da API:", textResponse);
        if (!response.ok) {
          throw new Error(textResponse || `Erro HTTP: ${response.status}`);
        }
      }

      // Passo 3: Tratamento de erros HTTP específicos
      if (!response.ok) {
        // O código 429 (Too many requests) é comum em webhooks gratuitos (ex: n8n, Make).
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
        setAiJustification(
          responseData.justificativa ||
            "Alocação sugerida sem justificativa adicional.",
        );
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

  // 3. [TUTORIAL] ATUALIZAÇÃO OTIMISTA (Optimistic UI)
  async function handleDropSlot(slotId: string) {
    if (!containerReady || occupiedId) return;
    if (slotId !== targetId) return;

    // CONCEITO: Ao invés de exibir um spinner de "Carregando..." e esperar o banco de dados
    // confirmar a gravação, nós alteramos os estados visuais (setOccupiedId, setResult) IMEDIATAMENTE.
    // O usuário percebe a ação como instantânea. Essa técnica se chama "Optimistic UI".
    setOccupiedId(slotId);
    setContainerReady(false);
    setIsGrabbed(false);
    setResult({
      kind: "success",
      slot: slotId,
    });

    const realZone = slotId.split("-")[0];

    // Após atualizar a UI, disparamos a requisição em background de forma silenciosa.
    try {
      const payloadGravacao = {
        vaga_confirmada: slotId,
        id_conteiner: displayId,
        peso_ton: Number(data.weight),
        data_hora_chegada: new Date().toLocaleString("pt-BR"),
        data_saida_prevista: data.departure,
        IMO: data.isIMO,
        zona: realZone,
        status: "Ocupado",
        justificativa:
          aiJustification || "Alocação manual (Fora do alvo da IA)",
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
      // Em uma aplicação 100% robusta de produção, este 'catch' deveria desfazer
      // a "Atualização Otimista" caso o servidor negue a ação, emitindo um alerta ao usuário.
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

      <DashboardMetrics slots={slots} />

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

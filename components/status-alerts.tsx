import { AlertTriangle, CheckCircle2, X } from "lucide-react";

type Result = { kind: "success" | "risk"; slot: string } | null;

type StatusAlertsProps = {
  result: Result;
  targetId: string | null;
  allocationError: string | null;
  onClearResult: () => void;
};

export function StatusAlerts({
  result,
  targetId,
  allocationError,
  onClearResult,
}: StatusAlertsProps) {
  return (
    <>
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
            onClick={onClearResult}
            className="rounded-md p-1 opacity-70 hover:opacity-100"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Exibição da Justificativa de Erro da IA */}
      {allocationError && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/5 p-4 text-red-200">
          <h3 className="flex items-center gap-2 font-bold">
            <AlertTriangle className="size-5" aria-hidden="true" />
            Análise Logística: Impedimento
          </h3>
          <p className="mt-2 text-sm leading-relaxed opacity-90">
            {allocationError}
          </p>
        </div>
      )}
    </>
  );
}

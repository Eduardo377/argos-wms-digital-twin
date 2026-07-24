"use client";

import type { Slot } from "@/lib/yard";
import {
  Package,
  Activity,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

type DashboardMetricsProps = {
  slots: Slot[];
};

export function DashboardMetrics({ slots }: DashboardMetricsProps) {
  if (!slots.length) return null;

  const occupiedSlots = slots.filter(
    (slot) =>
      slot.status === "Ocupado" ||
      slot.status === "Alocado" ||
      slot.status === "Realocado",
  );
  const totalContainers = occupiedSlots.length;

  const occupancyRate = ((totalContainers / slots.length) * 100).toFixed(2);

  const totalIMO = occupiedSlots.filter((slot) => slot.isIMO).length;

  const hasImoViolation = occupiedSlots.some(
    (slot) => slot.isIMO && !slot.id.includes("E"),
  );
  const isConforme = !hasImoViolation;

  return (
    <section
      aria-label="Métricas do Pátio"
      className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card/60 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="size-4 text-sky-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total de Contêineres
          </span>
        </div>
        <span className="font-mono text-3xl font-bold text-foreground">
          {totalContainers}
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card/60 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="size-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Taxa de Ocupação
          </span>
        </div>
        <span className="font-mono text-3xl font-bold text-foreground">
          {occupancyRate}%
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card/60 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="size-4 text-yellow-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Quantidade de IMO
          </span>
        </div>
        <span className="font-mono text-3xl font-bold text-foreground">
          {totalIMO}
        </span>
      </div>

      <div
        className={`flex flex-col gap-2 rounded-xl border p-5 shadow-sm transition-colors ${
          isConforme
            ? "border-border bg-card/60"
            : "border-red-500/50 bg-red-500/10"
        }`}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          {isConforme ? (
            <ShieldCheck className="size-4 text-emerald-500" />
          ) : (
            <ShieldAlert className="size-4 text-red-500" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider">
            Conformidade
          </span>
        </div>
        <span
          className={`text-xl font-bold tracking-tight ${
            isConforme ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {isConforme ? "Conforme" : "Não Conforme"}
        </span>
      </div>
    </section>
  );
}

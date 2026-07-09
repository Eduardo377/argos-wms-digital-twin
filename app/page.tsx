import { TerminalDashboard } from "@/components/terminal-dashboard"
import { Ship } from "lucide-react"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Ship className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-lg font-semibold leading-tight text-foreground text-balance">
                Terminal de Contêineres
              </h1>
              <p className="text-sm text-muted-foreground">Painel de Controle · Cérebro IA de Roteirização</p>
            </div>
          </div>
          <span className="hidden items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 sm:flex">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
            Sistema Online
          </span>
        </div>
      </header>

      <div className="px-6 py-8">
        <TerminalDashboard />
      </div>
    </main>
  )
}

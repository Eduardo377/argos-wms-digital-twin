import { Anchor, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-4 flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row border-t border-border pt-4">
      <div className="flex items-center gap-2">
        <Anchor className="size-3.5" aria-hidden="true" />
        Sistema de roteirização para armazéns · simulação de alocação assistida
        por IA
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 font-medium">
        {/* Link Repositório */}
        <a href="https://github.com/Eduardo377/argos-wms-digital-twin" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          Repositório
        </a>
        
        {/* Link GitHub Perfil */}
        <a href="https://github.com/Eduardo377/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          Eduardo377
        </a>
        
        {/* Link LinkedIn */}
        <a href="https://www.linkedin.com/in/eduardogomes377/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          LinkedIn
        </a>
        <a
          href="mailto:eduardogomes377@gmail.com"
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <Mail className="size-3.5" /> E-mail
        </a>
        <div className="ml-2 border-l border-border/50 pl-4 font-mono opacity-50">
          Build v2.1.0
        </div>
      </div>
    </footer>
  );
}

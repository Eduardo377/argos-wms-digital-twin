# 🏗️ Argos: Torre de Controle para Armazém Autoportante

![Versão](https://img.shields.io/badge/version-2.0.0-f97316?style=for-the-badge)
![Status](https://img.shields.io/badge/status-Em_Desenvolvimento-0b2c4d?style=for-the-badge)

**🔗 Aplicação Online:** [https://terminal-yms-ws.vercel.app/](https://terminal-yms-ws.vercel.app/)

---

## 📌 Visão Geral

O **Projeto Argos** é a evolução do sistema de gestão de pátios da Wilson Sons. Diferente da versão anterior voltada para contêineres, esta implementação foca no **Armazém Autoportante** de alta densidade. O sistema funciona como um Gêmeo Digital (Digital Twin) com motor de decisão assistido por IA (Gemini), integrando interface em tempo real com regras logísticas automatizadas.

## 🧠 Motor de Decisão (Regras de Negócio - Desafio 2)

A IA processa o estado atual do armazém aplicando três restrições críticas:

1. **Segurança (Cargas IMO):** Produtos perigosos são isolados em posições designadas via lógica do Make.com.
2. **Produtividade (Ocupação < 40%):** Restrição de movimentação de lança: a IA restringe a alocação aos níveis N1-N4 quando a ocupação global está abaixo de 40%.
3. **Física do Armazém:** Matriz expandida de 7 andares (Eixo Z), com validação de empilhamento (não permite alocação em N2 sem ocupação em N1).

---

## ⚙️ Arquitetura Técnica

### Fluxo de Dados

```mermaid
graph TD
    A[GATILHO: Chegada de Carga] --> B(Frontend: Next.js/Shadcn)
    B -->|Webhook| C(Make.com: Webhook Gateway)
    C -->|Consulta| D(Google Sheets: Estado da Matriz)
    D -->|Payload| E(Motor IA: Gemini Pro 1.5)
    E -->|Decisão JSON| F{Make: Roteador Lógico}
    F -->|Caminho A: Sucesso| G[Atualiza Sheets e UI]
    F -->|Caminho B: Alerta| H[Notifica Operador]

```

---

## 📂 Estrutura do Repositório

```text
├── app/              # Rotas e Layouts (Next.js App Router)
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/   # Componentes Shadcn/UI e Lógica de Interface
│   │   ├── ui/
│   │   └── button.tsx
│   ├── terminal-dashboard.tsx
│   ├── yard-map.tsx      # Renderização da matriz 3D (7 níveis)
│   └── movement-form.tsx # Input para Carga IMO e dados logísticos
├── lib/              # Utilitários e Tipagens (Yard.ts)
│   ├── utils.ts
│   └── yard.ts
├── backend/          # Blueprint da automação Make.com
│   └── blueprint-roteirizador.json
├── docs/             # Arquitetura e Diagramas
│   ├── fluxo_make_automacao.png
│   └── FLOW_ARCHITECTURE.md
└── public/           # Assets e Icons
    ├── apple-icon.png
    ├── placeholder.jpg
    ├── icon-dark-32x32.png
    ├── icon-light-32x32.png
    ├── placeholder-logo.png
    ├── placeholder-user.jpg
    ├── icon.svg (300 tokens)
    ├── placeholder-logo.svg
    └── placeholder.svg

```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Next.js, TypeScript, Tailwind CSS, Shadcn/UI, Lucide React.
- **Backend/Orquestração:** Make.com (Low-Code/No-Code Integration).
- **IA Cognitiva:** Google Gemini API (Prompt Engineering focado em roteirização logística).
- **Database:** Google Sheets (Matriz de estados).

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js (v18+)
- NPM ou PNPM
- Conta ativa no Make.com e Google Cloud (para API do Gemini)

### Passos de Instalação

1. **Clone o repositório:**

```bash
git clone https://github.com/Eduardo377/torre-controle-logistico-com-automacao_desafio-2

```

1. **Instale as dependências:**

```bash
npm install

```

ou

```bash
pnpm install
```

1. **Configure as variáveis de ambiente:**
   Crie um `.env.local` na raiz com o link do seu Webhook do Make.com.
2. **Inicie o servidor:**

```bash
npm run dev

```

ou

```bash
pnpm dev
```

---

## 📝 Documentação da Automação (Backend)

O arquivo `backend/blueprint-roteirizador.json` contém a arquitetura lógica do Make.com.

- **Ajustes necessários:** Importe este JSON no seu cenário do Make.com para replicar a lógica de busca do Google Sheets e a chamada à API do Gemini.
- **Customização:** A lógica da regra de 40% e o isolamento de cargas IMO está encapsulada no módulo `Generate a Response` (Gemini) do cenário.

---

## 🎓 Créditos e Contexto

Projeto desenvolvido como parte do desafio técnico da **KODIE Academy** em parceria com a **Wilson Sons**.

- **Versão:** 2.0.0
- **Status:** Em desenvolvimento (Refatoração de eixos para 7 andares concluída).

---

## 👨‍💻 Desenvolvido por

<a href="https://www.linkedin.com/in/eduardogomes377">
  <img src="https://github.com/Eduardo377.png" width="120px;" alt="Foto de Eduardo Gomes Andrade" style="border-radius: 50%;"/>
</a>
<br />
<strong>Eduarde Andrade</strong>
<br />
<em>Full Stack Developer</em>
<br /><br />
<a href="https://www.linkedin.com/in/eduardogomes377">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>

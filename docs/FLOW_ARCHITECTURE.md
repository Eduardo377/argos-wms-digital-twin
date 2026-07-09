# Arquitetura de Automação (Backend - Make.com)

O sistema de roteirização opera através de uma automação de baixo código no Make.com, processando as entradas do contêiner em tempo real via Webhook.

## O Fluxo de Dados:
1. **Webhook:** Recebe os dados de entrada do formulário frontend.
2. **Google Sheets (Busca):** Consulta o estado atual do pátio logístico.
3. **Google Gemini AI:** Analisa os dados de peso, tipo e disponibilidade, retornando a melhor vaga (lógica de roteirização).
4. **JSON Parser:** Trata a resposta da IA.
5. **Google Sheets (Ação):** O fluxo de decisão (If-Else) atualiza a planilha de pátio com o status 'Ocupado' (Update) ou registra a movimentação concluída (Add Row).

![Fluxo de Automação](./fluxo_make_automacao.png)
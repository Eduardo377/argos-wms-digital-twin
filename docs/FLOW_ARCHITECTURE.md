# Arquitetura de Automação (Backend - Make.com)

O sistema de roteirização do Argos WMS opera através de uma arquitetura de microsserviços baseada em automações de baixo código no Make.com. O backend foi dividido em dois fluxos distintos para separar a responsabilidade de "Raciocínio Lógico" (IA) e "Persistência de Dados" (Banco de Dados).

As chaves de comunicação entre a interface (Vercel) e os endpoints do Make.com são gerenciadas de forma segura via Variáveis de Ambiente (ex: `NEXT_PUBLIC_WEBHOOK_URL`).

## 1. Microsserviço: Torre de Controle (Cérebro IA)
Responsável por ler o estado atual da matriz 3D do pátio e acionar a Inteligência Artificial para determinar a melhor alocação baseada em regras de negócio rígidas.

1. **Webhook (Entrada):** Recebe os dados do novo contêiner (ID, peso, previsão de saída, flag IMO e zona alvo) enviados pelo formulário do frontend.
2. **Google Sheets (Busca):** Mapeia o estado atual do Armazém Autoportante (7 níveis de altura) para identificar vagas disponíveis e ocupadas.
3. **Google Gemini AI:** Analisa os dados recebidos cruzando-os com as 8 regras logísticas do terminal (isolamento IMO, peso, empilhamento, etc.).
4. **Webhook Response:** Devolve um JSON estruturado para o frontend informando o `targetId` ideal (ex: `FROZEN-A1-N1`) e a justificativa técnica.

## 2. Microsserviço: Gravação de Movimentação (Braço Mecânico)
Responsável por efetivar a persistência dos dados no Gêmeo Digital (Google Sheets) de forma assíncrona, ativado pelo evento de "Drag and Drop" do usuário.

1. **Webhook (Entrada):** Recebe o ID da vaga final validada e escolhida pelo usuário na interface.
2. **Google Sheets (Busca e Sanitização):** Localiza a coordenada exata da vaga no banco de dados oficial. A busca aplica funções de sanitização (`upper()`) nos parâmetros de entrada (`vaga_confirmada` e `zona`) para garantir consistência e evitar falhas operacionais causadas por divergências de formatação (letras maiúsculas ou minúsculas) oriundas do frontend.
3. **Router (Fluxo de Decisão If-Else e Trava de Segurança):** Atua como o mecanismo de segurança central do Gêmeo Digital, possuindo duas ramificações de estado:
   - *Caminho 1 (Update Row - Validação de Sucesso):* Executado apenas mediante duas validações estritas: a existência do `Row number` (assegurando que o sistema não interaja com vagas fantasmas ou não mapeadas) e a confirmação de que o status atual é igual a `Livre` (impedindo colisões físicas e sobreposições lógicas de contêineres). Confirmadas as regras, atualiza os dados da célula para 'Ocupado'.
   - *Caminho 2 (Add Row - Fallback e Auditoria):* Estruturado estruturado para atuar como um *fallback* de segurança. Caso a vaga desejada já esteja ocupada ou inválida, o fluxo é desviado (`else`) para registrar a anomalia operacional diretamente na planilha de alertas (SecOps).
4. **Webhook Response:** Confirma o sucesso da gravação de volta para a aplicação.

![Fluxo de Automação](./fluxo_make_automacao.png)
Crie um dashboard logístico de Terminal de Contêineres em React com Tailwind CSS e ícones Lucide.

DESIGN (ESTILO WILSON SONS):

Fundo principal: Azul Marinho Profundo (ex: bg-slate-950 ou #001A33).

Textos: Branco e cinza claro.

Destaques e Botões Primários: Laranja Vibrante (bg-orange-500 hover:bg-orange-600).

Estética: Painel de controle corporativo, industrial, limpo e tático (Dark Mode absoluto).

LAYOUT (2 COLUNAS):

Lado Esquerdo (Formulário): Título 'Nova Movimentação'. Campos: ID do Contêiner (text), Peso em tons (number), Previsão de Saída (date), Zona Alvo (select: Hot, Warm, Cold). Um botão laranja largo: 'Consultar Cérebro IA'.

Lado Direito (Mapa do Pátio): Um grid espaçoso representando as vagas. Crie uma matriz 4x4 ou 5x5. Cada slot deve ter seu nome (ex: A1-N1, B2-N2). Slots têm fundo translúcido e borda cinza escuro.

INTERAÇÃO E DRAG-AND-DROP:

Use a API nativa de Drag and Drop do HTML5 (onDragStart, onDragOver, onDrop).

Estado inicial: O grid exibe as vagas e não há contêiner solto na tela.

Ao clicar em 'Consultar Cérebro IA': Simule um loading de 1 segundo. Depois, o sistema escolhe um slot aleatório como 'Alvo da IA' (faça esse slot pulsar com borda laranja).

Ao mesmo tempo, renderize um componente 'Contêiner' arrastável (draggable) acima do grid.

O usuário deve conseguir arrastar esse Contêiner e soltar em qualquer slot do grid.

Validação cruzada: Se ele soltar no slot 'Alvo', exiba um aviso verde na tela: 'Sucesso: Alocado conforme roteirização da IA'. Se soltar em qualquer outro slot, exiba um aviso vermelho: 'Risco: Divergência de Pátio identificada'.
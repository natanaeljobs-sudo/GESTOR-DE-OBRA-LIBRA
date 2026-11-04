# Barra de Etapas em Cada Obra da Tabela (Implementado)

A barra de status com 11 etapas numeradas e a etapa final "Concluído" agora é exibida diretamente em cada obra da tabela.

---

## 1. O Que Foi Realizado
- **Régua Individual por Obra**: Cada obra listada na tabela (atuais e qualquer nova cadastrada) possui sua própria linha com a barra de 11 etapas + Concluído.
- **Novas Obras**: Toda nova obra cadastrada surge imediatamente na listagem com sua régua ativa, iniciando na **etapa 1 (Sapata)** com a primeira bolinha preenchida em azul.
- **Interação Independente**:
  - Clicar nas etapas 1 a 11 avança ou retrocede cumulativamente em azul (`#0085db`) apenas para aquela obra selecionada.
  - Clicar na etapa final **Concluído** marca aquela obra como concluída e torna toda a sua régua 100% verde (`emerald-500`).
- **Limpeza do Layout**: A régua única compartilhada que ficava no rodapé foi removida, eliminando duplicações e deixando a interface limpa e intuitiva.

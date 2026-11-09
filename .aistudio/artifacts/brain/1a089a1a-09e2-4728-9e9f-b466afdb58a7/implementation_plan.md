# Reprodução do Modal de Pré-Visualização A4 no Botão "Imprimir" de Recibos

Implementar a abertura de um modal de pré-visualização em tela cheia formato A4 para o botão de ação **"Imprimir"** na tela de Recibos, reproduzindo com fidelidade a experiência, controles de zoom e fluxo de impressão do modal de relatórios (`RelatorioPreviewModal`).

---

## Decisões Confirmadas pelo Usuário

> [!IMPORTANT]
> **Decisão Confirmada:** Ao clicar no botão **"Imprimir"** da barra de ferramentas do recibo em `RecibosView.tsx`, a aplicação abrirá um modal de pré-visualização em tela cheia do **próprio Recibo A4** (contendo a 1ª via de Contabilidade e a 2ª via do Beneficiário), com controles de zoom e botão de impressão nativa, em vez de disparar a caixa do navegador imediatamente.

---

## 1. Visão Geral e Conceito Central

- **O que faz:** Transforma a ação do botão "Imprimir" do recibo em uma experiência rica de conferência antes da impressão física. O usuário visualiza o recibo completo de 2 vias em escala real A4, pode aplicar zoom ou ajustar à tela, e confirmar a impressão nativa ou download.
- **Público e Contexto:** Gestores de obra, administradores e operadores responsáveis pelo acerto de contas com trabalhadores no canteiro.
- **Valor Agregado:** Elimina impressões acidentais ou com corte incorreto, garante visualização antecipada idêntica ao que sairá no papel ou no PDF e unifica o padrão de UX do sistema com a tela de Relatórios.

---

## 2. Experiência do Usuário e Design Visual

### Fluxo de Interação
1. O usuário gera ou seleciona um recibo na tela de **Recibos**.
2. Na barra de ferramentas do recibo, clica no botão primário **"Imprimir"** (`button:nth-of-type(3)`).
3. Em vez de disparar a janela de impressão diretamente, abre-se o modal em tela cheia (`ReciboPreviewModal`):
   - **Backdrop:** Fundo escurecido translúcido (`bg-black/85 backdrop-blur-xs`).
   - **Barra Superior (Header):**
     - Identificação: Ícone, número do recibo (`REC-...`), nome do recebedor e nome da obra.
     - Indicador central: Tag "Recibo A4 · 2 Vias (Contabilidade + Beneficiário)".
     - Ações no canto direito:
       - Botão primário **"Imprimir"** (que aciona `triggerReciboInPagePrint` / impressão nativa).
       - Botão circular de fechar modal (`X` ou tecla `Esc`).
   - **Área Central (Viewport de Pré-visualização):**
     - Folha A4 centralizada com sombra realista (`0 10px 25px rgba(0, 0, 0, 0.22)`).
     - Renderização de alta fidelidade: 1ª Via (Contabilidade/Pagador), linha de corte tracejada com tesoura central e 2ª Via (Trabalhador/Beneficiário).
   - **Barra Flutuante de Zoom (Inferior Direita):**
     - Botões Zoom Out (`-`), porcentagem atual (`85%`, `100%`), Zoom In (`+`) e Ajustar à Tela (Fit Screen).

### Padrão Visual (Design System)
- **Cores:** Fundo dark `#111c2d`, acento `#0085db` (hover `#0071ba`), bordas `#333f55`.
- **Tipografia:** `Plus Jakarta Sans` para UI e textos contratuais; `JetBrains Mono` para identificadores numéricos.
- **Bordas e Sombras:** `--radius-spike` (18px) para containers e 12px para controles de ação.

---

## 3. Decisões Técnicas e Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                       RecibosView                           │
│  [Dados do Recibo]  │  [Barra de Ferramentas: Imprimir]     │
└─────────────────────────────────┬───────────────────────────┘
                                  │ onClick
                                  ▼
                     setIsPreviewModalOpen(true)
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    ReciboPreviewModal                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Header: [Obra/Recibo]    [2 Vias A4]    [Imprimir] [X]  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Viewport:                                               │ │
│ │   ┌───────────────────────────────────────────────────┐ │ │
│ │   │ Folha A4 em Escala (transform: scale(zoom))       │ │ │
│ │   │  • 1ª Via (Contabilidade / Pagador)               │ │ │
│ │   │  - - - - - Linha de Corte Central - - - - -       │ │ │
│ │   │  • 2ª Via (Trabalhador / Beneficiário)            │ │ │
│ │   └───────────────────────────────────────────────────┘ │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Barra Flutuante de Zoom: [-] [85%] [+] [Ajustar à tela] │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬───────────────────────────┘
                                  │ Clique "Imprimir"
                                  ▼
                     triggerReciboInPagePrint()
```

- **Novo Componente:** `src/components/recibos/ReciboPreviewModal.tsx`
  - Reutiliza a mesma estrutura testada e segura de viewport, zoom e teclas de atalho de `RelatorioPreviewModal.tsx`.
  - Encapsula a renderização das 2 vias e a comunicação com o serviço de impressão.
- **Modificação em `RecibosView.tsx`:**
  - Adiciona o estado `const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);`.
  - Atualiza o clique do botão alvo (`button:nth-of-type(3)`) para acionar `setIsPreviewModalOpen(true)`.
  - Renderiza o `<ReciboPreviewModal />` no final da view passando `previewRecibo` e `activeObra`.
- **Isolamento de Escopo:**
  - Nenhuma outra tela ou componente do sistema é modificado.
  - A geração de recibo, dados e histórico de pagamentos permanecem idênticos.

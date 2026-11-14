---
schemaVersion: 1
generatedAt: 2026-11-13T17:28:25-03:00
reversa:
  version: "1.3.6"
kind: screen_modernization_decision
producedBy: screen-translator
hash: "sha256:screen-modernization-decision-libra-obras"
---

# Screen Modernization Decision — SISTEMA LIBRA - OBRAS

> Decisão sobre o modo de tradução visual das telas legadas. Fase 1 do Screen Translator.

---

## 1. Plataforma de Origem e Alvo
- **Plataforma de Origem**: React SPA com Tailwind CSS inline (🟢 CONFIRMADO no código legado).
- **Plataforma Alvo**: Web SPA moderna (React 19 + Tailwind CSS + Lucide Icons + CSS Print A4).
- **Telas Inventariadas**: 12 telas/views principais mapeadas em `_reversa_sdd/screens/inventory.json`.

## 2. Modos Avaliados e Trade-offs

| Aspecto | Modo 1: Literal | Modo 2: Modernizado (Recomendado) | Modo 3: Híbrido |
|---|---|---|---|
| **Fidelidade Visual** | Idêntica ao legado (mesmos grids e cores) | Preserva identidade visual, mas adiciona micro-interações, feedbacks de loading/erro e responsividade móvel aprimorada | Literal nos Recibos; Modernizado no restante |
| **Estados de Interface** | Mantém telas síncronas sem spinners | Declara explicitamente os 4 estados (Idle, Loading, Success, Error) | Misto |
| **Impressão A4 de Recibos** | Preservada | Preservada com precisão milimétrica CSS Print | Preservada |
| **Custo de Implementação** | Baixo | Médio | Médio |

## 3. Recomendação do Screen Translator
- **Recomendação**: **Modo 2 (Modernizado)**, preservando rigorosamente a identidade visual e a tela de **Recibos A4** (que deve ser idêntica na impressão), enquanto moderniza os formulários com feedback assíncrono de rede.


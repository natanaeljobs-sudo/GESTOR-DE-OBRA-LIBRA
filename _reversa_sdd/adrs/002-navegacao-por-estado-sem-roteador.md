# ADR-002: Navegação Baseada em Estado (`activeTab`) sem Roteador URL

- **Status:** Aceito (Retroativo) 🟢 CONFIRMADO
- **Data:** 2026-11-13 (inferido do histórico Git `b6154cb` e `32bc28d`)

## Contexto
A aplicação funciona como um painel único (PWA) com alternância rápida entre abas no menu lateral e navegação mobile.

## Decisão
Controlar a tela ativa através do estado `activeTab` (`TabType`) no `AppContext`, sem uso de `react-router` ou URLs dedicadas por módulo.


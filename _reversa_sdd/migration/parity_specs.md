---
schemaVersion: 1
generatedAt: 2026-11-13T19:24:35-03:00
reversa:
  version: "1.3.6"
kind: parity_specs
producedBy: inspector
hash: "sha256:parity-specs-libra-obras"
---

# Parity Specifications — SISTEMA LIBRA - OBRAS

> Especificação de critérios de paridade funcional e comportamental para homologação do sistema migrado em relação ao legado.

## 1. Modos de Validação Aplicáveis
- **Characterization Tests**: Suíte de testes automatizados baseada nos fluxos mapeados em `parity_tests/*.feature`.
- **Contract Tests**: Validação de schemas e endpoints da camada de persistência Supabase/PostgreSQL.
- **Contract Tests de Tela & Paridade Visual**:
  - Telas gerais: Validação contratual de componentes e dos 4 estados (Idle, Loading, Error, Success).
  - Recibos e Relatórios: Validação visual estrita de formatação para impressão em folha A4 física.

## 2. Critérios de Paridade Aceita
- **Métrica Primária**: 100% dos cenários de paridade críticos aprovados.
- **Divergência de Cálculo Financeiro**: 0,00% de divergência nos somatórios de saldos, orçamentos e subtotais.
- **Critério de Bloqueio de Cutover**: Qualquer falha nos cenários de emissão de recibo ou cálculo de saldo de despesas bloqueia o go-live.

## 3. Cobertura Adaptada ao Paradigma
- **Transição**: Estado em memória síncrono (Context API) → Aplicação Web assíncrona desacoplada (React 19 + Supabase/PostgreSQL).
- **Dimensões Obrigatórias**:
  - Idempotência em operações de escrita (evitar duplicidade de despesas por cliques múltiplos).
  - Tratamento determinístico de concorrência e integridade referencial via chaves estrangeiras.

## 4. Exceções e Deviations Aprovadas
- **DEV-001**: Presença de estados visuais assíncronos (`Loading`, `Error`) e skeletons que não existiam no legado.
- **DEV-002**: Renderização estrita de recibos em CSS Print A4.


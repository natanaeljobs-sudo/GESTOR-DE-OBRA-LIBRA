# Requisitos — Módulo `relatorios`

> Especificação de requisitos do módulo de relatórios executivos, consolidação contábil por categoria/etapa e exportação.
> Documento gerado automaticamente pelo **Reversa Writer**.

---

## 1. Visão Geral

- **Módulo:** `relatorios`
- **Caminho no Legado:** `src/components/relatorios/RelatoriosView.tsx`, `src/components/relatorios/RelatorioObraImpresso.tsx`, `src/components/relatorios/RelatorioPreviewModal.tsx`, `src/utils/relatorioPrintService.ts`
- **Propósito:** Consolidação de despesas e diárias de mão de obra em razão contábil unificado, cálculo de métricas executivas (Total Apurado, Contagem de Lançamentos, Maior Categoria de Custo), filtragem por períodos predefinidos ou arbitrários, filtro por etapa da obra, paginação, exportação para CSV e impressão de relatório impresso em alta fidelidade.
- **Nível de Confiança Geral:** 🟢 CONFIRMADO (código-fonte React/TypeScript analisado diretamente).

---

## 2. Requisitos Funcionais (RF)

| ID | Descrição | Prioridade (MoSCoW) | Confiança | Rastreabilidade no Código |
|---|---|---|---|---|
| **RF-01** | Filtragem por intervalo de datas com atalhos de período (`Mês Atual`, `Últimos 30 Dias`, `Mês Anterior`, `Obra Completa`) e seleção de início/fim livre | **Must** | 🟢 CONFIRMADO | `RelatoriosView.tsx:41-49, 90-140` |
| **RF-02** | Filtragem de lançamentos por etapa específica da obra ou visualização consolidada de todas as etapas | **Must** | 🟢 CONFIRMADO | `RelatoriosView.tsx:43, 560-618` |
| **RF-03** | Unificação de lançamentos de despesas e diárias em um livro-razão (`LedgerItem`) ordenado por data decrescente e valor | **Must** | 🟢 CONFIRMADO | `RelatoriosView.tsx:159-233` |
| **RF-04** | Apuração de totais e percentuais agregados por categoria: `Materiais da obra`, `Mão de obra`, `Produção de trilhos`, `Abastecimentos` e `Outros` | **Must** | 🟢 CONFIRMADO | `RelatoriosView.tsx:236-313` |
| **RF-05** | Exibição de cards de métricas executivas em destaque: Total Apurado (R$), Lançamentos (quantidade) e Maior Categoria com percentual | **Must** | 🟢 CONFIRMADO | `RelatoriosView.tsx:621-662` |
| **RF-06** | Barra de progresso visual empilhada proporcional colorida por categoria de despesa | **Should** | 🟢 CONFIRMADO | `RelatoriosView.tsx:670-687` |
| **RF-07** | Abas de filtragem rápida de lançamentos por categoria (`Todos`, `Materiais`, `Mão de obra`, `Trilhos`, `Abastecimentos`) | **Must** | 🟢 CONFIRMADO | `RelatoriosView.tsx:729-799` |
| **RF-08** | Busca textual de lançamentos por descrição, fornecedor ou categoria na tabela | **Should** | 🟢 CONFIRMADO | `RelatoriosView.tsx:58, 316-326` |
| **RF-09** | Paginação de lançamentos com 10 itens por página e navegação com elipses (`< 1 2 3 ... >`) | **Must** | 🟢 CONFIRMADO | `RelatoriosView.tsx:60-63, 328-367` |
| **RF-10** | Exportação de dados consolidados em formato CSV com codificação adequada para planilhas | **Should** | 🟢 CONFIRMADO | `RelatoriosView.tsx:379-408` |
| **RF-11** | Pré-visualização modal e impressão de relatório formatado para auditoria da obra (`RelatorioObraImpresso`) | **Must** | 🟢 CONFIRMADO | `RelatorioPreviewModal.tsx`, `relatorioPrintService.ts` |

---

## 3. Requisitos Não Funcionais (RNF)

| ID | Categoria | Descrição | Confiança | Evidência |
|---|---|---|---|---|
| **RNF-01** | **Consistência Contábil** | O somatório total do relatório executivo deve bater exatamente com a soma de cada fatia individual de despesas e diárias dentro do mesmo período temporal | 🟢 CONFIRMADO | `categoryStats.total === materiais + mao_de_obra + trilhos + abastecimentos + outros` |
| **RNF-02** | **Desempenho** | Filtragem e recomputação agregada em memória devem ser otimizadas via memoização para evitar travamento da interface | 🟢 CONFIRMADO | Uso exaustivo de `useMemo` em `allLedgerItems`, `categoryStats` e `displayedLedgerItems` |
| **RNF-03** | **Qualidade de Impressão** | O relatório para impressão física deve conter cabeçalho institucional da obra, data de emissão, resumo consolidado e quebra limpa de linhas | 🟢 CONFIRMADO | `RelatorioObraImpresso.tsx:1-400` |

---

## 4. Critérios de Aceitação (Gherkin)

### Cenário 1: Filtragem por atalho de período
- **Dado** que a obra possui lançamentos em diversos meses
- **Quando** o usuário clica no atalho "Mês Atual"
- **Então** as datas de início e fim são ajustadas para o primeiro dia do mês corrente até a data de hoje, e os cards de métricas são recalculados instantaneamente.

### Cenário 2: Exportação em CSV
- **Dado** uma lista de lançamentos filtrados por etapa e período
- **Quando** o usuário clica em "Exportar CSV"
- **Então** um arquivo com padrão `relatorio_obra_[id]_[inicio]_a_[fim].csv` é baixado com as colunas Tipo, Data, Descricao, Categoria, Fornecedor / Trabalhador e Valor.


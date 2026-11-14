# Design — Módulo `relatorios`

> Especificação arquitetural, modelos de dados, fluxo de consolidação e componentes do módulo de relatórios.
> Documento gerado automaticamente pelo **Reversa Writer**.

---

## 1. Visão Arquitetural

O módulo `relatorios` atua como a camada de inteligência analítica e auditoria fiscal da obra, agregando fontes heterogêneas de despesas em uma visão de extrato financeiro (livro-razão).

```mermaid
flowchart TD
    subgraph DataSources [Fontes de Dados Brutas]
        DESP[Despesas - Materiais, Combustível, Trilhos]
        DIA[Diárias - Mão de Obra de Trabalhadores]
        ETA[Etapas Construtivas da Obra]
    end

    subgraph Aggregator [Camada de Agregação / Memória]
        FILT[Filtro Temporal e de Etapa]
        LEDGER[Unificador de Razão: LedgerItem[]]
        STATS[Calculadora de Estatísticas por Categoria]
    end

    subgraph Views [Visualização e Saída]
        RV[RelatoriosView - Dashboard e Tabela Paginada]
        RPM[RelatorioPreviewModal]
        ROI[RelatorioObraImpresso - Modelo A4 / Impressão]
        CSV[Gerador de CSV Blob/URI]
    end

    DESP --> FILT
    DIA --> FILT
    ETA --> FILT
    FILT --> LEDGER
    LEDGER --> STATS
    STATS --> RV
    LEDGER --> RV
    RV --> RPM
    RPM --> ROI
    RV --> CSV
```

---

## 2. Estruturas de Dados Internas

### `LedgerItem` (Entrada Unificada no Razão)
```typescript
interface LedgerItem {
  id: string;                                                          // desp_[id] ou dia_[id]
  data: string;                                                        // YYYY-MM-DD
  categoriaKey: 'materiais' | 'mao_de_obra' | 'trilhos_producao' | 'abastecimentos' | 'outros';
  tipoLabel: string;                                                   // "Materiais", "Mão de obra", etc.
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  descricao: string;
  subtitulo: string;                                                   // Fornecedor ou trabalhador
  valor: number;
}
```

### Estatísticas de Categoria (`categoryStats`)
```typescript
interface CategoryStat {
  key: string;
  label: string;
  tabLabel: string;
  valor: number;
  percentual: number;                                                  // 0 a 100%
  color: string;
}

interface AggregateReportData {
  total: number;
  count: number;
  categories: CategoryStat[];
  maiorCategoria: CategoryStat | null;
}
```

---

## 3. Fluxo de Consolidação e Filtros

1. **Entrada de Período:** O usuário define `dataInicio` e `dataFim` (manualmente ou via atalhos como `Mês Atual`, `Últimos 30 Dias`, `Mês Anterior` ou `Obra Completa`).
2. **Filtragem de Etapa:** Filtra lançamentos pertencentes a `selectedEtapa` (`todas` ou ID de uma etapa específica).
3. **Mapeamento e Unificação:**
   - Despesas normais são traduzidas para `LedgerItem`, categorizadas com cores padronizadas.
   - Diárias de trabalhadores são traduzidas para `LedgerItem` com a categoria fixa `mao_de_obra`.
   - A lista combinada é ordenada de forma decrescente: primeiro por data (`YYYY-MM-DD`), e para datas iguais, pelo maior valor.
4. **Cálculo Agregado:**
   - Calcula os subtotais para cada uma das 5 categorias canônicas.
   - Determina o percentual de cada categoria sobre o custo global do período.
   - Identifica a categoria de maior impacto orçamentário.
5. **Renderização:** Exibe os 3 cards do topo, o gráfico de barra empilhada proporcional e a tabela com abas de categoria, campo de busca e paginação de 10 em 10 itens.


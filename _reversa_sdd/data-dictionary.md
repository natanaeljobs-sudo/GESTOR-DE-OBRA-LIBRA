# Dicionário de Dados — SISTEMA LIBRA - OBRAS

> Gerado pelo **Archaeologist** em 2026-11-13 (fonte: `src/types/index.ts`) 🟢 CONFIRMADO

## Entidades Principais

### 1. `Obra`
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` | Sim | Identificador único |
| `nome` | `string` | Sim | Nome da obra |
| `endereco` | `string` | Sim | Endereço completo |
| `dataInicio` | `string` | Sim | Data de início |
| `orcamentoTotal` | `number` | Sim | Orçamento total previsto |
| `tetoMaoDeObra` | `number` | Sim | Teto de gastos com mão de obra |
| `etapaAtualId` | `string` | Sim | ID da etapa atual |
| `status` | `'em_andamento' \| 'planejamento' \| 'concluida' \| 'andamento' \| 'cancelada'` | Sim | Status da obra |
| `valorVenda` | `number` | Não | Valor de venda estimado |
| `etapaAtual` | `string` | Não | Nome da etapa atual |
| `observacoes` | `string` | Não | Observações gerais |

### 2. `Etapa`
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` | Sim | Identificador único |
| `numero` | `number` | Sim | Ordem sequencial da etapa |
| `nome` | `string` | Sim | Nome da etapa |
| `orcamentoPrevisto` | `number` | Não | Orçamento previsto da etapa |
| `status` | `'pendente' \| 'em_andamento' \| 'concluida'` | Sim | Status da etapa |

### 3. `Despesa` e `ItemDespesa`
- **`Despesa`**: `id`, `obraId`, `descricao`, `data` (`YYYY-MM-DD`), `categoria` (`CategoriaDespesa`), `fornecedorNome`, `etapaId`, `compradorNome`, `formaPagamento` (`FormaPagamento`), `cartaoId?`, `parcelasTotal?`, `parcelasStatus?` (`'pendente' | 'geradas' | 'nao_aplicavel'`), `valorTotalNota`, `valorSomaItens`, `diferencaRateio`, `itens` (`ItemDespesa[]`), `comprovanteUrl?`, `statusConferencia` (`'ok' | 'pendente_info' | 'diferenca_rateio'`), `observacoes?`, `criadoPor`, `criadoEm`, `atualizadoEm?`.
- **`ItemDespesa`**: `id`, `materialId`, `materialNome`, `quantidade`, `unidade`, `valorUnitario`, `valorTotal`, `etapaId`, `destino` (`'obra' | 'producao_trilhos' | 'outra_obra' | 'estoque_geral'`), `observacoes?`.

### 4. `Material`
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` | Sim | Identificador único |
| `nome` | `string` | Sim | Nome do material |
| `unidadePadrao` | `string` | Sim | Unidade padrão (`kg`, `m`, `m²`, `un`, `saco`, etc.) |
| `categoriaSugerida` | `string` | Não | Categoria sugerida |
| `dataCadastro` | `string` | Sim | Data de cadastro |

### 5. `Trabalhador` e `Diaria`
- **`Trabalhador`**: `id`, `nome`, `funcao`, `cpf?`, `telefone?`, `chavePix?`, `valorDiariaPadrao`, `ativo`, `dataAdmissao`.
- **`Diaria`**: `id`, `obraId`, `trabalhadorId`, `trabalhadorNome`, `data`, `fracao` (`0.5 | 1.0 | 1.5`), `valorDiariaBase`, `valorCalculado`, `valorAdicional`, `descricaoAdicional?`, `justificativaAjuste?`, `valorTotal`, `etapaId`, `statusPagamento` (`'pendente' | 'pago'`), `dataPagamento?`, `reciboId?`, `comprovanteUrl?`, `criadoPor`.

### 6. `ReciboPagamento`
`id`, `obraId`, `numeroRecibo`, `trabalhadorId`, `trabalhadorNome`, `trabalhadorCpf`, `trabalhadorFuncao`, `responsavelNome`, `periodoInicio`, `periodoFim`, `diasEspecificos?`, `valorTotal`, `valorPorExtenso`, `motivo`, `diariasIds`, `dataEmissao`, `localCidade`, `observacoes?`.

### 7. `Orcamento` e `ItemOrcamento`
- **`Orcamento`**: `id`, `obraId`, `fornecedorEmpresa`, `identificacao`, `data`, `prazoValidade?`, `condicoesPagamento?`, `valorTotal`, `itens` (`ItemOrcamento[]`), `status` (`'em_cotacao' | 'aprovado' | 'recusado' | 'convertido_em_compra'`), `despesaConvertidaId?`, `comprovanteOuPdfUrl?`, `observacoes?`, `criadoEm`.
- **`ItemOrcamento`**: `id`, `materialId?`, `materialNome`, `quantidade`, `unidade`, `precoUnitarioCotado`, `valorTotalCotado`.

### 8. `ProducaoItem`
`id`, `obraId`, `produto`, `quantidade`, `comprimentoMetros?`, `especificacao?`, `data`, `destino`, `observacoes?`, `criadoPor`.

### 9. `CartaoConta` e `Parcela`
- **`CartaoConta`**: `id`, `apelido`, `tipo` (`'credito' | 'debito' | 'conta_corrente'`), `bandeira?`, `ultimosDigitos?`, `diaFechamento?`, `diaVencimento?`, `limite?`, `titular`.
- **`Parcela`**: `id`, `despesaId`, `descricao`, `cartaoId?`, `numeroParcela`, `totalParcelas`, `valorParcela`, `dataVencimento`, `status` (`'a_vencer' | 'paga' | 'em_atraso'`), `dataPagamento?`.

### 10. `Usuario`, `PermissaoModulo` e `SolicitacaoAcesso`
- **`Usuario`**: `id`, `nome`, `email`, `perfil` (`'master' | 'admin' | 'operador'`), `avatarColor`, `ativo`, `dataCadastro?`, `permissoes` (mapa por módulo com `visualizar`, `criar`, `editar`, `excluir`).
- **`SolicitacaoAcesso`**: `id`, `nome`, `email`, `mensagem`, `data`, `status` (`'pendente' | 'aprovado' | 'recusado'`).

### 11. `AlertaPendencia`
`id`, `tipo` (`'diferenca_rateio' | 'sem_cartao' | 'sem_comprovante' | 'diarias_pendentes' | 'teto_orcamento'`), `titulo`, `descricao`, `severidade` (`'alta' | 'media' | 'baixa'`), `entidadeId`, `moduloDestino`, `dataGerado`.


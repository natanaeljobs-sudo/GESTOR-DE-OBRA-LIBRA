# Máquinas de Estado — SISTEMA LIBRA - OBRAS

> Gerado pelo **Detective** em 2026-11-13

---

## 1. `Obra.status`

Valores: `planejamento`, `em_andamento`, `andamento` (legado/sinônimo), `concluida`, `cancelada`. 🟢 CONFIRMADO

```mermaid
stateDiagram-v2
    [*] --> planejamento
    planejamento --> em_andamento: Início da obra
    em_andamento --> concluida: Finalização das etapas
    em_andamento --> cancelada: Cancelamento
    planejamento --> cancelada: Cancelamento
```

---

## 2. `Etapa.status`

Valores: `pendente`, `em_andamento`, `concluida`. 🟢 CONFIRMADO

```mermaid
stateDiagram-v2
    [*] --> pendente
    pendente --> em_andamento: Iniciar etapa
    em_andamento --> concluida: Concluir etapa
```

---

## 3. `Despesa.statusConferencia`

Valores: `ok`, `pendente_info`, `diferenca_rateio`. 🟢 CONFIRMADO

```mermaid
stateDiagram-v2
    [*] --> pendente_info: Cadastro incompleto
    [*] --> ok: Soma dos itens == Valor da nota
    [*] --> diferenca_rateio: diferencaRateio != 0
    diferenca_rateio --> ok: Ajuste de rateio ou valor
    pendente_info --> ok: Informações completadas
```

---

## 4. `Diaria.statusPagamento`

Valores: `pendente`, `pago`. 🟢 CONFIRMADO

```mermaid
stateDiagram-v2
    [*] --> pendente: Lançamento da diária
    pendente --> pago: Emissão de ReciboPagamento
```

---

## 5. `Orcamento.status`

Valores: `em_cotacao`, `aprovado`, `recusado`, `convertido_em_compra`. 🟢 CONFIRMADO

```mermaid
stateDiagram-v2
    [*] --> em_cotacao: Criação da cotação
    em_cotacao --> aprovado: Aprovação
    em_cotacao --> recusado: Recusa
    aprovado --> convertido_em_compra: Conversão em Despesa
```

---

## 6. `Parcela.status`

Valores: `a_vencer`, `paga`, `em_atraso`. 🟢 CONFIRMADO

```mermaid
stateDiagram-v2
    [*] --> a_vencer: Geração da parcela
    a_vencer --> paga: Baixa / Pagamento
    a_vencer --> em_atraso: Vencimento ultrapassado
    em_atraso --> paga: Baixa / Pagamento
```

---

## 7. `SolicitacaoAcesso.status`

Valores: `pendente`, `aprovado`, `recusado`. 🟢 CONFIRMADO

```mermaid
stateDiagram-v2
    [*] --> pendente: Solicitação enviada no login
    pendente --> aprovado: Aprovação por Master/Admin
    pendente --> recusado: Recusa por Master/Admin
```


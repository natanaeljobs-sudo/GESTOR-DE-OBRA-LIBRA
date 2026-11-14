---
schemaVersion: 1
generatedAt: 2026-11-13T17:27:45-03:00
reversa:
  version: "1.3.6"
kind: data_migration_plan
producedBy: designer
hash: "sha256:data-migration-plan-libra-obras"
---

# Data Migration Plan — SISTEMA LIBRA - OBRAS

> Estratégia de carga inicial, bootstrap e validação de integridade.

---

## 1. Origem dos Dados Legados
- O sistema legado utilizava dados estáticos em mock (`data/initialData.ts`).
- Não há banco de dados SQL relacional antigo a ser migrado via ETL pesado; a carga inicial consiste em **Seeders de Bootstrap** para inicializar o sistema em produção com uma obra modelo configurada.

---

## 2. Roteiro de Seed Inicial (Bootstrap)

1. **Obra Piloto**:
   - `nome`: "Residencial Libra - Obra Matriz"
   - `orcamento_previsto`: R$ 150.000,00
   - `status`: `ativa`

2. **Categorias e Cartões**:
   - Cartão Corporativo Principal (limite configurável).

3. **Mão de Obra e Categorias**:
   - Criação dos trabalhadores padrão (Pedreiro, Servente, Eletricista) com valores de diária base.

---

## 3. Verificação de Integridade Pós-Carga
- Executar query de checagem no Supabase SQL Editor:
  ```sql
  SELECT count(*) FROM public.obras;
  SELECT count(*) FROM public.trabalhadores;
  ```
- Validar se todas as foreign keys foram respeitadas e se o usuário admin possui permissão de leitura/escrita.


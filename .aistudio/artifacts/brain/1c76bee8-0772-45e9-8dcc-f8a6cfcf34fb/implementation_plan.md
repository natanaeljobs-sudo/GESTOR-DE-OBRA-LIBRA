# Implementation Plan - Gestão de Obras (Edição, Exclusão, Valor de Venda, Lucro, Status e Etapa)

## Objectives
1. Update `Obra` type in `src/types/index.ts` to support `valorVenda` (optional number), `status` ('andamento' | 'concluida' | 'cancelada'), and `etapaAtual` (string).
2. Update AppContext / initial data if needed, or handle obea creation/update (`addObra`, `updateObra`, `deleteObra`).
3. Enhance the Obra modal ("Cadastrar obra" / "Editar obra") in `UsuariosView.tsx` to include:
   - Nome, Endereço
   - Orçamento Estimado, Teto Mão de Obra
   - Valor de Venda (opcional)
   - Status (Em andamento, Concluída, Cancelada)
   - Etapa atual
4. Update Obra cards in `UsuariosView.tsx` to show:
   - Status badge and current stage ("Etapa")
   - Valor de Venda and Previsão de Lucro (if valor de venda is provided: `Valor de Venda - Orçamento Total`)
   - Edit and Delete buttons on each card.
5. Add delete confirmation modal for Obras.

## Proposed Changes

### `src/types/index.ts`
- Add/update `Obra` interface properties:
  - `valorVenda?: number`
  - `status: 'andamento' | 'concluida' | 'cancelada' | 'planejamento'`
  - `etapaAtual: string`

### `src/components/usuarios/UsuariosView.tsx`
- Add states for editing an obra (`editingObra`, `obraToDelete`).
- Update `handleSaveObra` to handle both creating and updating an obra.
- Add delete obra handler.
- Update Obra modal inputs for Valor de Venda and Status.
- Update Obra card rendering to display status, stage, sale value, profit prediction, and Action buttons (Edit & Delete).

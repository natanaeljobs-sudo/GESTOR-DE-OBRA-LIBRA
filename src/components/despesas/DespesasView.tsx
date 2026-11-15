import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Despesa, ItemDespesa, CategoriaDespesa, DestinoItem, FormaPagamento } from '../../types';
import { formatBRL, parseCurrencyInput } from '../../utils/currency';
import { formatDateBR, getTodayISO } from '../../utils/date';
import { StorageService } from '../../services/storageService';

export const DespesasView: React.FC = () => {
  const {
    despesas,
    addDespesa,
    updateDespesa,
    deleteDespesa,
    materiais,
    addMaterial,
    unidadesMedida,
    etapas,
    cartoes,
    orcamentos,
    activeUser,
    activeObra,
    showToast,
    tabFilter,
    setTabFilter,
  } = useApp();

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTipoFilter, setCurrentTipoFilter] = useState<'todos' | 'materiais' | 'servicos'>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modais de Controle
  const [isModalOpen, setIsModalOpen] = useState(tabFilter === 'nova');
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [viewingDespesa, setViewingDespesa] = useState<Despesa | null>(null);
  const [despesaToDelete, setDespesaToDelete] = useState<Despesa | null>(null);

  // Estado do Formulário
  const [modalTipo, setModalTipo] = useState<'material' | 'servico'>('material');
  const [selectedOrcamentoId, setSelectedOrcamentoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [data, setData] = useState(getTodayISO());
  const [etapaVinculada, setEtapaVinculada] = useState(false);
  const [etapaId, setEtapaId] = useState('');
  const [statusPagamento, setStatusPagamento] = useState<'pago' | 'pendente'>('pago');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix');
  const [cartaoId, setCartaoId] = useState('');
  const [parcelasTotal, setParcelasTotal] = useState<number>(1);
  const [comprovanteUrl, setComprovanteUrl] = useState('');
  const [valorBruto, setValorBruto] = useState<string>('');
  const [desconto, setDesconto] = useState<string>('');
  const [valorTotalNota, setValorTotalNota] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Itens da Despesa
  const [itens, setItens] = useState<ItemDespesa[]>([
    {
      id: `item-${Date.now()}`,
      materialId: materiais[0]?.id || 'mat-cimento',
      materialNome: 'Cimento CP II 50kg',
      quantidade: 1,
      unidade: 'saco',
      valorUnitario: 35.0,
      valorTotal: 35.0,
      etapaId: activeObra.etapaAtualId || 'etapa-1',
      destino: 'obra',
    },
  ]);

  // Expandir / Recolher itens no feed
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItemsExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Recálculo de valores do formulário (Bruto - Desconto)
  const recalcValoresModal = (brutoStr: string, descStr: string) => {
    const bruto = parseFloat(brutoStr) || 0;
    const desc = parseFloat(descStr) || 0;
    const finalVal = Math.max(0, bruto - desc);
    if (finalVal > 0) {
      setValorTotalNota(finalVal.toFixed(2));
    }
  };

  // Adicionar Linha de Item
  const handleAddItem = (nome = '', qtd = 1, unid = 'un', vUnit = 0) => {
    const defaultMat = materiais.find(m => m.nome.toLowerCase() === nome.toLowerCase()) || materiais[0];
    const novo: ItemDespesa = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      materialId: defaultMat?.id || `mat-${Date.now()}`,
      materialNome: nome || defaultMat?.nome || 'Material',
      quantidade: qtd,
      unidade: unid || defaultMat?.unidadePadrao || 'un',
      valorUnitario: vUnit,
      valorTotal: Number((qtd * vUnit).toFixed(2)),
      etapaId: etapaId || activeObra.etapaAtualId || 'etapa-1',
      destino: 'obra',
    };
    setItens(prev => [...prev, novo]);
  };

  const handleUpdateItem = (index: number, updates: Partial<ItemDespesa>) => {
    setItens(prev => {
      const copy = [...prev];
      const cur = { ...copy[index], ...updates };
      if (updates.quantidade !== undefined || updates.valorUnitario !== undefined) {
        const q = updates.quantidade !== undefined ? updates.quantidade : cur.quantidade;
        const u = updates.valorUnitario !== undefined ? updates.valorUnitario : cur.valorUnitario;
        cur.valorTotal = Number((q * u).toFixed(2));
      }
      copy[index] = cur;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const somaItens = itens.reduce((sum, it) => sum + (it.valorTotal || 0), 0);

  // Abertura de Modal Novo
  const openNewModal = () => {
    setEditingDespesa(null);
    setModalTipo('material');
    setSelectedOrcamentoId('');
    setDescricao('');
    setFornecedorNome('');
    setData(getTodayISO());
    setEtapaVinculada(false);
    setEtapaId('');
    setStatusPagamento('pago');
    setFormaPagamento('pix');
    setCartaoId('');
    setParcelasTotal(1);
    setValorBruto('');
    setDesconto('');
    setValorTotalNota('');
    setComprovanteUrl('');
    setObservacoes('');
    setUploadError(null);
    setItens([
      {
        id: `item-${Date.now()}`,
        materialId: materiais[0]?.id || 'mat-cimento',
        materialNome: materiais[0]?.nome || 'Cimento CP II 50kg',
        quantidade: 1,
        unidade: materiais[0]?.unidadePadrao || 'saco',
        valorUnitario: 35.0,
        valorTotal: 35.0,
        etapaId: activeObra.etapaAtualId || 'etapa-1',
        destino: 'obra',
      },
    ]);
    setIsModalOpen(true);
  };

  // Abertura de Modal Edição
  const openEditModal = (desp: Despesa) => {
    setEditingDespesa(desp);
    const isServ = desp.categoria === 'servicos' || desp.descricao.toLowerCase().includes('serviço') || desp.descricao.toLowerCase().includes('locação');
    setModalTipo(isServ ? 'servico' : 'material');
    setSelectedOrcamentoId('');
    setDescricao(desp.descricao);
    setFornecedorNome(desp.fornecedorNome);
    setData(desp.data);
    setEtapaVinculada(Boolean(desp.etapaId));
    setEtapaId(desp.etapaId || '');
    setStatusPagamento(desp.formaPagamento === 'nao_informado' ? 'pendente' : 'pago');
    setFormaPagamento(desp.formaPagamento);
    setCartaoId(desp.cartaoId || '');
    setParcelasTotal(desp.parcelasTotal || 1);
    setValorBruto(String(desp.valorTotalNota));
    setDesconto('0.00');
    setValorTotalNota(String(desp.valorTotalNota));
    setComprovanteUrl(desp.comprovanteUrl || '');
    setObservacoes(desp.observacoes || '');
    setUploadError(null);
    setItens(desp.itens && desp.itens.length > 0 ? desp.itens : []);
    setIsModalOpen(true);
  };

  // Importar Orçamento no Modal
  const handleImportarOrcamento = (orcId: string) => {
    setSelectedOrcamentoId(orcId);
    if (!orcId) return;

    const orc = orcamentos.find(o => o.id === orcId);
    if (!orc) return;

    const isServ = orc.identificacao.toLowerCase().includes('serviço') || orc.identificacao.toLowerCase().includes('srv');
    setModalTipo(isServ ? 'servico' : 'material');
    setDescricao(orc.identificacao);
    setFornecedorNome(orc.fornecedorEmpresa);
    setValorBruto(String(orc.valorTotal));
    setDesconto('0.00');
    setValorTotalNota(String(orc.valorTotal));

    if (orc.itens && orc.itens.length > 0) {
      setItens(
        orc.itens.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          materialId: it.materialId || `mat-${idx}`,
          materialNome: it.materialNome,
          quantidade: it.quantidade,
          unidade: it.unidade,
          valorUnitario: it.precoUnitarioCotado,
          valorTotal: it.valorTotalCotado,
          etapaId: etapaId || activeObra.etapaAtualId || 'etapa-1',
          destino: 'obra',
        }))
      );
    }
  };

  // Salvar Despesa (Criar / Editar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    const valorNotaNum = parseCurrencyInput(valorTotalNota) || somaItens;
    const diferencaRateio = Number((valorNotaNum - somaItens).toFixed(2));
    const catFinal: CategoriaDespesa = modalTipo === 'servico' ? 'servicos' : 'materiais';

    if (editingDespesa) {
      updateDespesa({
        ...editingDespesa,
        descricao: descricao.trim().toUpperCase(),
        data,
        categoria: catFinal,
        fornecedorNome: fornecedorNome.trim() || 'Fornecedor Avulso',
        etapaId: etapaVinculada ? etapaId : '',
        compradorNome: activeUser.nome,
        formaPagamento: statusPagamento === 'pendente' && formaPagamento === 'pix' ? 'nao_informado' : formaPagamento,
        cartaoId: formaPagamento === 'cartao_credito' ? cartaoId : undefined,
        parcelasTotal: formaPagamento === 'cartao_credito' ? parcelasTotal : undefined,
        valorTotalNota: valorNotaNum,
        valorSomaItens: somaItens,
        diferencaRateio,
        itens,
        comprovanteUrl: comprovanteUrl.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });
      showToast('Despesa atualizada com sucesso!', 'success', 'Despesas');
    } else {
      addDespesa({
        obraId: activeObra.id,
        descricao: descricao.trim().toUpperCase(),
        data,
        categoria: catFinal,
        fornecedorNome: fornecedorNome.trim() || 'Fornecedor Avulso',
        etapaId: etapaVinculada ? etapaId : '',
        compradorNome: activeUser.nome,
        formaPagamento: statusPagamento === 'pendente' && formaPagamento === 'pix' ? 'nao_informado' : formaPagamento,
        cartaoId: formaPagamento === 'cartao_credito' ? cartaoId : undefined,
        parcelasTotal: formaPagamento === 'cartao_credito' ? parcelasTotal : undefined,
        valorTotalNota: valorNotaNum,
        valorSomaItens: somaItens,
        diferencaRateio,
        itens,
        comprovanteUrl: comprovanteUrl.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        statusConferencia: Math.abs(diferencaRateio) > 0.05 ? 'diferenca_rateio' : 'ok',
        criadoPor: activeUser.nome,
      });
      showToast('Despesa registrada com sucesso!', 'success', 'Despesas');
    }

    setIsModalOpen(false);
  };

  // Filtragem
  const filteredDespesas = despesas.filter(d => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      d.descricao.toLowerCase().includes(q) ||
      d.fornecedorNome.toLowerCase().includes(q) ||
      (d.itens && d.itens.some(it => it.materialNome.toLowerCase().includes(q)));

    const isServ = d.categoria === 'servicos' || d.descricao.toLowerCase().includes('serviço') || d.descricao.toLowerCase().includes('locação');
    const matchTipo =
      currentTipoFilter === 'todos' ||
      (currentTipoFilter === 'servicos' && isServ) ||
      (currentTipoFilter === 'materiais' && !isServ);

    const isPago = d.formaPagamento !== 'nao_informado';
    const matchStatus =
      selectedStatus === 'todos' ||
      (selectedStatus === 'pago' && isPago) ||
      (selectedStatus === 'pendente' && !isPago);

    return matchSearch && matchTipo && matchStatus;
  });

  const totalFiltrado = filteredDespesas.reduce((acc, d) => acc + (d.valorTotalNota || 0), 0);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredDespesas.length / itemsPerPage));
  const currentPageSafe = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (currentPageSafe - 1) * itemsPerPage;
  const paginatedDespesas = filteredDespesas.slice(startIndex, startIndex + itemsPerPage);

  const getEtapaNome = (eId?: string) => {
    if (!eId) return 'Não vinculada';
    const e = etapas.find(item => item.id === eId);
    return e ? (e.numero === 0 ? e.nome : `${e.numero} - ${e.nome}`) : 'Etapa Geral';
  };

  const getFormaPagamentoLabel = (forma: FormaPagamento) => {
    const map: Record<string, string> = {
      pix: 'Pix (À vista)',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      boleto: 'Boleto Faturado',
      dinheiro: 'Dinheiro',
      nao_informado: 'A Pagar / Não informado',
    };
    return map[forma] || forma;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-24 lg:pb-12 space-y-6 animate-in fade-in duration-150">
      
      {/* Header with Title and New Expense Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white font-headline">
            Despesas
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Controle de compras, notas fiscais e comprovantes da obra.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* Filter and Search Bar Simplificada Stitch */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-3 sm:p-4 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707a82]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar despesa ou fornecedor..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
            {/* Tipo de Lançamento: Todos, Materiais, Serviços */}
            <div className="inline-flex p-1 bg-[#f6f9fc] dark:bg-[#1a2535] rounded-xl border border-[#e6ecf1] dark:border-[#333f55] shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCurrentTipoFilter('todos');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currentTipoFilter === 'todos'
                    ? 'bg-[#0085db] text-white shadow-xs'
                    : 'text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentTipoFilter('materiais');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currentTipoFilter === 'materiais'
                    ? 'bg-[#0085db] text-white shadow-xs'
                    : 'text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white'
                }`}
              >
                Materiais
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentTipoFilter('servicos');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currentTipoFilter === 'servicos'
                    ? 'bg-[#0085db] text-white shadow-xs'
                    : 'text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white'
                }`}
              >
                Serviços
              </button>
            </div>

            {/* Status filter essencial */}
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] cursor-pointer"
            >
              <option value="todos">Todos Status</option>
              <option value="pago">Pago</option>
              <option value="pendente">A Pagar</option>
            </select>
          </div>
        </div>

        {/* Total indicator */}
        <div className="flex items-center justify-between text-xs text-[#707a82] dark:text-[#7c8fac] pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
          <span>
            <strong className="text-[#111c2d] dark:text-white">{filteredDespesas.length}</strong> despesas
          </span>
          <span className="font-bold text-[#111c2d] dark:text-white">
            Total:{' '}
            <span className="tabular-nums text-[#0085db] font-black">
              {formatBRL(totalFiltrado)}
            </span>
          </span>
        </div>
      </div>

      {/* Barra de Paginação Stitch */}
      {filteredDespesas.length > itemsPerPage && (
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0px_2px_6px_rgba(37,83,185,0.04)]">
          <div className="text-xs text-[#707a82] dark:text-[#7c8fac]">
            Página <strong className="text-[#111c2d] dark:text-white">{currentPageSafe}</strong> de{' '}
            <strong className="text-[#111c2d] dark:text-white">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPageSafe === 1}
              title="Página Anterior"
              className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    p === currentPageSafe
                      ? 'bg-[#0085db] text-white shadow-xs scale-105'
                      : 'text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] hover:text-[#111c2d] dark:hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPageSafe === totalPages}
              title="Próxima Página"
              className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Expense Cards Feed Dinâmico */}
      <div className="space-y-4">
        {filteredDespesas.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6">
            <span className="material-symbols-outlined text-[36px] text-[#707a82] opacity-50 block mb-2">
              shopping_bag
            </span>
            <p className="text-sm font-semibold text-[#111c2d] dark:text-white">
              Nenhuma despesa encontrada para os filtros selecionados
            </p>
            <p className="text-xs text-[#707a82] mt-1">
              Ajuste os filtros de busca ou cadastre uma nova despesa.
            </p>
          </div>
        ) : (
          paginatedDespesas.map(desp => {
            const isServico = desp.categoria === 'servicos' || desp.descricao.toLowerCase().includes('serviço') || desp.descricao.toLowerCase().includes('locação');
            const isPago = desp.formaPagamento !== 'nao_informado';
            const totalItens = desp.itens ? desp.itens.length : 0;
            const isExpanded = expandedItems[desp.id];
            const faltaComprovante = !desp.comprovanteUrl;

            return (
              <div
                key={desp.id}
                className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-4 sm:p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none transition-all hover:border-[#0085db]/40 space-y-3"
              >
                {/* Linha Principal com Informações Essenciais */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Badge Tipo */}
                      {isServico ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f1f5f9] dark:bg-[#1a2535] text-[#5a6a85] dark:text-[#94a3b8] border border-[#e2e8f0] dark:border-[#334155]">
                          <span className="material-symbols-outlined text-[13px] text-[#707a82] dark:text-[#7c8fac]">
                            handyman
                          </span>
                          Serviço
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f1f5f9] dark:bg-[#1a2535] text-[#5a6a85] dark:text-[#94a3b8] border border-[#e2e8f0] dark:border-[#334155]">
                          <span className="material-symbols-outlined text-[13px] text-[#707a82] dark:text-[#7c8fac]">
                            inventory_2
                          </span>
                          Material
                        </span>
                      )}

                      {/* Badge Status Pagamento */}
                      {isPago ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="material-symbols-outlined text-[13px] text-[#707a82] dark:text-[#7c8fac]">
                            check_circle
                          </span>
                          Pago
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                          <span className="material-symbols-outlined text-[13px] text-[#707a82] dark:text-[#7c8fac]">
                            schedule
                          </span>
                          A Pagar
                        </span>
                      )}

                      <span className="text-xs text-[#707a82] font-medium">
                        {formatDateBR(desp.data)}
                      </span>

                      {faltaComprovante && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-[13px] text-amber-600 dark:text-amber-400">
                            warning
                          </span>
                          Falta anexar comprovante
                        </span>
                      )}
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-[#111c2d] dark:text-white uppercase truncate">
                      {desp.descricao}
                    </h2>
                    <div className="text-xs text-[#707a82] dark:text-[#7c8fac] truncate">
                      Fornecedor:{' '}
                      <strong className="text-[#111c2d] dark:text-white font-semibold">
                        {desp.fornecedorNome}
                      </strong>
                    </div>
                  </div>

                  {/* Valor Total e Ações */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e6ecf1] dark:border-[#333f55]">
                    <div className="text-base sm:text-lg font-black text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(desp.valorTotalNota)}
                    </div>
                    <div className="flex items-center gap-1">
                      {totalItens > 0 && (
                        <button
                          type="button"
                          onClick={() => setViewingDespesa(desp)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#707a82] hover:text-[#0085db] hover:bg-[#0085db]/10 transition-colors cursor-pointer"
                          title={`Visualizar detalhes e itens da despesa (${totalItens} itens)`}
                        >
                          <span className="material-symbols-outlined text-[17px]">visibility</span>
                        </button>
                      )}

                      {desp.comprovanteUrl ? (
                        <a
                          href={desp.comprovanteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg text-[#0085db] hover:bg-[#0085db]/10 transition-colors inline-flex items-center justify-center"
                          title="Abrir nota/comprovante"
                        >
                          <span className="material-symbols-outlined text-[16px]">description</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openEditModal(desp)}
                          className="w-7 h-7 rounded-lg text-[#ffae1f] hover:text-[#e09819] hover:bg-[#ffae1f]/10 transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Falta anexar comprovante (clique para anexar)"
                        >
                          <span className="material-symbols-outlined text-[16px]">description</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openEditModal(desp)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#707a82] hover:text-[#0085db] hover:bg-[#0085db]/10 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDespesaToDelete(desp)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#707a82] hover:text-[#fb977d] hover:bg-[#fb977d]/10 transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subitens quando expandidos na tela */}
                {totalItens > 0 && isExpanded && (
                  <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {desp.itens.map(it => (
                        <div
                          key={it.id}
                          className="p-2.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-xs"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-semibold text-[#111c2d] dark:text-white truncate">
                              {it.materialNome}
                            </span>
                            <span className="font-bold text-[#111c2d] dark:text-white tabular-nums shrink-0">
                              {formatBRL(it.valorTotal)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-1">
                            <span>
                              {it.quantidade} {it.unidade} × {formatBRL(it.valorUnitario)}
                            </span>
                            <span className="capitalize">
                              {(it.destino || 'obra').replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL LANÇAR / EDITAR DESPESA STITCH                    */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-150"
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#111c2d] rounded-[24px] shadow-2xl border border-[#e6ecf1] dark:border-[#333f55] p-5 sm:p-6 space-y-4 max-h-[94vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111c2d] dark:text-white font-headline">
                    {editingDespesa ? 'Editar Despesa' : 'Lançar despesa'}
                  </h2>
                  <p className="text-xs text-[#707a82]">
                    Lançamento rápido e descomplicado de compras e serviços.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 1. Escolha Direta: Material ou Serviço */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                O que você está lançando?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModalTipo('material')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    modalTipo === 'material'
                      ? 'border-[#0085db] bg-[#0085db]/5'
                      : 'border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] hover:border-[#0085db]/40'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      modalTipo === 'material'
                        ? 'bg-[#0085db] text-white'
                        : 'bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] border border-[#e6ecf1] dark:border-[#333f55]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                  </div>
                  <div>
                    <strong className="block text-xs font-bold text-[#111c2d] dark:text-white">
                      Compra de material
                    </strong>
                    <span className="text-[10px] text-[#707a82]">Insumos e ferramentas</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTipo('servico')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    modalTipo === 'servico'
                      ? 'border-[#0085db] bg-[#0085db]/5'
                      : 'border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] hover:border-[#0085db]/40'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      modalTipo === 'servico'
                        ? 'bg-[#0085db] text-white'
                        : 'bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] border border-[#e6ecf1] dark:border-[#333f55]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">handyman</span>
                  </div>
                  <div>
                    <strong className="block text-xs font-bold text-[#111c2d] dark:text-white">
                      Serviços
                    </strong>
                    <span className="text-[10px] text-[#707a82]">Empreitada, locação, frete</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Puxar Dados de um Orçamento Aprovado */}
            <div className="p-3 rounded-2xl bg-[#0085db]/5 dark:bg-[#0085db]/10 border border-[#0085db]/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0085db] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">request_quote</span>
                  <span>Puxar dados de um orçamento aprovado</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0085db]/10 text-[#0085db] border border-[#0085db]/20">
                  Opcional
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedOrcamentoId}
                  onChange={e => handleImportarOrcamento(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#0085db]/30 bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
                >
                  <option value="">Selecione um orçamento para preencher automático...</option>
                  {orcamentos.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.identificacao} · {o.fornecedorEmpresa} ({formatBRL(o.valorTotal)})
                    </option>
                  ))}
                </select>
                {selectedOrcamentoId && (
                  <button
                    type="button"
                    onClick={() => setSelectedOrcamentoId('')}
                    className="h-8 px-2.5 text-xs font-semibold text-[#707a82] hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-[#111c2d] hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-[#e6ecf1] dark:border-[#333f55] hover:border-rose-200 dark:hover:border-rose-900/40 rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    title="Limpar seleção do orçamento"
                  >
                    <span className="material-symbols-outlined text-[14px]">backspace</span>
                    <span>Limpar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Datalist com materiais cadastrados */}
            <datalist id="datalist-materiais-sistema">
              {materiais.map(m => (
                <option key={m.id} value={m.nome} />
              ))}
            </datalist>

            {/* Discriminação dos Itens */}
            <div className="p-3 rounded-2xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#111c2d] dark:text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0085db]">
                      inventory
                    </span>
                    <span>Discriminação dos itens</span>
                  </h4>
                  <p className="text-[10px] text-[#707a82]">
                    Edite os itens do orçamento ou escolha materiais cadastrados / novos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddItem('', 1, 'un', 0)}
                  className="px-2.5 py-1 text-xs font-bold bg-[#0085db] hover:bg-[#0071ba] text-white rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Adicionar item</span>
                </button>
              </div>

              {/* Cabeçalho das Colunas */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-2 text-[10px] font-bold text-[#707a82] uppercase tracking-wider">
                <span className="col-span-5">Descrição / Material</span>
                <span className="col-span-2 text-center">Quantidade</span>
                <span className="col-span-1 text-center">Unid.</span>
                <span className="col-span-2 text-right">Valor Unit.</span>
                <span className="col-span-2 text-right pr-5">Subtotal</span>
              </div>

              {/* Linhas de Itens Dinâmicas */}
              <div className="space-y-2">
                {itens.map((it, idx) => (
                  <div
                    key={it.id}
                    className="grid grid-cols-12 gap-2 p-2 rounded-xl bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] items-center"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <input
                        type="text"
                        list="datalist-materiais-sistema"
                        placeholder="Digite ou escolha material..."
                        value={it.materialNome}
                        onChange={e => handleUpdateItem(idx, { materialNome: e.target.value })}
                        required
                        className="w-full h-8 px-2.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-transparent text-[#111c2d] dark:text-white font-medium focus:ring-1 focus:ring-[#0085db]"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="Qtd"
                        value={it.quantidade || ''}
                        onChange={e => handleUpdateItem(idx, { quantidade: parseFloat(e.target.value) || 0 })}
                        required
                        className="w-full h-8 px-2 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-transparent text-[#111c2d] dark:text-white font-semibold text-center focus:ring-1 focus:ring-[#0085db]"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                      <input
                        type="text"
                        placeholder="un"
                        value={it.unidade}
                        onChange={e => handleUpdateItem(idx, { unidade: e.target.value })}
                        className="w-full h-8 px-1 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-transparent text-[#707a82] dark:text-white text-center"
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="R$ Unit"
                        value={it.valorUnitario || ''}
                        onChange={e => handleUpdateItem(idx, { valorUnitario: parseFloat(e.target.value) || 0 })}
                        required
                        className="w-full h-8 px-2 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-transparent text-[#111c2d] dark:text-white font-bold text-right focus:ring-1 focus:ring-[#0085db]"
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-bold text-[#111c2d] dark:text-white tabular-nums">
                        {formatBRL(it.valorTotal)}
                      </span>
                      {itens.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-[#707a82] hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Remover item"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total dos Itens Discriminados */}
              <div className="flex items-center justify-between pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] text-xs">
                <span className="text-[#707a82]">Soma dos itens discriminados:</span>
                <span className="font-bold text-[#111c2d] dark:text-white tabular-nums">
                  {formatBRL(somaItens)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: COMPRA DE CIMENTO E AREIA PARA SAPATA"
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0085db] uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    {modalTipo === 'servico' ? 'Prestador / Empresa *' : 'Fornecedor *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome da loja ou prestador"
                    value={fornecedorNome}
                    onChange={e => setFornecedorNome(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={data}
                    onChange={e => setData(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
                  />
                </div>

                {/* Etapa da obra com checkbox */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={etapaVinculada}
                        onChange={e => {
                          setEtapaVinculada(e.target.checked);
                          if (e.target.checked && !etapaId) {
                            setEtapaId(activeObra.etapaAtualId || etapas[0]?.id || 'etapa-1');
                          }
                        }}
                        className="w-3.5 h-3.5 rounded text-[#0085db] focus:ring-[#0085db] border-[#e6ecf1] dark:border-[#333f55] cursor-pointer"
                      />
                      <span className="text-xs font-bold text-[#111c2d] dark:text-white">
                        Etapa da obra
                      </span>
                    </label>
                    <span
                      className={`text-[10px] ${
                        etapaVinculada ? 'text-emerald-600 font-semibold' : 'text-[#707a82]'
                      }`}
                    >
                      {etapaVinculada ? 'Vinculada' : 'Não vinculada'}
                    </span>
                  </div>
                  <select
                    disabled={!etapaVinculada}
                    value={etapaId}
                    onChange={e => setEtapaId(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] transition-all focus:outline-hidden focus:ring-2 focus:ring-[#0085db] ${
                      etapaVinculada
                        ? 'bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white cursor-pointer opacity-100'
                        : 'bg-gray-100 dark:bg-[#151d2a] text-[#707a82] dark:text-[#525f75] cursor-not-allowed opacity-60'
                    }`}
                  >
                    <option value="">Selecione uma etapa...</option>
                    {etapas.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.numero === 0 ? e.nome : `${e.numero} - ${e.nome}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Situação do Pagamento *
                  </label>
                  <select
                    value={statusPagamento}
                    onChange={e => setStatusPagamento(e.target.value as 'pago' | 'pendente')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0085db] cursor-pointer"
                  >
                    <option value="pago">Pago</option>
                    <option value="pendente">A Pagar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={formaPagamento}
                    onChange={e => setFormaPagamento(e.target.value as FormaPagamento)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] cursor-pointer"
                  >
                    <option value="pix">Pix (À vista)</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="boleto">Boleto Faturado</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="nao_informado">Não informado</option>
                  </select>
                </div>

                {/* Campos se for Cartão de Crédito */}
                {formaPagamento === 'cartao_credito' && (
                  <div className="sm:col-span-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-[#0085db]">
                          credit_card
                        </span>
                        <span>Cartão Utilizado</span>
                      </label>
                      <select
                        value={cartaoId}
                        onChange={e => setCartaoId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-medium focus:ring-2 focus:ring-[#0085db] cursor-pointer"
                      >
                        <option value="">Selecione o cartão...</option>
                        {cartoes.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.apelido} {c.ultimosDigitos ? `(Final ${c.ultimosDigitos})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-[#707a82]">
                          calendar_month
                        </span>
                        <span>Nº de Parcelas</span>
                      </label>
                      <select
                        value={parcelasTotal}
                        onChange={e => setParcelasTotal(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold focus:ring-2 focus:ring-[#0085db] cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 10, 12].map(n => (
                          <option key={n} value={n}>
                            {n === 1 ? '1x (À vista na fatura)' : `${n}x`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Comprovante / Upload */}
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 flex items-center justify-between">
                    <span>Link do Comprovante *</span>
                    <span className="text-[10px] text-amber-600 font-semibold">Essencial</span>
                  </label>
                  <div className="space-y-1.5">
                    <div className="relative flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] absolute left-3 top-1/2 -translate-y-1/2 text-[#707a82]">
                        description
                      </span>
                      <input
                        type="url"
                        placeholder="https://onedrive.live.com/..."
                        value={comprovanteUrl}
                        onChange={e => setComprovanteUrl(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
                      />
                      <label
                        className="px-2.5 py-2 rounded-xl border border-[#0085db]/30 bg-[#0085db]/10 hover:bg-[#0085db]/20 text-[#0085db] cursor-pointer shrink-0 transition-colors"
                        title="Upload direto de foto ou nota"
                      >
                        <span className="material-symbols-outlined text-[16px] block">cloud_upload</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          disabled={isUploading}
                          className="hidden"
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploading(true);
                            setUploadError(null);
                            const res = await StorageService.uploadComprovante(file, activeObra.id);
                            setIsUploading(false);
                            if (res.url) {
                              setComprovanteUrl(res.url);
                              showToast('Comprovante enviado com sucesso!', 'success', 'Upload');
                            } else {
                              setUploadError(res.error || 'Falha ao enviar comprovante');
                            }
                          }}
                        />
                      </label>
                    </div>
                    {uploadError && (
                      <p className="text-[10px] text-rose-500 font-semibold">{uploadError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Bloco de Valores com Desconto Obtido */}
              <div className="p-3.5 rounded-2xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-2.5">
                <h4 className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">payments</span>
                  <span>Valores & Desconto Recebido</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#707a82] mb-1">
                      Valor Bruto (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={valorBruto}
                      onChange={e => {
                        setValorBruto(e.target.value);
                        recalcValoresModal(e.target.value, desconto);
                      }}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                      <span>Desconto Obtido (R$)</span>
                      <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1 rounded font-bold">
                        - R$
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={desconto}
                      onChange={e => {
                        setDesconto(e.target.value);
                        recalcValoresModal(valorBruto, e.target.value);
                      }}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#111c2d] dark:text-white mb-1">
                      Total Efetivo da Nota
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={valorTotalNota}
                      onChange={e => setValorTotalNota(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-black rounded-xl border border-[#0085db]/40 bg-[#0085db]/5 text-[#0085db] tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#707a82] mb-1">
                  Observações (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais sobre frete, garantias, etc."
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer active:scale-95 inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Salvar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL VISUALIZAR DETALHES DA DESPESA STITCH              */}
      {/* ======================================================== */}
      {viewingDespesa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            onClick={() => setViewingDespesa(null)}
            className="absolute inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-150"
          />
          <div className="relative z-50 w-full max-w-2xl bg-white dark:bg-[#111c2d] rounded-[24px] shadow-2xl border border-[#e6ecf1] dark:border-[#333f55] p-5 sm:p-6 space-y-4 max-h-[94vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">visibility</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111c2d] dark:text-white font-headline">
                    Visualizar despesa
                  </h2>
                  <p className="text-xs text-[#707a82]">
                    Conferência completa de dados, discriminação dos itens e valores.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingDespesa(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Badges e Identificação */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-2xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0085db]/10 text-[#0085db] border border-[#0085db]/20">
                  <span className="material-symbols-outlined text-[15px]">
                    {viewingDespesa.categoria === 'servicos' ? 'handyman' : 'inventory_2'}
                  </span>
                  <span>{viewingDespesa.categoria === 'servicos' ? 'Serviços' : 'Material'}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    viewingDespesa.formaPagamento !== 'nao_informado'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {viewingDespesa.formaPagamento !== 'nao_informado' ? 'check_circle' : 'schedule'}
                  </span>
                  <span>{viewingDespesa.formaPagamento !== 'nao_informado' ? 'Pago' : 'A Pagar'}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-[#707a82] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55]">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  <span>{formatDateBR(viewingDespesa.data)}</span>
                </span>
              </div>
            </div>

            {/* Discriminação dos Itens */}
            <div className="p-3.5 rounded-2xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#111c2d] dark:text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0085db]">
                      inventory
                    </span>
                    <span>Discriminação dos itens</span>
                  </h4>
                  <p className="text-[11px] text-[#707a82]">
                    Detalhamento de cada item ou serviço prestado na nota.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#0085db] bg-white dark:bg-[#111c2d] px-2.5 py-0.5 rounded-full border border-[#0085db]/30">
                  {viewingDespesa.itens?.length || 0} itens discriminados
                </span>
              </div>

              {/* Cabeçalho */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-2 text-[10px] font-bold text-[#707a82] uppercase tracking-wider">
                <span className="col-span-5">Descrição / Material ou Serviço</span>
                <span className="col-span-2 text-center">Quantidade</span>
                <span className="col-span-1 text-center">Unid.</span>
                <span className="col-span-2 text-right">Valor Unit. (R$)</span>
                <span className="col-span-2 text-right pr-2">Subtotal</span>
              </div>

              <div className="space-y-2">
                {(viewingDespesa.itens || []).map(it => (
                  <div
                    key={it.id}
                    className="grid grid-cols-12 gap-2 p-2.5 rounded-xl bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] items-center text-xs"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <span className="font-bold text-[#111c2d] dark:text-white block">
                        {it.materialNome}
                      </span>
                      <span className="text-[10px] text-[#707a82] sm:hidden">
                        Quantidade: {it.quantidade} {it.unidade} × {formatBRL(it.valorUnitario)}
                      </span>
                    </div>
                    <div className="hidden sm:block col-span-2 text-center font-bold text-[#111c2d] dark:text-white">
                      {it.quantidade}
                    </div>
                    <div className="hidden sm:block col-span-1 text-center text-[#707a82]">
                      {it.unidade}
                    </div>
                    <div className="hidden sm:block col-span-2 text-right font-bold text-[#111c2d] dark:text-white tabular-nums">
                      {it.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="col-span-12 sm:col-span-2 text-right font-black text-[#111c2d] dark:text-white tabular-nums pr-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800 flex items-center justify-between sm:justify-end">
                      <span className="text-[10px] text-[#707a82] sm:hidden">Subtotal:</span>
                      <span>{formatBRL(it.valorTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total dos Itens */}
              <div className="flex items-center justify-between pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] text-xs">
                <span className="text-[#707a82]">Total dos itens discriminados:</span>
                <span className="font-bold text-[#111c2d] dark:text-white tabular-nums">
                  {formatBRL(viewingDespesa.valorSomaItens || 0)}
                </span>
              </div>
            </div>

            {/* Informações Essenciais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2 p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
                <span className="block text-[10px] font-bold text-[#707a82] uppercase tracking-wider mb-0.5">
                  Descrição
                </span>
                <span className="font-bold text-[#111c2d] dark:text-white uppercase">
                  {viewingDespesa.descricao}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
                <span className="block text-[10px] font-bold text-[#707a82] uppercase tracking-wider mb-0.5">
                  Fornecedor
                </span>
                <span className="font-bold text-[#111c2d] dark:text-white">
                  {viewingDespesa.fornecedorNome}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
                <span className="block text-[10px] font-bold text-[#707a82] uppercase tracking-wider mb-0.5">
                  Data
                </span>
                <span className="font-bold text-[#111c2d] dark:text-white">
                  {formatDateBR(viewingDespesa.data)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
                <span className="block text-[10px] font-bold text-[#707a82] uppercase tracking-wider mb-0.5">
                  Etapa da obra
                </span>
                <div className="flex items-center gap-1.5 font-bold text-[#0085db]">
                  <span className="material-symbols-outlined text-[15px]">construction</span>
                  <span>{getEtapaNome(viewingDespesa.etapaId)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
                <span className="block text-[10px] font-bold text-[#707a82] uppercase tracking-wider mb-0.5">
                  Forma de Pagamento
                </span>
                <div className="flex items-center gap-1.5 font-bold text-[#111c2d] dark:text-white">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">
                    payments
                  </span>
                  <span>{getFormaPagamentoLabel(viewingDespesa.formaPagamento)}</span>
                </div>
              </div>

              {viewingDespesa.comprovanteUrl && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-[#0085db]/5 border border-[#0085db]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#0085db]">
                      description
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-[#111c2d] dark:text-white">
                        Comprovante / Nota Fiscal
                      </span>
                      <span className="text-[11px] text-[#707a82]">Anexo disponível no repositório da obra</span>
                    </div>
                  </div>
                  <a
                    href={viewingDespesa.comprovanteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-3 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl inline-flex items-center gap-1 transition-all shadow-xs"
                  >
                    <span>Abrir nota</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>
              )}
            </div>

            {/* Valores e Total */}
            <div className="p-4 rounded-2xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-3">
              <h4 className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">payments</span>
                <span>Valores & Desconto Recebido</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55]">
                  <span className="block text-[11px] font-semibold text-[#707a82] mb-0.5">Valor Bruto</span>
                  <span className="text-sm font-bold text-[#111c2d] dark:text-white tabular-nums">
                    {formatBRL(viewingDespesa.valorTotalNota)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                    Desconto Obtido
                  </span>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                    R$ 0,00
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0085db]/5 border border-[#0085db]/30">
                  <span className="block text-[11px] font-bold text-[#0085db] mb-0.5">Total Efetivo</span>
                  <span className="text-base font-black text-[#0085db] tabular-nums">
                    {formatBRL(viewingDespesa.valorTotalNota)}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações do Rodapé */}
            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = viewingDespesa;
                  setViewingDespesa(null);
                  openEditModal(target);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#0085db] hover:bg-[#0085db]/10 rounded-xl cursor-pointer inline-flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Editar despesa</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingDespesa(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer active:scale-95 inline-flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Concluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO COMPACTO                */}
      {/* ======================================================== */}
      {despesaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDespesaToDelete(null)}
            className="absolute inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-150"
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#111c2d] rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/50 p-5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-rose-500">
              <span className="material-symbols-outlined text-[20px]">delete_forever</span>
              <h2 className="text-xs font-bold uppercase tracking-wider font-headline">
                Excluir Despesa
              </h2>
            </div>
            <p className="text-xs text-[#707a82]">
              Deseja excluir a despesa{' '}
              <strong className="text-[#111c2d] dark:text-white">
                {despesaToDelete.descricao}
              </strong>{' '}
              no valor de{' '}
              <strong className="text-[#111c2d] dark:text-white">
                {formatBRL(despesaToDelete.valorTotalNota)}
              </strong>
              ?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
              <button
                type="button"
                onClick={() => setDespesaToDelete(null)}
                className="h-8 px-3 text-xs font-bold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDespesa(despesaToDelete.id);
                  setDespesaToDelete(null);
                  showToast('Despesa excluída com sucesso!', 'success', 'Despesas');
                }}
                className="h-8 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

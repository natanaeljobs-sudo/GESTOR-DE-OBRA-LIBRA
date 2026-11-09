import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProducaoItem } from '../../types';
import { formatBRL } from '../../utils/currency';
import { formatDateBR, getTodayISO } from '../../utils/date';
import { Modal } from '../common/Modal';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X as XIcon,
  RotateCcw,
  CheckCircle2,
  Check,
  AlertTriangle,
  Package,
} from 'lucide-react';

export const ProducaoView: React.FC = () => {
  const {
    producao,
    addProducao,
    updateProducao,
    deleteProducao,
    produtosProducao,
    addProdutoProducao,
    updateProdutoProducao,
    deleteProdutoProducao,
    activeObra,
    totalTrilhosProduzidos,
    totalPlacasProduzidas,
    totalMetrosBatidos,
    custoIndicativoTrilho,
    activeUser,
  } = useApp();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [produtoFilter, setProdutoFilter] = useState<string>('all');

  // Modal State for New / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProducaoItem | null>(null);

  // Form Fields
  const [produto, setProduto] = useState<string>('Trilho de Laje');
  const [quantidade, setQuantidade] = useState<number>(6);
  const [comprimentoMetros, setComprimentoMetros] = useState<string>('2.80');
  const [especificacao, setEspecificacao] = useState('');
  const [data, setData] = useState(getTodayISO());
  const [destino, setDestino] = useState('Laje pavimento térreo - Obra Juscelino Mola');
  const [observacoes, setObservacoes] = useState('');
  const [formSavedSuccess, setFormSavedSuccess] = useState(false);

  // Delete Confirmation Modal State
  const [itemToDelete, setItemToDelete] = useState<ProducaoItem | null>(null);

  // Modal State for Products Management (matching Unidades in MateriaisView)
  const [isProdutosModalOpen, setIsProdutosModalOpen] = useState(false);
  const [novoProdutoInput, setNovoProdutoInput] = useState('');
  const [editingProdutoOldName, setEditingProdutoOldName] = useState<string | null>(null);
  const [editingProdutoNewName, setEditingProdutoNewName] = useState('');
  const [deletingProduto, setDeletingProduto] = useState<string | null>(null);
  const [produtoFeedback, setProdutoFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const getProdutoLabel = (p: string) => {
    if (p === 'trilho') return 'Trilho de Laje';
    if (p === 'placa_cimento') return 'Placa de Concreto';
    if (p === 'outro') return 'Outro artefato de cimento';
    return p;
  };

  const isTrilho = (p: string) => {
    const norm = p.toLowerCase();
    return norm === 'trilho' || norm.includes('trilho');
  };

  const getProdutoUsageCount = (prodNome: string) => {
    return producao.filter(
      p =>
        p.produto.toLowerCase() === prodNome.toLowerCase() ||
        (prodNome === 'Trilho de Laje' && p.produto === 'trilho') ||
        (prodNome === 'Placa de Concreto' && p.produto === 'placa_cimento')
    ).length;
  };

  const handleAddProdutoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = novoProdutoInput.trim();
    if (!trimmed) return;
    const ok = addProdutoProducao(trimmed);
    if (ok) {
      setProduto(trimmed);
      setNovoProdutoInput('');
      setProdutoFeedback({
        type: 'success',
        message: `Produto "${trimmed}" cadastrado e selecionado!`,
      });
      setTimeout(() => setProdutoFeedback(null), 3000);
    } else {
      setProdutoFeedback({
        type: 'error',
        message: `O produto "${trimmed}" já está cadastrado.`,
      });
      setTimeout(() => setProdutoFeedback(null), 3500);
    }
  };

  const handleSaveEditProduto = (oldName: string) => {
    const trimmed = editingProdutoNewName.trim();
    if (!trimmed || trimmed.toLowerCase() === oldName.toLowerCase()) {
      setEditingProdutoOldName(null);
      return;
    }
    const ok = updateProdutoProducao(oldName, trimmed);
    if (ok) {
      if (produto.toLowerCase() === oldName.toLowerCase()) {
        setProduto(trimmed);
      }
      setEditingProdutoOldName(null);
      setProdutoFeedback({
        type: 'success',
        message: `Produto renomeado para "${trimmed}" com sucesso!`,
      });
      setTimeout(() => setProdutoFeedback(null), 3000);
    } else {
      setProdutoFeedback({
        type: 'error',
        message: `Não foi possível renomear. Já existe outro produto com o nome "${trimmed}".`,
      });
      setTimeout(() => setProdutoFeedback(null), 3500);
    }
  };

  const handleConfirmDeleteProduto = (prodNome: string) => {
    deleteProdutoProducao(prodNome);
    if (produto.toLowerCase() === prodNome.toLowerCase()) {
      setProduto(produtosProducao.find(p => p.toLowerCase() !== prodNome.toLowerCase()) || 'Trilho de Laje');
    }
    setDeletingProduto(null);
    setProdutoFeedback({
      type: 'success',
      message: `Produto "${prodNome}" removido com sucesso.`,
    });
    setTimeout(() => setProdutoFeedback(null), 3000);
  };

  // Filtered production list
  const filteredProducao = useMemo(() => {
    return producao.filter(item => {
      // Must belong to current obra
      if (item.obraId !== activeObra.id) return false;

      // Filter by product type
      if (produtoFilter !== 'all') {
        const itemLabel = getProdutoLabel(item.produto).toLowerCase();
        const filterLower = produtoFilter.toLowerCase();
        if (filterLower.includes('trilho')) {
          if (!itemLabel.includes('trilho') && item.produto !== 'trilho') return false;
        } else if (filterLower.includes('placa')) {
          if (!itemLabel.includes('placa') && item.produto !== 'placa_cimento') return false;
        } else {
          if (itemLabel !== filterLower && item.produto.toLowerCase() !== filterLower) return false;
        }
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesSpec = item.especificacao?.toLowerCase().includes(term);
        const matchesDest = item.destino?.toLowerCase().includes(term);
        const matchesObs = item.observacoes?.toLowerCase().includes(term);
        const matchesUser = item.criadoPor?.toLowerCase().includes(term);
        const matchesProdName = getProdutoLabel(item.produto).toLowerCase().includes(term);

        if (!matchesSpec && !matchesDest && !matchesObs && !matchesUser && !matchesProdName) {
          return false;
        }
      }

      return true;
    });
  }, [producao, activeObra.id, produtoFilter, searchTerm]);


  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setProduto(produtosProducao[0] || 'Trilho de Laje');
    setQuantidade(6);
    setComprimentoMetros('2.80');
    setEspecificacao('');
    setData(getTodayISO());
    setDestino(`Laje - ${activeObra.nome}`);
    setObservacoes('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: ProducaoItem) => {
    setEditingItem(item);
    setProduto(getProdutoLabel(item.produto));
    setQuantidade(item.quantidade);
    setComprimentoMetros(item.comprimentoMetros !== undefined ? item.comprimentoMetros.toString() : '');
    setEspecificacao(item.especificacao || '');
    setData(item.data);
    setDestino(item.destino);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  // Submit Add or Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantidade <= 0) return;

    const parsedComprimento = parseFloat(comprimentoMetros.replace(',', '.'));
    const finalComprimento = !isNaN(parsedComprimento) && parsedComprimento > 0 ? parsedComprimento : undefined;

    if (editingItem) {
      updateProducao({
        ...editingItem,
        produto,
        quantidade,
        comprimentoMetros: finalComprimento,
        especificacao: especificacao.trim() || undefined,
        data,
        destino: destino.trim() || activeObra.nome,
        observacoes: observacoes.trim() || undefined,
      });
    } else {
      addProducao({
        obraId: activeObra.id,
        produto,
        quantidade,
        comprimentoMetros: finalComprimento,
        especificacao: especificacao.trim() || undefined,
        data,
        destino: destino.trim() || activeObra.nome,
        observacoes: observacoes.trim() || undefined,
        criadoPor: activeUser.nome,
      });
    }

    setFormSavedSuccess(true);
    setTimeout(() => {
      setFormSavedSuccess(false);
      setIsModalOpen(false);
      setEditingItem(null);
    }, 400);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteProducao(itemToDelete.id);
    setItemToDelete(null);
  };


  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Header matching Permissões view */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white font-sans">
            Produção
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5 font-sans">
            Fabricação própria de trilhos de laje e placas de concreto para a obra
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0085db] hover:bg-[#0071ba] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#0085db]/25 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar produção</span>
        </button>
      </div>

      {/* Production KPI Cards - Refined Spike Design System matching reference and other tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Metros Batidos (Total) */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-xs flex flex-col justify-center items-center text-center transition-all hover:border-[#0085db]/40">
          <div className="flex items-center justify-center w-full">
            <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider text-center">
              METROS BATIDOS (TOTAL)
            </span>
          </div>
          <div className="mt-2 text-center w-full">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#111c2d] dark:text-white tabular-nums tracking-tight">
              {totalMetrosBatidos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-bold text-[#707a82] dark:text-[#7c8fac] ml-1 uppercase">M</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total de Trilhos */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-xs flex flex-col justify-center items-center text-center transition-all hover:border-[#0085db]/40">
          <div className="flex items-center justify-center w-full">
            <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider text-center">
              TOTAL DE TRILHOS
            </span>
          </div>
          <div className="mt-2 text-center w-full">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#111c2d] dark:text-white tabular-nums tracking-tight">
              {totalTrilhosProduzidos}{' '}
              <span className="text-sm font-bold text-[#707a82] dark:text-[#7c8fac] uppercase">UND</span>
            </div>
          </div>
        </div>

        {/* Card 3: Placas de Concreto */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-xs flex flex-col justify-center items-center text-center transition-all hover:border-[#0085db]/40">
          <div className="flex items-center justify-center w-full">
            <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider text-center">
              PLACAS DE CONCRETO
            </span>
          </div>
          <div className="mt-2 text-center w-full">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#111c2d] dark:text-white tabular-nums tracking-tight">
              {totalPlacasProduzidas}{' '}
              <span className="text-sm font-bold text-[#707a82] dark:text-[#7c8fac] uppercase">UND</span>
            </div>
          </div>
        </div>

        {/* Card 4: Custo Indicativo / Trilho */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-xs flex flex-col justify-center items-center text-center transition-all hover:border-[#0085db]/40">
          <div className="flex items-center justify-center w-full">
            <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider text-center">
              CUSTO INDICATIVO / TRILHO
            </span>
          </div>
          <div className="mt-2 text-center w-full">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0085db] tabular-nums tracking-tight">
              {formatBRL(custoIndicativoTrilho)}
            </div>
            <p className="mt-1 text-[11px] text-[#707a82] dark:text-[#7c8fac] text-center">
              Material ÷ Quantidade
            </p>
          </div>
        </div>

      </div>

      {/* Filter Toolbar matching Materiais and Permissões view */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por lote, especificação, destino ou responsável..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Product Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 shrink-0">Produto:</span>
            <select
              value={produtoFilter}
              onChange={e => setProdutoFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40 cursor-pointer"
            >
              <option value="all">Todos os produtos</option>
              {produtosProducao.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Clear / Reset Filters */}
          {(searchTerm || produtoFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setProdutoFilter('all');
              }}
              className="px-3.5 py-2 text-xs font-semibold text-[#0085db] bg-[#0085db]/10 hover:bg-[#0085db]/20 dark:bg-[#0085db]/20 dark:hover:bg-[#0085db]/30 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Corporate Data Table matching Materiais and Permissões view */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[20px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] bg-zinc-50/70 dark:bg-[#162232]/50 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5 sm:px-6">Produção & Especificação</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Tamanho</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Quantidade</th>
                <th className="py-3.5 px-4 sm:px-6">Data / Responsável</th>
                <th className="py-3.5 px-5 sm:px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55] text-xs">
              {filteredProducao.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    <Package className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                    <p className="font-semibold text-zinc-600 dark:text-zinc-300">
                      Nenhum lote de produção encontrado
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Tente ajustar sua busca ou registre uma nova produção.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducao.map(item => {
                  const hasComprimento = item.comprimentoMetros !== undefined && item.comprimentoMetros > 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-[#162232]/60 transition-colors"
                    >
                      {/* Product & Specifications Column */}
                      <td className="py-3 px-5 sm:px-6">
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-[#111c2d] dark:text-white block leading-tight">
                            {item.especificacao || getProdutoLabel(item.produto)}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] dark:text-[#7c8fac] border border-[#e6ecf1] dark:border-[#333f55]">
                              {getProdutoLabel(item.produto)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Comprimento Column */}
                      <td className="py-3 px-4 sm:px-6 text-center tabular-nums align-middle">
                        {hasComprimento ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] dark:text-[#7c8fac] border border-[#e6ecf1] dark:border-[#333f55]">
                            {item.comprimentoMetros?.toFixed(2)} m
                          </span>
                        ) : (
                          <span className="text-[#707a82] dark:text-[#7c8fac]">—</span>
                        )}
                      </td>

                      {/* Quantidade Column */}
                      <td className="py-3 px-4 sm:px-6 text-center align-middle">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] dark:text-[#7c8fac] border border-[#e6ecf1] dark:border-[#333f55] tabular-nums">
                          {item.quantidade} un
                        </span>
                      </td>

                      {/* Data & Responsável Column */}
                      <td className="py-3 px-4 sm:px-6 align-middle">
                        <span className="font-bold text-xs text-[#111c2d] dark:text-white block tabular-nums">
                          {formatDateBR(item.data)}
                        </span>
                      </td>

                      {/* Ações Column (Editar & Excluir) */}
                      <td className="py-3 px-5 sm:px-6 text-right align-middle">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Botão Editar (Pencil) */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Editar lote de produção"
                            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-[#0085db] hover:bg-zinc-100 dark:hover:bg-[#1f2d42] transition-all cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Botão Excluir (Trash2) */}
                          <button
                            onClick={() => setItemToDelete(item)}
                            title="Excluir lote de produção"
                            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal: New / Edit Production Batch matching Materiais view */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar' : 'Registrar Produção'}
        subtitle={
          editingItem
            ? getProdutoLabel(produto)
            : 'Preencha os dados do lote fabricado.'
        }
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formSavedSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Registro de produção salvo com sucesso!</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white">
                Produto
              </label>
              <button
                type="button"
                onClick={() => setIsProdutosModalOpen(true)}
                className="text-[11px] font-semibold text-[#0085db] hover:text-[#0071ba] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                title="Editar produtos"
              >
                <Pencil className="w-3 h-3" />
                <span>Editar</span>
              </button>
            </div>
            <select
              value={produto}
              onChange={e => {
                if (e.target.value === '__manage_produtos__') {
                  setIsProdutosModalOpen(true);
                } else {
                  setProduto(e.target.value);
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] cursor-pointer"
            >
              {produto && !produtosProducao.includes(produto) && (
                <option value={produto}>{getProdutoLabel(produto)}</option>
              )}
              {produtosProducao.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="__manage_produtos__" className="text-[#0085db] font-semibold">
                ✏️ Editar produtos...
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Quantidade *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantidade}
                onChange={e => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Tamanho{isTrilho(produto) ? '*' : ''}
              </label>
              <input
                type="text"
                placeholder="Ex: 2.40, 3.20, 4.10"
                value={comprimentoMetros}
                onChange={e => setComprimentoMetros(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Obra
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Laje pavimento térreo..."
                value={destino}
                onChange={e => setDestino(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Observações
            </label>
            <textarea
              rows={3}
              placeholder="Tipo de treliça H8, traço do concreto, ferragem..."
              value={observacoes || especificacao}
              onChange={e => {
                setObservacoes(e.target.value);
                setEspecificacao(e.target.value);
              }}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] resize-y"
            />
          </div>

          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-sm shadow-[#0085db]/25 cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Confirmation matching Materiais view */}
      {itemToDelete && (
        <Modal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          title="Excluir Registro"
          subtitle="Tem certeza que deseja remover este registro?"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55]">
              <p className="font-bold text-xs text-[#111c2d] dark:text-white uppercase">
                {`${itemToDelete.quantidade}x ${getProdutoLabel(itemToDelete.produto).toUpperCase()} ${itemToDelete.comprimentoMetros ? `(${itemToDelete.comprimentoMetros.toFixed(2)}M)` : ''}`}
              </p>
            </div>

            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5 focus:outline-hidden focus:ring-2 focus:ring-rose-500/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Gerenciar Produtos de Fabricação (idêntico ao gerenciador de unidades da aba materiais) */}
      <Modal
        isOpen={isProdutosModalOpen}
        onClose={() => {
          setIsProdutosModalOpen(false);
          setEditingProdutoOldName(null);
          setDeletingProduto(null);
          setProdutoFeedback(null);
        }}
        title="Gerenciar Produtos"
        subtitle="Cadastre novos produtos de fabricação, altere nomenclaturas existentes ou remova opções."
        maxWidth="md"
      >
        <div className="space-y-4">
          {produtoFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                produtoFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-200'
              }`}
            >
              {produtoFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{produtoFeedback.message}</span>
            </div>
          )}

          {/* Form to add new product */}
          <form onSubmit={handleAddProdutoSubmit} className="space-y-1.5">
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white">
              Novo Produto de Fabricação
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Mourão de concreto, Meio-fio, Pingadeira..."
                value={novoProdutoInput}
                onChange={e => setNovoProdutoInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
              <button
                type="submit"
                disabled={!novoProdutoInput.trim()}
                className="px-3.5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          {/* List of registered products */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider">
                Produtos Cadastrados ({produtosProducao.length})
              </span>
            </div>

            <div className="border border-[#e6ecf1] dark:border-[#333f55] rounded-xl divide-y divide-[#e6ecf1] dark:divide-[#333f55] max-h-72 overflow-y-auto bg-white dark:bg-[#162232]">
              {produtosProducao.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#707a82]">
                  Nenhum produto cadastrado.
                </div>
              ) : (
                produtosProducao.map(p => {
                  const usageCount = getProdutoUsageCount(p);
                  const isEditing = editingProdutoOldName === p;
                  const isDeleting = deletingProduto === p;

                  if (isEditing) {
                    return (
                      <div key={p} className="p-2.5 flex items-center gap-2 bg-[#0085db]/5">
                        <input
                          type="text"
                          value={editingProdutoNewName}
                          onChange={e => setEditingProdutoNewName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEditProduto(p);
                            } else if (e.key === 'Escape') {
                              setEditingProdutoOldName(null);
                            }
                          }}
                          autoFocus
                          className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-[#0085db] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditProduto(p)}
                          className="p-1.5 rounded-lg bg-[#0085db] hover:bg-[#0071ba] text-white cursor-pointer"
                          title="Salvar alteração"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProdutoOldName(null)}
                          className="p-1.5 rounded-lg text-[#707a82] hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                          title="Cancelar"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  if (isDeleting) {
                    return (
                      <div key={p} className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>
                            Deseja excluir o produto &quot;{p}&quot;?
                            {usageCount > 0 && ` (${usageCount} ${usageCount === 1 ? 'lote vinculado' : 'lotes vinculados'})`}
                          </span>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDeletingProduto(null)}
                            className="px-2.5 py-1 text-xs text-[#707a82] hover:bg-white dark:hover:bg-[#111c2d] rounded-lg cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteProduto(p)}
                            className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                          >
                            Confirmar Exclusão
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={p}
                      className="p-2.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-[#1a2535] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-[#111c2d] dark:text-white truncate">
                          {p}
                        </span>
                        {usageCount > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[#707a82] dark:text-[#7c8fac] font-medium shrink-0">
                            {usageCount} {usageCount === 1 ? 'lote' : 'lotes'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProdutoOldName(p);
                            setEditingProdutoNewName(p);
                          }}
                          className="p-1.5 rounded-lg text-[#707a82] hover:text-[#0085db] hover:bg-zinc-100 dark:hover:bg-[#1a2535] transition-colors cursor-pointer"
                          title={`Editar nome de ${p}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProduto(p)}
                          className="p-1.5 rounded-lg text-[#707a82] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title={`Excluir ${p}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end">
            <button
              type="button"
              onClick={() => setIsProdutosModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

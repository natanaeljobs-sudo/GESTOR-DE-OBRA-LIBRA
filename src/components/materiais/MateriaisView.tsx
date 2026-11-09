import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Material } from '../../types';
import { formatBRL } from '../../utils/currency';
import { formatDateBR } from '../../utils/date';
import { Modal } from '../common/Modal';
import {
  Package,
  Plus,
  Search,
  History,
  TrendingDown,
  TrendingUp,
  Pencil,
  Trash2,
  X as XIcon,
  RotateCcw,
  Layers,
  ArrowRight,
  ShoppingCart,
  CheckCircle2,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const MateriaisView: React.FC = () => {
  const {
    materiais,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    unidadesMedida,
    categoriasMateriais,
    addUnidadeMedida,
    updateUnidadeMedida,
    deleteUnidadeMedida,
    addCategoriaMaterial,
    updateCategoriaMaterial,
    deleteCategoriaMaterial,
    despesas,
    activeObra,
    setActiveTab,
    navigateToTabWithFilter,
    showToast,
  } = useApp();

  // Search & Filters matching Permissões view
  const [searchTerm, setSearchTerm] = useState('');
  const [unidadeFilter, setUnidadeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'com_compras' | 'sem_compras'>('all');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Modals de Gerenciamento de Unidades e Categorias
  const [isUnidadesModalOpen, setIsUnidadesModalOpen] = useState(false);
  const [isCategoriasModalOpen, setIsCategoriasModalOpen] = useState(false);

  // Form state for New Material
  const [nome, setNome] = useState('');
  const [unidadePadrao, setUnidadePadrao] = useState('Unidade');
  const [categoriaSugerida, setCategoriaSugerida] = useState('Alvenaria');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Form state for Edit Material
  const [editNome, setEditNome] = useState('');
  const [editUnidade, setEditUnidade] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editDataCadastro, setEditDataCadastro] = useState('');

  // Unidades management modal internal state
  const [novaUnidadeInput, setNovaUnidadeInput] = useState('');
  const [editingUnidadeOldName, setEditingUnidadeOldName] = useState<string | null>(null);
  const [editingUnidadeNewName, setEditingUnidadeNewName] = useState('');
  const [deletingUnidade, setDeletingUnidade] = useState<string | null>(null);
  const [unidadeFeedback, setUnidadeFeedback] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);

  // Categorias management modal internal state
  const [novaCategoriaInput, setNovaCategoriaInput] = useState('');
  const [editingCategoriaOldName, setEditingCategoriaOldName] = useState<string | null>(null);
  const [editingCategoriaNewName, setEditingCategoriaNewName] = useState('');
  const [deletingCategoria, setDeletingCategoria] = useState<string | null>(null);
  const [categoriaFeedback, setCategoriaFeedback] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);


  // Purchase stats calculation from real despesas
  const materialStats = useMemo(() => {
    const stats: Record<
      string,
      {
        totalQuantidade: number;
        totalGasto: number;
        precoMedio: number;
        menorPreco: number;
        maiorPreco: number;
        ultimaCompraData?: string;
        ultimoValorUnitario?: number;
        ultimoValorTotal?: number;
        ultimoFornecedor?: string;
        ultimaQuantidade?: number;
        compras: {
          despesaId: string;
          descricao: string;
          data: string;
          fornecedor: string;
          quantidade: number;
          unidade: string;
          valorUnitario: number;
          valorTotal: number;
        }[];
      }
    > = {};

    materiais.forEach(m => {
      stats[m.id] = {
        totalQuantidade: 0,
        totalGasto: 0,
        precoMedio: 0,
        menorPreco: Infinity,
        maiorPreco: 0,
        compras: [],
      };
    });

    despesas.forEach(desp => {
      desp.itens.forEach(item => {
        const itemNome = (item.materialNome || '').trim().toLowerCase();
        const mat = materiais.find(
          m => m.id === item.materialId || m.nome.trim().toLowerCase() === itemNome
        );
        if (mat) {
          const s = stats[mat.id] || {
            totalQuantidade: 0,
            totalGasto: 0,
            precoMedio: 0,
            menorPreco: Infinity,
            maiorPreco: 0,
            compras: [],
          };

          s.totalQuantidade += Number(item.quantidade || 0);
          s.totalGasto += Number(item.valorTotal || 0);
          if (item.valorUnitario > 0) {
            if (item.valorUnitario < s.menorPreco) s.menorPreco = item.valorUnitario;
            if (item.valorUnitario > s.maiorPreco) s.maiorPreco = item.valorUnitario;
          }

          s.compras.push({
            despesaId: desp.id,
            descricao: desp.descricao,
            data: desp.data,
            fornecedor: desp.fornecedorNome,
            quantidade: item.quantidade,
            unidade: item.unidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.valorTotal,
          });

          stats[mat.id] = s;
        }
      });
    });

    Object.keys(stats).forEach(key => {
      const s = stats[key];
      if (s.totalQuantidade > 0) {
        s.precoMedio = s.totalGasto / s.totalQuantidade;
      }
      if (s.menorPreco === Infinity) s.menorPreco = 0;
      // Sort purchases newest first by date (YYYY-MM-DD descending)
      s.compras.sort((a, b) => (b.data > a.data ? 1 : b.data < a.data ? -1 : 0));
      if (s.compras.length > 0) {
        const ultima = s.compras[0];
        s.ultimaCompraData = ultima.data;
        s.ultimoValorUnitario = ultima.valorUnitario;
        s.ultimoValorTotal = ultima.valorTotal;
        s.ultimoFornecedor = ultima.fornecedor;
        s.ultimaQuantidade = ultima.quantidade;
      }
    });

    return stats;
  }, [materiais, despesas]);

  // Estatísticas específicas para o modal de edição (de acordo com a obra selecionada)
  const editModalStats = useMemo(() => {
    if (!editingMaterial) {
      return { menorPreco: 0, totalQuantidadeObra: 0, totalGastoObra: 0 };
    }

    let menorPrecoObra = Infinity;
    let menorPrecoGeral = Infinity;
    let totalQuantidadeObra = 0;
    let totalGastoObra = 0;

    despesas.forEach(desp => {
      const isCurrentObra = !activeObra?.id || desp.obraId === activeObra.id;

      desp.itens.forEach(item => {
        const itemNome = (item.materialNome || '').trim().toLowerCase();
        const matNome = (editingMaterial.nome || '').trim().toLowerCase();
        const isMatch = item.materialId === editingMaterial.id || (matNome && itemNome === matNome);

        if (isMatch) {
          if (item.valorUnitario > 0) {
            if (item.valorUnitario < menorPrecoGeral) menorPrecoGeral = item.valorUnitario;
            if (isCurrentObra && item.valorUnitario < menorPrecoObra) menorPrecoObra = item.valorUnitario;
          }
          if (isCurrentObra) {
            totalQuantidadeObra += Number(item.quantidade || 0);
            totalGastoObra += Number(item.valorTotal || 0);
          }
        }
      });
    });

    const menorPrecoFinal = menorPrecoObra !== Infinity 
      ? menorPrecoObra 
      : (menorPrecoGeral !== Infinity ? menorPrecoGeral : 0);

    return {
      menorPreco: menorPrecoFinal,
      totalQuantidadeObra,
      totalGastoObra,
    };
  }, [editingMaterial, despesas, activeObra]);

  // Unique units for dropdown filter
  const unidadesDisponiveis = useMemo(() => {
    const set = new Set<string>();
    unidadesMedida.forEach(u => set.add(u.toLowerCase()));
    materiais.forEach(m => {
      if (m.unidadePadrao) set.add(m.unidadePadrao.toLowerCase());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [unidadesMedida, materiais]);

  // Contagem de uso para feedback nos modais
  const getUnidadeUsageCount = (unidade: string) => {
    return materiais.filter(m => m.unidadePadrao.toLowerCase() === unidade.toLowerCase()).length;
  };

  const getCategoriaUsageCount = (categoria: string) => {
    return materiais.filter(
      m => m.categoriaSugerida && m.categoriaSugerida.toLowerCase() === categoria.toLowerCase()
    ).length;
  };

  // Handlers para Gerenciamento de Unidades
  const handleAddUnidadeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = novaUnidadeInput.trim();
    if (!trimmed) return;
    const added = addUnidadeMedida(trimmed);
    if (added) {
      setNovaUnidadeInput('');
      setUnidadeFeedback({ type: 'success', message: `Unidade "${trimmed}" cadastrada com sucesso!` });
      if (isNewModalOpen) setUnidadePadrao(trimmed);
      if (editingMaterial) setEditUnidade(trimmed);
      setTimeout(() => setUnidadeFeedback(null), 3000);
    } else {
      setUnidadeFeedback({ type: 'warning', message: `A unidade "${trimmed}" já está cadastrada.` });
      setTimeout(() => setUnidadeFeedback(null), 3000);
    }
  };

  const handleSaveEditUnidade = (oldNome: string) => {
    const trimmedNew = editingUnidadeNewName.trim();
    if (!trimmedNew || trimmedNew.toLowerCase() === oldNome.toLowerCase()) {
      setEditingUnidadeOldName(null);
      return;
    }
    const success = updateUnidadeMedida(oldNome, trimmedNew);
    if (success) {
      if (unidadePadrao.toLowerCase() === oldNome.toLowerCase()) setUnidadePadrao(trimmedNew);
      if (editUnidade.toLowerCase() === oldNome.toLowerCase()) setEditUnidade(trimmedNew);
      setEditingUnidadeOldName(null);
      setUnidadeFeedback({
        type: 'success',
        message: `Unidade alterada para "${trimmedNew}" e materiais vinculados foram atualizados!`,
      });
      setTimeout(() => setUnidadeFeedback(null), 3500);
    } else {
      setUnidadeFeedback({ type: 'warning', message: `Nome inválido ou já existente.` });
      setTimeout(() => setUnidadeFeedback(null), 3000);
    }
  };

  const handleConfirmDeleteUnidade = (nome: string) => {
    deleteUnidadeMedida(nome);
    setDeletingUnidade(null);
    setUnidadeFeedback({ type: 'success', message: `Unidade "${nome}" removida.` });
    setTimeout(() => setUnidadeFeedback(null), 3000);
  };

  // Handlers para Gerenciamento de Categorias
  const handleAddCategoriaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = novaCategoriaInput.trim();
    if (!trimmed) return;
    const added = addCategoriaMaterial(trimmed);
    if (added) {
      setNovaCategoriaInput('');
      setCategoriaFeedback({ type: 'success', message: `Categoria "${trimmed}" cadastrada com sucesso!` });
      if (isNewModalOpen) setCategoriaSugerida(trimmed);
      if (editingMaterial) setEditCategoria(trimmed);
      setTimeout(() => setCategoriaFeedback(null), 3000);
    } else {
      setCategoriaFeedback({ type: 'warning', message: `A categoria "${trimmed}" já está cadastrada.` });
      setTimeout(() => setCategoriaFeedback(null), 3000);
    }
  };

  const handleSaveEditCategoria = (oldNome: string) => {
    const trimmedNew = editingCategoriaNewName.trim();
    if (!trimmedNew || trimmedNew.toLowerCase() === oldNome.toLowerCase()) {
      setEditingCategoriaOldName(null);
      return;
    }
    const success = updateCategoriaMaterial(oldNome, trimmedNew);
    if (success) {
      if (categoriaSugerida.toLowerCase() === oldNome.toLowerCase()) setCategoriaSugerida(trimmedNew);
      if (editCategoria.toLowerCase() === oldNome.toLowerCase()) setEditCategoria(trimmedNew);
      setEditingCategoriaOldName(null);
      setCategoriaFeedback({
        type: 'success',
        message: `Categoria alterada para "${trimmedNew}" e materiais vinculados foram atualizados!`,
      });
      setTimeout(() => setCategoriaFeedback(null), 3500);
    } else {
      setCategoriaFeedback({ type: 'warning', message: `Nome inválido ou já existente.` });
      setTimeout(() => setCategoriaFeedback(null), 3000);
    }
  };

  const handleConfirmDeleteCategoria = (nome: string) => {
    deleteCategoriaMaterial(nome);
    setDeletingCategoria(null);
    setCategoriaFeedback({ type: 'success', message: `Categoria "${nome}" removida.` });
    setTimeout(() => setCategoriaFeedback(null), 3000);
  };

  // Filtering materials matching Permissões view logic
  const filteredMateriais = useMemo(() => {
    return materiais.filter(m => {
      const matchesSearch =
        !searchTerm ||
        m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.categoriaSugerida && m.categoriaSugerida.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.unidadePadrao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUnidade =
        unidadeFilter === 'all' || m.unidadePadrao.toLowerCase() === unidadeFilter.toLowerCase();

      const comprasCount = materialStats[m.id]?.compras.length || 0;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'com_compras'
          ? comprasCount > 0
          : comprasCount === 0;

      return matchesSearch && matchesUnidade && matchesStatus;
    });
  }, [materiais, searchTerm, unidadeFilter, statusFilter, materialStats]);

  // Handle Create New Material
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    addMaterial({
      nome: nome.trim(),
      unidadePadrao: unidadePadrao || 'Unidade',
      categoriaSugerida: categoriaSugerida || undefined,
    });

    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setNome('');
      setUnidadePadrao(unidadesMedida[0] || 'Unidade');
      setCategoriaSugerida(categoriasMateriais[0] || 'Alvenaria');
      setIsNewModalOpen(false);
    }, 800);
  };

  // Handle Edit Material
  const handleOpenEdit = (mat: Material) => {
    setEditingMaterial(mat);
    setEditNome(mat.nome);
    setEditUnidade(mat.unidadePadrao);
    setEditCategoria(mat.categoriaSugerida || '');
    setEditDataCadastro(mat.dataCadastro ? mat.dataCadastro.slice(0, 10) : new Date().toISOString().slice(0, 10));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial || !editNome.trim()) return;

    updateMaterial({
      ...editingMaterial,
      nome: editNome.trim(),
      unidadePadrao: editUnidade.trim() || 'un',
      categoriaSugerida: editCategoria.trim() || undefined,
      dataCadastro: editDataCadastro || editingMaterial.dataCadastro || new Date().toISOString().slice(0, 10),
    });

    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setEditingMaterial(null);
    }, 800);
  };

  // Handle Delete Material
  const handleConfirmDelete = () => {
    if (!materialToDelete) return;
    deleteMaterial(materialToDelete.id);
    setMaterialToDelete(null);
  };

  const formatCadastroData = (dataStr?: string) => {
    if (!dataStr) return '01/12/2025';
    return formatDateBR(dataStr);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Top Header matching Permissões view */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white font-sans">
            Materiais
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5 font-sans">
            Gerencie o catálogo de ferramentas e insumos
          </p>
        </div>

        <button
          onClick={() => {
            setNome('');
            setUnidadePadrao(unidadesMedida[0] || 'Unidade');
            setCategoriaSugerida(categoriasMateriais[0] || 'Alvenaria');
            setIsNewModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0085db] hover:bg-[#0071ba] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#0085db]/25 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo material</span>
        </button>
      </div>


      {/* Filter Toolbar matching Permissões view */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar materiais por nome, unidade ou categoria..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Unidade Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 shrink-0">Unidade:</span>
            <select
              value={unidadeFilter}
              onChange={e => setUnidadeFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40 cursor-pointer"
            >
              <option value="all">Todas as Unidades</option>
              {unidadesDisponiveis.map(u => (
                <option key={u} value={u}>
                  {u.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40 cursor-pointer"
            >
              <option value="all">Todos os Materiais</option>
              <option value="com_compras">Com compras</option>
              <option value="sem_compras">Sem compras</option>
            </select>
          </div>

          {/* Clear / Reset Filters */}
          {(searchTerm || unidadeFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setUnidadeFilter('all');
                setStatusFilter('all');
              }}
              className="px-3.5 py-2 text-xs font-semibold text-[#0085db] bg-[#0085db]/10 hover:bg-[#0085db]/20 dark:bg-[#0085db]/20 dark:hover:bg-[#0085db]/30 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Corporate Data Table matching Permissões view */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[20px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] bg-zinc-50/70 dark:bg-[#162232]/50 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-5 sm:px-6">Material</th>
                <th className="py-3 px-4 sm:px-6">Unidade</th>
                <th className="py-3 px-4 sm:px-6">Compras</th>
                <th className="py-3 px-4 sm:px-6">Último preço</th>
                <th className="py-3 px-5 sm:px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55] text-xs">
              {filteredMateriais.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    <Package className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                    <p className="font-semibold text-zinc-600 dark:text-zinc-300">
                      Nenhum material encontrado
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Tente ajustar sua busca ou adicione um novo material.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMateriais.map(mat => {
                  const stats = materialStats[mat.id] || {
                    totalQuantidade: 0,
                    totalGasto: 0,
                    precoMedio: 0,
                    menorPreco: 0,
                    maiorPreco: 0,
                    compras: [],
                  };
                  const hasPurchases = stats.compras.length > 0;

                  return (
                    <tr
                      key={mat.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-[#162232]/60 transition-colors"
                    >
                      {/* Material Column */}
                      <td className="py-2.5 px-5 sm:px-6">
                        <span
                          className="font-bold text-xs sm:text-sm text-[#111c2d] dark:text-white uppercase block"
                          style={{ textTransform: 'uppercase' }}
                        >
                          {mat.nome}
                        </span>
                      </td>

                      {/* Unidade Column matching Perfil pill */}
                      <td className="py-2.5 px-4 sm:px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] font-bold uppercase tracking-wider">
                          {mat.unidadePadrao}
                        </span>
                      </td>

                      {/* Compras Column matching corporate gray pills */}
                      <td className="py-2.5 px-4 sm:px-6">
                        {hasPurchases ? (
                          <span className="inline-flex items-center justify-center min-w-[28px] px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] tabular-nums">
                            {stats.compras.length}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center min-w-[28px] px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82]/70 dark:text-[#7c8fac]/70 tabular-nums">
                            0
                          </span>
                        )}
                      </td>

                      {/* Último Preço Comprado Column (Buscado de Despesas) */}
                      <td className="py-2.5 px-4 sm:px-6">
                        {hasPurchases && stats.ultimoValorUnitario !== undefined && stats.ultimoValorUnitario > 0 ? (
                          <div
                            className="cursor-pointer group/preco"
                            onClick={() => setSelectedMaterial(mat)}
                            title={`Última compra em ${formatDateBR(stats.ultimaCompraData)} · Fornecedor: ${stats.ultimoFornecedor || 'Despesas'} (${stats.ultimaQuantidade} ${mat.unidadePadrao} por ${formatBRL(stats.ultimoValorTotal || 0)})`}
                          >
                            <span className="font-extrabold text-[#111c2d] dark:text-white tabular-nums block text-xs sm:text-sm group-hover/preco:text-[#0085db] transition-colors">
                              {formatBRL(stats.ultimoValorUnitario)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500 text-[11px] italic">
                            Sem compras em Despesas
                          </span>
                        )}
                      </td>

                      {/* Actions Column matching Permissões (Ver Histórico, Editar, Excluir) */}
                      <td className="py-2.5 px-5 sm:px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Ver Histórico */}
                          <button
                            onClick={() => setSelectedMaterial(mat)}
                            title="Ver histórico de compras deste material"
                            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-[#0085db] hover:bg-zinc-100 dark:hover:bg-[#1f2d42] transition-all cursor-pointer"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => handleOpenEdit(mat)}
                            title="Editar material"
                            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-[#0085db] hover:bg-zinc-100 dark:hover:bg-[#1f2d42] transition-all cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Excluir */}
                          <button
                            onClick={() => setMaterialToDelete(mat)}
                            title="Excluir material"
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

      {/* Modal: New Material */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Novo material"
        subtitle="Adicione um produto ou ferramenta ao catálogo"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Material cadastrado com sucesso!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Nome *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Cimento"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white">
                Unidade padrão *
              </label>
              <button
                type="button"
                onClick={() => setIsUnidadesModalOpen(true)}
                className="text-[11px] font-semibold text-[#0085db] hover:text-[#0071ba] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                title="Editar unidades"
              >
                <Pencil className="w-3 h-3" />
                <span>Editar</span>
              </button>
            </div>
            <select
              value={unidadePadrao}
              onChange={e => {
                if (e.target.value === '__manage_unidades__') {
                  setIsUnidadesModalOpen(true);
                } else {
                  setUnidadePadrao(e.target.value);
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] cursor-pointer"
            >
              {unidadesMedida.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              <option value="__manage_unidades__" className="text-[#0085db] font-semibold">
                ✏️ Editar unidades...
              </option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white">
                Categoria
              </label>
              <button
                type="button"
                onClick={() => setIsCategoriasModalOpen(true)}
                className="text-[11px] font-semibold text-[#0085db] hover:text-[#0071ba] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                title="Editar categorias"
              >
                <Pencil className="w-3 h-3" />
                <span>Editar</span>
              </button>
            </div>
            <select
              value={categoriaSugerida}
              onChange={e => {
                if (e.target.value === '__manage_categorias__') {
                  setIsCategoriasModalOpen(true);
                } else {
                  setCategoriaSugerida(e.target.value);
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] cursor-pointer"
            >
              <option value="">Selecione uma categoria...</option>
              {categoriasMateriais.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__manage_categorias__" className="text-[#0085db] font-semibold">
                ✏️ Editar categorias...
              </option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-sm shadow-[#0085db]/25 cursor-pointer"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Material */}
      {editingMaterial && (
        <Modal
          isOpen={!!editingMaterial}
          onClose={() => setEditingMaterial(null)}
          title="Editar material"
          subtitle={`Atualize "${editingMaterial.nome}"`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Material atualizado com sucesso!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Nome do Material / Insumo *
              </label>
              <input
                type="text"
                required
                value={editNome}
                onChange={e => setEditNome(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white">
                    Unidade
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsUnidadesModalOpen(true)}
                    className="text-[11px] font-semibold text-[#0085db] hover:text-[#0071ba] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                    title="Editar unidades"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                </div>
                <select
                  value={editUnidade}
                  onChange={e => {
                    if (e.target.value === '__manage_unidades__') {
                      setIsUnidadesModalOpen(true);
                    } else {
                      setEditUnidade(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] cursor-pointer"
                >
                  {/* Se a unidade atual não estiver na lista de unidadesMedida, exibe-a como opção */}
                  {editUnidade && !unidadesMedida.includes(editUnidade) && (
                    <option value={editUnidade}>{editUnidade}</option>
                  )}
                  {unidadesMedida.map(u => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                  <option value="__manage_unidades__" className="text-[#0085db] font-semibold">
                    ✏️ Editar unidades...
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                  Data de cadastro
                </label>
                <input
                  type="date"
                  value={editDataCadastro}
                  onChange={e => setEditDataCadastro(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white">
                  Categoria
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoriasModalOpen(true)}
                  className="text-[11px] font-semibold text-[#0085db] hover:text-[#0071ba] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  title="Editar categorias"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Editar</span>
                </button>
              </div>
              <select
                value={editCategoria}
                onChange={e => {
                  if (e.target.value === '__manage_categorias__') {
                    setIsCategoriasModalOpen(true);
                  } else {
                    setEditCategoria(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] cursor-pointer"
              >
                <option value="">Selecione uma categoria...</option>
                {/* Se a categoria atual não estiver na lista de categoriasMateriais, exibe-a como opção */}
                {editCategoria && !categoriasMateriais.includes(editCategoria) && (
                  <option value={editCategoria}>{editCategoria}</option>
                )}
                {categoriasMateriais.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__manage_categorias__" className="text-[#0085db] font-semibold">
                  ✏️ Editar categorias...
                </option>
              </select>
            </div>

            {/* Informações de Compras & Histórico (removidas da tabela para manter a listagem limpa) */}
            {editingMaterial && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111c2d] dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <span>RESUMO COMPLETO</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
                    <span className="text-[10px] text-[#707a82] dark:text-[#7c8fac] block uppercase tracking-wider font-semibold">
                      MENOR PREÇO
                    </span>
                    <span className="text-xs font-bold text-[#0085db] tabular-nums block mt-0.5">
                      {editModalStats.menorPreco > 0
                        ? formatBRL(editModalStats.menorPreco)
                        : '—'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
                    <span className="text-[10px] text-[#707a82] dark:text-[#7c8fac] block uppercase tracking-wider font-semibold">
                      TOTAL COMPRADOS
                    </span>
                    <span className="text-xs font-bold text-[#111c2d] dark:text-white tabular-nums block mt-0.5 uppercase">
                      {editModalStats.totalQuantidadeObra} {editUnidade}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
                    <span className="text-[10px] text-[#707a82] dark:text-[#7c8fac] block uppercase tracking-wider font-semibold">
                      TOTAL GASTO
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block mt-0.5 uppercase">
                      {formatBRL(editModalStats.totalGastoObra)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMaterial(null)}
                className="px-3 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
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
      )}

      {/* Modal: Delete Confirmation */}
      {materialToDelete && (
        <Modal
          isOpen={!!materialToDelete}
          onClose={() => setMaterialToDelete(null)}
          title="Excluir Material"
          subtitle="Tem certeza que deseja remover este produto do catálogo?"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55]">
              <p className="font-bold text-xs text-[#111c2d] dark:text-white uppercase">
                {materialToDelete.nome}
              </p>
            </div>

            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMaterialToDelete(null)}
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

      {/* Modal: Material Purchase History Details (Requested feature: de onde foram as ultimas compras) */}
      {selectedMaterial && (
        <Modal
          isOpen={!!selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          title={selectedMaterial.nome}
          subtitle="Registro das últimas compras, fornecedores e valores pagos."
          maxWidth="2xl"
        >
          {(() => {
            const stats = materialStats[selectedMaterial.id];
            if (!stats || stats.compras.length === 0) {
              return (
                <div className="text-center py-8 text-[#707a82] text-xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-600 dark:text-zinc-300">
                      Nenhuma compra registrada ainda
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Lance uma nota fiscal na aba <strong>Despesas</strong> selecionando este material para ver o histórico aqui.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMaterial(null);
                      setActiveTab('despesas');
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#0085db] text-white rounded-xl shadow-sm hover:bg-[#0071ba] transition-colors cursor-pointer"
                  >
                    <span>Lançar Compra em Despesas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {/* Metrics header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3.5 bg-[#f6f9fc] dark:bg-[#1a2535] rounded-xl text-center text-xs border border-[#e6ecf1] dark:border-[#333f55]">
                  <div>
                    <span className="text-[#707a82] dark:text-[#7c8fac] block text-[10px]">Volume Total</span>
                    <span className="font-bold text-[#111c2d] dark:text-white tabular-nums text-sm">
                      {stats.totalQuantidade} {selectedMaterial.unidadePadrao}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#707a82] dark:text-[#7c8fac] block text-[10px]">Preço Médio</span>
                    <span className="font-bold text-[#0085db] tabular-nums text-sm">
                      {formatBRL(stats.precoMedio)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#707a82] dark:text-[#7c8fac] block text-[10px]">Menor Preço</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">
                      {formatBRL(stats.menorPreco)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#707a82] dark:text-[#7c8fac] block text-[10px]">Total Investido</span>
                    <span className="font-bold text-[#111c2d] dark:text-white tabular-nums text-sm">
                      {formatBRL(stats.totalGasto)}
                    </span>
                  </div>
                </div>

                {/* Purchases list showing supplier, date, price, volume */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Últimas Compras ({stats.compras.length})
                  </h4>
                  <div className="divide-y divide-[#e6ecf1] dark:divide-[#333f55] max-h-72 overflow-y-auto pr-1">
                    {stats.compras.map((compra, i) => (
                      <div
                        key={i}
                        className="py-3 flex items-center justify-between text-xs hover:bg-zinc-50/60 dark:hover:bg-[#162232]/40 px-2 rounded-lg transition-colors"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#111c2d] dark:text-white flex items-center gap-2">
                            <span>{compra.fornecedor}</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] border border-[#e6ecf1] dark:border-[#333f55]">
                              {formatDateBR(compra.data)}
                            </span>
                          </p>
                          <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">
                            {compra.descricao || 'Compra de material p/ canteiro'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-[#111c2d] dark:text-white tabular-nums block text-xs sm:text-sm">
                            {formatBRL(compra.valorTotal)}
                          </span>
                          <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac] tabular-nums">
                            {compra.quantidade} {compra.unidade} × {formatBRL(compra.valorUnitario)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55]">
                  <button
                    onClick={() => {
                      const matName = selectedMaterial.nome;
                      setSelectedMaterial(null);
                      navigateToTabWithFilter('despesas', matName);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-[#0085db] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Ver despesas</span>
                  </button>

                  <button
                    onClick={() => {
                      const matName = selectedMaterial.nome;
                      setSelectedMaterial(null);
                      navigateToTabWithFilter('orcamentos', matName);
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-[#0085db] text-white rounded-xl hover:bg-[#0071ba] shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Comparar cotação</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Modal: Gerenciar Unidades de Medida */}
      <Modal
        isOpen={isUnidadesModalOpen}
        onClose={() => {
          setIsUnidadesModalOpen(false);
          setEditingUnidadeOldName(null);
          setDeletingUnidade(null);
          setUnidadeFeedback(null);
        }}
        title="Gerenciar Unidades de Medida"
        subtitle="Cadastre novas unidades, altere nomenclaturas existentes ou remova opções."
        maxWidth="md"
      >
        <div className="space-y-4">
          {unidadeFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                unidadeFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-200'
              }`}
            >
              {unidadeFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{unidadeFeedback.message}</span>
            </div>
          )}

          {/* Form to add new unit */}
          <form onSubmit={handleAddUnidadeSubmit} className="space-y-1.5">
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white">
              Nova Unidade de Medida
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: saco, m², barra 12m, caixa, pallet..."
                value={novaUnidadeInput}
                onChange={e => setNovaUnidadeInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
              <button
                type="submit"
                disabled={!novaUnidadeInput.trim()}
                className="px-3.5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          {/* List of units */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider">
                Unidades Cadastradas ({unidadesMedida.length})
              </span>
            </div>

            <div className="border border-[#e6ecf1] dark:border-[#333f55] rounded-xl divide-y divide-[#e6ecf1] dark:divide-[#333f55] max-h-72 overflow-y-auto bg-white dark:bg-[#162232]">
              {unidadesMedida.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#707a82]">
                  Nenhuma unidade cadastrada.
                </div>
              ) : (
                unidadesMedida.map(u => {
                  const usageCount = getUnidadeUsageCount(u);
                  const isEditing = editingUnidadeOldName === u;
                  const isDeleting = deletingUnidade === u;

                  if (isEditing) {
                    return (
                      <div key={u} className="p-2.5 flex items-center gap-2 bg-[#0085db]/5">
                        <input
                          type="text"
                          value={editingUnidadeNewName}
                          onChange={e => setEditingUnidadeNewName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEditUnidade(u);
                            } else if (e.key === 'Escape') {
                              setEditingUnidadeOldName(null);
                            }
                          }}
                          autoFocus
                          className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-[#0085db] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditUnidade(u)}
                          className="p-1.5 rounded-lg bg-[#0085db] hover:bg-[#0071ba] text-white cursor-pointer"
                          title="Salvar alteração"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingUnidadeOldName(null)}
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
                      <div key={u} className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>
                            Deseja excluir a unidade &quot;{u}&quot;?
                            {usageCount > 0 && ` (${usageCount} materiais vinculados)`}
                          </span>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDeletingUnidade(null)}
                            className="px-2.5 py-1 text-xs text-[#707a82] hover:bg-white rounded-lg cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteUnidade(u)}
                            className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                          >
                            Sim, excluir
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={u}
                      className="px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111c2d] dark:text-white">
                          {u}
                        </span>
                        <span className="text-[10px] text-[#707a82] dark:text-[#7c8fac]">
                          {usageCount > 0 ? (
                            <span>· {usageCount} {usageCount === 1 ? 'material vinculado' : 'materiais vinculados'}</span>
                          ) : (
                            <span>· sem uso</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUnidadeOldName(u);
                            setEditingUnidadeNewName(u);
                            setDeletingUnidade(null);
                          }}
                          className="p-1.5 rounded-lg text-[#707a82] hover:text-[#0085db] hover:bg-[#0085db]/10 transition-colors cursor-pointer"
                          title="Editar nome da unidade"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingUnidade(u);
                            setEditingUnidadeOldName(null);
                          }}
                          className="p-1.5 rounded-lg text-[#707a82] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Excluir unidade"
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
              onClick={() => {
                setIsUnidadesModalOpen(false);
                setEditingUnidadeOldName(null);
                setDeletingUnidade(null);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl cursor-pointer"
            >
              Concluído
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Gerenciar Categorias de Materiais */}
      <Modal
        isOpen={isCategoriasModalOpen}
        onClose={() => {
          setIsCategoriasModalOpen(false);
          setEditingCategoriaOldName(null);
          setDeletingCategoria(null);
          setCategoriaFeedback(null);
        }}
        title="Gerenciar Categorias de Materiais"
        subtitle="Cadastre novas categorias, altere nomenclaturas existentes ou remova opções."
        maxWidth="md"
      >
        <div className="space-y-4">
          {categoriaFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                categoriaFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-200'
              }`}
            >
              {categoriaFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{categoriaFeedback.message}</span>
            </div>
          )}

          {/* Form to add new category */}
          <form onSubmit={handleAddCategoriaSubmit} className="space-y-1.5">
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white">
              Nova Categoria
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Elétrico, Hidráulico, Pintura, Cobertura, Ferragens..."
                value={novaCategoriaInput}
                onChange={e => setNovaCategoriaInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
              <button
                type="submit"
                disabled={!novaCategoriaInput.trim()}
                className="px-3.5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          {/* List of categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider">
                Categorias Cadastradas ({categoriasMateriais.length})
              </span>
            </div>

            <div className="border border-[#e6ecf1] dark:border-[#333f55] rounded-xl divide-y divide-[#e6ecf1] dark:divide-[#333f55] max-h-72 overflow-y-auto bg-white dark:bg-[#162232]">
              {categoriasMateriais.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#707a82]">
                  Nenhuma categoria cadastrada.
                </div>
              ) : (
                categoriasMateriais.map(cat => {
                  const usageCount = getCategoriaUsageCount(cat);
                  const isEditing = editingCategoriaOldName === cat;
                  const isDeleting = deletingCategoria === cat;

                  if (isEditing) {
                    return (
                      <div key={cat} className="p-2.5 flex items-center gap-2 bg-[#0085db]/5">
                        <input
                          type="text"
                          value={editingCategoriaNewName}
                          onChange={e => setEditingCategoriaNewName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEditCategoria(cat);
                            } else if (e.key === 'Escape') {
                              setEditingCategoriaOldName(null);
                            }
                          }}
                          autoFocus
                          className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-[#0085db] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditCategoria(cat)}
                          className="p-1.5 rounded-lg bg-[#0085db] hover:bg-[#0071ba] text-white cursor-pointer"
                          title="Salvar alteração"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategoriaOldName(null)}
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
                      <div key={cat} className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>
                            Deseja excluir a categoria &quot;{cat}&quot;?
                            {usageCount > 0 && ` (${usageCount} materiais vinculados)`}
                          </span>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDeletingCategoria(null)}
                            className="px-2.5 py-1 text-xs text-[#707a82] hover:bg-white rounded-lg cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteCategoria(cat)}
                            className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                          >
                            Sim, excluir
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cat}
                      className="px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111c2d] dark:text-white">
                          {cat}
                        </span>
                        <span className="text-[10px] text-[#707a82] dark:text-[#7c8fac]">
                          {usageCount > 0 ? (
                            <span>· {usageCount} {usageCount === 1 ? 'material vinculado' : 'materiais vinculados'}</span>
                          ) : (
                            <span>· sem uso</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoriaOldName(cat);
                            setEditingCategoriaNewName(cat);
                            setDeletingCategoria(null);
                          }}
                          className="p-1.5 rounded-lg text-[#707a82] hover:text-[#0085db] hover:bg-[#0085db]/10 transition-colors cursor-pointer"
                          title="Editar nome da categoria"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingCategoria(cat);
                            setEditingCategoriaOldName(null);
                          }}
                          className="p-1.5 rounded-lg text-[#707a82] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Excluir categoria"
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
              onClick={() => {
                setIsCategoriasModalOpen(false);
                setEditingCategoriaOldName(null);
                setDeletingCategoria(null);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl cursor-pointer"
            >
              Concluído
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

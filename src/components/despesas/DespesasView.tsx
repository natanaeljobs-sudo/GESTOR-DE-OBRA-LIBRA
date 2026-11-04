import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Despesa, ItemDespesa, CategoriaDespesa, DestinoItem, FormaPagamento } from '../../types';
import { formatBRL, parseCurrencyInput } from '../../utils/currency';
import { formatDateBR, getTodayISO } from '../../utils/date';
import { Modal } from '../common/Modal';
import {
  Plus,
  Search,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  CreditCard,
  Layers,
  ShoppingBag,
} from 'lucide-react';

export const DespesasView: React.FC = () => {
  const {
    despesas,
    addDespesa,
    updateDespesa,
    deleteDespesa,
    materiais,
    addMaterial,
    etapas,
    cartoes,
    activeUser,
    activeObra,
    tabFilter,
    setTabFilter,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>(tabFilter || 'todos');
  const [selectedEtapa, setSelectedEtapa] = useState<string>('todas');
  const [isModalOpen, setIsModalOpen] = useState(tabFilter === 'nova');
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);

  // Form state
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(getTodayISO());
  const [categoria, setCategoria] = useState<CategoriaDespesa>('materiais');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [etapaId, setEtapaId] = useState(activeObra.etapaAtualId || 'etapa-2');
  const [compradorNome, setCompradorNome] = useState(activeUser.nome);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix');
  const [cartaoId, setCartaoId] = useState<string>('');
  const [parcelasTotal, setParcelasTotal] = useState<number>(1);
  const [valorTotalNota, setValorTotalNota] = useState<string>('');
  const [comprovanteUrl, setComprovanteUrl] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Items for this expense
  const [itens, setItens] = useState<ItemDespesa[]>([
    {
      id: `item-${Date.now()}`,
      materialId: 'mat-cimento',
      materialNome: 'Cimento CP II 50kg',
      quantidade: 1,
      unidade: 'saco',
      valorUnitario: 35.0,
      valorTotal: 35.0,
      etapaId: activeObra.etapaAtualId || 'etapa-2',
      destino: 'obra',
    },
  ]);

  const [showNovoMaterial, setShowNovoMaterial] = useState(false);
  const [novoMaterialNome, setNovoMaterialNome] = useState('');
  const [novoMaterialUnidade, setNovoMaterialUnidade] = useState('un');

  const openNewModal = () => {
    setEditingDespesa(null);
    setDescricao('');
    setData(getTodayISO());
    setCategoria('materiais');
    setFornecedorNome('');
    setEtapaId(activeObra.etapaAtualId || 'etapa-2');
    setCompradorNome(activeUser.nome);
    setFormaPagamento('pix');
    setCartaoId('');
    setParcelasTotal(1);
    setValorTotalNota('');
    setComprovanteUrl('');
    setObservacoes('');
    setItens([
      {
        id: `item-${Date.now()}`,
        materialId: materiais[0]?.id || 'mat-generico',
        materialNome: materiais[0]?.nome || 'Material Geral',
        quantidade: 1,
        unidade: materiais[0]?.unidadePadrao || 'un',
        valorUnitario: 0,
        valorTotal: 0,
        etapaId: activeObra.etapaAtualId || 'etapa-2',
        destino: 'obra',
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (desp: Despesa) => {
    setEditingDespesa(desp);
    setDescricao(desp.descricao);
    setData(desp.data);
    setCategoria(desp.categoria);
    setFornecedorNome(desp.fornecedorNome);
    setEtapaId(desp.etapaId);
    setCompradorNome(desp.compradorNome);
    setFormaPagamento(desp.formaPagamento);
    setCartaoId(desp.cartaoId || '');
    setParcelasTotal(desp.parcelasTotal || 1);
    setValorTotalNota(String(desp.valorTotalNota));
    setComprovanteUrl(desp.comprovanteUrl || '');
    setObservacoes(desp.observacoes || '');
    setItens(desp.itens && desp.itens.length > 0 ? desp.itens : []);
    setIsModalOpen(true);
  };

  const addItem = () => {
    const defaultMat = materiais[0];
    const newItem: ItemDespesa = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      materialId: defaultMat?.id || 'mat-generico',
      materialNome: defaultMat?.nome || 'Material',
      quantidade: 1,
      unidade: defaultMat?.unidadePadrao || 'un',
      valorUnitario: 0,
      valorTotal: 0,
      etapaId,
      destino: 'obra',
    };
    setItens(prev => [...prev, newItem]);
  };

  const updateItem = (index: number, updates: Partial<ItemDespesa>) => {
    setItens(prev => {
      const copy = [...prev];
      const current = { ...copy[index], ...updates };
      if (updates.quantidade !== undefined || updates.valorUnitario !== undefined) {
        current.valorTotal = Number((current.quantidade * current.valorUnitario).toFixed(2));
      }
      copy[index] = current;
      return copy;
    });
  };

  const removeItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const somaItens = itens.reduce((acc, it) => acc + (it.valorTotal || 0), 0);
  const valorTotalNotaNum = parseCurrencyInput(valorTotalNota);
  const diferencaRateio = Number((valorTotalNotaNum - somaItens).toFixed(2));

  const handleSaveNovoMaterial = () => {
    if (!novoMaterialNome.trim()) return;
    const criado = addMaterial({
      nome: novoMaterialNome.trim(),
      unidadePadrao: novoMaterialUnidade.trim() || 'un',
    });
    setNovoMaterialNome('');
    setShowNovoMaterial(false);
    if (itens.length > 0) {
      updateItem(itens.length - 1, {
        materialId: criado.id,
        materialNome: criado.nome,
        unidade: criado.unidadePadrao,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    const totalCalculado = valorTotalNotaNum > 0 ? valorTotalNotaNum : somaItens;

    if (editingDespesa) {
      updateDespesa({
        ...editingDespesa,
        descricao,
        data,
        categoria,
        fornecedorNome: fornecedorNome.trim() || 'Fornecedor Avulso',
        etapaId,
        compradorNome,
        formaPagamento,
        cartaoId: cartaoId || undefined,
        parcelasTotal: formaPagamento === 'cartao_credito' ? parcelasTotal : undefined,
        valorTotalNota: totalCalculado,
        valorSomaItens: somaItens,
        diferencaRateio: Number((totalCalculado - somaItens).toFixed(2)),
        itens,
        comprovanteUrl: comprovanteUrl.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });
    } else {
      addDespesa({
        obraId: activeObra.id,
        descricao,
        data,
        categoria,
        fornecedorNome: fornecedorNome.trim() || 'Fornecedor Avulso',
        etapaId,
        compradorNome,
        formaPagamento,
        cartaoId: cartaoId || undefined,
        parcelasTotal: formaPagamento === 'cartao_credito' ? parcelasTotal : undefined,
        valorTotalNota: totalCalculado,
        valorSomaItens: somaItens,
        diferencaRateio: Number((totalCalculado - somaItens).toFixed(2)),
        itens,
        comprovanteUrl: comprovanteUrl.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        statusConferencia: Math.abs(diferencaRateio) > 0.05 ? 'diferenca_rateio' : 'ok',
        criadoPor: activeUser.nome,
      });
    }

    setIsModalOpen(false);
  };

  const filteredDespesas = despesas.filter(d => {
    const matchesSearch =
      d.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.itens.some(it => it.materialNome.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategoria =
      selectedCategoria === 'todos' || d.categoria === selectedCategoria;

    const matchesEtapa =
      selectedEtapa === 'todas' || d.etapaId === selectedEtapa;

    return matchesSearch && matchesCategoria && matchesEtapa;
  });

  const totalFiltrado = filteredDespesas.reduce((sum, d) => sum + d.valorTotalNota, 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Header with Title and New Expense Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
            Despesas & Itens de Notas
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Lançamento de compras detalhadas por item, conferência de notas e links do OneDrive.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Nova Despesa</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-4 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707a82]" />
            <input
              type="text"
              placeholder="Buscar por descrição, fornecedor ou material..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
            />
          </div>

          {/* Categoria filter */}
          <select
            value={selectedCategoria}
            onChange={e => {
              setSelectedCategoria(e.target.value);
              setTabFilter(null);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
          >
            <option value="todos">Todas as Categorias</option>
            <option value="materiais">Materiais da Obra</option>
            <option value="trilhos_producao">Material para Trilhos</option>
            <option value="abastecimentos">Abastecimentos / Frete</option>
            <option value="equipamentos">Equipamentos</option>
            <option value="outros">Outros Custos</option>
          </select>

          {/* Etapa filter */}
          <select
            value={selectedEtapa}
            onChange={e => setSelectedEtapa(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
          >
            <option value="todas">Todas as Etapas</option>
            {etapas.map(e => (
              <option key={e.id} value={e.id}>
                {e.numero} — {e.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Total indicator for filtered selection */}
        <div className="flex items-center justify-between text-xs text-[#707a82] dark:text-[#7c8fac] pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
          <span>{filteredDespesas.length} despesa(s) localizada(s)</span>
          <span className="font-bold text-[#111c2d] dark:text-white">
            Total filtrado: <span className="tabular-nums text-[#0085db] font-black">{formatBRL(totalFiltrado)}</span>
          </span>
        </div>
      </div>

      {/* Expense Cards */}
      <div className="space-y-4">
        {filteredDespesas.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6">
            <ShoppingBag className="w-10 h-10 text-[#707a82] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-[#111c2d] dark:text-white">
              Nenhuma despesa encontrada para os filtros selecionados
            </p>
            <p className="text-xs text-[#707a82] mt-1">
              Ajuste a busca ou registre uma nova nota fiscal.
            </p>
          </div>
        ) : (
          filteredDespesas.map(desp => {
            const etapaObj = etapas.find(e => e.id === desp.etapaId);
            return (
              <div
                key={desp.id}
                className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none transition-all hover:border-[#0085db]/40"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-[#707a82]">
                      <span className="font-bold text-[#0085db] uppercase tracking-wider text-[10px]">
                        {desp.categoria.replace('_', ' ')}
                      </span>
                      <span>·</span>
                      <span>{formatDateBR(desp.data)}</span>
                      <span>·</span>
                      <span>{etapaObj?.nome || 'Etapa Geral'}</span>
                      {desp.diferencaRateio !== 0 && (
                        <>
                          <span>·</span>
                          <span className="text-[#fb977d] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 inline" />
                            Diferença de rateio: {formatBRL(Math.abs(desp.diferencaRateio))}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-[#111c2d] dark:text-white mt-1">
                      {desp.descricao}
                    </h2>
                    <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                      Fornecedor: <strong className="text-[#111c2d] dark:text-white">{desp.fornecedorNome}</strong> · Comprador: {desp.compradorNome} · Pagamento: {desp.formaPagamento.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                    <div className="text-lg sm:text-xl font-extrabold text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(desp.valorTotalNota)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {desp.comprovanteUrl && (
                        <a
                          href={desp.comprovanteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-[#0085db] hover:bg-[#0085db]/10"
                          title="Abrir comprovante / OneDrive"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => openEditModal(desp)}
                        className="p-1.5 rounded-lg text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] cursor-pointer"
                        title="Editar despesa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir a despesa "${desp.descricao}"?`)) {
                            deleteDespesa(desp.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-[#707a82] hover:text-[#fb977d] hover:bg-[#fb977d]/10 cursor-pointer"
                        title="Excluir despesa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-items table / list */}
                {desp.itens && desp.itens.length > 0 && (
                  <div className="mt-3 pt-2">
                    <div className="text-[11px] font-bold text-[#707a82] uppercase tracking-wider mb-2">
                      Itens discriminados na nota ({desp.itens.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {desp.itens.map(item => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-[#111c2d] dark:text-white truncate">
                              {item.materialNome}
                            </span>
                            <span className="font-extrabold text-[#111c2d] dark:text-white tabular-nums shrink-0">
                              {formatBRL(item.valorTotal)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-1.5">
                            <span>
                              {item.quantidade} {item.unidade} × {formatBRL(item.valorUnitario)}
                            </span>
                            <span className="capitalize text-[#707a82]">
                              {item.destino.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {desp.observacoes && (
                  <p className="mt-2.5 text-xs text-[#707a82] italic">
                    Obs: {desp.observacoes}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Creating / Editing Expense */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDespesa ? 'Editar Despesa' : 'Lançar Nova Despesa'}
        subtitle="Preencha o cabeçalho e os itens. Campos desconhecidos podem ser deixados vazios."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Descrição da Compra / Nota *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Compra de cimento e areia para baldrame"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Fornecedor / Loja
              </label>
              <input
                type="text"
                placeholder="Ex: Comercial Silva Materiais"
                value={fornecedorNome}
                onChange={e => setFornecedorNome(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Data da Compra
              </label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value as CategoriaDespesa)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              >
                <option value="materiais">Materiais da Obra</option>
                <option value="trilhos_producao">Material para Trilhos</option>
                <option value="abastecimentos">Abastecimentos / Frete</option>
                <option value="equipamentos">Equipamentos</option>
                <option value="outros">Outros Custos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Etapa da Obra
              </label>
              <select
                value={etapaId}
                onChange={e => setEtapaId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              >
                {etapas.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.numero} — {e.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Forma de Pagamento
              </label>
              <select
                value={formaPagamento}
                onChange={e => setFormaPagamento(e.target.value as FormaPagamento)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              >
                <option value="pix">Pix</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="nao_informado">Não informado (preencher depois)</option>
              </select>
            </div>

            {formaPagamento === 'cartao_credito' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Cartão Utilizado
                  </label>
                  <select
                    value={cartaoId}
                    onChange={e => setCartaoId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                  >
                    <option value="">Selecione o cartão (opcional)...</option>
                    {cartoes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.apelido} {c.ultimosDigitos ? `(Final ${c.ultimosDigitos})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Número de Parcelas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={parcelasTotal}
                    onChange={e => setParcelasTotal(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Valor Total da Nota Fiscal (R$)
              </label>
              <input
                type="text"
                placeholder={somaItens > 0 ? formatBRL(somaItens) : 'Ex: 450,00'}
                value={valorTotalNota}
                onChange={e => setValorTotalNota(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Link do Comprovante (OneDrive / Anexo)
              </label>
              <input
                type="url"
                placeholder="https://onedrive.live.com/..."
                value={comprovanteUrl}
                onChange={e => setComprovanteUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#111c2d] dark:text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0085db]" />
                Itens da Compra ({itens.length})
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovoMaterial(!showNovoMaterial)}
                  className="text-[11px] font-semibold text-[#0085db] hover:underline cursor-pointer"
                >
                  + Cadastrar Material Novo
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1 text-xs font-bold bg-[#0085db]/10 hover:bg-[#0085db]/20 text-[#0085db] rounded-lg transition-colors cursor-pointer"
                >
                  + Adicionar Item
                </button>
              </div>
            </div>

            {/* Quick material creation inline box */}
            {showNovoMaterial && (
              <div className="p-3 mb-3 bg-[#0085db]/5 border border-[#0085db]/20 rounded-xl space-y-2">
                <p className="text-xs font-bold text-[#0085db]">
                  Novo Material no Catálogo (sem preço fixo)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nome do material..."
                    value={novoMaterialNome}
                    onChange={e => setNovoMaterialNome(e.target.value)}
                    className="col-span-2 px-2.5 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Unidade (saco, m³, un)"
                    value={novoMaterialUnidade}
                    onChange={e => setNovoMaterialUnidade(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNovoMaterial(false)}
                    className="px-2.5 py-1 text-xs text-[#707a82] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNovoMaterial}
                    className="px-3.5 py-1 text-xs font-bold bg-[#0085db] hover:bg-[#0071ba] text-white rounded-lg cursor-pointer"
                  >
                    Salvar Material
                  </button>
                </div>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {itens.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] space-y-2"
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6 sm:col-span-4">
                      <select
                        value={item.materialId}
                        onChange={e => {
                          const mat = materiais.find(m => m.id === e.target.value);
                          updateItem(idx, {
                            materialId: e.target.value,
                            materialNome: mat?.nome || item.materialNome,
                            unidade: mat?.unidadePadrao || item.unidade,
                          });
                        }}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                      >
                        {materiais.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3 sm:col-span-2">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        placeholder="Qtd"
                        value={item.quantidade || ''}
                        onChange={e => updateItem(idx, { quantidade: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Un"
                        value={item.unidade}
                        onChange={e => updateItem(idx, { unidade: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white text-center"
                      />
                    </div>

                    <div className="col-span-5 sm:col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="R$ Unit"
                        value={item.valorUnitario || ''}
                        onChange={e => updateItem(idx, { valorUnitario: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                      />
                    </div>

                    <div className="col-span-5 sm:col-span-2 text-right">
                      <span className="text-xs font-bold text-[#111c2d] dark:text-white tabular-nums">
                        {formatBRL(item.valorTotal)}
                      </span>
                    </div>

                    {itens.length > 1 && (
                      <div className="col-span-2 sm:col-span-12 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-[#707a82] hover:text-[#fb977d] text-xs cursor-pointer"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-[#e6ecf1] dark:border-[#333f55] text-[11px]">
                    <span className="text-[#707a82]">Destino:</span>
                    <select
                      value={item.destino}
                      onChange={e => updateItem(idx, { destino: e.target.value as DestinoItem })}
                      className="px-2 py-0.5 rounded border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                    >
                      <option value="obra">Obra Juscelino Mola</option>
                      <option value="producao_trilhos">Produção de Trilhos</option>
                      <option value="outra_obra">Outra Obra / Local</option>
                      <option value="estoque_geral">Uso Geral</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Note conference & difference indicator */}
            <div className="mt-3 p-3.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] text-xs space-y-1">
              <div className="flex justify-between font-medium text-[#707a82] dark:text-[#7c8fac]">
                <span>Soma dos itens:</span>
                <span className="font-bold tabular-nums text-[#111c2d] dark:text-white">{formatBRL(somaItens)}</span>
              </div>
              {valorTotalNotaNum > 0 && Math.abs(diferencaRateio) > 0.01 && (
                <div className="flex justify-between font-bold text-[#fb977d]">
                  <span>Diferença em relação à nota (rateio/pendência):</span>
                  <span className="tabular-nums">{formatBRL(diferencaRateio)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Observações
            </label>
            <textarea
              rows={2}
              placeholder="Anotações sobre a compra..."
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-sm shadow-[#0085db]/25 cursor-pointer"
            >
              {editingDespesa ? 'Salvar Alterações' : 'Registrar Despesa'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

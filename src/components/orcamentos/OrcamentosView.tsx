import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Orcamento, ItemOrcamento } from '../../types';
import { formatBRL } from '../../utils/currency';
import { formatDateBR, getTodayISO } from '../../utils/date';
import { Modal } from '../common/Modal';
import {
  Scale,
  Plus,
  Search,
  ShoppingCart,
  CheckCircle2,
  TrendingDown,
  Layers,
  Trash2,
} from 'lucide-react';

export const OrcamentosView: React.FC = () => {
  const {
    orcamentos,
    addOrcamento,
    deleteOrcamento,
    converterOrcamentoEmDespesa,
    materiais,
    activeObra,
    tabFilter,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState(tabFilter || '');
  const [selectedMaterialFilter, setSelectedMaterialFilter] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<'orcamentos' | 'comparador'>('orcamentos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [targetOrcamentoToConvert, setTargetOrcamentoToConvert] = useState<Orcamento | null>(null);
  const [convertFormaPagamento, setConvertFormaPagamento] = useState<'pix' | 'cartao_credito' | 'boleto' | 'dinheiro'>('pix');

  // Form for new quote
  const [fornecedorEmpresa, setFornecedorEmpresa] = useState('');
  const [identificacao, setIdentificacao] = useState('');
  const [data, setData] = useState(getTodayISO());
  const [prazoValidade, setPrazoValidade] = useState('');
  const [condicoesPagamento, setCondicoesPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemOrcamento[]>([
    {
      id: `orc-item-${Date.now()}`,
      materialId: materiais[0]?.id || 'mat-cimento',
      materialNome: materiais[0]?.nome || 'Cimento CP II 50kg',
      quantidade: 50,
      unidade: 'saco',
      precoUnitarioCotado: 34.0,
      valorTotalCotado: 1700.0,
    },
  ]);

  const addItem = () => {
    const mat = materiais[0];
    setItens(prev => [
      ...prev,
      {
        id: `orc-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        materialId: mat?.id || 'mat-generico',
        materialNome: mat?.nome || 'Material',
        quantidade: 1,
        unidade: mat?.unidadePadrao || 'un',
        precoUnitarioCotado: 0,
        valorTotalCotado: 0,
      },
    ]);
  };

  const updateItem = (index: number, updates: Partial<ItemOrcamento>) => {
    setItens(prev => {
      const copy = [...prev];
      const cur = { ...copy[index], ...updates };
      if (updates.quantidade !== undefined || updates.precoUnitarioCotado !== undefined) {
        cur.valorTotalCotado = Number((cur.quantidade * cur.precoUnitarioCotado).toFixed(2));
      }
      copy[index] = cur;
      return copy;
    });
  };

  const removeItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const totalCotacao = itens.reduce((sum, it) => sum + it.valorTotalCotado, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedorEmpresa.trim()) return;

    addOrcamento({
      obraId: activeObra.id,
      fornecedorEmpresa: fornecedorEmpresa.trim(),
      identificacao: identificacao.trim() || `COT-${Date.now().toString().slice(-4)}`,
      data,
      prazoValidade: prazoValidade || undefined,
      condicoesPagamento: condicoesPagamento.trim() || undefined,
      valorTotal: totalCotacao,
      itens,
      status: 'em_cotacao',
      observacoes: observacoes.trim() || undefined,
    });

    setIsModalOpen(false);
    setFornecedorEmpresa('');
    setIdentificacao('');
    setCondicoesPagamento('');
    setObservacoes('');
  };

  const handleOpenConvert = (orc: Orcamento) => {
    setTargetOrcamentoToConvert(orc);
    setIsConvertModalOpen(true);
  };

  const handleConfirmConvert = () => {
    if (!targetOrcamentoToConvert) return;
    converterOrcamentoEmDespesa(targetOrcamentoToConvert.id, convertFormaPagamento);
    setIsConvertModalOpen(false);
    setTargetOrcamentoToConvert(null);
  };

  const priceComparisonData = useMemo(() => {
    const map: Record<
      string,
      {
        materialNome: string;
        unidade: string;
        cots: {
          orcamentoId: string;
          fornecedor: string;
          data: string;
          precoUnitario: number;
          quantidade: number;
          status: string;
        }[];
        menorPreco: number;
        melhorFornecedor: string;
      }
    > = {};

    orcamentos.forEach(orc => {
      orc.itens.forEach(it => {
        const key = it.materialNome.toLowerCase().trim();
        if (!map[key]) {
          map[key] = {
            materialNome: it.materialNome,
            unidade: it.unidade,
            cots: [],
            menorPreco: Infinity,
            melhorFornecedor: '',
          };
        }

        map[key].cots.push({
          orcamentoId: orc.id,
          fornecedor: orc.fornecedorEmpresa,
          data: orc.data,
          precoUnitario: it.precoUnitarioCotado,
          quantidade: it.quantidade,
          status: orc.status,
        });

        if (it.precoUnitarioCotado > 0 && it.precoUnitarioCotado < map[key].menorPreco) {
          map[key].menorPreco = it.precoUnitarioCotado;
          map[key].melhorFornecedor = orc.fornecedorEmpresa;
        }
      });
    });

    return Object.values(map);
  }, [orcamentos]);

  const filteredOrcamentos = orcamentos.filter(orc => {
    const matchesSearch =
      orc.fornecedorEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.identificacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.itens.some(it => it.materialNome.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMat =
      selectedMaterialFilter === 'todos' ||
      orc.itens.some(it => it.materialNome.toLowerCase() === selectedMaterialFilter.toLowerCase());

    return matchesSearch && matchesMat;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
            Orçamentos & Comparação de Preços
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Cotações independentes das despesas reais. Compare preços entre lojas e converta em compra sem duplicar gastos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Cotação / Orçamento</span>
        </button>
      </div>

      {/* Tabs Switcher: Orçamentos vs Comparador */}
      <div className="flex items-center gap-2 border-b border-[#e6ecf1] dark:border-[#333f55] pb-2">
        <button
          onClick={() => setActiveTab('orcamentos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'orcamentos'
              ? 'bg-[#0085db] text-white shadow-sm shadow-[#0085db]/25'
              : 'text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]'
          }`}
        >
          Orçamentos Cadastrados ({orcamentos.length})
        </button>
        <button
          onClick={() => setActiveTab('comparador')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'comparador'
              ? 'bg-[#0085db] text-white shadow-sm shadow-[#0085db]/25'
              : 'text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Comparador entre Lojas ({priceComparisonData.length} itens)</span>
        </button>
      </div>

      {activeTab === 'orcamentos' ? (
        <>
          {/* Search and Filters */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-4 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707a82]" />
              <input
                type="text"
                placeholder="Pesquisar orçamento por empresa, número ou material..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>

            <select
              value={selectedMaterialFilter}
              onChange={e => setSelectedMaterialFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
            >
              <option value="todos">Todos os Materiais</option>
              {materiais.map(m => (
                <option key={m.id} value={m.nome}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Quotes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrcamentos.map(orc => {
              const isConverted = orc.status === 'convertido_em_compra';
              return (
                <div
                  key={orc.id}
                  className={`bg-white dark:bg-[#111c2d] border rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between transition-all ${
                    isConverted
                      ? 'border-[#4bd08b]/40 bg-[#4bd08b]/5'
                      : 'border-[#e6ecf1] dark:border-[#333f55] hover:border-[#0085db]/40'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#707a82] uppercase tracking-wider">
                            {orc.identificacao}
                          </span>
                          <span>·</span>
                          <span className="text-xs text-[#707a82]">
                            {formatDateBR(orc.data)}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-[#111c2d] dark:text-white mt-0.5">
                          {orc.fornecedorEmpresa}
                        </h2>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          orc.status === 'convertido_em_compra'
                            ? 'bg-[#4bd08b]/15 text-[#4bd08b] border border-[#4bd08b]/30'
                            : orc.status === 'aprovado'
                            ? 'bg-[#0085db]/15 text-[#0085db] border border-[#0085db]/30'
                            : orc.status === 'recusado'
                            ? 'bg-[#fb977d]/15 text-[#fb977d] border border-[#fb977d]/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-[#707a82]'
                        }`}
                      >
                        {orc.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Total */}
                    <div className="my-3 flex items-baseline justify-between">
                      <span className="text-xs text-[#707a82] font-medium">Valor Total Cotado:</span>
                      <span className="text-xl font-extrabold text-[#111c2d] dark:text-white tabular-nums">
                        {formatBRL(orc.valorTotal)}
                      </span>
                    </div>

                    {/* Items table preview */}
                    <div className="space-y-1.5 pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] text-xs">
                      {orc.itens.map(it => (
                        <div key={it.id} className="flex justify-between items-center text-[#111c2d] dark:text-[#7c8fac]">
                          <span className="truncate pr-2">
                            {it.quantidade} {it.unidade} {it.materialNome}
                          </span>
                          <span className="font-semibold tabular-nums shrink-0">
                            {formatBRL(it.precoUnitarioCotado)}/un
                          </span>
                        </div>
                      ))}
                    </div>

                    {orc.condicoesPagamento && (
                      <p className="mt-3 text-[11px] text-[#707a82]">
                        Condições: <strong className="text-[#111c2d] dark:text-white">{orc.condicoesPagamento}</strong>
                      </p>
                    )}
                    {orc.observacoes && (
                      <p className="mt-1 text-[11px] text-[#707a82] italic">
                        Obs: {orc.observacoes}
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (confirm(`Excluir o orçamento de ${orc.fornecedorEmpresa}?`)) {
                          deleteOrcamento(orc.id);
                        }
                      }}
                      className="p-1.5 text-[#707a82] hover:text-[#fb977d] rounded cursor-pointer"
                      title="Excluir orçamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      {!isConverted ? (
                        <button
                          onClick={() => handleOpenConvert(orc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#4bd08b] hover:bg-[#10bd9d] active:scale-95 rounded-xl shadow-xs transition-colors cursor-pointer"
                          title="Transforma este orçamento em despesa real sem duplicar valores"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Converter em Compra</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-[#4bd08b] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Compra Efetivada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Intelligent Price Comparison Matrix */
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#111c2d] dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#0085db]" />
              Comparativo de Preços por Material entre Fornecedores
            </h2>
            <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5">
              Identifique rapidamente qual fornecedor oferece o menor preço unitário cotado.
            </p>
          </div>

          <div className="space-y-4">
            {priceComparisonData.map(group => (
              <div
                key={group.materialNome}
                className="border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-4 bg-[#f6f9fc] dark:bg-[#1a2535] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#e6ecf1] dark:border-[#333f55]">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#111c2d] dark:text-white">
                      {group.materialNome}
                    </h3>
                    <span className="text-xs text-[#707a82]">
                      Unidade de cotação: {group.unidade}
                    </span>
                  </div>

                  {group.menorPreco !== Infinity && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4bd08b]/15 text-[#10bd9d] dark:text-[#4bd08b] border border-[#4bd08b]/30 text-xs font-bold">
                      <TrendingDown className="w-4 h-4" />
                      <span>
                        Melhor Oferta: {formatBRL(group.menorPreco)} ({group.melhorFornecedor})
                      </span>
                    </div>
                  )}
                </div>

                {/* Vendors comparison table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {group.cots.map((cot, idx) => {
                    const isBest = cot.precoUnitario === group.menorPreco;
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                          isBest
                            ? 'bg-white dark:bg-[#111c2d] border-[#4bd08b] text-[#111c2d] dark:text-white shadow-xs'
                            : 'bg-white dark:bg-[#111c2d] border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac]'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="font-bold truncate text-[#111c2d] dark:text-white">{cot.fornecedor}</span>
                            {isBest && (
                              <span className="text-[10px] font-black uppercase text-[#4bd08b]">
                                Mais barato!
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#707a82] block mt-0.5">
                            Cotado em {formatDateBR(cot.data)}
                          </span>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-between items-baseline">
                          <span className="text-[11px] text-[#707a82]">Unitário:</span>
                          <span className={`text-sm font-black tabular-nums ${isBest ? 'text-[#4bd08b]' : 'text-[#111c2d] dark:text-white'}`}>
                            {formatBRL(cot.precoUnitario)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Quote */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Novo Orçamento / Cotação"
        subtitle="Armazene cotações de fornecedores sem somar no custo real da obra até a compra."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Empresa / Loja Fornecedora *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Comercial Silva, Depósito Goiás..."
                value={fornecedorEmpresa}
                onChange={e => setFornecedorEmpresa(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Identificação / Nº da Cotação
              </label>
              <input
                type="text"
                placeholder="Ex: COT-2026-08, Proposta 440"
                value={identificacao}
                onChange={e => setIdentificacao(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Data da Cotação
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
                Condições de Pagamento / Frete
              </label>
              <input
                type="text"
                placeholder="Ex: 3x no boleto, à vista com 5% desc"
                value={condicoesPagamento}
                onChange={e => setCondicoesPagamento(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#111c2d] dark:text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0085db]" />
                Itens Cotados ({itens.length})
              </h4>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 text-xs font-bold bg-[#0085db]/10 hover:bg-[#0085db]/20 text-[#0085db] rounded-lg transition-colors cursor-pointer"
              >
                + Adicionar Item
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {itens.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-xs"
                >
                  <div className="col-span-5 sm:col-span-4">
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

                  <div className="col-span-4 sm:col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Preço Cotado R$"
                      value={item.precoUnitarioCotado || ''}
                      onChange={e => updateItem(idx, { precoUnitarioCotado: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                    />
                  </div>

                  <div className="col-span-10 sm:col-span-2 text-right">
                    <span className="font-bold text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(item.valorTotalCotado)}
                    </span>
                  </div>

                  {itens.length > 1 && (
                    <div className="col-span-2 sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-[#707a82] hover:text-[#fb977d] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 bg-[#f6f9fc] dark:bg-[#1a2535] rounded-xl flex justify-between items-center text-xs border border-[#e6ecf1] dark:border-[#333f55]">
              <span className="font-medium text-[#707a82] dark:text-[#7c8fac]">Total do Orçamento:</span>
              <span className="text-base font-black text-[#0085db] tabular-nums">
                {formatBRL(totalCotacao)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Observações
            </label>
            <textarea
              rows={2}
              placeholder="Prazo de entrega, contatos do vendedor..."
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
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
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
            >
              Salvar Orçamento
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Conversion to Expense */}
      {targetOrcamentoToConvert && (
        <Modal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          title="Converter Orçamento em Despesa Efetiva"
          subtitle="A compra será lançada no custo da obra sem duplicar valores."
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-[#4bd08b]/10 border border-[#4bd08b]/30 rounded-xl text-xs space-y-1">
              <p className="font-bold text-[#111c2d] dark:text-white">
                {targetOrcamentoToConvert.fornecedorEmpresa}
              </p>
              <p className="text-[#4bd08b]">
                Valor Total: <strong className="tabular-nums">{formatBRL(targetOrcamentoToConvert.valorTotal)}</strong>
              </p>
              <p className="text-[11px] text-[#707a82]">
                {targetOrcamentoToConvert.itens.length} itens serão importados para a nota.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Forma de Pagamento da Compra
              </label>
              <select
                value={convertFormaPagamento}
                onChange={e => setConvertFormaPagamento(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold"
              >
                <option value="pix">Pix</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>

            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="px-3.5 py-2 text-xs text-[#707a82] hover:text-[#111c2d] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmConvert}
                className="px-4 py-2 text-xs font-bold text-white bg-[#4bd08b] hover:bg-[#10bd9d] rounded-xl shadow-xs cursor-pointer"
              >
                Confirmar Compra
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

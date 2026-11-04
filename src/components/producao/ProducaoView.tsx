import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/currency';
import { formatDateBR, getTodayISO } from '../../utils/date';
import { Modal } from '../common/Modal';
import {
  Hammer,
  Plus,
  Layers,
  Calendar,
  TrendingDown,
} from 'lucide-react';

export const ProducaoView: React.FC = () => {
  const {
    producao,
    addProducao,
    activeObra,
    totalTrilhosProduzidos,
    totalPlacasProduzidas,
    custoIndicativoTrilho,
    totaisPorCategoria,
    activeUser,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produto, setProduto] = useState<'trilho' | 'placa_cimento'>('trilho');
  const [quantidade, setQuantidade] = useState<number>(6);
  const [comprimentoMetros, setComprimentoMetros] = useState<string>('2.80');
  const [especificacao, setEspecificacao] = useState('');
  const [data, setData] = useState(getTodayISO());
  const [destino, setDestino] = useState('Laje pavimento térreo - Obra Juscelino Mola');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantidade <= 0) return;

    addProducao({
      obraId: activeObra.id,
      produto,
      quantidade,
      comprimentoMetros: produto === 'trilho' ? parseFloat(comprimentoMetros) || undefined : undefined,
      especificacao: especificacao.trim() || undefined,
      data,
      destino: destino.trim() || 'Obra Juscelino Mola',
      observacoes: observacoes.trim() || undefined,
      criadoPor: activeUser.nome,
    });

    setIsModalOpen(false);
    setQuantidade(6);
    setEspecificacao('');
    setObservacoes('');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
            Produção de Trilhos & Placas no Canteiro
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Fabricação própria para uso exclusivo na obra. Trilhos de comprimentos livres e placas de concreto.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Produção</span>
        </button>
      </div>

      {/* Production KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Trilhos total */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-[#707a82]">
            <span>Trilhos Armados Concretados</span>
            <div className="w-9 h-9 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center">
              <Hammer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#111c2d] dark:text-white tabular-nums">
            {totalTrilhosProduzidos} <span className="text-sm font-normal text-[#707a82]">unidades</span>
          </div>
          <p className="text-xs text-[#707a82] mt-1">
            Produzidos com treliça H8 sob medida
          </p>
        </div>

        {/* Placas total */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-[#707a82]">
            <span>Placas de Concreto</span>
            <div className="w-9 h-9 rounded-xl bg-[#4bd08b]/15 text-[#4bd08b] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#111c2d] dark:text-white tabular-nums">
            {totalPlacasProduzidas} <span className="text-sm font-normal text-[#707a82]">unidades</span>
          </div>
          <p className="text-xs text-[#707a82] mt-1">
            Placas pré-moldadas para laje e calçada
          </p>
        </div>

        {/* Custo indicativo por unidade */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-[#707a82]">
            <span>Custo Indicativo / Trilho</span>
            <div className="w-9 h-9 rounded-xl bg-[#8763da]/15 text-[#8763da] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#8763da] tabular-nums">
            {formatBRL(custoIndicativoTrilho)}
          </div>
          <p className="text-xs text-[#707a82] mt-1">
            Material alocado: {formatBRL(totaisPorCategoria.trilhos_producao)}
          </p>
        </div>

      </div>

      {/* Production Log History */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none space-y-4">
        <h2 className="text-sm font-bold text-[#111c2d] dark:text-white flex items-center gap-2 pb-2 border-b border-[#e6ecf1] dark:border-[#333f55]">
          <Calendar className="w-4 h-4 text-[#0085db]" />
          Histórico de Concretagem e Fabricação ({producao.length} lotes)
        </h2>

        <div className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
          {producao.map(item => (
            <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full ${
                      item.produto === 'trilho'
                        ? 'bg-[#0085db]/15 text-[#0085db]'
                        : 'bg-[#4bd08b]/15 text-[#4bd08b]'
                    }`}
                  >
                    {item.produto === 'trilho' ? 'Trilho de Laje' : 'Placa de Concreto'}
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-[#707a82] dark:text-[#7c8fac]">
                    {formatDateBR(item.data)}
                  </span>
                  {item.comprimentoMetros && (
                    <>
                      <span>·</span>
                      <span className="font-bold text-[#111c2d] dark:text-white">
                        Comprimento: {item.comprimentoMetros.toFixed(2)}m
                      </span>
                    </>
                  )}
                </div>

                <p className="text-[#111c2d] dark:text-white font-medium mt-1">
                  {item.especificacao || `Lote fabricado por ${item.criadoPor}`}
                </p>
                <p className="text-[11px] text-[#707a82] mt-0.5">
                  Destino: {item.destino}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base font-extrabold text-[#111c2d] dark:text-white tabular-nums block">
                  {item.quantidade} un
                </span>
                <span className="text-[10px] text-[#707a82]">
                  Lançado por {item.criadoPor}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: New Production Batch */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Produção no Canteiro"
        subtitle="Informe a quantidade fabricada e especificações do comprimento."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Produto Fabricado *
            </label>
            <select
              value={produto}
              onChange={e => setProduto(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold"
            >
              <option value="trilho">Trilho de Laje (comprimento sob medida)</option>
              <option value="placa_cimento">Placa de Cimento Pré-moldada</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Quantidade Produzida (un) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantidade}
                onChange={e => setQuantidade(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-bold"
              />
            </div>

            {produto === 'trilho' ? (
              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                  Comprimento (metros)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 2.40, 3.20, 4.10"
                  value={comprimentoMetros}
                  onChange={e => setComprimentoMetros(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                  Data da Concretagem
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={e => setData(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                />
              </div>
            )}
          </div>

          {produto === 'trilho' && (
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Data da Fabricação
              </label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Destino / Local de Aplicação
            </label>
            <input
              type="text"
              placeholder="Ex: Laje vão da sala, calçada, garagem..."
              value={destino}
              onChange={e => setDestino(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Especificação ou Observações
            </label>
            <textarea
              rows={2}
              placeholder="Tipo de treliça, traço de concreto..."
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 text-xs text-[#707a82] hover:text-[#111c2d] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
            >
              Salvar Produção
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

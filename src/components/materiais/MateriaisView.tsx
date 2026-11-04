import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

export const MateriaisView: React.FC = () => {
  const { materiais, addMaterial, despesas, navigateToTabWithFilter } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Form for new material
  const [nome, setNome] = useState('');
  const [unidadePadrao, setUnidadePadrao] = useState('un');
  const [categoriaSugerida, setCategoriaSugerida] = useState('');

  const materialStats = useMemo(() => {
    const stats: Record<
      string,
      {
        totalQuantidade: number;
        totalGasto: number;
        precoMedio: number;
        menorPreco: number;
        maiorPreco: number;
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
        const mat = materiais.find(
          m => m.id === item.materialId || m.nome.toLowerCase() === item.materialNome.toLowerCase()
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
    });

    return stats;
  }, [materiais, despesas]);

  const filteredMateriais = materiais.filter(m =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.categoriaSugerida?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    addMaterial({
      nome: nome.trim(),
      unidadePadrao: unidadePadrao.trim() || 'un',
      categoriaSugerida: categoriaSugerida.trim() || undefined,
    });

    setNome('');
    setUnidadePadrao('un');
    setCategoriaSugerida('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
            Catálogo de Materiais
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Cadastro por nome sem preço fixo. Preço médio ponderado apurado a partir das compras reais.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Material</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-4 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707a82]" />
          <input
            type="text"
            placeholder="Pesquisar por nome do material (cimento, areia, ferro...)"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
          />
        </div>
      </div>

      {/* Grid of Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMateriais.map(mat => {
          const stats = materialStats[mat.id] || {
            totalQuantidade: 0,
            totalGasto: 0,
            precoMedio: 0,
            menorPreco: 0,
            maiorPreco: 0,
            compras: [],
          };

          return (
            <div
              key={mat.id}
              className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between hover:border-[#0085db] dark:hover:border-[#0085db] transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#111c2d] dark:text-white">
                        {mat.nome}
                      </h2>
                      <span className="text-[11px] text-[#707a82]">
                        Unidade: <strong className="text-[#111c2d] dark:text-white">{mat.unidadePadrao}</strong>
                      </span>
                    </div>
                  </div>

                  {mat.categoriaSugerida && (
                    <span className="text-[10px] font-bold text-[#707a82] bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] px-2 py-0.5 rounded-full">
                      {mat.categoriaSugerida}
                    </span>
                  )}
                </div>

                {/* Price metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] text-xs">
                  <div>
                    <span className="text-[11px] text-[#707a82] block">Preço Médio Pago</span>
                    <span className="text-sm font-extrabold text-[#111c2d] dark:text-white tabular-nums">
                      {stats.precoMedio > 0 ? formatBRL(stats.precoMedio) : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#707a82] block">Total Comprado</span>
                    <span className="text-sm font-extrabold text-[#111c2d] dark:text-white tabular-nums">
                      {stats.totalQuantidade > 0 ? `${stats.totalQuantidade} ${mat.unidadePadrao}` : '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#707a82] flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-[#4bd08b]" /> Menor Preço
                    </span>
                    <span className="font-semibold text-[#4bd08b] tabular-nums">
                      {stats.menorPreco > 0 ? formatBRL(stats.menorPreco) : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#707a82] flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-[#fb977d]" /> Maior Preço
                    </span>
                    <span className="font-semibold text-[#fb977d] tabular-nums">
                      {stats.maiorPreco > 0 ? formatBRL(stats.maiorPreco) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer action: purchase history */}
              <div className="mt-4 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between">
                <span className="text-[11px] text-[#707a82]">
                  Total: <strong className="text-[#111c2d] dark:text-white tabular-nums">{formatBRL(stats.totalGasto)}</strong>
                </span>
                <button
                  onClick={() => setSelectedMaterial(mat)}
                  className="text-xs font-bold text-[#0085db] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  Ver Histórico ({stats.compras.length})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Material Purchase History Details */}
      {selectedMaterial && (
        <Modal
          isOpen={!!selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          title={`Histórico: ${selectedMaterial.nome}`}
          subtitle={`Todas as compras registradas com este material na Obra Juscelino Mola.`}
          maxWidth="2xl"
        >
          {(() => {
            const stats = materialStats[selectedMaterial.id];
            if (!stats || stats.compras.length === 0) {
              return (
                <div className="text-center py-8 text-[#707a82] text-xs">
                  Nenhuma compra registrada ainda para este material.
                </div>
              );
            }
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#f6f9fc] dark:bg-[#1a2535] rounded-xl text-center text-xs border border-[#e6ecf1] dark:border-[#333f55]">
                  <div>
                    <span className="text-[#707a82] block text-[10px]">Volume Total</span>
                    <span className="font-bold text-[#111c2d] dark:text-white tabular-nums">
                      {stats.totalQuantidade} {selectedMaterial.unidadePadrao}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#707a82] block text-[10px]">Preço Médio Ponderado</span>
                    <span className="font-bold text-[#0085db] tabular-nums">
                      {formatBRL(stats.precoMedio)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#707a82] block text-[10px]">Total Investido</span>
                    <span className="font-bold text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(stats.totalGasto)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-[#e6ecf1] dark:divide-[#333f55] max-h-64 overflow-y-auto">
                  {stats.compras.map((compra, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#111c2d] dark:text-white">
                          {compra.fornecedor}
                        </p>
                        <p className="text-[11px] text-[#707a82]">
                          {formatDateBR(compra.data)} · {compra.descricao}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#111c2d] dark:text-white tabular-nums block">
                          {formatBRL(compra.valorTotal)}
                        </span>
                        <span className="text-[11px] text-[#707a82] tabular-nums">
                          {compra.quantidade} {compra.unidade} × {formatBRL(compra.valorUnitario)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
                  <button
                    onClick={() => {
                      const matName = selectedMaterial.nome;
                      setSelectedMaterial(null);
                      navigateToTabWithFilter('orcamentos', matName);
                    }}
                    className="px-3.5 py-2 text-xs font-bold bg-[#0085db] text-white rounded-xl hover:bg-[#0071ba] transition-colors cursor-pointer"
                  >
                    Comparar Cotações deste Material
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Modal: New Material */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Material"
        subtitle="O cadastro geral não possui preço fixo. O preço é informado em cada nota ou cotação."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Nome do Material / Insumo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Cimento CP II 50kg, Areia Média, Tijolo..."
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Unidade de Medida Padrão
            </label>
            <input
              type="text"
              placeholder="Ex: saco, m³, m, un, barra 12m, milheiro..."
              value={unidadePadrao}
              onChange={e => setUnidadePadrao(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Categoria Construtiva Sugerida
            </label>
            <input
              type="text"
              placeholder="Ex: Alvenaria, Sapata, Laje, Hidráulico..."
              value={categoriaSugerida}
              onChange={e => setCategoriaSugerida(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
            >
              Salvar no Catálogo
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

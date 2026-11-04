import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/currency';
import { formatDateBR, getTodayISO } from '../../utils/date';
import {
  Download,
  Printer,
  Calendar,
  Filter,
} from 'lucide-react';

export const RelatoriosView: React.FC = () => {
  const {
    activeObra,
    totalGeralObra,
    totaisPorCategoria,
    despesas,
    diarias,
    etapas,
  } = useApp();

  const [dataInicio, setDataInicio] = useState('2026-09-01');
  const [dataFim, setDataFim] = useState(getTodayISO());
  const [selectedEtapa, setSelectedEtapa] = useState('todas');

  const filteredDespesas = despesas.filter(d => {
    const inDate = d.data >= dataInicio && d.data <= dataFim;
    const inEtapa = selectedEtapa === 'todas' || d.etapaId === selectedEtapa;
    return inDate && inEtapa;
  });

  const filteredDiarias = diarias.filter(d => {
    const inDate = d.data >= dataInicio && d.data <= dataFim;
    const inEtapa = selectedEtapa === 'todas' || d.etapaId === selectedEtapa;
    return inDate && inEtapa;
  });

  const totalPeriodo =
    filteredDespesas.reduce((sum, d) => sum + d.valorTotalNota, 0) +
    filteredDiarias.reduce((sum, d) => sum + d.valorTotal, 0);

  const handleExportCSV = () => {
    const rows = [
      ['Tipo', 'Data', 'Descricao', 'Categoria / Funcao', 'Fornecedor / Trabalhador', 'Valor (R$)'],
      ...filteredDespesas.map(d => [
        'Despesa',
        d.data,
        `"${d.descricao.replace(/"/g, '""')}"`,
        d.categoria,
        `"${d.fornecedorNome.replace(/"/g, '""')}"`,
        d.valorTotalNota.toFixed(2),
      ]),
      ...filteredDiarias.map(dia => [
        'Mao de Obra',
        dia.data,
        `"Diaria ${dia.fracao}x ${dia.descricaoAdicional || ''}"`,
        'Diaria',
        `"${dia.trabalhadorNome.replace(/"/g, '""')}"`,
        dia.valorTotal.toFixed(2),
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_obra_${activeObra.id}_${getTodayISO()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
            Relatórios Financeiros & Exportação
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Consolidado executivo, prestação de contas da obra e exportação em planilha CSV.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#4bd08b]" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-4 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col sm:flex-row gap-3 items-center no-print text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-[#707a82] shrink-0" />
          <span className="font-semibold text-[#111c2d] dark:text-white">De:</span>
          <input
            type="date"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-[#111c2d] dark:text-white">Até:</span>
          <input
            type="date"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#707a82] shrink-0" />
          <select
            value={selectedEtapa}
            onChange={e => setSelectedEtapa(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
          >
            <option value="todas">Todas as Etapas</option>
            {etapas.map(e => (
              <option key={e.id} value={e.id}>
                {e.numero} — {e.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white text-[#111c2d] dark:bg-[#111c2d] dark:text-white border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 sm:p-8 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none space-y-6">
        
        {/* Document Header */}
        <div className="border-b border-[#e6ecf1] dark:border-[#333f55] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold text-[#0085db] uppercase tracking-widest">
                RELATÓRIO FINANCEIRO CONSOLIDADO
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-[#111c2d] dark:text-white tracking-tight mt-0.5">
                {activeObra.nome}
              </h1>
              <p className="text-xs text-[#707a82] mt-0.5">
                Período de referência: {formatDateBR(dataInicio)} a {formatDateBR(dataFim)}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#707a82] block">Total Apurado no Período</span>
              <span className="text-2xl font-black text-[#0085db] tabular-nums">
                {formatBRL(totalPeriodo)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary Table */}
        <div>
          <h2 className="text-xs font-bold text-[#707a82] uppercase tracking-wider mb-2">
            Resumo Geral por Categoria de Custo
          </h2>
          <div className="border border-[#e6ecf1] dark:border-[#333f55] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] dark:text-[#7c8fac] font-bold border-b border-[#e6ecf1] dark:border-[#333f55] uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Categoria</th>
                  <th className="py-2.5 px-4">Descrição Principal</th>
                  <th className="py-2.5 px-4 text-right">Valor Total (R$)</th>
                  <th className="py-2.5 px-4 text-right">Participação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
                <tr>
                  <td className="py-2.5 px-4 font-bold text-[#0085db]">Materiais da Obra</td>
                  <td className="py-2.5 px-4 text-[#707a82]">Cimento, areia, brita, ferro e tijolo</td>
                  <td className="py-2.5 px-4 text-right font-black tabular-nums">{formatBRL(totaisPorCategoria.materiais)}</td>
                  <td className="py-2.5 px-4 text-right text-[#707a82] tabular-nums font-semibold">66,6%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-[#4bd08b]">Mão de Obra</td>
                  <td className="py-2.5 px-4 text-[#707a82]">Diárias pedreiros, serventes e carpinteiros (teto R$ 32k)</td>
                  <td className="py-2.5 px-4 text-right font-black tabular-nums">{formatBRL(totaisPorCategoria.mao_de_obra)}</td>
                  <td className="py-2.5 px-4 text-right text-[#707a82] tabular-nums font-semibold">26,0%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-[#8763da]">Material Produção de Trilhos</td>
                  <td className="py-2.5 px-4 text-[#707a82]">Treliças H8 e formas metálicas</td>
                  <td className="py-2.5 px-4 text-right font-black tabular-nums">{formatBRL(totaisPorCategoria.trilhos_producao)}</td>
                  <td className="py-2.5 px-4 text-right text-[#707a82] tabular-nums font-semibold">5,8%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-[#46caeb]">Abastecimentos</td>
                  <td className="py-2.5 px-4 text-[#707a82]">Combustível frete e busca de insumos</td>
                  <td className="py-2.5 px-4 text-right font-black tabular-nums">{formatBRL(totaisPorCategoria.abastecimentos)}</td>
                  <td className="py-2.5 px-4 text-right text-[#707a82] tabular-nums font-semibold">1,5%</td>
                </tr>
                <tr className="bg-[#f6f9fc] dark:bg-[#1a2535] font-bold border-t border-[#e6ecf1] dark:border-[#333f55]">
                  <td className="py-3 px-4 font-extrabold" colSpan={2}>
                    TOTAL LANÇADO NA PLANILHA ATUALIZADA
                  </td>
                  <td className="py-3 px-4 text-right font-black text-[#0085db] text-sm tabular-nums">
                    {formatBRL(totalGeralObra)}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold tabular-nums">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Detailed Ledger for Selected Range */}
        <div>
          <h2 className="text-xs font-bold text-[#707a82] uppercase tracking-wider mb-2">
            Detalhamento dos Lançamentos do Período ({filteredDespesas.length + filteredDiarias.length} registros)
          </h2>
          <div className="border border-[#e6ecf1] dark:border-[#333f55] rounded-xl overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] dark:text-[#7c8fac] font-bold border-b border-[#e6ecf1] dark:border-[#333f55] sticky top-0 uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Descrição / Fornecedor / Pessoa</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
                {filteredDespesas.map(d => (
                  <tr key={d.id} className="hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]">
                    <td className="py-2 px-3 font-semibold whitespace-nowrap">{formatDateBR(d.data)}</td>
                    <td className="py-2 px-3 text-[#0085db] font-bold capitalize">{d.categoria.replace('_', ' ')}</td>
                    <td className="py-2 px-3 truncate max-w-xs">{d.descricao} ({d.fornecedorNome})</td>
                    <td className="py-2 px-3 text-right font-black tabular-nums">{formatBRL(d.valorTotalNota)}</td>
                  </tr>
                ))}
                {filteredDiarias.map(dia => (
                  <tr key={dia.id} className="hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]">
                    <td className="py-2 px-3 font-semibold whitespace-nowrap">{formatDateBR(dia.data)}</td>
                    <td className="py-2 px-3 text-[#4bd08b] font-bold">Mão de Obra</td>
                    <td className="py-2 px-3 truncate max-w-xs">Diária {dia.trabalhadorNome} ({dia.fracao}x)</td>
                    <td className="py-2 px-3 text-right font-black tabular-nums">{formatBRL(dia.valorTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

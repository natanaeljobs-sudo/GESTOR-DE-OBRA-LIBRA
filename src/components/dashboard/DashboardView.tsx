import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/currency';
import { formatDateBR } from '../../utils/date';
import {
  TrendingUp,
  Users2,
  Hammer,
  CreditCard,
  AlertTriangle,
  Receipt,
  PlusCircle,
  FileCheck2,
  Calendar,
  Building,
  Scale,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    activeObra,
    etapas,
    totalGeralObra,
    totaisPorCategoria,
    totalMaoDeObra,
    totalMaoDeObraPaga,
    totalMaoDeObraPendente,
    saldoTetoMaoDeObra,
    totalAPagar,
    totalTrilhosProduzidos,
    totalPlacasProduzidas,
    custoIndicativoTrilho,
    despesas,
    diarias,
    alertas,
    navigateToTabWithFilter,
  } = useApp();

  const etapaAtual = etapas.find(e => e.id === activeObra.etapaAtualId) || etapas[1];

  const pctMateriais = totalGeralObra > 0 ? ((totaisPorCategoria.materiais / totalGeralObra) * 100).toFixed(1) : '0';
  const pctMaoDeObra = totalGeralObra > 0 ? ((totaisPorCategoria.mao_de_obra / totalGeralObra) * 100).toFixed(1) : '0';
  const pctTrilhos = totalGeralObra > 0 ? ((totaisPorCategoria.trilhos_producao / totalGeralObra) * 100).toFixed(1) : '0';
  const pctAbastecimentos = totalGeralObra > 0 ? ((totaisPorCategoria.abastecimentos / totalGeralObra) * 100).toFixed(1) : '0';

  const tetoMaoDeObra = activeObra.tetoMaoDeObra || 32000;
  const pctTetoConsumido = Math.min(100, (totalMaoDeObra / tetoMaoDeObra) * 100).toFixed(1);

  const recentDespesas = [...despesas].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 4);
  const recentDiarias = [...diarias].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 4);

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Top Banner: Spike Welcome Card */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#707a82] dark:text-[#7c8fac]">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0085db]/10 text-[#0085db] font-bold text-[11px]">
                <Building className="w-3.5 h-3.5" />
                {activeObra.nome}
              </span>
              <span>·</span>
              <span>Início {formatDateBR(activeObra.dataInicio)}</span>
              <span>·</span>
              <span className="text-[#4bd08b] font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4bd08b]" />
                Em andamento
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111c2d] dark:text-white mt-2">
              Painel Geral de Obras
            </h1>
            <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
              Etapa em execução: <strong className="text-[#111c2d] dark:text-white">{etapaAtual.numero} — {etapaAtual.nome}</strong>. Controle de notas, diárias semanais e trilhos fabricados.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            <button
              onClick={() => navigateToTabWithFilter('despesas', 'nova')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl transition-all shadow-sm shadow-[#0085db]/25 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Despesa</span>
            </button>
            <button
              onClick={() => navigateToTabWithFilter('maodeobra', 'nova')}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-[#e6ecf1] dark:hover:bg-[#202f43] border border-[#e6ecf1] dark:border-[#333f55] active:scale-95 rounded-xl transition-all cursor-pointer"
            >
              <Users2 className="w-4 h-4 text-[#0085db]" />
              <span>Lançar Diária</span>
            </button>
            <button
              onClick={() => navigateToTabWithFilter('recibos')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-[#e6ecf1] dark:hover:bg-[#202f43] border border-[#e6ecf1] dark:border-[#333f55] active:scale-95 rounded-xl transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-[#4bd08b]" />
              <span>Emitir Recibo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner (Spike warning card) */}
      {alertas.length > 0 && (
        <div className="bg-[#f8c076]/15 border border-[#f8c076]/30 rounded-[18px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f8c076]/20 text-[#d9941a] dark:text-[#f8c076] flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#111c2d] dark:text-white">
                {alertas.length} pendências aguardando conferência ou preenchimento
              </p>
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                {alertas[0]?.titulo}: {alertas[0]?.descricao}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateToTabWithFilter('alertas')}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-[#0085db] hover:bg-[#0071ba] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-sm shadow-[#0085db]/20 cursor-pointer"
          >
            Ver Todas as Pendências
          </button>
        </div>
      )}

      {/* 4 Core Financial KPI Cards (Spike Card Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Gasto */}
        <div
          onClick={() => navigateToTabWithFilter('despesas')}
          className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none cursor-pointer hover:border-[#0085db] dark:hover:border-[#0085db] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac]">
              Total Gasto na Obra
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111c2d] dark:text-white tabular-nums">
            {formatBRL(totalGeralObra)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#707a82] dark:text-[#7c8fac]">
            <span>Orçamento ref:</span>
            <span className="font-semibold text-[#111c2d] dark:text-white tabular-nums">
              {formatBRL(activeObra.orcamentoTotal)}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-[#f0f5f9] dark:bg-[#15263a] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#0085db] h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (totalGeralObra / activeObra.orcamentoTotal) * 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Mão de Obra e Teto R$ 32k */}
        <div
          onClick={() => navigateToTabWithFilter('maodeobra')}
          className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none cursor-pointer hover:border-[#4bd08b] dark:hover:border-[#4bd08b] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac]">
              Mão de Obra (Teto R$ 32k)
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#4bd08b]/15 text-[#4bd08b] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111c2d] dark:text-white tabular-nums">
            {formatBRL(totalMaoDeObra)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#707a82] dark:text-[#7c8fac]">
            <span>Saldo restante:</span>
            <span className="font-bold text-[#4bd08b] tabular-nums">
              {formatBRL(saldoTetoMaoDeObra)}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-[#f0f5f9] dark:bg-[#15263a] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#4bd08b] h-1.5 rounded-full"
              style={{ width: `${pctTetoConsumido}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-[#707a82] dark:text-[#7c8fac] text-right tabular-nums">
            {pctTetoConsumido}% do teto fechado
          </p>
        </div>

        {/* KPI 3: Valores a Pagar */}
        <div
          onClick={() => navigateToTabWithFilter('cartoes')}
          className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none cursor-pointer hover:border-[#fb977d] dark:hover:border-[#fb977d] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac]">
              Valores a Pagar
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#fb977d]/15 text-[#fb977d] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#d5745b] dark:text-[#fb977d] tabular-nums">
            {formatBRL(totalAPagar)}
          </div>
          <div className="mt-2 space-y-1 text-xs text-[#707a82] dark:text-[#7c8fac]">
            <div className="flex justify-between">
              <span>Diárias pendentes:</span>
              <span className="font-semibold text-[#111c2d] dark:text-white tabular-nums">
                {formatBRL(totalMaoDeObraPendente)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Faturas / Parcelas:</span>
              <span className="font-semibold text-[#111c2d] dark:text-white tabular-nums">
                {formatBRL(totalAPagar - totalMaoDeObraPendente)}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Produção Própria */}
        <div
          onClick={() => navigateToTabWithFilter('producao')}
          className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none cursor-pointer hover:border-[#8763da] dark:hover:border-[#8763da] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac]">
              Produção no Canteiro
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#8763da]/15 text-[#8763da] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Hammer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111c2d] dark:text-white tabular-nums">
            {totalTrilhosProduzidos} <span className="text-sm font-normal text-[#707a82]">trilhos</span>
          </div>
          <div className="mt-2 space-y-1 text-xs text-[#707a82] dark:text-[#7c8fac]">
            <div className="flex justify-between">
              <span>Placas concretadas:</span>
              <span className="font-semibold text-[#111c2d] dark:text-white tabular-nums">
                {totalPlacasProduzidas} un
              </span>
            </div>
            <div className="flex justify-between">
              <span>Custo indicativo/trilho:</span>
              <span className="font-bold text-[#8763da] tabular-nums">
                {formatBRL(custoIndicativoTrilho)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Category Breakdown & Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Distribution by Category as in the Sheet */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#111c2d] dark:text-white">
                Distribuição de Custos da Obra
              </h2>
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                Valores calculados da planilha da Obra Juscelino Mola (R$ 28.795,62)
              </p>
            </div>
            <button
              onClick={() => navigateToTabWithFilter('despesas')}
              className="text-xs font-semibold text-[#0085db] hover:underline cursor-pointer"
            >
              Ver detalhamento
            </button>
          </div>

          {/* Spike proportional horizontal bar */}
          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-[#f0f5f9] dark:bg-[#15263a] mb-6">
            <div
              className="bg-[#0085db] hover:opacity-90 transition-opacity"
              style={{ width: `${pctMateriais}%` }}
              title={`Materiais: ${pctMateriais}%`}
            />
            <div
              className="bg-[#4bd08b] hover:opacity-90 transition-opacity"
              style={{ width: `${pctMaoDeObra}%` }}
              title={`Mão de Obra: ${pctMaoDeObra}%`}
            />
            <div
              className="bg-[#8763da] hover:opacity-90 transition-opacity"
              style={{ width: `${pctTrilhos}%` }}
              title={`Trilhos: ${pctTrilhos}%`}
            />
            <div
              className="bg-[#46caeb] hover:opacity-90 transition-opacity"
              style={{ width: `${pctAbastecimentos}%` }}
              title={`Abastecimentos: ${pctAbastecimentos}%`}
            />
          </div>

          {/* Category detail rows with drilldown handlers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Materiais da obra */}
            <div
              onClick={() => navigateToTabWithFilter('despesas', 'materiais')}
              className="p-4 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#0085db] dark:hover:border-[#0085db] cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#0085db] shrink-0" />
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white">
                    Materiais da Obra
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac] tabular-nums">
                  {pctMateriais}%
                </span>
              </div>
              <div className="mt-2 text-lg font-black text-[#111c2d] dark:text-white tabular-nums">
                {formatBRL(totaisPorCategoria.materiais)}
              </div>
              <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                Cimento, areia, brita, ferro e alvenaria
              </p>
            </div>

            {/* Mão de Obra */}
            <div
              onClick={() => navigateToTabWithFilter('maodeobra')}
              className="p-4 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#4bd08b] dark:hover:border-[#4bd08b] cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#4bd08b] shrink-0" />
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white">
                    Mão de Obra
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac] tabular-nums">
                  {pctMaoDeObra}%
                </span>
              </div>
              <div className="mt-2 text-lg font-black text-[#111c2d] dark:text-white tabular-nums">
                {formatBRL(totaisPorCategoria.mao_de_obra)}
              </div>
              <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                Diárias pagas ({formatBRL(totalMaoDeObraPaga)}) e a pagar
              </p>
            </div>

            {/* Material para trilhos */}
            <div
              onClick={() => navigateToTabWithFilter('despesas', 'trilhos_producao')}
              className="p-4 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#8763da] dark:hover:border-[#8763da] cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#8763da] shrink-0" />
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white">
                    Produção de Trilhos
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac] tabular-nums">
                  {pctTrilhos}%
                </span>
              </div>
              <div className="mt-2 text-lg font-black text-[#111c2d] dark:text-white tabular-nums">
                {formatBRL(totaisPorCategoria.trilhos_producao)}
              </div>
              <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                Treliças metálicas H8 e formas
              </p>
            </div>

            {/* Abastecimentos */}
            <div
              onClick={() => navigateToTabWithFilter('despesas', 'abastecimentos')}
              className="p-4 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#46caeb] dark:hover:border-[#46caeb] cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#46caeb] shrink-0" />
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white">
                    Abastecimentos
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac] tabular-nums">
                  {pctAbastecimentos}%
                </span>
              </div>
              <div className="mt-2 text-lg font-black text-[#111c2d] dark:text-white tabular-nums">
                {formatBRL(totaisPorCategoria.abastecimentos)}
              </div>
              <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                Combustível frete e transporte
              </p>
            </div>

          </div>
        </div>

        {/* Right Col: Etapas Progress & Orçamentos */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#111c2d] dark:text-white">
                Etapas Construtivas
              </h3>
              <span className="text-xs text-[#707a82] dark:text-[#7c8fac] font-medium">
                11 Etapas
              </span>
            </div>

            <div className="space-y-2.5">
              {etapas.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535]">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                        e.status === 'concluida'
                          ? 'bg-[#4bd08b]/15 text-[#4bd08b]'
                          : e.status === 'em_andamento'
                          ? 'bg-[#0085db]/15 text-[#0085db]'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {e.numero}
                    </span>
                    <span className="font-semibold text-[#111c2d] dark:text-white">
                      {e.nome}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold capitalize ${
                      e.status === 'concluida'
                        ? 'text-[#4bd08b]'
                        : e.status === 'em_andamento'
                        ? 'text-[#0085db]'
                        : 'text-[#707a82]'
                    }`}
                  >
                    {e.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick quote comparator highlight */}
          <div className="mt-6 pt-4 border-t border-[#e6ecf1] dark:border-[#333f55]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              <Scale className="w-4 h-4 text-[#0085db]" />
              <span>Comparador de Preços</span>
            </div>
            <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mb-3">
              Cotações registradas entre lojas de cimento (menor R$ 32,50/saco).
            </p>
            <button
              onClick={() => navigateToTabWithFilter('orcamentos')}
              className="w-full py-2.5 rounded-xl bg-[#0085db]/10 hover:bg-[#0085db]/20 text-xs font-bold text-[#0085db] transition-colors cursor-pointer"
            >
              Comparar Orçamentos
            </button>
          </div>
        </div>

      </div>

      {/* Recent Activity Split: Despesas & Diárias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latest Expenses */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55] mb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#0085db]" />
              <h3 className="text-sm font-bold text-[#111c2d] dark:text-white">
                Últimas Compras & Notas
              </h3>
            </div>
            <button
              onClick={() => navigateToTabWithFilter('despesas')}
              className="text-xs font-semibold text-[#0085db] hover:underline cursor-pointer"
            >
              Ver todas ({despesas.length})
            </button>
          </div>

          <div className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
            {recentDespesas.map(d => (
              <div
                key={d.id}
                onClick={() => navigateToTabWithFilter('despesas', d.id)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl px-2.5 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#111c2d] dark:text-white truncate">
                    {d.descricao}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                    <span>{d.fornecedorNome}</span>
                    <span>·</span>
                    <span>{formatDateBR(d.data)}</span>
                    {d.statusConferencia === 'diferenca_rateio' && (
                      <span className="text-[#fb977d] font-bold">Rateio pendente</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[#111c2d] dark:text-white tabular-nums">
                    {formatBRL(d.valorTotalNota)}
                  </span>
                  <span className="block text-[10px] text-[#707a82] capitalize">
                    {d.formaPagamento.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Diárias */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55] mb-3">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-[#4bd08b]" />
              <h3 className="text-sm font-bold text-[#111c2d] dark:text-white">
                Diárias Recentes de Mão de Obra
              </h3>
            </div>
            <button
              onClick={() => navigateToTabWithFilter('maodeobra')}
              className="text-xs font-semibold text-[#0085db] hover:underline cursor-pointer"
            >
              Ver todas ({diarias.length})
            </button>
          </div>

          <div className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
            {recentDiarias.map(dia => (
              <div
                key={dia.id}
                onClick={() => navigateToTabWithFilter('maodeobra')}
                className="py-3 flex items-center justify-between gap-3 hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl px-2.5 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#111c2d] dark:text-white truncate">
                      {dia.trabalhadorNome}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        dia.statusPagamento === 'pago'
                          ? 'bg-[#4bd08b]/15 text-[#4bd08b]'
                          : 'bg-[#f8c076]/20 text-[#d9941a] dark:text-[#f8c076]'
                      }`}
                    >
                      {dia.statusPagamento === 'pago' ? 'Pago' : 'A Pagar'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                    <span>{formatDateBR(dia.data)}</span>
                    <span>·</span>
                    <span>{dia.fracao === 1 ? 'Integral' : `${dia.fracao} diária`}</span>
                    {dia.valorAdicional > 0 && (
                      <span className="text-[#0085db] font-semibold">+ Adicional</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[#111c2d] dark:text-white tabular-nums">
                    {formatBRL(dia.valorTotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

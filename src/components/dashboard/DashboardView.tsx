import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/currency';
import { formatDateBR } from '../../utils/date';
import {
  TrendingUp,
  Users2,
  Hammer,
  CreditCard,
  Receipt,
  PlusCircle,
  FileCheck2,
  Calendar,
  Building,
  Scale,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  X,
  ChevronRight,
  Layers,
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

  const [showModalCategorias, setShowModalCategorias] = useState(false);
  const [showModalSemanas, setShowModalSemanas] = useState(false);

  const etapaAtual = etapas.find(e => e.id === activeObra.etapaAtualId) || etapas[1];

  const pctMateriais = totalGeralObra > 0 ? ((totaisPorCategoria.materiais / totalGeralObra) * 100).toFixed(1) : '0';
  const pctMaoDeObra = totalGeralObra > 0 ? ((totaisPorCategoria.mao_de_obra / totalGeralObra) * 100).toFixed(1) : '0';
  const pctTrilhos = totalGeralObra > 0 ? ((totaisPorCategoria.trilhos_producao / totalGeralObra) * 100).toFixed(1) : '0';
  const pctAbastecimentos = totalGeralObra > 0 ? ((totaisPorCategoria.abastecimentos / totalGeralObra) * 100).toFixed(1) : '0';

  const tetoMaoDeObra = activeObra.tetoMaoDeObra || 32000;
  const pctTetoConsumido = Math.min(100, (totalMaoDeObra / tetoMaoDeObra) * 100).toFixed(1);

  const recentDespesas = [...despesas].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 4);
  const recentDiarias = [...diarias].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 4);

  // Agrupamento de diárias por semana construtiva para o modal Stitch
  const diariasPorSemana = diarias.reduce((acc, d) => {
    const sem = d.semanaNumero || 1;
    if (!acc[sem]) {
      acc[sem] = { semana: sem, total: 0, count: 0, pagas: 0, pendentes: 0 };
    }
    acc[sem].total += d.valorTotal;
    acc[sem].count += 1;
    if (d.statusPagamento === 'pago') acc[sem].pagas += d.valorTotal;
    else acc[sem].pendentes += d.valorTotal;
    return acc;
  }, {} as Record<number, { semana: number; total: number; count: number; pagas: number; pendentes: number }>);

  const listaSemanas = Object.values(diariasPorSemana).sort((a, b) => a.semana - b.semana);

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Banner de Alerta Stitch Oficial (caso haja pendências ou diferenças de rateio) */}
      {alertas.length > 0 && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[18px] bg-[#d9941a]/10 border border-[#d9941a]/30 text-[#111c2d] dark:text-white"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#d9941a]/20 text-[#d9941a] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111c2d] dark:text-white flex items-center gap-2">
                <span>{alertas.length} pendências aguardando conferência ou preenchimento</span>
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#d5745b] text-white">
                  {alertas.length}
                </span>
              </h4>
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                {alertas[0]?.mensagem || 'Verifique notas com diferença de rateio ou pendências na obra.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigateToTabWithFilter('alertas')}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-[#0085db] hover:bg-[#0071ba] active:scale-95 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            Ver Todas as Pendências
          </button>
        </div>
      )}

      {/* Top Banner: Card de Ação Stitch Oficial */}
      <article className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#707a82] dark:text-[#7c8fac] flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0085db]/10 text-[#0085db] font-bold text-[11px]">
                <Building className="w-3.5 h-3.5" />
                {activeObra.nome}
              </span>
              <span>•</span>
              <span>Início {formatDateBR(activeObra.dataInicio)}</span>
              <span>•</span>
              {activeObra.status === 'concluida' ? (
                <span className="text-[#10bd9d] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10bd9d]" />
                  Concluída
                </span>
              ) : activeObra.status === 'cancelada' ? (
                <span className="text-[#d5745b] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#d5745b]" />
                  Cancelada
                </span>
              ) : (
                <span className="text-[#10bd9d] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10bd9d]" />
                  Em andamento
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111c2d] dark:text-white mt-2">
              Painel Geral de Obras
            </h1>
            <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
              Etapa em execução: <strong className="text-[#111c2d] dark:text-white">{activeObra.etapaAtual || `${etapaAtual.numero} — ${etapaAtual.nome}`}</strong>. Controle de notas, diárias semanais e trilhos fabricados.
            </p>
          </div>

          {/* Botões de Ação do Design System Stitch */}
          <footer className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            <button
              type="button"
              onClick={() => navigateToTabWithFilter('despesas', 'nova')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0085db] hover:bg-[#0071ba] active:scale-95 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Despesa</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToTabWithFilter('maodeobra', 'nova')}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#e6ecf1] dark:hover:bg-[#202f43] font-semibold text-xs active:scale-95 transition-all cursor-pointer"
            >
              <Users2 className="w-4 h-4 text-[#0085db]" />
              <span>Lançar Diária</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToTabWithFilter('recibos')}
              className="hidden sm:flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#e6ecf1] dark:hover:bg-[#202f43] font-semibold text-xs active:scale-95 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-[#10bd9d]" />
              <span>Emitir Recibo</span>
            </button>
          </footer>
        </div>
      </article>

      {/* 4 Cards de KPI com Estética Stitch Oficial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Gasto */}
        <article
          onClick={() => navigateToTabWithFilter('despesas')}
          className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none hover:border-[#0085db] dark:hover:border-[#0085db] transition-all cursor-pointer group"
        >
          <header className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac]">
              Total Gasto na Obra
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </header>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111c2d] dark:text-white tabular-nums">
            {formatBRL(totalGeralObra)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#707a82] dark:text-[#7c8fac]">
            <span>Orçamento ref:</span>
            <span className="font-semibold text-[#111c2d] dark:text-white tabular-nums">
              {formatBRL(activeObra.orcamentoTotal)}
            </span>
          </div>
          <div className="mt-3 w-full bg-[#f0f5f9] dark:bg-[#15263a] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#0085db] h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (totalGeralObra / (activeObra.orcamentoTotal || 1)) * 100)}%` }}
            />
          </div>
        </article>

        {/* KPI 2: Mão de Obra e Teto R$ 32k */}
        <article
          onClick={() => navigateToTabWithFilter('maodeobra')}
          className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none hover:border-[#10bd9d] dark:hover:border-[#10bd9d] transition-all cursor-pointer group"
        >
          <header className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac]">
              Mão de Obra (Teto R$ 32k)
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#10bd9d]/15 text-[#10bd9d] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users2 className="w-5 h-5" />
            </div>
          </header>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111c2d] dark:text-white tabular-nums">
            {formatBRL(totalMaoDeObra)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#707a82] dark:text-[#7c8fac]">Saldo restante:</span>
            <span className="font-bold text-[#10bd9d] tabular-nums">
              {formatBRL(saldoTetoMaoDeObra)}
            </span>
          </div>
          <div className="mt-3 w-full bg-[#f0f5f9] dark:bg-[#15263a] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#10bd9d] h-1.5 rounded-full"
              style={{ width: `${pctTetoConsumido}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-[#707a82] dark:text-[#7c8fac] text-right tabular-nums">
            {pctTetoConsumido}% do teto fechado
          </p>
        </article>

        {/* KPI 3: Valores a Pagar */}
        <article
          onClick={() => navigateToTabWithFilter('cartoes')}
          className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none hover:border-[#d5745b] dark:hover:border-[#d5745b] transition-all cursor-pointer group"
        >
          <header className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac]">
              Valores a Pagar
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#d5745b]/15 text-[#d5745b] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </header>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#d5745b] tabular-nums">
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
                {formatBRL(Math.max(0, totalAPagar - totalMaoDeObraPendente))}
              </span>
            </div>
          </div>
        </article>

        {/* KPI 4: Produção no Canteiro */}
        <article
          onClick={() => navigateToTabWithFilter('producao')}
          className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none hover:border-[#8763da] dark:hover:border-[#8763da] transition-all cursor-pointer group"
        >
          <header className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac]">
              Produção no Canteiro
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#8763da]/15 text-[#8763da] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Hammer className="w-5 h-5" />
            </div>
          </header>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0085db] tabular-nums">
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
        </article>

      </div>

      {/* Seção de Distribuição de Custos com Acesso aos Modais Stitch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Distribuição por Categoria */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#111c2d] dark:text-white">
                Distribuição de Custos da Obra
              </h2>
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                Valores calculados da obra ativa ({formatBRL(totalGeralObra)})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowModalCategorias(true)}
                className="text-xs font-bold text-[#0085db] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Todas as Categorias</span>
              </button>
              <button
                type="button"
                onClick={() => setShowModalSemanas(true)}
                className="text-xs font-bold text-[#10bd9d] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Todas as Semanas</span>
              </button>
            </div>
          </div>

          {/* Barra proporcional horizontal */}
          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-[#f0f5f9] dark:bg-[#15263a] mb-6">
            <div
              className="bg-[#0085db] hover:opacity-90 transition-opacity"
              style={{ width: `${pctMateriais}%` }}
              title={`Materiais: ${pctMateriais}%`}
            />
            <div
              className="bg-[#10bd9d] hover:opacity-90 transition-opacity"
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

          {/* Grid de categorias interativas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Materiais */}
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
              className="p-4 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#10bd9d] dark:hover:border-[#10bd9d] cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10bd9d] shrink-0" />
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

            {/* Produção de Trilhos */}
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

        {/* Coluna Direita: Etapas Construtivas */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#111c2d] dark:text-white">
                Etapas Construtivas
              </h3>
              <span className="text-xs text-[#707a82] dark:text-[#7c8fac] font-medium">
                {etapas.length} Etapas
              </span>
            </div>

            <div className="space-y-2.5">
              {etapas.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535]">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                        e.status === 'concluida'
                          ? 'bg-[#10bd9d]/15 text-[#10bd9d]'
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
                        ? 'text-[#10bd9d]'
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

          {/* Destaque do Comparador de Preços */}
          <div className="mt-6 pt-4 border-t border-[#e6ecf1] dark:border-[#333f55]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              <Scale className="w-4 h-4 text-[#0085db]" />
              <span>Comparador de Preços</span>
            </div>
            <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mb-3">
              Cotações registradas e propostas comerciais entre lojas.
            </p>
            <button
              type="button"
              onClick={() => navigateToTabWithFilter('orcamentos')}
              className="w-full py-2.5 rounded-xl bg-[#0085db]/10 hover:bg-[#0085db]/20 text-xs font-bold text-[#0085db] transition-colors cursor-pointer"
            >
              Comparar Orçamentos
            </button>
          </div>
        </div>

      </div>

      {/* Atividades Recentes: Despesas & Diárias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Últimas Despesas */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#0085db]" />
                <h3 className="text-sm font-bold text-[#111c2d] dark:text-white">
                  Últimas Compras & Notas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigateToTabWithFilter('despesas')}
                className="text-xs font-semibold text-[#0085db] hover:underline cursor-pointer"
              >
                Ver todas ({despesas.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {recentDespesas.map(d => (
                <div
                  key={d.id}
                  onClick={() => navigateToTabWithFilter('despesas', d.id)}
                  className="p-3 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#0085db] dark:hover:border-[#0085db] cursor-pointer transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#111c2d] dark:text-white truncate">
                        {d.descricao}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                        <span>{d.fornecedorNome}</span>
                        <span>·</span>
                        <span>{formatDateBR(d.data)}</span>
                        {d.statusConferencia === 'diferenca_rateio' && (
                          <span className="text-[#d5745b] font-bold">Rateio pendente</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(d.valorTotalNota)}
                    </span>
                    <span className="block text-[10px] text-[#707a82] dark:text-[#7c8fac] capitalize">
                      {d.formaPagamento.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diárias Recentes */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-[#10bd9d]" />
                <h3 className="text-sm font-bold text-[#111c2d] dark:text-white">
                  Diárias Recentes de Mão de Obra
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigateToTabWithFilter('maodeobra')}
                className="text-xs font-semibold text-[#0085db] hover:underline cursor-pointer"
              >
                Ver todas ({diarias.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {recentDiarias.map(dia => (
                <div
                  key={dia.id}
                  onClick={() => navigateToTabWithFilter('maodeobra')}
                  className="p-3 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#10bd9d] dark:hover:border-[#10bd9d] cursor-pointer transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#10bd9d]/15 text-[#10bd9d] flex items-center justify-center shrink-0">
                      <Users2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#111c2d] dark:text-white truncate">
                          {dia.trabalhadorNome}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dia.statusPagamento === 'pago'
                              ? 'bg-[#10bd9d]/15 text-[#10bd9d] border border-[#10bd9d]/25'
                              : 'bg-[#d9941a]/15 text-[#d9941a] border border-[#d9941a]/30'
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
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(dia.valorTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: Todas as Categorias de Custo (Design do Stitch) */}
      {showModalCategorias && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] max-w-2xl w-full p-6 shadow-[0px_10px_25px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between pb-4 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111c2d] dark:text-white">
                    Todas as Categorias de Custo
                  </h3>
                  <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                    Consolidação completa das despesas da obra por centro de custo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModalCategorias(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f0f5f9] dark:hover:bg-[#15263a] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* Item Materiais */}
              <div
                onClick={() => {
                  setShowModalCategorias(false);
                  navigateToTabWithFilter('despesas', 'materiais');
                }}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#0085db] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0085db]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#111c2d] dark:text-white">Materiais da Obra</h4>
                    <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">Cimento, areia, brita, ferro e agregados</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#111c2d] dark:text-white tabular-nums">
                    {formatBRL(totaisPorCategoria.materiais)}
                  </span>
                  <span className="block text-[11px] text-[#707a82] dark:text-[#7c8fac]">{pctMateriais}%</span>
                </div>
              </div>

              {/* Item Mão de Obra */}
              <div
                onClick={() => {
                  setShowModalCategorias(false);
                  navigateToTabWithFilter('maodeobra');
                }}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#10bd9d] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#10bd9d]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#111c2d] dark:text-white">Mão de Obra & Diárias</h4>
                    <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">Diárias da equipe e bônus</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#111c2d] dark:text-white tabular-nums">
                    {formatBRL(totaisPorCategoria.mao_de_obra)}
                  </span>
                  <span className="block text-[11px] text-[#707a82] dark:text-[#7c8fac]">{pctMaoDeObra}%</span>
                </div>
              </div>

              {/* Item Trilhos */}
              <div
                onClick={() => {
                  setShowModalCategorias(false);
                  navigateToTabWithFilter('despesas', 'trilhos_producao');
                }}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#8763da] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#8763da]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#111c2d] dark:text-white">Produção de Trilhos e Formas</h4>
                    <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">Treliças H8 e insumos de fabricação</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#111c2d] dark:text-white tabular-nums">
                    {formatBRL(totaisPorCategoria.trilhos_producao)}
                  </span>
                  <span className="block text-[11px] text-[#707a82] dark:text-[#7c8fac]">{pctTrilhos}%</span>
                </div>
              </div>

              {/* Item Abastecimentos */}
              <div
                onClick={() => {
                  setShowModalCategorias(false);
                  navigateToTabWithFilter('despesas', 'abastecimentos');
                }}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#46caeb] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#46caeb]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#111c2d] dark:text-white">Abastecimentos e Fretes</h4>
                    <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">Combustível dos caminhões e transporte</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#111c2d] dark:text-white tabular-nums">
                    {formatBRL(totaisPorCategoria.abastecimentos)}
                  </span>
                  <span className="block text-[11px] text-[#707a82] dark:text-[#7c8fac]">{pctAbastecimentos}%</span>
                </div>
              </div>

              {/* Outros / Ferramentas */}
              <div
                onClick={() => {
                  setShowModalCategorias(false);
                  navigateToTabWithFilter('despesas', 'outros');
                }}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#707a82] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#707a82]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#111c2d] dark:text-white">Ferramentas & Despesas Gerais</h4>
                    <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">EPIs, discos de corte e pequenos reparos</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#111c2d] dark:text-white tabular-nums">
                    {formatBRL(totaisPorCategoria.outros || 0)}
                  </span>
                </div>
              </div>

            </div>

            <div className="mt-5 pt-4 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#707a82]">Total Consolidado da Obra:</span>
              <span className="text-base font-extrabold text-[#111c2d] dark:text-white tabular-nums">
                {formatBRL(totalGeralObra)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Todas as Semanas da Obra (Design do Stitch) */}
      {showModalSemanas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] max-w-2xl w-full p-6 shadow-[0px_10px_25px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between pb-4 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#10bd9d]/15 text-[#10bd9d] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111c2d] dark:text-white">
                    Todas as Semanas da Obra
                  </h3>
                  <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                    Distribuição temporal dos fechamentos semanais de diárias e equipe
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModalSemanas(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f0f5f9] dark:hover:bg-[#15263a] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {listaSemanas.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#707a82]">
                  Nenhuma diária semanal lançada até o momento.
                </div>
              ) : (
                listaSemanas.map(sem => (
                  <div
                    key={sem.semana}
                    onClick={() => {
                      setShowModalSemanas(false);
                      navigateToTabWithFilter('maodeobra');
                    }}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#10bd9d] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#10bd9d]/15 text-[#10bd9d] font-extrabold text-xs flex items-center justify-center">
                        S{sem.semana}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#111c2d] dark:text-white">
                          Semana {sem.semana}
                        </h4>
                        <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">
                          {sem.count} diárias registradas ({formatBRL(sem.pagas)} pagas / {formatBRL(sem.pendentes)} a pagar)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#111c2d] dark:text-white tabular-nums">
                        {formatBRL(sem.total)}
                      </span>
                      <span className="block text-[10px] text-[#10bd9d] font-semibold">Ver Diárias →</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#707a82]">Total de Mão de Obra Lançada:</span>
              <span className="text-base font-extrabold text-[#111c2d] dark:text-white tabular-nums">
                {formatBRL(totalMaoDeObra)}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

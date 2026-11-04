import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Trabalhador, Diaria } from '../../types';
import { formatBRL } from '../../utils/currency';
import { formatDateBR, getTodayISO, getWeekRange, getDayOfWeekName } from '../../utils/date';
import { Modal } from '../common/Modal';
import {
  Users2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  CheckCheck,
  FileCheck2,
  Calendar,
  UserPlus,
  Trash2,
} from 'lucide-react';

export const MaoDeObraView: React.FC = () => {
  const {
    trabalhadores,
    diarias,
    addTrabalhador,
    addDiaria,
    deleteDiaria,
    marcarDiariasPagas,
    activeObra,
    etapas,
    activeUser,
    navigateToTabWithFilter,
    tabFilter,
  } = useApp();

  const [selectedTrabId, setSelectedTrabId] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'pago'>('todos');
  const [isDiariaModalOpen, setIsDiariaModalOpen] = useState(tabFilter === 'nova');
  const [isTrabModalOpen, setIsTrabModalOpen] = useState(false);

  // Form for new Diaria
  const [trabalhadorId, setTrabalhadorId] = useState(trabalhadores[0]?.id || '');
  const [data, setData] = useState(getTodayISO());
  const [fracao, setFracao] = useState<number>(1.0);
  const [valorDiariaBase, setValorDiariaBase] = useState<number>(trabalhadores[0]?.valorDiariaPadrao || 180);
  const [valorAdicional, setValorAdicional] = useState<string>('0');
  const [descricaoAdicional, setDescricaoAdicional] = useState('');
  const [justificativaAjuste, setJustificativaAjuste] = useState('');
  const [etapaId, setEtapaId] = useState(activeObra.etapaAtualId || 'etapa-2');
  const [statusPagamento, setStatusPagamento] = useState<'pendente' | 'pago'>('pendente');

  // Form for Worker modal
  const [trabNome, setTrabNome] = useState('');
  const [trabFuncao, setTrabFuncao] = useState('Pedreiro');
  const [trabCpf, setTrabCpf] = useState('');
  const [trabTelefone, setTrabTelefone] = useState('');
  const [trabChavePix, setTrabChavePix] = useState('');
  const [trabValorDiaria, setTrabValorDiaria] = useState(180);

  const handleSelectWorker = (id: string) => {
    setTrabalhadorId(id);
    const trab = trabalhadores.find(t => t.id === id);
    if (trab) {
      setValorDiariaBase(trab.valorDiariaPadrao);
    }
  };

  const groupedWeeks = useMemo(() => {
    const weeksMap: Record<
      string,
      {
        weekLabel: string;
        segunda: string;
        domingo: string;
        numeroSemana: number;
        diarias: Diaria[];
        totalPago: number;
        totalPendente: number;
        totalGeral: number;
      }
    > = {};

    diarias.forEach(d => {
      const range = getWeekRange(d.data);
      const key = `${range.segunda}_${range.domingo}`;

      if (!weeksMap[key]) {
        weeksMap[key] = {
          weekLabel: range.label,
          segunda: range.segunda,
          domingo: range.domingo,
          numeroSemana: range.numeroSemana,
          diarias: [],
          totalPago: 0,
          totalPendente: 0,
          totalGeral: 0,
        };
      }

      weeksMap[key].diarias.push(d);
      if (d.statusPagamento === 'pago') {
        weeksMap[key].totalPago += d.valorTotal;
      } else {
        weeksMap[key].totalPendente += d.valorTotal;
      }
      weeksMap[key].totalGeral += d.valorTotal;
    });

    return Object.values(weeksMap).sort((a, b) => b.segunda.localeCompare(a.segunda));
  }, [diarias]);

  const totalMaoDeObra = diarias.reduce((sum, d) => sum + d.valorTotal, 0);
  const totalPagas = diarias.filter(d => d.statusPagamento === 'pago').reduce((sum, d) => sum + d.valorTotal, 0);
  const totalPendentes = diarias.filter(d => d.statusPagamento === 'pendente').reduce((sum, d) => sum + d.valorTotal, 0);
  const teto = activeObra.tetoMaoDeObra || 32000;
  const saldoTeto = teto - totalMaoDeObra;

  const handleSaveDiaria = (e: React.FormEvent) => {
    e.preventDefault();
    const trab = trabalhadores.find(t => t.id === trabalhadorId);
    if (!trab) return;

    const adicional = parseFloat(valorAdicional) || 0;
    const calculado = Number((fracao * valorDiariaBase).toFixed(2));
    const total = Number((calculado + adicional).toFixed(2));

    addDiaria({
      obraId: activeObra.id,
      trabalhadorId: trab.id,
      trabalhadorNome: trab.nome,
      data,
      fracao,
      valorDiariaBase,
      valorCalculado: calculado,
      valorAdicional: adicional,
      descricaoAdicional: adicional > 0 ? descricaoAdicional : undefined,
      justificativaAjuste: justificativaAjuste.trim() || undefined,
      valorTotal: total,
      etapaId,
      statusPagamento,
      dataPagamento: statusPagamento === 'pago' ? getTodayISO() : undefined,
      criadoPor: activeUser.nome,
    });

    setIsDiariaModalOpen(false);
    setValorAdicional('0');
    setDescricaoAdicional('');
    setJustificativaAjuste('');
  };

  const handleSaveTrab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trabNome.trim()) return;

    addTrabalhador({
      nome: trabNome.trim(),
      funcao: trabFuncao,
      cpf: trabCpf.trim() || undefined,
      telefone: trabTelefone.trim() || undefined,
      chavePix: trabChavePix.trim() || undefined,
      valorDiariaPadrao: trabValorDiaria || 150,
      ativo: true,
    });

    setIsTrabModalOpen(false);
    setTrabNome('');
    setTrabCpf('');
    setTrabTelefone('');
    setTrabChavePix('');
  };

  const handleExecutePagarSemana = (trabalhadorTargetId: string, weekDiarias: Diaria[]) => {
    const pendentes = weekDiarias
      .filter(d => d.trabalhadorId === trabalhadorTargetId && d.statusPagamento === 'pendente')
      .map(d => d.id);

    if (pendentes.length === 0) {
      alert('Não há diárias pendentes para este trabalhador nesta semana.');
      return;
    }

    marcarDiariasPagas(pendentes);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
            Mão de Obra & Diárias
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Acompanhamento semanal de segunda a domingo, serviços adicionais justificados e teto de R$ 32.000,00.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsTrabModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#0085db]" />
            <span>Novo Trabalhador</span>
          </button>
          <button
            onClick={() => setIsDiariaModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Diária</span>
          </button>
        </div>
      </div>

      {/* Ceiling Tracker Bar (R$ 32.000,00) */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ecf1] dark:border-[#333f55]">
          <div>
            <span className="text-xs font-bold text-[#0085db] uppercase tracking-wider">
              Controle do Teto Fechado de Mão de Obra
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#111c2d] dark:text-white tabular-nums">
                {formatBRL(totalMaoDeObra)}
              </span>
              <span className="text-xs text-[#707a82]">
                de <strong className="text-[#111c2d] dark:text-white tabular-nums">{formatBRL(teto)}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[#707a82] block text-[11px]">Total Pago</span>
              <span className="font-bold text-[#4bd08b] text-sm tabular-nums">
                {formatBRL(totalPagas)}
              </span>
            </div>
            <div className="border-l border-[#e6ecf1] dark:border-[#333f55] pl-4">
              <span className="text-[#707a82] block text-[11px]">A Pagar (Pendente)</span>
              <span className="font-bold text-[#f8c076] text-sm tabular-nums">
                {formatBRL(totalPendentes)}
              </span>
            </div>
            <div className="border-l border-[#e6ecf1] dark:border-[#333f55] pl-4">
              <span className="text-[#707a82] block text-[11px]">Saldo Disponível</span>
              <span className="font-bold text-[#111c2d] dark:text-white text-sm tabular-nums">
                {formatBRL(saldoTeto)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-[#f0f5f9] dark:bg-[#15263a] rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-[#4bd08b] h-3"
              style={{ width: `${Math.min(100, (totalPagas / teto) * 100)}%` }}
              title={`Pago: ${formatBRL(totalPagas)}`}
            />
            <div
              className="bg-[#f8c076] h-3"
              style={{ width: `${Math.min(100, (totalPendentes / teto) * 100)}%` }}
              title={`A Pagar: ${formatBRL(totalPendentes)}`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-2">
            <span>{((totalMaoDeObra / teto) * 100).toFixed(1)}% consumido do teto fechado</span>
            <span className="font-bold text-[#4bd08b]">
              Restam {formatBRL(saldoTeto)} para conclusão
            </span>
          </div>
        </div>
      </div>

      {/* Workers Filter & Status Filter Bar */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-4 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedTrabId}
            onChange={e => setSelectedTrabId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold"
          >
            <option value="todos">Todos os Trabalhadores ({trabalhadores.length})</option>
            {trabalhadores.map(t => (
              <option key={t.id} value={t.id}>
                {t.nome} ({t.funcao} · {formatBRL(t.valorDiariaPadrao)})
              </option>
            ))}
          </select>

          <div className="flex items-center p-1 bg-[#f0f5f9] dark:bg-[#15263a] rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold shadow-xs'
                  : 'text-[#707a82]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('pendente')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'pendente'
                  ? 'bg-white dark:bg-[#111c2d] text-[#d9941a] dark:text-[#f8c076] font-bold shadow-xs'
                  : 'text-[#707a82]'
              }`}
            >
              A Pagar
            </button>
            <button
              onClick={() => setStatusFilter('pago')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'pago'
                  ? 'bg-white dark:bg-[#111c2d] text-[#4bd08b] font-bold shadow-xs'
                  : 'text-[#707a82]'
              }`}
            >
              Pagos
            </button>
          </div>
        </div>

        <button
          onClick={() => navigateToTabWithFilter('recibos')}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0085db] bg-[#0085db]/10 border border-[#0085db]/20 rounded-xl hover:bg-[#0085db]/20 transition-colors cursor-pointer"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Ir para Gerador de Recibos</span>
        </button>
      </div>

      {/* Weekly Accordions / Groups */}
      <div className="space-y-6">
        {groupedWeeks.map(week => {
          const weekFilteredDiarias = week.diarias.filter(d => {
            const matchTrab = selectedTrabId === 'todos' || d.trabalhadorId === selectedTrabId;
            const matchStatus = statusFilter === 'todos' || d.statusPagamento === statusFilter;
            return matchTrab && matchStatus;
          });

          if (weekFilteredDiarias.length === 0) return null;

          const workersWithPending = Array.from(
            new Set(
              week.diarias
                .filter(d => d.statusPagamento === 'pendente')
                .map(d => d.trabalhadorId)
            )
          );

          return (
            <div
              key={`${week.segunda}_${week.domingo}`}
              className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none space-y-4"
            >
              {/* Week Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#0085db]" />
                    <h2 className="text-sm sm:text-base font-bold text-[#111c2d] dark:text-white">
                      Semana: {week.weekLabel}
                    </h2>
                  </div>
                  <p className="text-xs text-[#707a82] mt-0.5">
                    Segunda a Domingo · {weekFilteredDiarias.length} diárias registradas
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-right text-xs">
                    <span className="text-[#707a82] block text-[10px]">Total da Semana</span>
                    <span className="text-sm font-black text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(weekFilteredDiarias.reduce((sum, d) => sum + d.valorTotal, 0))}
                    </span>
                  </div>

                  {/* "Pagar Semana" Batch Action */}
                  {workersWithPending.length > 0 && (
                    <div className="flex items-center gap-2">
                      {workersWithPending.map(wId => {
                        const trab = trabalhadores.find(t => t.id === wId);
                        const trabPendingTotal = week.diarias
                          .filter(d => d.trabalhadorId === wId && d.statusPagamento === 'pendente')
                          .reduce((sum, d) => sum + d.valorTotal, 0);

                        return (
                          <button
                            key={wId}
                            onClick={() => {
                              if (confirm(`Confirmar pagamento da semana para ${trab?.nome} no valor de ${formatBRL(trabPendingTotal)}?`)) {
                                handleExecutePagarSemana(wId, week.diarias);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#4bd08b] hover:bg-[#10bd9d] rounded-xl shadow-xs transition-colors cursor-pointer"
                            title={`Marcar diárias pendentes de ${trab?.nome} como pagas`}
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Pagar: {trab?.nome.split(' ')[0]} ({formatBRL(trabPendingTotal)})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Day by Day Log Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] font-bold text-[11px] uppercase tracking-wider">
                      <th className="pb-3">Data / Dia</th>
                      <th className="pb-3">Trabalhador</th>
                      <th className="pb-3">Fração</th>
                      <th className="pb-3">Valor Diária</th>
                      <th className="pb-3">Adicional / Justificativa</th>
                      <th className="pb-3 text-right">Valor Total</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
                    {weekFilteredDiarias.map(dia => {
                      const dayName = getDayOfWeekName(dia.data);
                      return (
                        <tr key={dia.id} className="hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]">
                          <td className="py-3 font-semibold text-[#111c2d] dark:text-white whitespace-nowrap">
                            <span>{formatDateBR(dia.data)}</span>
                            <span className="block text-[10px] text-[#707a82]">{dayName}</span>
                          </td>
                          <td className="py-3 font-bold text-[#111c2d] dark:text-white">
                            {dia.trabalhadorNome}
                          </td>
                          <td className="py-3 text-[#707a82] dark:text-[#7c8fac] tabular-nums">
                            {dia.fracao === 1 ? '1.0 (Integral)' : `${dia.fracao} diária`}
                          </td>
                          <td className="py-3 text-[#707a82] dark:text-[#7c8fac] tabular-nums">
                            {formatBRL(dia.valorCalculado)}
                          </td>
                          <td className="py-3 text-[#707a82] dark:text-[#7c8fac]">
                            {dia.valorAdicional > 0 ? (
                              <div>
                                <span className="font-semibold text-[#0085db] tabular-nums">
                                  +{formatBRL(dia.valorAdicional)}
                                </span>
                                {dia.descricaoAdicional && (
                                  <span className="block text-[10px] text-[#707a82]">
                                    {dia.descricaoAdicional}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#707a82]">-</span>
                            )}
                          </td>
                          <td className="py-3 text-right font-black text-[#111c2d] dark:text-white tabular-nums">
                            {formatBRL(dia.valorTotal)}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                dia.statusPagamento === 'pago'
                                  ? 'bg-[#4bd08b]/15 text-[#4bd08b]'
                                  : 'bg-[#f8c076]/20 text-[#d9941a] dark:text-[#f8c076]'
                              }`}
                            >
                              {dia.statusPagamento === 'pago' ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Pago
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  A Pagar
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {dia.statusPagamento === 'pendente' && (
                                <button
                                  onClick={() => marcarDiariasPagas([dia.id])}
                                  className="p-1 text-[#4bd08b] hover:bg-[#4bd08b]/15 rounded cursor-pointer"
                                  title="Marcar diária como paga"
                                >
                                  <CheckCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm(`Excluir esta diária de ${dia.trabalhadorNome}?`)) {
                                    deleteDiaria(dia.id);
                                  }
                                }}
                                className="p-1 text-[#707a82] hover:text-[#fb977d] hover:bg-[#fb977d]/15 rounded cursor-pointer"
                                title="Excluir lançamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Diária */}
      <Modal
        isOpen={isDiariaModalOpen}
        onClose={() => setIsDiariaModalOpen(false)}
        title="Lançar Diária de Trabalho"
        subtitle="Registre o dia trabalhado, fração da diária e eventuais adicionais ou justificativas."
        maxWidth="md"
      >
        <form onSubmit={handleSaveDiaria} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Trabalhador *
            </label>
            <select
              required
              value={trabalhadorId}
              onChange={e => handleSelectWorker(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
            >
              {trabalhadores.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nome} — {t.funcao} (Ref: {formatBRL(t.valorDiariaPadrao)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Data do Trabalho
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Fração Trabalhada
              </label>
              <select
                value={fracao}
                onChange={e => setFracao(parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              >
                <option value={1.0}>1.0 — Diária Integral</option>
                <option value={0.5}>0.5 — Meio Período</option>
                <option value={1.5}>1.5 — Diária e Meia</option>
                <option value={2.0}>2.0 — Dupla</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Valor Base da Diária (R$)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={valorDiariaBase}
                onChange={e => setValorDiariaBase(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Valor Adicional / Extra (R$)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={valorAdicional}
                onChange={e => setValorAdicional(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>
          </div>

          {parseFloat(valorAdicional) > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Descrição do Adicional & Justificativa *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Horas extras para concretagem da viga..."
                value={descricaoAdicional}
                onChange={e => setDescricaoAdicional(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Etapa Vinculada
            </label>
            <select
              value={etapaId}
              onChange={e => setEtapaId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
            >
              {etapas.map(e => (
                <option key={e.id} value={e.id}>
                  {e.numero} — {e.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 bg-[#f6f9fc] dark:bg-[#1a2535] rounded-xl text-xs flex justify-between items-center font-semibold border border-[#e6ecf1] dark:border-[#333f55]">
            <span className="text-[#707a82] dark:text-[#7c8fac]">Total a pagar por este dia:</span>
            <span className="text-base font-extrabold text-[#0085db] tabular-nums">
              {formatBRL((fracao * valorDiariaBase) + (parseFloat(valorAdicional) || 0))}
            </span>
          </div>

          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDiariaModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
            >
              Salvar Diária
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Worker */}
      <Modal
        isOpen={isTrabModalOpen}
        onClose={() => setIsTrabModalOpen(false)}
        title="Cadastrar Trabalhador"
        subtitle="Mantenha o histórico e diária de referência por período."
        maxWidth="md"
      >
        <form onSubmit={handleSaveTrab} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: João Ferreira da Silva"
              value={trabNome}
              onChange={e => setTrabNome(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Função
              </label>
              <select
                value={trabFuncao}
                onChange={e => setTrabFuncao(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              >
                <option value="Pedreiro">Pedreiro</option>
                <option value="Servente">Servente</option>
                <option value="Carpinteiro">Carpinteiro</option>
                <option value="Armador">Armador</option>
                <option value="Eletricista">Eletricista</option>
                <option value="Encanador">Encanador</option>
                <option value="Encarregado de Obra">Encarregado de Obra</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Valor Diária Padrão (R$)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={trabValorDiaria}
                onChange={e => setTrabValorDiaria(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                CPF
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={trabCpf}
                onChange={e => setTrabCpf(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Chave PIX
              </label>
              <input
                type="text"
                placeholder="CPF, celular ou e-mail"
                value={trabChavePix}
                onChange={e => setTrabChavePix(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTrabModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
            >
              Cadastrar Trabalhador
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Trabalhador, Diaria } from '../../types';
import { formatBRL } from '../../utils/currency';
import { formatDateBR, getTodayISO, getWeekRange, getDayOfWeekName } from '../../utils/date';
import {
  UserPlus,
  Plus,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  CheckCheck,
  X,
} from 'lucide-react';

export const MaoDeObraView: React.FC = () => {
  const {
    trabalhadores,
    diarias,
    addTrabalhador,
    addDiaria,
    updateDiaria,
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
  const [diariaToDelete, setDiariaToDelete] = useState<Diaria | null>(null);
  const [editingDiaria, setEditingDiaria] = useState<Diaria | null>(null);

  // Pagination state (1 week per page)
  const [currentWeekPage, setCurrentWeekPage] = useState<number>(1);

  // Toast feedback state
  const [toast, setToast] = useState<{ title: string; desc?: string } | null>(null);

  const showToast = (title: string, desc?: string) => {
    setToast({ title, desc });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Form for Diaria (Add / Edit)
  const [trabalhadorId, setTrabalhadorId] = useState(trabalhadores[0]?.id || '');
  const [data, setData] = useState(getTodayISO());
  const [fracao, setFracao] = useState<number>(1.0);
  const [valorDiariaBase, setValorDiariaBase] = useState<number>(trabalhadores[0]?.valorDiariaPadrao || 180);
  const [valorAdicional, setValorAdicional] = useState<string>('0');
  const [descricaoAdicional, setDescricaoAdicional] = useState('');
  const [etapaId, setEtapaId] = useState(activeObra.etapaAtualId || 'etapa-2');

  // Form for Worker modal
  const [trabNome, setTrabNome] = useState('');
  const [trabFuncao, setTrabFuncao] = useState('Pedreiro');
  const [trabCpf, setTrabCpf] = useState('');
  const [trabChavePix, setTrabChavePix] = useState('');
  const [trabValorDiaria, setTrabValorDiaria] = useState(180);

  const handleSelectWorker = (id: string) => {
    setTrabalhadorId(id);
    const trab = trabalhadores.find(t => t.id === id);
    if (trab) {
      setValorDiariaBase(trab.valorDiariaPadrao);
    }
  };

  const resetDiariaForm = () => {
    setEditingDiaria(null);
    const defaultTrab = trabalhadores[0];
    setTrabalhadorId(defaultTrab?.id || '');
    setData(getTodayISO());
    setFracao(1.0);
    setValorDiariaBase(defaultTrab?.valorDiariaPadrao || 180);
    setValorAdicional('0');
    setDescricaoAdicional('');
    setEtapaId(activeObra.etapaAtualId || 'etapa-2');
  };

  const handleOpenEditDiaria = (dia: Diaria) => {
    setEditingDiaria(dia);
    setTrabalhadorId(dia.trabalhadorId);
    setData(dia.data);
    setFracao(dia.fracao);
    setValorDiariaBase(dia.valorDiariaBase || 180);
    setValorAdicional(String(dia.valorAdicional || 0));
    setDescricaoAdicional(dia.descricaoAdicional || '');
    setEtapaId(dia.etapaId || activeObra.etapaAtualId || 'etapa-2');
    setIsDiariaModalOpen(true);
  };

  // Grouping by weeks
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

  // Overall totals
  const totalMaoDeObra = diarias.reduce((sum, d) => sum + d.valorTotal, 0);
  const totalPagas = diarias.filter(d => d.statusPagamento === 'pago').reduce((sum, d) => sum + d.valorTotal, 0);
  const totalPendentes = diarias.filter(d => d.statusPagamento === 'pendente').reduce((sum, d) => sum + d.valorTotal, 0);
  const teto = activeObra.tetoMaoDeObra || 32000;
  const saldoTeto = teto - totalMaoDeObra;
  const pctTeto = Math.min(100, Math.round((totalMaoDeObra / teto) * 100));

  // Filtered weeks list
  const filteredWeeks = useMemo(() => {
    return groupedWeeks
      .map(week => {
        const filteredDiarias = week.diarias.filter(d => {
          const matchTrab = selectedTrabId === 'todos' || d.trabalhadorId === selectedTrabId;
          const matchStatus = statusFilter === 'todos' || d.statusPagamento === statusFilter;
          return matchTrab && matchStatus;
        });

        const totalSemana = filteredDiarias.reduce((sum, d) => sum + d.valorTotal, 0);
        const totalSemanaPendente = filteredDiarias
          .filter(d => d.statusPagamento === 'pendente')
          .reduce((sum, d) => sum + d.valorTotal, 0);

        return {
          ...week,
          diarias: filteredDiarias,
          totalSemana,
          totalSemanaPendente,
          isQuitada: filteredDiarias.length > 0 && totalSemanaPendente === 0,
        };
      })
      .filter(w => w.diarias.length > 0);
  }, [groupedWeeks, selectedTrabId, statusFilter]);

  const totalPages = Math.max(1, filteredWeeks.length);
  const safeCurrentPage = Math.min(Math.max(1, currentWeekPage), totalPages);
  const activeWeek = filteredWeeks[safeCurrentPage - 1];

  const handleSaveDiaria = (e: React.FormEvent) => {
    e.preventDefault();
    const trab = trabalhadores.find(t => t.id === trabalhadorId);
    if (!trab) return;

    const adicional = parseFloat(valorAdicional) || 0;
    const calculado = Number((fracao * valorDiariaBase).toFixed(2));
    const total = Number((calculado + adicional).toFixed(2));

    if (editingDiaria) {
      updateDiaria({
        ...editingDiaria,
        trabalhadorId: trab.id,
        trabalhadorNome: trab.nome,
        data,
        fracao,
        valorDiariaBase,
        valorCalculado: calculado,
        valorAdicional: adicional,
        descricaoAdicional: adicional > 0 ? descricaoAdicional : undefined,
        valorTotal: total,
        etapaId,
      });
      showToast('Diária Atualizada', `Lançamento de ${trab.nome} atualizado com sucesso.`);
    } else {
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
        valorTotal: total,
        etapaId,
        statusPagamento: 'pendente',
        criadoPor: activeUser.nome,
      });
      showToast('Diária Lançada', `Diária de ${trab.nome} registrada com sucesso.`);
    }

    setIsDiariaModalOpen(false);
    resetDiariaForm();
  };

  const handleSaveTrab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trabNome.trim()) return;

    addTrabalhador({
      nome: trabNome.trim(),
      funcao: trabFuncao,
      cpf: trabCpf.trim() || undefined,
      chavePix: trabChavePix.trim() || undefined,
      valorDiariaPadrao: trabValorDiaria || 180,
      ativo: true,
    });

    setIsTrabModalOpen(false);
    showToast('Trabalhador Cadastrado', `${trabNome.trim()} adicionado com sucesso.`);
    setTrabNome('');
    setTrabCpf('');
    setTrabChavePix('');
    setTrabValorDiaria(180);
  };

  const handleExecutePagarSemana = (trabalhadorTargetId: string, weekDiarias: Diaria[]) => {
    const pendentes = weekDiarias
      .filter(d => d.trabalhadorId === trabalhadorTargetId && d.statusPagamento === 'pendente')
      .map(d => d.id);

    if (pendentes.length === 0) return;

    const trab = trabalhadores.find(t => t.id === trabalhadorTargetId);
    marcarDiariasPagas(pendentes);
    showToast('Pagamento Confirmado', `Diárias de ${trab?.nome || 'trabalhador'} marcadas como pagas.`);
  };

  const getShortDayName = (isoDate: string) => {
    const fullName = getDayOfWeekName(isoDate);
    const map: Record<string, string> = {
      segunda: 'Seg',
      terça: 'Ter',
      quarta: 'Qua',
      quinta: 'Qui',
      sexta: 'Sex',
      sábado: 'Sáb',
      domingo: 'Dom',
    };
    return map[fullName.toLowerCase()] || fullName.slice(0, 3);
  };

  const adicionalNum = parseFloat(valorAdicional) || 0;
  const previewTotal = fracao * valorDiariaBase + adicionalNum;

  return (
    <div className="space-y-4 md:space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150 max-w-4xl mx-auto w-full">

      {/* ============================================================== */}
      {/* 1. CABEÇALHO & AÇÕES (MOBILE vs TABLET/DESKTOP)                 */}
      {/* ============================================================== */}
      
      {/* Mobile: Título empilhado + Botões em Grid 2 Colunas */}
      <div className="block md:hidden space-y-3">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-[#111c2d] dark:text-white">
            Diárias
          </h1>
          <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
            Controle semanal e pagamentos de mão de obra.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setIsTrabModalOpen(true)}
            className="h-10 px-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#0085db]" />
            <span>Novo Trab.</span>
          </button>
          <button
            type="button"
            onClick={() => {
              resetDiariaForm();
              setIsDiariaModalOpen(true);
            }}
            className="h-10 px-3 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0074bf] rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Diária</span>
          </button>
        </div>
      </div>

      {/* Tablet / Desktop: Título à esquerda e Botões à direita */}
      <div className="hidden md:flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111c2d] dark:text-white">
            Diárias
          </h1>
          <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Controle semanal e pagamentos de mão de obra.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsTrabModalOpen(true)}
            className="h-10 px-4 inline-flex items-center gap-2 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]"
          >
            <UserPlus className="w-4.5 h-4.5 text-[#0085db]" />
            <span>Novo Trabalhador</span>
          </button>
          <button
            type="button"
            onClick={() => {
              resetDiariaForm();
              setIsDiariaModalOpen(true);
            }}
            className="h-10 px-4 inline-flex items-center gap-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0074bf] rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Lançar Diária</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CARD CONTROLE DO TETO (MOBILE vs TABLET/DESKTOP)             */}
      {/* ============================================================== */}

      {/* Versão Mobile */}
      <div className="block md:hidden bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-2xl p-4 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] space-y-3.5">
        <div>
          <span className="text-[10px] font-bold text-[#0085db] uppercase tracking-wider block">
            Teto de Mão de Obra
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-[#111c2d] dark:text-white tabular-nums">
              {formatBRL(totalMaoDeObra)}
            </span>
            <span className="text-xs text-[#707a82]">/ {formatBRL(teto)}</span>
          </div>
        </div>

        {/* Métricas em 3 Colunas Centralizadas */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#e6ecf1] dark:border-[#333f55] text-center">
          <div>
            <span className="text-[#707a82] dark:text-[#7c8fac] block text-[9px] font-bold uppercase tracking-wider">
              TOTAL PAGO
            </span>
            <span className="font-bold text-[#4bd08b] text-xs tabular-nums block mt-0.5">
              {formatBRL(totalPagas)}
            </span>
          </div>
          <div className="border-x border-[#e6ecf1] dark:border-[#333f55]">
            <span className="text-[#707a82] dark:text-[#7c8fac] block text-[9px] font-bold uppercase tracking-wider">
              A PAGAR
            </span>
            <span className="font-bold text-[#f8c076] text-xs tabular-nums block mt-0.5">
              {formatBRL(totalPendentes)}
            </span>
          </div>
          <div>
            <span className="text-[#707a82] dark:text-[#7c8fac] block text-[9px] font-bold uppercase tracking-wider">
              SALDO
            </span>
            <span className="font-bold text-[#111c2d] dark:text-white text-xs tabular-nums block mt-0.5">
              {formatBRL(saldoTeto)}
            </span>
          </div>
        </div>

        {/* Barra de Progresso Mobile */}
        <div className="space-y-1.5">
          <div className="w-full bg-[#f0f5f9] dark:bg-[#15263a] rounded-full h-2.5 overflow-hidden flex">
            <div
              className="bg-[#4bd08b] h-2.5 transition-all duration-300"
              style={{ width: `${Math.min(100, (totalPagas / teto) * 100)}%` }}
            />
            <div
              className="bg-[#f8c076] h-2.5 transition-all duration-300"
              style={{ width: `${Math.min(100, (totalPendentes / teto) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#707a82]">
            <span className="font-bold text-[#111c2d] dark:text-white uppercase">
              {pctTeto}% DO TETO UTILIZADO
            </span>
            <span className="font-bold text-[#4bd08b] uppercase">
              SALDO: {formatBRL(saldoTeto)}
            </span>
          </div>
        </div>
      </div>

      {/* Versão Tablet / Desktop */}
      <div className="hidden md:block bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[20px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
          <div>
            <span className="text-xs font-bold text-[#0085db] uppercase tracking-wider">
              Controle do Teto Fechado de Mão de Obra
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#111c2d] dark:text-white tabular-nums">
                {formatBRL(totalMaoDeObra)}
              </span>
              <span className="text-xs text-[#707a82]">
                de <strong className="text-[#111c2d] dark:text-white">{formatBRL(teto)}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-center">
            <div>
              <span className="text-[#707a82] block text-[10px] font-bold uppercase tracking-wider">
                TOTAL PAGO
              </span>
              <span className="font-bold text-[#4bd08b] text-sm tabular-nums block mt-0.5">
                {formatBRL(totalPagas)}
              </span>
            </div>
            <div className="border-l border-[#e6ecf1] dark:border-[#333f55] pl-5">
              <span className="text-[#707a82] block text-[10px] font-bold uppercase tracking-wider">
                A PAGAR
              </span>
              <span className="font-bold text-[#f8c076] text-sm tabular-nums block mt-0.5">
                {formatBRL(totalPendentes)}
              </span>
            </div>
            <div className="border-l border-[#e6ecf1] dark:border-[#333f55] pl-5">
              <span className="text-[#707a82] block text-[10px] font-bold uppercase tracking-wider">
                SALDO
              </span>
              <span className="font-bold text-[#111c2d] dark:text-white text-sm tabular-nums block mt-0.5">
                {formatBRL(saldoTeto)}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso com Rótulos em Caixa Alta */}
        <div className="space-y-1.5">
          <div className="w-full bg-[#f0f5f9] dark:bg-[#15263a] rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-[#4bd08b] h-3 transition-all duration-300"
              style={{ width: `${Math.min(100, (totalPagas / teto) * 100)}%` }}
            />
            <div
              className="bg-[#f8c076] h-3 transition-all duration-300"
              style={{ width: `${Math.min(100, (totalPendentes / teto) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#707a82]">
            <span className="font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
              {pctTeto}% DO TETO UTILIZADO
            </span>
            <span className="font-bold text-[#4bd08b] uppercase tracking-wider">
              SALDO DISPONÍVEL: {formatBRL(saldoTeto)}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. FILTROS & BOTÃO RECIBOS (MOBILE vs TABLET/DESKTOP)           */}
      {/* ============================================================== */}

      {/* Filtros Mobile */}
      <div className="block md:hidden space-y-2">
        <select
          value={selectedTrabId}
          onChange={e => {
            setSelectedTrabId(e.target.value);
            setCurrentWeekPage(1);
          }}
          className="w-full h-10 px-3 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
        >
          <option value="todos">Todos os Trabalhadores ({trabalhadores.length})</option>
          {trabalhadores.map(t => (
            <option key={t.id} value={t.id}>
              {t.nome} ({t.funcao})
            </option>
          ))}
        </select>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center h-9 p-1 bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-xl text-xs flex-1">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('todos');
                setCurrentWeekPage(1);
              }}
              className={`flex-1 h-7 rounded-lg text-[11px] transition-all cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-[#0085db] text-white font-bold'
                  : 'text-[#707a82]'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('pendente');
                setCurrentWeekPage(1);
              }}
              className={`flex-1 h-7 rounded-lg text-[11px] transition-all cursor-pointer ${
                statusFilter === 'pendente'
                  ? 'bg-[#f8c076]/30 text-[#d9941a] dark:text-[#f8c076] font-bold'
                  : 'text-[#707a82]'
              }`}
            >
              A Pagar
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('pago');
                setCurrentWeekPage(1);
              }}
              className={`flex-1 h-7 rounded-lg text-[11px] transition-all cursor-pointer ${
                statusFilter === 'pago'
                  ? 'bg-[#4bd08b]/20 text-[#4bd08b] font-bold'
                  : 'text-[#707a82]'
              }`}
            >
              Pagos
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigateToTabWithFilter('recibos')}
            className="h-9 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] hover:text-[#0085db] rounded-xl shadow-xs shrink-0 cursor-pointer active:scale-95 transition-all"
          >
            <Receipt className="w-4 h-4 text-[#0085db]" />
            <span>Recibos</span>
          </button>
        </div>
      </div>

      {/* Filtros Tablet / Desktop */}
      <div className="hidden md:flex bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-3.5 items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <select
            value={selectedTrabId}
            onChange={e => {
              setSelectedTrabId(e.target.value);
              setCurrentWeekPage(1);
            }}
            className="h-10 px-3 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
          >
            <option value="todos">Todos os Trabalhadores ({trabalhadores.length})</option>
            {trabalhadores.map(t => (
              <option key={t.id} value={t.id}>
                {t.nome} ({t.funcao})
              </option>
            ))}
          </select>

          <div className="flex items-center h-10 p-1 bg-[#f0f5f9] dark:bg-[#15263a] rounded-xl text-xs">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('todos');
                setCurrentWeekPage(1);
              }}
              className={`h-8 px-3 rounded-lg text-xs transition-all cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold shadow-xs'
                  : 'text-[#707a82]'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('pendente');
                setCurrentWeekPage(1);
              }}
              className={`h-8 px-3 rounded-lg text-xs transition-all cursor-pointer ${
                statusFilter === 'pendente'
                  ? 'bg-white dark:bg-[#111c2d] text-[#d9941a] dark:text-[#f8c076] font-bold shadow-xs'
                  : 'text-[#707a82]'
              }`}
            >
              A Pagar
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('pago');
                setCurrentWeekPage(1);
              }}
              className={`h-8 px-3 rounded-lg text-xs transition-all cursor-pointer ${
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
          type="button"
          onClick={() => navigateToTabWithFilter('recibos')}
          className="h-10 px-4 inline-flex items-center gap-2 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] hover:text-[#0085db] rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <Receipt className="w-4.5 h-4.5 text-[#0085db]" />
          <span>Gerar recibo</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 4. PAGINAÇÃO SEMANAL (MOBILE vs TABLET/DESKTOP)                 */}
      {/* ============================================================== */}

      {/* Paginação Mobile */}
      <div className="flex md:hidden bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-xl px-3.5 py-2.5 items-center justify-between shadow-xs">
        <span className="text-xs text-[#707a82]">
          Semana <strong className="text-[#111c2d] dark:text-white">{safeCurrentPage}</strong> de{' '}
          <strong>{totalPages}</strong>
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentWeekPage(p => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="w-7 h-7 rounded-lg border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] disabled:opacity-40 flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentWeekPage(pageNum)}
              className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-all ${
                pageNum === safeCurrentPage
                  ? 'bg-[#0085db] text-white font-bold'
                  : 'text-[#707a82]'
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentWeekPage(p => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            className="w-7 h-7 rounded-lg border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white disabled:opacity-40 flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Paginação Tablet / Desktop */}
      <div className="hidden md:flex bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] px-4 py-3 items-center justify-between shadow-xs">
        <div className="text-xs text-[#707a82]">
          Semana <strong className="text-[#111c2d] dark:text-white">{safeCurrentPage}</strong> de{' '}
          <strong>{totalPages}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentWeekPage(p => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="w-8 h-8 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] disabled:opacity-40 flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentWeekPage(pageNum)}
              className={`w-8 h-8 rounded-xl text-xs flex items-center justify-center cursor-pointer transition-all ${
                pageNum === safeCurrentPage
                  ? 'bg-[#0085db] text-white font-bold shadow-xs'
                  : 'text-[#707a82]'
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentWeekPage(p => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            className="w-8 h-8 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white disabled:opacity-40 flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. LISTAGEM DA SEMANA (MOBILE EM CARDS vs TABLET EM TABELA)     */}
      {/* ============================================================== */}
      
      {!activeWeek ? (
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-8 text-center text-xs text-[#707a82]">
          Nenhuma diária encontrada para os filtros selecionados.
        </div>
      ) : (
        <>
          {/* MODO MOBILE: Lista em Cards Individuais */}
          <div className="block md:hidden bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-2xl p-4 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] space-y-3">
            {/* Cabeçalho da Semana Mobile */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0085db]" />
                <span className="text-xs font-bold text-[#111c2d] dark:text-white">
                  {activeWeek.weekLabel}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-[#707a82] block uppercase">TOTAL</span>
                <span className="text-sm font-black text-[#111c2d] dark:text-white tabular-nums">
                  {formatBRL(activeWeek.totalSemana)}
                </span>
              </div>
            </div>

            {/* Lista de Diárias em Cards Individuais */}
            <div className="space-y-2.5">
              {activeWeek.diarias.map(dia => {
                const shortDay = getShortDayName(dia.data);
                const dateParts = formatDateBR(dia.data).split('/');
                const shortDate = `${dateParts[0]}/${dateParts[1]}`;
                const isPago = dia.statusPagamento === 'pago';

                return (
                  <div
                    key={dia.id}
                    className="p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between gap-3 animate-in fade-in"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-[#707a82]">
                          {shortDate} · {shortDay}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                            isPago
                              ? 'bg-[#4bd08b]/15 text-[#4bd08b]'
                              : 'bg-[#f8c076]/20 text-[#d9941a] dark:text-[#f8c076]'
                          }`}
                        >
                          {isPago ? 'Pago' : 'A Pagar'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#111c2d] dark:text-white uppercase truncate">
                        {dia.trabalhadorNome}
                      </h4>
                      <div className="text-[11px] text-[#707a82]">
                        {dia.fracao === 1 ? '1.0 Diária' : `${dia.fracao} Diária`} ·{' '}
                        <strong className="text-[#111c2d] dark:text-white tabular-nums font-extrabold">
                          {formatBRL(dia.valorTotal)}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDiaria(dia)}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] hover:text-[#0085db] flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiariaToDelete(dia)}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MODO TABLET / DESKTOP: Tabela da Semana Completa */}
          <div className="hidden md:block bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[20px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-[#0085db]" />
                <h2 className="text-base font-bold text-[#111c2d] dark:text-white">
                  Semana: {activeWeek.weekLabel}
                </h2>
                {activeWeek.isQuitada && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#10bd9d]">
                    Concluída &amp; Paga
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[#707a82] block text-[10px] font-bold uppercase tracking-wider">
                    TOTAL DA SEMANA
                  </span>
                  <span className="text-base font-black text-[#111c2d] dark:text-white tabular-nums">
                    {formatBRL(activeWeek.totalSemana)}
                  </span>
                </div>

                {!activeWeek.isQuitada && (() => {
                  const workersWithPending = Array.from(
                    new Set(
                      activeWeek.diarias
                        .filter(d => d.statusPagamento === 'pendente')
                        .map(d => d.trabalhadorId)
                    )
                  );
                  if (workersWithPending.length === 0) return null;

                  return (
                    <div className="flex items-center gap-2 flex-wrap">
                      {workersWithPending.map(wId => {
                        const trab = trabalhadores.find(t => t.id === wId);
                        const trabPendingTotal = activeWeek.diarias
                          .filter(d => d.trabalhadorId === wId && d.statusPagamento === 'pendente')
                          .reduce((sum, d) => sum + d.valorTotal, 0);

                        return (
                          <button
                            key={wId}
                            type="button"
                            onClick={() => handleExecutePagarSemana(wId, activeWeek.diarias)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#4bd08b] hover:bg-[#10bd9d] rounded-xl shadow-xs transition-colors cursor-pointer"
                            title={`Marcar diárias pendentes de ${trab?.nome} como pagas`}
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Pagar: {trab?.nome?.split(' ')[0]} ({formatBRL(trabPendingTotal)})</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] font-bold text-[11px] uppercase tracking-wider">
                    <th className="pb-3">Data / Dia</th>
                    <th className="pb-3">Trabalhador</th>
                    <th className="pb-3">Fração</th>
                    <th className="pb-3">Valor Diária</th>
                    <th className="pb-3 text-right">Valor Total</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
                  {activeWeek.diarias.map(dia => {
                    const dayName = getDayOfWeekName(dia.data);
                    const isPago = dia.statusPagamento === 'pago';
                    return (
                      <tr key={dia.id} className="hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]">
                        <td className="py-3 font-semibold whitespace-nowrap">
                          {formatDateBR(dia.data)} · <span className="text-[#707a82] capitalize">{dayName}</span>
                        </td>
                        <td className="py-3 font-bold uppercase">{dia.trabalhadorNome}</td>
                        <td className="py-3 text-[#707a82]">
                          {dia.fracao === 1
                            ? '1.0 (Integral)'
                            : dia.fracao === 0.5
                            ? '0.5 (Meio Período)'
                            : dia.fracao === 1.5
                            ? '1.5 (Diária e Meia)'
                            : `${dia.fracao} (Diária)`}
                        </td>
                        <td className="py-3 text-[#707a82] tabular-nums">
                          {formatBRL(dia.valorDiariaBase || 180)}
                        </td>
                        <td className="py-3 text-right font-black tabular-nums">
                          {formatBRL(dia.valorTotal)}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isPago
                                ? 'bg-[#4bd08b]/15 text-[#4bd08b]'
                                : 'bg-[#f8c076]/20 text-[#d9941a]'
                            }`}
                          >
                            {isPago ? 'Pago' : 'A Pagar'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditDiaria(dia)}
                              className="p-1.5 text-[#707a82] hover:text-[#0085db] rounded-lg hover:bg-[#0085db]/10 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDiariaToDelete(dia)}
                              className="p-1.5 text-[#707a82] hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </>
      )}

      {/* ============================================================== */}
      {/* 6. MODAIS INTEGRADOS                                           */}
      {/* ============================================================== */}

      {/* 1. Modal: Lançar / Editar Diária */}
      {isDiariaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setIsDiariaModalOpen(false);
              resetDiariaForm();
            }}
          />

          <div className="relative z-50 w-full max-w-sm md:max-w-md bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 md:px-6 py-4 md:py-5 border-b border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between">
              <div>
                <h2 className="text-sm md:text-base font-bold text-[#111c2d] dark:text-white">
                  {editingDiaria ? 'Editar Diária de Trabalho' : 'Lançar Diária de Trabalho'}
                </h2>
                <p className="text-[10px] md:text-xs text-[#707a82]">
                  Registre o dia trabalhado e fração.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDiariaModalOpen(false);
                  resetDiariaForm();
                }}
                className="w-8 h-8 rounded-full text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiaria} className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5">
                  Trabalhador *
                </label>
                <select
                  required
                  value={trabalhadorId}
                  onChange={e => handleSelectWorker(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-medium"
                >
                  {trabalhadores.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome} — {t.funcao} ({formatBRL(t.valorDiariaPadrao)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5">
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
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5">
                    Fração
                  </label>
                  <select
                    value={fracao}
                    onChange={e => setFracao(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                  >
                    <option value={1.0}>1.0 (Integral)</option>
                    <option value={0.5}>0.5 (Meio Período)</option>
                    <option value={1.5}>1.5 (Diária e Meia)</option>
                    <option value={2.0}>2.0 (Dupla)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-[#f6f9fc] dark:bg-[#1a2535] rounded-xl text-xs flex justify-between items-center border border-[#e6ecf1] dark:border-[#333f55]">
                <span className="text-[#707a82]">Total previsto a pagar:</span>
                <span className="text-base font-extrabold text-[#0085db] tabular-nums">
                  {formatBRL(previewTotal)}
                </span>
              </div>

              <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDiariaModalOpen(false);
                    resetDiariaForm();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0074bf] rounded-xl shadow-xs cursor-pointer"
                >
                  {editingDiaria ? 'Salvar Alterações' : 'Salvar Diária'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Cadastrar Trabalhador */}
      {isTrabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsTrabModalOpen(false)}
          />

          <div className="relative z-50 w-full max-w-sm md:max-w-md bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 md:px-6 py-4 md:py-5 border-b border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between">
              <div>
                <h2 className="text-sm md:text-base font-bold text-[#111c2d] dark:text-white">
                  Cadastrar Trabalhador
                </h2>
                <p className="text-[10px] md:text-xs text-[#707a82]">
                  Adicione novos membros à equipe de obra.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTrabModalOpen(false)}
                className="w-8 h-8 rounded-full text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrab} className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Andrade"
                  value={trabNome}
                  onChange={e => setTrabNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5">
                    Função
                  </label>
                  <select
                    value={trabFuncao}
                    onChange={e => setTrabFuncao(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                  >
                    <option value="Pedreiro">Pedreiro</option>
                    <option value="Ajudante">Ajudante</option>
                    <option value="Carpinteiro">Carpinteiro</option>
                    <option value="Eletricista">Eletricista</option>
                    <option value="Servente">Servente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5">
                    Valor Diária (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={trabValorDiaria}
                    onChange={e => setTrabValorDiaria(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTrabModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0074bf] rounded-xl shadow-xs cursor-pointer"
                >
                  Cadastrar Trabalhador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Confirmar Exclusão */}
      {diariaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDiariaToDelete(null)}
          />

          <div className="relative z-50 w-full max-w-xs md:max-w-sm bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-5 md:p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-4.5 h-4.5 md:w-5 md:h-5" />
              </div>
              <div>
                <h2 className="text-xs md:text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                  Excluir Diária
                </h2>
                <p className="text-[10px] text-[#707a82]">Ação irreversível no sistema</p>
              </div>
            </div>

            <div className="py-3 md:py-4 space-y-2 md:space-y-3">
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                Deseja remover o lançamento de{' '}
                <strong className="text-[#111c2d] dark:text-white uppercase">
                  {diariaToDelete.trabalhadorNome}
                </strong>
                ?
              </p>

              <div className="p-2.5 md:p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-xs flex justify-between">
                <span className="text-[#707a82]">
                  {formatDateBR(diariaToDelete.data)}
                </span>
                <span className="font-extrabold text-[#111c2d] dark:text-white tabular-nums">
                  {formatBRL(diariaToDelete.valorTotal)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 md:gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDiariaToDelete(null)}
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const nome = diariaToDelete.trabalhadorNome;
                  deleteDiaria(diariaToDelete.id);
                  setDiariaToDelete(null);
                  showToast('Diária Excluída', `Diária de ${nome} excluída com sucesso.`);
                }}
                className="px-4 py-1.5 md:py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Notificação Toast */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-20 right-4 left-4 md:left-auto md:right-6 z-50 animate-in slide-in-from-bottom-2 fade-in">
          <div className="inline-flex w-full md:w-auto items-center justify-between gap-2.5 px-3.5 md:px-4 py-2.5 rounded-xl md:rounded-2xl bg-[#111c2d] text-white shadow-xl border border-zinc-700/60">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-[#4bd08b] shrink-0" />
              <span className="text-xs font-semibold truncate whitespace-nowrap">
                {toast.desc ? `${toast.title}: ${toast.desc}` : toast.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-1 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

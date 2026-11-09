import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CartaoConta, Parcela } from '../../types';
import { formatBRL } from '../../utils/currency';

interface ExtendedCartao extends CartaoConta {
  isConta?: boolean;
  banco?: string;
  tipoChave?: string;
  chavePix?: string;
  agenciaConta?: string;
  obraVinculada?: string;
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'Janeiro',
  '02': 'Fevereiro',
  '03': 'Março',
  '04': 'Abril',
  '05': 'Maio',
  '06': 'Junho',
  '07': 'Julho',
  '08': 'Agosto',
  '09': 'Setembro',
  '10': 'Outubro',
  '11': 'Novembro',
  '12': 'Dezembro',
};

const getWeekdayName = (dateStr: string): string => {
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const [y, m, d] = parts.map(Number);
    const date = new Date(y, m - 1, d);
    const days = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];
    return days[date.getDay()] || '';
  } catch {
    return '';
  }
};

const formatDateToBR = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const CartoesView: React.FC = () => {
  const {
    cartoes: initialCartoes,
    parcelas: initialParcelas,
    navigateToTabWithFilter,
  } = useApp();

  // Load Material Symbols Font if not already present
  useEffect(() => {
    if (!document.getElementById('material-symbols-font')) {
      const link = document.createElement('link');
      link.id = 'material-symbols-font';
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Cards local state with persistent defaults
  const [cardsList, setCardsList] = useState<ExtendedCartao[]>(() => {
    return initialCartoes.map((c) => ({
      ...c,
      isConta: c.tipo === 'conta_corrente',
    }));
  });

  // Parcelas local state
  const [parcelasList, setParcelasList] = useState<Parcela[]>(() => initialParcelas);

  // Period filter states
  const [periodMode, setPeriodMode] = useState<'mes' | 'todo'>('mes');
  const [selectedMes, setSelectedMes] = useState<string>('11');
  const [selectedAno, setSelectedAno] = useState<string>('2026');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 3;

  // Mobile card indicator (1 of N)
  const [mobileCardIndex, setMobileCardIndex] = useState<number>(1);

  // Slider refs
  const cardsSliderRef = useRef<HTMLDivElement>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (title: string, desc: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ title, desc });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Modals state
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
  const [isExcluirModalOpen, setIsExcluirModalOpen] = useState(false);

  // Modal 1: Cadastro state
  const [cadTipoReg, setCadTipoReg] = useState<'cartao' | 'conta'>('cartao');
  const [cadApelido, setCadApelido] = useState('');
  const [cadBandeira, setCadBandeira] = useState('Mastercard');
  const [cadDigitos, setCadDigitos] = useState('');
  const [cadFechamento, setCadFechamento] = useState<number>(25);
  const [cadVencimento, setCadVencimento] = useState<number>(5);
  const [cadBanco, setCadBanco] = useState('Bradesco');
  const [cadTipoChave, setCadTipoChave] = useState('CNPJ');
  const [cadChaveFinal, setCadChaveFinal] = useState('');
  const [cadAgenciaConta, setCadAgenciaConta] = useState('');
  const [cadTitular, setCadTitular] = useState('Natanael');
  const [cadObra, setCadObra] = useState('juscelino');

  // Modal 2: Editar Parcela state
  const [editingParcela, setEditingParcela] = useState<Parcela | null>(null);
  const [editDescricao, setEditDescricao] = useState('');
  const [editCartaoId, setEditCartaoId] = useState('');
  const [editNumParc, setEditNumParc] = useState<number>(1);
  const [editTotalParc, setEditTotalParc] = useState<number>(3);
  const [editVencimento, setEditVencimento] = useState('');
  const [editValor, setEditValor] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'a_vencer' | 'paga'>('a_vencer');

  // Modal 3: Excluir Parcela state
  const [deletingParcela, setDeletingParcela] = useState<Parcela | null>(null);

  // Filtered Parcelas according to period mode
  const filteredParcelas = useMemo(() => {
    return parcelasList.filter((p) => {
      if (periodMode === 'todo') return true;
      const parts = p.dataVencimento.split('-');
      if (parts.length === 3) {
        const [ano, mes] = parts;
        return mes === selectedMes && ano === selectedAno;
      }
      return true;
    });
  }, [parcelasList, periodMode, selectedMes, selectedAno]);

  // Totals calculated from filtered parcelas
  const totalAVencer = useMemo(() => {
    return filteredParcelas
      .filter((p) => p.status === 'a_vencer' || p.status === 'em_atraso')
      .reduce((sum, p) => sum + p.valorParcela, 0);
  }, [filteredParcelas]);

  const totalQuitado = useMemo(() => {
    return filteredParcelas
      .filter((p) => p.status === 'paga')
      .reduce((sum, p) => sum + p.valorParcela, 0);
  }, [filteredParcelas]);

  // Card specific invoice calculation based on current filter
  const getCardFatura = (cardId: string) => {
    return filteredParcelas
      .filter(
        (p) =>
          (p.cartaoId === cardId || (cardId === 'cartao-nubank' && !p.cartaoId)) &&
          (p.status === 'a_vencer' || p.status === 'em_atraso')
      )
      .reduce((sum, p) => sum + p.valorParcela, 0);
  };

  // Card slider scrolling
  const scrollCards = (direction: number) => {
    if (cardsSliderRef.current) {
      const step = cardsSliderRef.current.clientWidth > 400 ? 360 : 300;
      cardsSliderRef.current.scrollBy({ left: direction * step, behavior: 'smooth' });
    }
  };

  const handleSliderScroll = () => {
    if (cardsSliderRef.current) {
      const clientWidth = cardsSliderRef.current.clientWidth;
      const scrollLeft = cardsSliderRef.current.scrollLeft;
      const index = Math.round(scrollLeft / (clientWidth * 0.85)) + 1;
      setMobileCardIndex(Math.min(Math.max(index, 1), Math.max(cardsList.length, 1)));
    }
  };

  // Card Cadastro Handler
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadApelido.trim()) return;

    const isConta = cadTipoReg === 'conta';
    const newCard: ExtendedCartao = {
      id: `card-${Date.now()}`,
      apelido: cadApelido.trim(),
      tipo: isConta ? 'conta_corrente' : 'credito',
      isConta,
      bandeira: isConta ? 'Pix' : cadBandeira,
      ultimosDigitos: isConta ? cadChaveFinal.trim() || '****' : cadDigitos.trim() || '****',
      diaFechamento: isConta ? 1 : cadFechamento,
      diaVencimento: isConta ? 1 : cadVencimento,
      limite: 20000,
      titular: cadTitular.trim() || 'Natanael',
      banco: cadBanco,
      tipoChave: cadTipoChave,
      chavePix: cadChaveFinal,
      agenciaConta: cadAgenciaConta,
      obraVinculada: cadObra,
    };

    setCardsList((prev) => [...prev, newCard]);
    setIsCadastroModalOpen(false);
    showToast('Cadastrado com sucesso', `${newCard.apelido} foi adicionado à obra.`);

    // Reset fields
    setCadApelido('');
    setCadDigitos('');
    setCadChaveFinal('');
    setCadAgenciaConta('');
  };

  // Parcela Edit Handler
  const openEditarModal = (parcela: Parcela) => {
    setEditingParcela(parcela);
    setEditDescricao(parcela.descricao);
    setEditCartaoId(parcela.cartaoId || 'cartao-nubank');
    setEditNumParc(parcela.numeroParcela);
    setEditTotalParc(parcela.totalParcelas);
    setEditVencimento(parcela.dataVencimento);
    setEditValor(parcela.valorParcela);
    setEditStatus(parcela.status === 'paga' ? 'paga' : 'a_vencer');
    setIsEditarModalOpen(true);
  };

  const handleSaveEditParcela = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParcela) return;

    setParcelasList((prev) =>
      prev.map((p) => {
        if (p.id === editingParcela.id) {
          return {
            ...p,
            descricao: editDescricao.trim(),
            cartaoId: editCartaoId,
            numeroParcela: editNumParc,
            totalParcelas: editTotalParc,
            dataVencimento: editVencimento,
            valorParcela: editValor,
            status: editStatus,
          };
        }
        return p;
      })
    );

    setIsEditarModalOpen(false);
    setEditingParcela(null);
    showToast('Parcela atualizada', 'Os dados do lançamento foram alterados com sucesso.');
  };

  // Parcela Delete Handler
  const openExcluirModal = (parcela: Parcela) => {
    setDeletingParcela(parcela);
    setIsExcluirModalOpen(true);
  };

  const handleConfirmDeleteParcela = () => {
    if (!deletingParcela) return;
    setParcelasList((prev) => prev.filter((p) => p.id !== deletingParcela.id));
    setIsExcluirModalOpen(false);
    setDeletingParcela(null);
    showToast('Parcela excluída', 'O registro foi removido com sucesso.');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-200">
      
      {/* 1. Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
            Cartões
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Controle de faturas, parcelas e contas da obra.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsCadastroModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="leading-none">Cadastrar Cartão / Conta</span>
          </button>
        </div>
      </div>

      {/* 2. Alerta Resumido e Compacto de Compras Pendentes */}
      <div className="bg-[#f8c076]/10 border border-[#f8c076]/30 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-[18px] text-[#d9941a] dark:text-[#f8c076] shrink-0">
            warning
          </span>
          <p className="text-[#111c2d] dark:text-white uppercase tracking-wider text-[11px] truncate">
            <strong className="font-extrabold">1 COMPRA PENDENTE</strong> DE VÍNCULO COM CARTÃO OU PARCELAMENTO
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateToTabWithFilter('despesas', 'nao_informado')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0085db] hover:text-white bg-[#0085db]/10 hover:bg-[#0085db] rounded-lg transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer active:scale-95 shrink-0"
        >
          <span>VER PENDÊNCIA</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>

      {/* 3. Barra de Filtro de Período da Obra Selecionada */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-4 shadow-[0px_2px_6px_rgba(37,83,185,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center h-10 p-1 bg-[#f0f5f9] dark:bg-[#15263a] rounded-xl text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setPeriodMode('mes')}
              className={`flex-1 sm:flex-initial h-8 px-3.5 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer text-xs ${
                periodMode === 'mes'
                  ? 'bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold shadow-xs leading-none'
                  : 'text-[#707a82] hover:text-[#111c2d] dark:hover:text-white font-semibold leading-none'
              }`}
            >
              Mês / Ano
            </button>
            <button
              type="button"
              onClick={() => setPeriodMode('todo')}
              className={`flex-1 sm:flex-initial h-8 px-3.5 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer text-xs ${
                periodMode === 'todo'
                  ? 'bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold shadow-xs leading-none'
                  : 'text-[#707a82] hover:text-[#111c2d] dark:hover:text-white font-semibold leading-none'
              }`}
            >
              Todo o Período
            </button>
          </div>

          {periodMode === 'mes' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedMes}
                onChange={(e) => setSelectedMes(e.target.value)}
                className="flex-1 sm:flex-initial h-10 px-3 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-[#0085db]"
              >
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
                <option value="01">Janeiro</option>
              </select>
              <select
                value={selectedAno}
                onChange={(e) => setSelectedAno(e.target.value)}
                className="flex-1 sm:flex-initial h-10 px-3 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-[#0085db]"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#707a82] dark:text-[#7c8fac]">
          <span className="material-symbols-outlined text-[16px] text-[#0085db]">date_range</span>
          <span>
            Período:{' '}
            <strong className="text-[#111c2d] dark:text-white font-bold">
              {periodMode === 'todo' ? 'Todo o Período' : `${MONTH_NAMES[selectedMes] || selectedMes} / ${selectedAno}`}
            </strong>
          </span>
        </div>
      </div>

      {/* 4. Seção de Cartões & Contas Ativas com Carrossel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#707a82] dark:text-[#7c8fac] font-bold uppercase tracking-wider">
            CARTÕES &amp; CONTAS ATIVAS ({cardsList.length})
          </span>

          {/* Controles de navegação do carrossel */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollCards(-1)}
              title="Cartões Anteriores"
              className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="text-[11px] font-bold px-1 text-[#707a82] sm:hidden">
              {mobileCardIndex}/{cardsList.length}
            </span>
            <button
              type="button"
              onClick={() => scrollCards(1)}
              title="Mais Cartões à Direita"
              className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white hover:text-[#0085db] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Carrossel Deslizante de Cartões */}
        <div className="relative overflow-hidden">
          <div
            ref={cardsSliderRef}
            onScroll={handleSliderScroll}
            className="flex items-stretch gap-4 md:gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-1 snap-x snap-mandatory"
          >
            {cardsList.map((card) => {
              const isNubank = card.apelido.toLowerCase().includes('nubank');
              const isInter = card.apelido.toLowerCase().includes('inter');
              const isContaCorrente = card.isConta || card.tipo === 'conta_corrente';
              const cardFatura = getCardFatura(card.id);

              if (isContaCorrente) {
                return (
                  <div
                    key={card.id}
                    className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-center relative overflow-hidden rounded-[22px] p-5 shadow-lg border border-[#0085db]/25 bg-gradient-to-br from-white to-[#f0f6fc] dark:from-[#111c2d] dark:to-[#16253b] text-[#111c2d] dark:text-white flex flex-col justify-between min-h-[175px] md:h-[180px] transition-transform hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#0085db]"></div>
                    <div>
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-[#0085db]">
                            account_balance
                          </span>
                          <span className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wide">
                            Conta Corrente
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#10bd9d]/15 text-[#10bd9d]">
                          <span className="material-symbols-outlined text-[11px]">bolt</span>
                          <span>PIX</span>
                        </span>
                      </div>

                      <div className="mt-3.5">
                        <h2 className="text-sm font-extrabold uppercase tracking-wide truncate">
                          {card.apelido}
                        </h2>
                        <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5 font-medium">
                          Chave Final {card.ultimosDigitos || '1289'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-baseline justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#707a82] dark:text-[#7c8fac]">
                        PREVISÃO DE SAÍDA
                      </span>
                      <span className="text-lg font-black text-[#0085db] tabular-nums tracking-tight">
                        R$ 0,00
                      </span>
                    </div>
                  </div>
                );
              }

              // Cartão de Crédito Escuro
              return (
                <div
                  key={card.id}
                  className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-center relative overflow-hidden rounded-[22px] p-5 shadow-lg border border-[#2b3544] bg-[#111927] text-white flex flex-col justify-between min-h-[175px] md:h-[180px] transition-transform hover:-translate-y-1 hover:border-[#0085db]/40"
                >
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none"></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isNubank ? (
                          <div className="w-8 h-6 rounded-md bg-gradient-to-r from-[#eab308] to-[#facc15] shadow-xs"></div>
                        ) : isInter ? (
                          <div className="w-8 h-6 rounded-md bg-gradient-to-r from-[#ea580c] to-[#f97316] shadow-xs"></div>
                        ) : (
                          <div className="w-8 h-6 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 shadow-xs"></div>
                        )}
                        <span className="material-symbols-outlined text-[15px] text-zinc-400 rotate-90 leading-none">
                          wifi
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-zinc-300 tracking-wider">
                        •••• {card.ultimosDigitos || '4821'}
                      </span>
                    </div>

                    <div className="mt-3.5">
                      <h2 className="text-sm font-extrabold text-white uppercase tracking-wide truncate">
                        {card.apelido}
                      </h2>
                      <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
                        Vence dia {String(card.diaVencimento || 5).padStart(2, '0')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-baseline justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      FATURA
                    </span>
                    <span
                      className={`text-lg font-black tabular-nums tracking-tight ${
                        isNubank
                          ? 'text-[#facc15]'
                          : cardFatura > 0
                          ? 'text-[#facc15]'
                          : 'text-emerald-400'
                      }`}
                    >
                      {formatBRL(cardFatura)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Barra de Paginação Solta e em Cima */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] px-4 py-3 flex items-center justify-between shadow-[0px_2px_6px_rgba(37,83,185,0.04)]">
        <div className="text-xs text-[#707a82] dark:text-[#7c8fac]">
          Página <strong className="text-[#111c2d] dark:text-white">{currentPage}</strong> de{' '}
          <strong className="text-[#111c2d] dark:text-white">{totalPages}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            title="Página Anterior"
            className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          {/* Janela de 3 pílulas de página */}
          <div className="flex items-center gap-1 px-1 transition-all duration-300">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#0085db] text-white shadow-xs transform scale-105'
                    : 'text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] hover:text-[#111c2d] dark:hover:text-white font-semibold'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            title="Próxima Página"
            className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* 6. Tabela / Cartões: Parcelas & Vencimentos */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[20px] p-4 sm:p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] space-y-4">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-[#e6ecf1] dark:border-[#333f55] gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#0085db]">calendar_today</span>
            <h2 className="text-sm font-bold text-[#111c2d] dark:text-white leading-none uppercase tracking-wider">
              PARCELAS &amp; VENCIMENTOS
            </h2>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider font-semibold">
            TOTAL A VENCER: <strong className="text-[#fb977d] font-bold">{formatBRL(totalAVencer)}</strong> · TOTAL QUITADO: <strong className="text-[#4bd08b] font-bold">{formatBRL(totalQuitado)}</strong>
          </p>
        </div>

        {/* Mobile View: Cards Verticais Touch */}
        <div className="block sm:hidden space-y-2.5">
          {filteredParcelas.length === 0 ? (
            <p className="text-xs text-center text-[#707a82] py-4">Nenhuma parcela para o período selecionado.</p>
          ) : (
            filteredParcelas.map((p) => {
              const card = cardsList.find((c) => c.id === p.cartaoId);
              const weekday = getWeekdayName(p.dataVencimento);
              const isPaga = p.status === 'paga';

              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#707a82]">
                      {formatDateToBR(p.dataVencimento)} {weekday && `· ${weekday.split('-')[0]}`}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase inline-flex items-center gap-1 ${
                        isPaga
                          ? 'bg-[#4bd08b]/20 text-[#10bd9d] dark:text-[#4bd08b]'
                          : 'bg-[#f8c076]/20 text-[#d9941a] dark:text-[#f8c076]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {isPaga ? 'check_circle' : 'schedule'}
                      </span>
                      <span>{isPaga ? 'Paga' : 'A Vencer'}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#111c2d] dark:text-white">
                      {p.descricao}
                    </h4>
                    <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">
                      {card?.apelido || 'Nubank Natanael'} · Parcela {p.numeroParcela} de {p.totalParcelas}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]/60">
                    <span className="text-xs font-black text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(p.valorParcela)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditarModal(p)}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] hover:text-[#0085db] flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                        title="Editar parcela"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openExcluirModal(p)}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                        title="Excluir parcela"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop & Tablet View: Tabela Completa */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] font-bold text-[11px] uppercase tracking-wider">
                <th className="pb-3 whitespace-nowrap">Vencimento</th>
                <th className="pb-3">Descrição da Compra</th>
                <th className="pb-3 whitespace-nowrap">Parcela</th>
                <th className="pb-3 whitespace-nowrap">Cartão</th>
                <th className="pb-3 text-right whitespace-nowrap">Valor da Parcela</th>
                <th className="pb-3 text-center whitespace-nowrap">Status</th>
                <th className="pb-3 text-right whitespace-nowrap">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
              {filteredParcelas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[#707a82]">
                    Nenhuma parcela cadastrada para o período selecionado.
                  </td>
                </tr>
              ) : (
                filteredParcelas.map((p) => {
                  const card = cardsList.find((c) => c.id === p.cartaoId);
                  const weekday = getWeekdayName(p.dataVencimento);
                  const isPaga = p.status === 'paga';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors"
                    >
                      <td className="py-3 font-semibold text-[#111c2d] dark:text-white whitespace-nowrap">
                        <span>{formatDateToBR(p.dataVencimento)}</span>
                        {weekday && (
                          <span className="block text-[10px] text-[#707a82] font-normal">
                            {weekday}
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-bold text-[#111c2d] dark:text-white">
                        {p.descricao}
                      </td>
                      <td className="py-3 text-[#707a82] dark:text-[#7c8fac] tabular-nums whitespace-nowrap">
                        {p.numeroParcela} de {p.totalParcelas}
                      </td>
                      <td className="py-3 text-[#707a82] dark:text-[#7c8fac] font-medium whitespace-nowrap">
                        {card?.apelido || 'Nubank Natanael'}
                      </td>
                      <td className="py-3 text-right font-black text-[#111c2d] dark:text-white tabular-nums whitespace-nowrap">
                        {formatBRL(p.valorParcela)}
                      </td>
                      <td className="py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            isPaga
                              ? 'bg-[#4bd08b]/20 text-[#10bd9d] dark:text-[#4bd08b]'
                              : 'bg-[#f8c076]/20 text-[#d9941a] dark:text-[#f8c076]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px] shrink-0">
                            {isPaga ? 'check_circle' : 'schedule'}
                          </span>
                          <span>{isPaga ? 'Paga' : 'A Vencer'}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditarModal(p)}
                            className="p-1.5 text-[#707a82] hover:text-[#0085db] rounded-lg hover:bg-[#0085db]/10 transition-colors cursor-pointer"
                            title="Editar parcela"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openExcluirModal(p)}
                            className="p-1.5 text-[#707a82] hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Excluir parcela"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
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

      {/* ========================================================================= */}
      {/* MODAL 1: CADASTRAR CARTÃO OU CONTA (Integrado & Idêntico ao Modelo)        */}
      {/* ========================================================================= */}
      {isCadastroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCadastroModalOpen(false)}
          />

          <div className="relative z-50 w-full max-w-lg bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">
                    {cadTipoReg === 'cartao' ? 'credit_card' : 'account_balance'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111c2d] dark:text-white">
                    Cadastrar Cartão / Conta
                  </h3>
                  <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                    Controle de vencimento de faturas e saídas financeiras da obra.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCadastroModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Formulário de Cadastro */}
            <form onSubmit={handleSaveCard} className="p-6 space-y-4">
              
              {/* Tipo de Cadastro */}
              <div className="p-4 rounded-2xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#e6ecf1] dark:border-[#333f55]">
                  <span className="material-symbols-outlined text-[18px] text-[#0085db]">category</span>
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                    TIPO DE CADASTRO
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <label
                    onClick={() => setCadTipoReg('cartao')}
                    className={`relative flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                      cadTipoReg === 'cartao'
                        ? 'border-[#0085db] bg-[#0085db]/5'
                        : 'border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] hover:border-[#0085db]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          cadTipoReg === 'cartao'
                            ? 'bg-[#0085db] text-white'
                            : 'bg-[#f0f5f9] dark:bg-[#15263a] text-[#707a82]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">credit_card</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#111c2d] dark:text-white">
                          Cartão de Crédito
                        </span>
                        <span className="block text-[10px] text-[#707a82] dark:text-[#7c8fac]">
                          Fatura e parcelas
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setCadTipoReg('conta')}
                    className={`relative flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                      cadTipoReg === 'conta'
                        ? 'border-[#0085db] bg-[#0085db]/5'
                        : 'border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] hover:border-[#0085db]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          cadTipoReg === 'conta'
                            ? 'bg-[#0085db] text-white'
                            : 'bg-[#f0f5f9] dark:bg-[#15263a] text-[#707a82]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">account_balance</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#111c2d] dark:text-white">
                          Conta Bancária / Pix
                        </span>
                        <span className="block text-[10px] text-[#707a82] dark:text-[#7c8fac]">
                          Débito direto (D+0)
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dados do Cartão ou Conta */}
              <div className="p-4 rounded-2xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-[#e6ecf1] dark:border-[#333f55]">
                  <span className="material-symbols-outlined text-[18px] text-[#0085db]">badge</span>
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                    {cadTipoReg === 'cartao' ? 'DADOS DO CARTÃO' : 'DADOS DA CONTA BANCÁRIA'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                    NOME / APELIDO DE IDENTIFICAÇÃO *
                  </label>
                  <input
                    type="text"
                    required
                    value={cadApelido}
                    onChange={(e) => setCadApelido(e.target.value)}
                    placeholder={
                      cadTipoReg === 'cartao'
                        ? 'Ex: NUBANK NATANAEL, INTER OBRA PJ...'
                        : 'Ex: BRADESCO MATRIZ, ITAÚ OPERACIONAL...'
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white uppercase font-bold focus:ring-2 focus:ring-[#0085db]"
                  />
                </div>

                {cadTipoReg === 'cartao' ? (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                          BANDEIRA
                        </label>
                        <select
                          value={cadBandeira}
                          onChange={(e) => setCadBandeira(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
                        >
                          <option value="Mastercard">Mastercard</option>
                          <option value="Visa">Visa</option>
                          <option value="Elo">Elo</option>
                          <option value="Hipercard">Hipercard</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                          4 ÚLTIMOS DÍGITOS
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={cadDigitos}
                          onChange={(e) => setCadDigitos(e.target.value)}
                          placeholder="4821"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-mono font-bold tracking-wider"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                          DIA DE FECHAMENTO *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={cadFechamento}
                          onChange={(e) => setCadFechamento(parseInt(e.target.value) || 25)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                          DIA DE VENCIMENTO *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={cadVencimento}
                          onChange={(e) => setCadVencimento(parseInt(e.target.value) || 5)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                          BANCO
                        </label>
                        <select
                          value={cadBanco}
                          onChange={(e) => setCadBanco(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
                        >
                          <option value="Bradesco">Bradesco</option>
                          <option value="Itaú">Itaú</option>
                          <option value="Banco do Brasil">Banco do Brasil</option>
                          <option value="Caixa Econômica">Caixa Econômica</option>
                          <option value="Inter">Inter Empresas</option>
                          <option value="Nubank PJ">Nubank PJ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                          TIPO DE CHAVE PIX
                        </label>
                        <select
                          value={cadTipoChave}
                          onChange={(e) => setCadTipoChave(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
                        >
                          <option value="CNPJ">CNPJ da Empresa</option>
                          <option value="CPF">CPF do Titular</option>
                          <option value="E-mail">E-mail</option>
                          <option value="Telefone">Telefone</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                          FINAL DA CHAVE / CONTA
                        </label>
                        <input
                          type="text"
                          value={cadChaveFinal}
                          onChange={(e) => setCadChaveFinal(e.target.value)}
                          placeholder="Ex: 1289"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                          AGÊNCIA &amp; CONTA (OPCIONAL)
                        </label>
                        <input
                          type="text"
                          value={cadAgenciaConta}
                          onChange={(e) => setCadAgenciaConta(e.target.value)}
                          placeholder="Ex: Ag. 2381 / CC 10293-8"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Titular e Obra */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                      TITULAR RESPONSÁVEL
                    </label>
                    <input
                      type="text"
                      value={cadTitular}
                      onChange={(e) => setCadTitular(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                      OBRA VINCULADA
                    </label>
                    <select
                      value={cadObra}
                      onChange={(e) => setCadObra(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
                    >
                      <option value="juscelino">Obra Juscelino Mola</option>
                      <option value="alphaville">Obra Alphaville 02</option>
                      <option value="todas">Todas as Obras (Geral)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rodapé */}
              <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCadastroModalOpen(false)}
                  className="h-10 px-4 inline-flex items-center justify-center text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>{cadTipoReg === 'cartao' ? 'Cadastrar Cartão' : 'Cadastrar Conta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR PARCELA (Integrado & Idêntico ao Modelo)                   */}
      {/* ========================================================================= */}
      {isEditarModalOpen && editingParcela && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditarModalOpen(false)}
          />

          <div className="relative z-50 w-full max-w-lg bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">edit_note</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111c2d] dark:text-white">
                    Editar Parcela de Cartão
                  </h3>
                  <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                    Atualize vencimento, valor, cartão vinculado ou status de quitação.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditarModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Formulário de Edição */}
            <form onSubmit={handleSaveEditParcela} className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#e6ecf1] dark:border-[#333f55]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#0085db]">credit_card</span>
                    <span className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                      DADOS DA PARCELA
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      editStatus === 'paga'
                        ? 'bg-[#4bd08b]/20 text-[#10bd9d] dark:text-[#4bd08b]'
                        : 'bg-[#f8c076]/20 text-[#d9941a] dark:text-[#f8c076]'
                    }`}
                  >
                    {editStatus === 'paga' ? 'Paga' : 'A Vencer'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                    DESCRIÇÃO DA COMPRA *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDescricao}
                    onChange={(e) => setEditDescricao(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                      CARTÃO VINCULADO
                    </label>
                    <select
                      value={editCartaoId}
                      onChange={(e) => setEditCartaoId(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
                    >
                      {cardsList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.apelido} (•••• {c.ultimosDigitos || '****'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                      NÚMERO DA PARCELA
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={editNumParc}
                        onChange={(e) => setEditNumParc(parseInt(e.target.value) || 1)}
                        className="w-20 px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold text-center"
                      />
                      <span className="text-xs text-[#707a82] font-semibold">de</span>
                      <input
                        type="number"
                        min="1"
                        value={editTotalParc}
                        onChange={(e) => setEditTotalParc(parseInt(e.target.value) || 1)}
                        className="w-20 px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                      DATA DE VENCIMENTO
                    </label>
                    <input
                      type="date"
                      required
                      value={editVencimento}
                      onChange={(e) => setEditVencimento(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                      VALOR DA PARCELA (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editValor}
                      onChange={(e) => setEditValor(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                    SITUAÇÃO DO PAGAMENTO
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'a_vencer' | 'paga')}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
                  >
                    <option value="avencer">A Vencer (Fatura Aberta)</option>
                    <option value="paga">Paga (Fatura Liquidada)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditarModalOpen(false)}
                  className="h-10 px-4 inline-flex items-center justify-center text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EXCLUIR PARCELA (Integrado & Idêntico ao Modelo)                  */}
      {/* ========================================================================= */}
      {isExcluirModalOpen && deletingParcela && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsExcluirModalOpen(false)}
          />

          <div className="relative z-50 w-full max-w-sm bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">delete_forever</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                  Excluir Parcela
                </h2>
                <p className="text-[11px] text-[#707a82]">Ação irreversível no cronograma</p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                Deseja remover a parcela de{' '}
                <strong className="text-[#111c2d] dark:text-white">
                  {deletingParcela.descricao}
                </strong>
                ?
              </p>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-xs">
                <div>
                  <span className="block text-[#111c2d] dark:text-white font-bold">
                    {cardsList.find((c) => c.id === deletingParcela.cartaoId)?.apelido ||
                      'Nubank Natanael'}
                  </span>
                  <span className="text-[11px] text-[#707a82]">
                    Vencimento: {formatDateToBR(deletingParcela.dataVencimento)}
                  </span>
                </div>
                <span className="font-black text-[#111c2d] dark:text-white tabular-nums text-sm">
                  {formatBRL(deletingParcela.valorParcela)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsExcluirModalOpen(false)}
                className="h-9 px-3.5 inline-flex items-center justify-center text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteParcela}
                className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Feedback Integrado */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#111c2d] text-white px-4 py-3 rounded-2xl shadow-xl border border-zinc-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-[#10bd9d]/20 text-[#10bd9d] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div className="pr-2">
            <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
            <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{toast.desc}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

    </div>
  );
};

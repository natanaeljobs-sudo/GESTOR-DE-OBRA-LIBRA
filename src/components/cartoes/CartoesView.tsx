import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Pencil, Trash2, CheckCircle2, Clock } from 'lucide-react';
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

// Dados padrão idênticos aos modelos HTML (DESKTOP, TABLET, MOBILE)
const DEFAULT_CARDS: ExtendedCartao[] = [
  {
    id: 'card-nubank',
    apelido: 'NUBANK NATANAEL',
    tipo: 'credito',
    bandeira: 'Mastercard',
    ultimosDigitos: '4821',
    diaFechamento: 25,
    diaVencimento: 5,
    limite: 15000,
    titular: 'Natanael Master',
    isConta: false,
  },
  {
    id: 'card-inter',
    apelido: 'INTER OBRA PJ',
    tipo: 'credito',
    bandeira: 'Mastercard',
    ultimosDigitos: '9034',
    diaFechamento: 20,
    diaVencimento: 1,
    limite: 25000,
    titular: 'Construtora Libra PJ',
    isConta: false,
  },
  {
    id: 'card-bradesco',
    apelido: 'CONTA BRADESCO PIX',
    tipo: 'conta_corrente',
    bandeira: 'Pix',
    ultimosDigitos: '1289',
    diaFechamento: 1,
    diaVencimento: 1,
    limite: 0,
    titular: 'Construtora Libra Matriz',
    isConta: true,
  },
];

const DEFAULT_PARCELAS: Parcela[] = [
  {
    id: 'parc-01-1',
    despesaId: 'desp-01',
    cartaoId: 'card-nubank',
    numeroParcela: 1,
    totalParcelas: 3,
    valorParcela: 1616.83,
    dataVencimento: '2026-10-05',
    status: 'paga',
    descricao: 'COMPRA INICIAL CIMENTO E AREIA (1/3)',
  },
  {
    id: 'parc-01-2',
    despesaId: 'desp-01',
    cartaoId: 'card-nubank',
    numeroParcela: 2,
    totalParcelas: 3,
    valorParcela: 1616.83,
    dataVencimento: '2026-11-05',
    status: 'a_vencer',
    descricao: 'COMPRA INICIAL CIMENTO E AREIA (2/3)',
  },
  {
    id: 'parc-01-3',
    despesaId: 'desp-01',
    cartaoId: 'card-nubank',
    numeroParcela: 3,
    totalParcelas: 3,
    valorParcela: 1616.84,
    dataVencimento: '2026-12-05',
    status: 'a_vencer',
    descricao: 'COMPRA INICIAL CIMENTO E AREIA (3/3)',
  },
  {
    id: 'parc-02-1',
    despesaId: 'desp-02',
    cartaoId: 'card-inter',
    numeroParcela: 1,
    totalParcelas: 2,
    valorParcela: 2450.0,
    dataVencimento: '2026-11-01',
    status: 'paga',
    descricao: 'AÇO CA-50 E ESTRIBOS ESTRUTURAIS (1/2)',
  },
  {
    id: 'parc-02-2',
    despesaId: 'desp-02',
    cartaoId: 'card-inter',
    numeroParcela: 2,
    totalParcelas: 2,
    valorParcela: 2450.0,
    dataVencimento: '2026-12-01',
    status: 'a_vencer',
    descricao: 'AÇO CA-50 E ESTRIBOS ESTRUTURAIS (2/2)',
  },
  {
    id: 'parc-03-1',
    despesaId: 'desp-03',
    cartaoId: 'card-nubank',
    numeroParcela: 1,
    totalParcelas: 4,
    valorParcela: 980.0,
    dataVencimento: '2026-10-05',
    status: 'paga',
    descricao: 'TIJOLOS E BLOCOS CERÂMICOS (1/4)',
  },
  {
    id: 'parc-03-2',
    despesaId: 'desp-03',
    cartaoId: 'card-nubank',
    numeroParcela: 2,
    totalParcelas: 4,
    valorParcela: 980.0,
    dataVencimento: '2026-11-05',
    status: 'a_vencer',
    descricao: 'TIJOLOS E BLOCOS CERÂMICOS (2/4)',
  },
  {
    id: 'parc-03-3',
    despesaId: 'desp-03',
    cartaoId: 'card-nubank',
    numeroParcela: 3,
    totalParcelas: 4,
    valorParcela: 980.0,
    dataVencimento: '2026-12-05',
    status: 'a_vencer',
    descricao: 'TIJOLOS E BLOCOS CERÂMICOS (3/4)',
  },
  {
    id: 'parc-03-4',
    despesaId: 'desp-03',
    cartaoId: 'card-nubank',
    numeroParcela: 4,
    totalParcelas: 4,
    valorParcela: 980.0,
    dataVencimento: '2027-01-05',
    status: 'a_vencer',
    descricao: 'TIJOLOS E BLOCOS CERÂMICOS (4/4)',
  },
  {
    id: 'parc-04-1',
    despesaId: 'desp-04',
    cartaoId: 'card-inter',
    numeroParcela: 1,
    totalParcelas: 3,
    valorParcela: 1850.0,
    dataVencimento: '2026-11-01',
    status: 'a_vencer',
    descricao: 'CONCRETO USINADO FCK 25 LAJE (1/3)',
  },
  {
    id: 'parc-04-2',
    despesaId: 'desp-04',
    cartaoId: 'card-inter',
    numeroParcela: 2,
    totalParcelas: 3,
    valorParcela: 1850.0,
    dataVencimento: '2026-12-01',
    status: 'a_vencer',
    descricao: 'CONCRETO USINADO FCK 25 LAJE (2/3)',
  },
  {
    id: 'parc-04-3',
    despesaId: 'desp-04',
    cartaoId: 'card-inter',
    numeroParcela: 3,
    totalParcelas: 3,
    valorParcela: 1850.0,
    dataVencimento: '2027-01-01',
    status: 'a_vencer',
    descricao: 'CONCRETO USINADO FCK 25 LAJE (3/3)',
  },
];

export const CartoesView: React.FC = () => {
  const { navigateToTabWithFilter } = useApp();

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

  // Cards local state com os dados oficiais do modelo
  const [cardsList, setCardsList] = useState<ExtendedCartao[]>(DEFAULT_CARDS);

  // Parcelas local state com os dados oficiais do modelo
  const [parcelasList, setParcelasList] = useState<Parcela[]>(DEFAULT_PARCELAS);

  // Period filter states
  const [periodMode, setPeriodMode] = useState<'mes' | 'todo'>('todo');
  const [selectedMes, setSelectedMes] = useState<string>('11');
  const [selectedAno, setSelectedAno] = useState<string>('2026');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

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

  // Modais de Parcelas e Cartões
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
  const [isEditarParcelaModalOpen, setIsEditarParcelaModalOpen] = useState(false);
  const [isExcluirParcelaModalOpen, setIsExcluirParcelaModalOpen] = useState(false);
  const [isEditarCartaoModalOpen, setIsEditarCartaoModalOpen] = useState(false);
  const [isExcluirCartaoModalOpen, setIsExcluirCartaoModalOpen] = useState(false);

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

  // Modal 4: Editar Cartão state
  const [editingCartao, setEditingCartao] = useState<ExtendedCartao | null>(null);
  const [editCardNome, setEditCardNome] = useState('');
  const [editCardTipo, setEditCardTipo] = useState('Mastercard');
  const [editCardDigitos, setEditCardDigitos] = useState('');
  const [editCardFechamento, setEditCardFechamento] = useState<number>(25);
  const [editCardVencimento, setEditCardVencimento] = useState<number>(5);
  const [editCardTitular, setEditCardTitular] = useState('Natanael Master');

  // Modal 5: Excluir Cartão state
  const [deletingCartao, setDeletingCartao] = useState<ExtendedCartao | null>(null);

  // Parcelas filtradas conforme período selecionado
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

  // Reset de página ao alterar filtros de período
  useEffect(() => {
    setCurrentPage(1);
  }, [periodMode, selectedMes, selectedAno]);

  // Paginação dinâmica calculada sobre as parcelas filtradas
  const totalPages = Math.ceil(filteredParcelas.length / itemsPerPage);
  const safeCurrentPage = totalPages > 0 ? Math.min(Math.max(1, currentPage), totalPages) : 1;
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedParcelas = useMemo(() => {
    return filteredParcelas.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredParcelas, startIndex, itemsPerPage]);

  // Totais calculados
  const totalAVencer = useMemo(() => {
    return parcelasList
      .filter((p) => p.status === 'a_vencer' || p.status === 'em_atraso')
      .reduce((sum, p) => sum + p.valorParcela, 0);
  }, [parcelasList]);

  const totalQuitado = useMemo(() => {
    return parcelasList
      .filter((p) => p.status === 'paga')
      .reduce((sum, p) => sum + p.valorParcela, 0);
  }, [parcelasList]);

  // Cálculo da fatura do cartão
  const getCardFatura = (cardId: string) => {
    return parcelasList
      .filter(
        (p) =>
          (p.cartaoId === cardId || (cardId === 'card-nubank' && !p.cartaoId)) &&
          (p.status === 'a_vencer' || p.status === 'em_atraso')
      )
      .reduce((sum, p) => sum + p.valorParcela, 0);
  };

  // Rolagem do carrossel
  const scrollCards = (direction: number) => {
    if (cardsSliderRef.current) {
      const step = cardsSliderRef.current.clientWidth > 400 ? 360 : cardsSliderRef.current.clientWidth + 16;
      cardsSliderRef.current.scrollBy({ left: direction * step, behavior: 'smooth' });
    }
  };

  const handleSliderScroll = () => {
    if (cardsSliderRef.current) {
      const clientWidth = cardsSliderRef.current.clientWidth;
      const scrollLeft = cardsSliderRef.current.scrollLeft;
      const index = Math.round(scrollLeft / (clientWidth + 16)) + 1;
      setMobileCardIndex(Math.min(Math.max(index, 1), Math.max(cardsList.length, 1)));
    }
  };

  // Handler: Cadastrar Cartão / Conta
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadApelido.trim()) return;

    const isConta = cadTipoReg === 'conta';
    const newCard: ExtendedCartao = {
      id: `card-${Date.now()}`,
      apelido: cadApelido.trim().toUpperCase(),
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

  // Handler: Editar Cartão / Conta
  const openEditarCartaoModal = (card: ExtendedCartao) => {
    setEditingCartao(card);
    setEditCardNome(card.apelido);
    setEditCardTipo(card.isConta || card.tipo === 'conta_corrente' ? 'Pix' : card.bandeira || 'Mastercard');
    setEditCardDigitos(card.ultimosDigitos || '');
    setEditCardFechamento(card.diaFechamento || 25);
    setEditCardVencimento(card.diaVencimento || 5);
    setEditCardTitular(card.titular || 'Natanael Master');
    setIsEditarCartaoModalOpen(true);
  };

  const handleSaveEditCartao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCartao) return;

    const isConta = editCardTipo === 'Pix';
    setCardsList((prev) =>
      prev.map((c) => {
        if (c.id === editingCartao.id) {
          return {
            ...c,
            apelido: editCardNome.trim().toUpperCase(),
            bandeira: editCardTipo,
            tipo: isConta ? 'conta_corrente' : 'credito',
            isConta,
            ultimosDigitos: editCardDigitos.trim(),
            diaFechamento: isConta ? 1 : editCardFechamento,
            diaVencimento: isConta ? 1 : editCardVencimento,
            titular: editCardTitular.trim(),
          };
        }
        return c;
      })
    );

    setIsEditarCartaoModalOpen(false);
    setEditingCartao(null);
    showToast('Alterações salvas', `Os dados de "${editCardNome.toUpperCase()}" foram atualizados.`);
  };

  // Handler: Excluir Cartão / Conta
  const openExcluirCartaoModal = (card: ExtendedCartao) => {
    setDeletingCartao(card);
    setIsExcluirCartaoModalOpen(true);
  };

  const handleConfirmDeleteCartao = () => {
    if (!deletingCartao) return;
    const nome = deletingCartao.apelido;
    setCardsList((prev) => prev.filter((c) => c.id !== deletingCartao.id));
    setIsExcluirCartaoModalOpen(false);
    setDeletingCartao(null);
    showToast('Cartão removido', `"${nome}" foi excluído com sucesso.`);
  };

  // Handler: Editar Parcela
  const openEditarParcelaModal = (parcela: Parcela) => {
    setEditingParcela(parcela);
    setEditDescricao(parcela.descricao);
    setEditCartaoId(parcela.cartaoId || 'card-nubank');
    setEditNumParc(parcela.numeroParcela);
    setEditTotalParc(parcela.totalParcelas);
    setEditVencimento(parcela.dataVencimento);
    setEditValor(parcela.valorParcela);
    setEditStatus(parcela.status === 'paga' ? 'paga' : 'a_vencer');
    setIsEditarParcelaModalOpen(true);
  };

  const handleSaveEditParcela = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParcela) return;

    setParcelasList((prev) =>
      prev.map((p) => {
        if (p.id === editingParcela.id) {
          return {
            ...p,
            descricao: editDescricao.trim().toUpperCase(),
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

    setIsEditarParcelaModalOpen(false);
    setEditingParcela(null);
    showToast('Parcela atualizada', 'Os dados do lançamento foram alterados com sucesso.');
  };

  // Handler: Excluir Parcela
  const openExcluirParcelaModal = (parcela: Parcela) => {
    setDeletingParcela(parcela);
    setIsExcluirParcelaModalOpen(true);
  };

  const handleConfirmDeleteParcela = () => {
    if (!deletingParcela) return;
    setParcelasList((prev) => prev.filter((p) => p.id !== deletingParcela.id));
    setIsExcluirParcelaModalOpen(false);
    setDeletingParcela(null);
    showToast('Parcela excluída', 'O registro foi removido com sucesso.');
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-200">
      
      {/* 1. Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 sm:px-5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="leading-none">Cadastrar Cartão / Conta</span>
          </button>
        </div>
      </div>

      {/* 2. Alerta de Compras Pendentes em Caixa Alta */}
      <div className="bg-[#f8c076]/10 border border-[#f8c076]/30 rounded-xl sm:rounded-[18px] p-3 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-[18px] text-[#d9941a] dark:text-[#f8c076] shrink-0">
            warning
          </span>
          <p className="text-[#111c2d] dark:text-white uppercase tracking-wider text-[11px] truncate font-bold sm:font-normal">
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

      {/* 3. Filtro de Período da Obra (Mobile View) */}
      <div className="block sm:hidden bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-2xl p-3.5 shadow-[0px_2px_6px_rgba(37,83,185,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#e6ecf1]/70 dark:border-[#333f55]/60">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#0085db]">date_range</span>
            <span className="text-[10px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider">
              PERÍODO DA OBRA
            </span>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#0085db]/10 text-[#0085db] font-bold uppercase tracking-wide">
            {periodMode === 'todo' ? 'Todo o Período' : `${MONTH_NAMES[selectedMes] || selectedMes} / ${selectedAno}`}
          </span>
        </div>

        <div className="flex items-center h-9 p-1 bg-[#f0f5f9] dark:bg-[#15263a] rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setPeriodMode('mes')}
            className={`flex-1 h-7 inline-flex items-center justify-center rounded-lg text-[11px] transition-all cursor-pointer ${
              periodMode === 'mes'
                ? 'bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold shadow-xs'
                : 'text-[#707a82] dark:text-[#7c8fac] font-semibold'
            }`}
          >
            Mês / Ano
          </button>
          <button
            type="button"
            onClick={() => setPeriodMode('todo')}
            className={`flex-1 h-7 inline-flex items-center justify-center rounded-lg text-[11px] transition-all cursor-pointer ${
              periodMode === 'todo'
                ? 'bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold shadow-xs'
                : 'text-[#707a82] dark:text-[#7c8fac] font-semibold'
            }`}
          >
            Todo o Período
          </button>
        </div>

        {periodMode === 'mes' && (
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-[#0085db]"
            >
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
              <option value="01">Janeiro</option>
            </select>
            <select
              value={selectedAno}
              onChange={(e) => setSelectedAno(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-[#0085db]"
            >
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        )}
      </div>

      {/* 3. Filtro de Período da Obra (Desktop & Tablet View) */}
      <div className="hidden sm:flex bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-4 shadow-[0px_2px_6px_rgba(37,83,185,0.04)] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center h-10 p-1 bg-[#f0f5f9] dark:bg-[#15263a] rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setPeriodMode('mes')}
              className={`h-8 px-3.5 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer text-xs ${
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
              className={`h-8 px-3.5 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer text-xs ${
                periodMode === 'todo'
                  ? 'bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold shadow-xs leading-none'
                  : 'text-[#707a82] hover:text-[#111c2d] dark:hover:text-white font-semibold leading-none'
              }`}
            >
              Todo o Período
            </button>
          </div>

          {periodMode === 'mes' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedMes}
                onChange={(e) => setSelectedMes(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-[#0085db]"
              >
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
                <option value="01">Janeiro</option>
              </select>
              <select
                value={selectedAno}
                onChange={(e) => setSelectedAno(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-[#0085db]"
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
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0085db]/10 text-[#0085db] font-bold uppercase">
            Obra Juscelino Mola
          </span>
        </div>
      </div>

      {/* 4. Seção de Cartões Ativos (Carrossel Responsivo com Ações de Edição e Exclusão) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs text-[#707a82] dark:text-[#7c8fac] font-bold uppercase tracking-wider">
            CARTÕES &amp; CONTAS ATIVAS ({cardsList.length})
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollCards(-1)}
              title="Cartões Anteriores"
              className="w-7 h-7 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">chevron_left</span>
            </button>
            <span className="text-[11px] font-bold px-1 text-[#707a82] sm:hidden">
              {mobileCardIndex}/{cardsList.length}
            </span>
            <button
              type="button"
              onClick={() => scrollCards(1)}
              title="Mais Cartões à Direita"
              className="w-7 h-7 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white hover:text-[#0085db] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Carrossel Deslizante de Cartões */}
        <div className="relative overflow-hidden">
          <style>{`
            .cards-slider-track::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
            }
          `}</style>
          <div
            ref={cardsSliderRef}
            onScroll={handleSliderScroll}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="cards-slider-track flex items-stretch gap-4 overflow-x-auto scroll-smooth no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 snap-x snap-mandatory"
          >
            {cardsList.map((card) => {
              const isNubank = card.apelido.toUpperCase().includes('NUBANK');
              const isInter = card.apelido.toUpperCase().includes('INTER');
              const isContaCorrente = card.isConta || card.tipo === 'conta_corrente';
              const cardFatura = getCardFatura(card.id);

              if (isContaCorrente) {
                return (
                  <div
                    key={card.id}
                    className="w-full sm:w-[320px] md:w-[340px] shrink-0 snap-center relative overflow-hidden rounded-[22px] p-5 shadow-lg border border-[#0085db]/30 bg-gradient-to-br from-white to-[#f0f6fc] dark:from-[#111c2d] dark:to-[#16253b] text-[#111c2d] dark:text-white flex flex-col justify-between min-h-[175px] md:min-h-[180px] transition-transform hover:-translate-y-1 hover:shadow-md group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#0085db]"></div>
                    <div>
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-[#0085db]">
                            account_balance
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wide">
                            Conta Corrente
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#10bd9d]/15 text-[#10bd9d]">
                            <span className="material-symbols-outlined text-[11px]">bolt</span>
                            <span>PIX</span>
                          </span>
                          <div className="flex items-center gap-1 pl-1 border-l border-[#e6ecf1] dark:border-[#333f55]">
                            <button
                              type="button"
                              onClick={() => openEditarCartaoModal(card)}
                              className="w-6 h-6 rounded-md bg-[#f0f5f9] dark:bg-[#1a2535] hover:bg-[#0085db] text-[#707a82] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Editar conta"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openExcluirCartaoModal(card)}
                              className="w-6 h-6 rounded-md bg-[#f0f5f9] dark:bg-[#1a2535] hover:bg-rose-600 text-[#707a82] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Excluir conta"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </div>
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

              // Cartão de Crédito
              return (
                <div
                  key={card.id}
                  className="w-full sm:w-[320px] md:w-[340px] shrink-0 snap-center relative overflow-hidden rounded-[22px] p-5 shadow-lg border border-[#2b3544] bg-[#111927] text-white flex flex-col justify-between min-h-[175px] md:min-h-[180px] transition-transform hover:-translate-y-1 hover:border-[#0085db]/40 group"
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-300 tracking-wider">
                          •••• {card.ultimosDigitos || '4821'}
                        </span>
                        <div className="flex items-center gap-1 pl-1 border-l border-white/20">
                          <button
                            type="button"
                            onClick={() => openEditarCartaoModal(card)}
                            className="w-6 h-6 rounded-md bg-white/10 hover:bg-[#0085db] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Editar cartão"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openExcluirCartaoModal(card)}
                            className="w-6 h-6 rounded-md bg-white/10 hover:bg-rose-600 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Excluir cartão"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                      </div>
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

      {/* 5. Barra de Paginação Solta e em Cima Idêntica ao Modelo (Exibida somente quando necessária: totalPages > 1) */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-[0px_2px_6px_rgba(37,83,185,0.04)]">
          <div className="text-xs text-[#707a82] dark:text-[#7c8fac]">
            Página <strong className="text-[#111c2d] dark:text-white">{safeCurrentPage}</strong> de{' '}
            <strong className="text-[#111c2d] dark:text-white">{totalPages}</strong>
            <span className="hidden sm:inline text-[11px] text-[#707a82] dark:text-[#7c8fac] ml-2">
              ({startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredParcelas.length)} de {filteredParcelas.length} parcelas)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safeCurrentPage === 1}
              title="Página Anterior"
              aria-label="Página Anterior"
              className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <div className="flex items-center gap-1 px-1 transition-all duration-300">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    safeCurrentPage === page
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
              disabled={safeCurrentPage === totalPages}
              title="Próxima Página"
              aria-label="Próxima Página"
              className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Tabela / Cards de Parcelas & Vencimentos */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-2xl sm:rounded-[20px] p-4 sm:p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] space-y-4">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-[#e6ecf1] dark:border-[#333f55] gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#0085db]">calendar_today</span>
            <h2 className="text-xs sm:text-sm font-bold text-[#111c2d] dark:text-white leading-none uppercase tracking-wider">
              PARCELAS &amp; VENCIMENTOS
            </h2>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider font-semibold">
            TOTAL A VENCER: <strong className="text-[#fb977d] font-bold">{formatBRL(totalAVencer)}</strong> · TOTAL QUITADO: <strong className="text-[#4bd08b] font-bold">{formatBRL(totalQuitado)}</strong>
          </p>
        </div>

        {/* Mobile View: Cards Verticais Touch */}
        <div className="block sm:hidden space-y-2.5">
          {paginatedParcelas.length === 0 ? (
            <p className="text-xs text-center text-[#707a82] py-4">Nenhuma parcela para o período selecionado.</p>
          ) : (
            paginatedParcelas.map((p) => {
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
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                        isPaga
                          ? 'bg-[#4bd08b]/15 text-[#10bd9d] dark:text-[#4bd08b] border border-[#4bd08b]/25'
                          : 'bg-[#f8c076]/18 text-[#d9941a] dark:text-[#f8c076] border border-[#f8c076]/30'
                      }`}
                    >
                      {isPaga ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      ) : (
                        <Clock className="w-3 h-3 shrink-0" />
                      )}
                      <span>{isPaga ? 'Paga' : 'A Vencer'}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#111c2d] dark:text-white uppercase">
                      {p.descricao}
                    </h4>
                    <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">
                      {card?.apelido || 'NUBANK NATANAEL'} · Parcela {p.numeroParcela} de {p.totalParcelas}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]/60">
                    <span className="text-xs font-black text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(p.valorParcela)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditarParcelaModal(p)}
                        className="p-1.5 rounded-lg text-[#707a82] hover:text-[#0085db] hover:bg-[#0085db]/10 transition-colors cursor-pointer"
                        title="Editar parcela"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openExcluirParcelaModal(p)}
                        className="p-1.5 rounded-lg text-[#707a82] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Excluir parcela"
                      >
                        <Trash2 className="w-4 h-4" />
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
                <th className="pb-3">Descrição</th>
                <th className="pb-3 whitespace-nowrap">Parcela</th>
                <th className="pb-3 whitespace-nowrap">Cartão</th>
                <th className="pb-3 text-right whitespace-nowrap">Valor da Parcela</th>
                <th className="pb-3 text-center whitespace-nowrap">Status</th>
                <th className="pb-3 text-right whitespace-nowrap">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
              {paginatedParcelas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[#707a82]">
                    Nenhuma parcela cadastrada para o período selecionado.
                  </td>
                </tr>
              ) : (
                paginatedParcelas.map((p) => {
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
                      <td className="py-3 font-bold text-[#111c2d] dark:text-white uppercase">
                        {p.descricao}
                      </td>
                      <td className="py-3 text-[#707a82] dark:text-[#7c8fac] tabular-nums whitespace-nowrap">
                        {p.numeroParcela} de {p.totalParcelas}
                      </td>
                      <td className="py-3 text-[#707a82] dark:text-[#7c8fac] font-medium whitespace-nowrap">
                        {card?.apelido || 'NUBANK NATANAEL'}
                      </td>
                      <td className="py-3 text-right font-black text-[#111c2d] dark:text-white tabular-nums whitespace-nowrap">
                        {formatBRL(p.valorParcela)}
                      </td>
                      <td className="py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            isPaga
                              ? 'bg-[#4bd08b]/15 text-[#10bd9d] dark:text-[#4bd08b] border border-[#4bd08b]/25'
                              : 'bg-[#f8c076]/18 text-[#d9941a] dark:text-[#f8c076] border border-[#f8c076]/30'
                          }`}
                        >
                          {isPaga ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>{isPaga ? 'Paga' : 'A Vencer'}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditarParcelaModal(p)}
                            className="p-1.5 text-[#707a82] hover:text-[#0085db] rounded-lg hover:bg-[#0085db]/10 transition-colors cursor-pointer"
                            title="Editar parcela"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openExcluirParcelaModal(p)}
                            className="p-1.5 text-[#707a82] hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Excluir parcela"
                          >
                            <Trash2 className="w-4 h-4" />
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
      {/* MODAL 1: CADASTRAR CARTÃO OU CONTA                                         */}
      {/* ========================================================================= */}
      {isCadastroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCadastroModalOpen(false)}
          />

          <div className="relative z-50 w-full max-w-lg bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                    Adicione um novo meio de pagamento à obra.
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
                          BANDEIRA / TIPO *
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
                          ÚLTIMOS DÍGITOS
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={cadDigitos}
                          onChange={(e) => setCadDigitos(e.target.value)}
                          placeholder="Ex: 4821"
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
      {/* MODAL 2: EDITAR PARCELA                                                   */}
      {/* ========================================================================= */}
      {isEditarParcelaModalOpen && editingParcela && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditarParcelaModalOpen(false)}
          />

          <div className="relative z-50 w-full max-w-lg bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                onClick={() => setIsEditarParcelaModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

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
                    <option value="a_vencer">A Vencer (Fatura Aberta)</option>
                    <option value="paga">Paga (Fatura Liquidada)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditarParcelaModalOpen(false)}
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
      {/* MODAL 3: EXCLUIR PARCELA                                                  */}
      {/* ========================================================================= */}
      {isExcluirParcelaModalOpen && deletingParcela && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsExcluirParcelaModalOpen(false)}
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
                      'NUBANK NATANAEL'}
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
                onClick={() => setIsExcluirParcelaModalOpen(false)}
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

      {/* ========================================================================= */}
      {/* MODAL 4: EDITAR CARTÃO / CONTA (Integrado & Idêntico ao Modelo)            */}
      {/* ========================================================================= */}
      {isEditarCartaoModalOpen && editingCartao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditarCartaoModalOpen(false)}
          />

          <div className="relative z-50 w-full max-w-md sm:max-w-lg bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    {editCardTipo === 'Pix' || editingCartao.isConta ? 'account_balance' : 'credit_card'}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111c2d] dark:text-white">
                    {editCardTipo === 'Pix' || editingCartao.isConta ? 'Editar Conta Bancária / Pix' : 'Editar Cartão de Crédito'}
                  </h2>
                  <p className="text-xs text-[#707a82]">
                    Atualize o apelido, dados da fatura ou chave.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditarCartaoModalOpen(false)}
                className="w-8 h-8 rounded-full text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditCartao} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                  NOME / APELIDO DE IDENTIFICAÇÃO *
                </label>
                <input
                  type="text"
                  required
                  value={editCardNome}
                  onChange={(e) => setEditCardNome(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white uppercase font-bold focus:ring-2 focus:ring-[#0085db]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                    BANDEIRA / TIPO
                  </label>
                  <select
                    value={editCardTipo}
                    onChange={(e) => setEditCardTipo(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
                  >
                    <option value="Mastercard">Mastercard</option>
                    <option value="Visa">Visa</option>
                    <option value="Elo">Elo</option>
                    <option value="Pix">Conta Corrente / Pix</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                    {editCardTipo === 'Pix' ? 'FINAL DA CHAVE' : 'ÚLTIMOS DÍGITOS'}
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editCardDigitos}
                    onChange={(e) => setEditCardDigitos(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-mono font-bold tracking-wider"
                  />
                </div>
              </div>

              {editCardTipo !== 'Pix' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                      DIA DE FECHAMENTO
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={editCardFechamento}
                      onChange={(e) => setEditCardFechamento(parseInt(e.target.value) || 25)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                      DIA DE VENCIMENTO
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={editCardVencimento}
                      onChange={(e) => setEditCardVencimento(parseInt(e.target.value) || 5)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider">
                  TITULAR RESPONSÁVEL
                </label>
                <input
                  type="text"
                  value={editCardTitular}
                  onChange={(e) => setEditCardTitular(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55]">
                <button
                  type="button"
                  onClick={() => setIsEditarCartaoModalOpen(false)}
                  className="h-10 px-4 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0074bf] active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EXCLUIR CARTÃO / CONTA (Integrado & Idêntico ao Modelo)           */}
      {/* ========================================================================= */}
      {isExcluirCartaoModalOpen && deletingCartao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsExcluirCartaoModalOpen(false)}
          />

          <div className="relative z-50 w-full max-w-sm bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </div>

            <h3 className="text-base font-bold text-[#111c2d] dark:text-white">
              Excluir Cartão / Conta?
            </h3>
            <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-1 leading-relaxed">
              Você tem certeza que deseja remover este meio de pagamento da obra?
            </p>

            <div className="my-4 p-3.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-left text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111c2d] dark:text-white truncate">
                  {deletingCartao.apelido}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[#707a82] font-semibold">
                  {deletingCartao.isConta ? 'Conta Bancária / Pix' : 'Cartão de Crédito'}
                </span>
              </div>
              <p className="text-[11px] text-[#707a82]">
                Identificação: •••• {deletingCartao.ultimosDigitos || '****'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsExcluirCartaoModalOpen(false)}
                className="h-10 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCartao}
                className="h-10 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Confirmar Exclusão</span>
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

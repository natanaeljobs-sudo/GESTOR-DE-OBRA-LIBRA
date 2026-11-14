import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Obra,
  Etapa,
  Despesa,
  Material,
  Trabalhador,
  Diaria,
  ReciboPagamento,
  Orcamento,
  ProducaoItem,
  CartaoConta,
  Parcela,
  Usuario,
  AlertaPendencia,
  CategoriaDespesa,
  SolicitacaoAcesso,
  PerfilUsuario,
  ToastNotification,
} from '../types';
import {
  INITIAL_OBRAS,
  INITIAL_ETAPAS,
  INITIAL_USUARIOS,
  INITIAL_CARTOES,
  INITIAL_MATERIAIS,
  INITIAL_TRABALHADORES,
  INITIAL_DESPESAS,
  INITIAL_DIARIAS,
  INITIAL_PRODUCAO,
  INITIAL_ORCAMENTOS,
  INITIAL_PARCELAS,
  INITIAL_ALERTAS,
} from '../data/initialData';
import { valorPorExtenso } from '../utils/currency';
import { getTodayISO } from '../utils/date';
import { ObrasService, DespesasService, TrabalhadoresService } from '../services/supabaseApi';

export type TabType = 
  | 'dashboard' 
  | 'despesas' 
  | 'materiais' 
  | 'maodeobra' 
  | 'recibos' 
  | 'orcamentos' 
  | 'producao' 
  | 'cartoes' 
  | 'alertas' 
  | 'usuarios' 
  | 'relatorios';

interface AppContextType {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Active Tab & Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tabFilter: string | null;
  setTabFilter: (filter: string | null) => void;
  navigateToTabWithFilter: (tab: TabType, filter?: string) => void;

  // Obra
  obras: Obra[];
  activeObra: Obra;
  setActiveObraId: (id: string) => void;
  addObra: (obra: Obra) => void;
  updateObra: (obra: Obra) => void;
  deleteObra: (id: string) => void;

  // Etapas
  etapas: Etapa[];
  updateEtapaStatus: (id: string, status: Etapa['status']) => void;

  // Users & Auth
  usuarios: Usuario[];
  activeUser: Usuario;
  setActiveUserId: (id: string) => void;
  addUsuario: (user: Usuario) => void;
  updateUsuario: (user: Usuario) => void;
  deleteUsuario: (id: string) => void;

  // Master Settings & Solicitações de Acesso
  masterEmail: string;
  updateMasterEmail: (email: string) => void;
  solicitacoesAcesso: SolicitacaoAcesso[];
  registrarSolicitacaoAcesso: (dados: { nome: string; email: string; mensagem: string }) => void;
  atualizarStatusSolicitacao: (id: string, status: 'pendente' | 'aprovado' | 'recusado') => void;
  excluirSolicitacaoAcesso: (id: string) => void;

  // Despesas
  despesas: Despesa[];
  addDespesa: (despesa: Omit<Despesa, 'id' | 'criadoEm'>) => void;
  updateDespesa: (despesa: Despesa) => void;
  deleteDespesa: (id: string) => void;

  // Materiais
  materiais: Material[];
  addMaterial: (material: Omit<Material, 'id' | 'dataCadastro'>) => Material;
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;

  // Unidades e Categorias de Materiais
  unidadesMedida: string[];
  categoriasMateriais: string[];
  addUnidadeMedida: (nome: string) => boolean;
  updateUnidadeMedida: (oldNome: string, newNome: string) => boolean;
  deleteUnidadeMedida: (nome: string) => void;
  addCategoriaMaterial: (nome: string) => boolean;
  updateCategoriaMaterial: (oldNome: string, newNome: string) => boolean;
  deleteCategoriaMaterial: (nome: string) => void;

  // Trabalhadores & Diárias
  trabalhadores: Trabalhador[];
  diarias: Diaria[];
  addTrabalhador: (trabalhador: Omit<Trabalhador, 'id' | 'dataAdmissao'>) => void;
  updateTrabalhador: (trabalhador: Trabalhador) => void;
  addDiaria: (diaria: Omit<Diaria, 'id'>) => void;
  updateDiaria: (diaria: Diaria) => void;
  deleteDiaria: (id: string) => void;
  marcarDiariasPagas: (diariasIds: string[], comprovanteUrl?: string) => void;

  // Recibos
  recibos: ReciboPagamento[];
  emitirRecibo: (dados: {
    numeroRecibo?: string;
    trabalhadorId?: string;
    trabalhadorManual?: {
      nome: string;
      cpf?: string;
      funcao?: string;
    };
    diariasIds: string[];
    periodoInicio: string;
    periodoFim: string;
    motivo?: string;
    responsavelNome?: string;
    localCidade?: string;
    marcarComoPagas?: boolean;
  }) => ReciboPagamento;
  updateRecibo: (recibo: ReciboPagamento) => void;
  deleteRecibo: (id: string, restaurarDiarias?: boolean) => void;

  // Orçamentos
  orcamentos: Orcamento[];
  addOrcamento: (orcamento: Omit<Orcamento, 'id' | 'criadoEm'>) => void;
  updateOrcamento: (orcamento: Orcamento) => void;
  deleteOrcamento: (id: string) => void;
  converterOrcamentoEmDespesa: (orcamentoId: string, formaPagamento: Despesa['formaPagamento']) => void;

  // Produção
  producao: ProducaoItem[];
  produtosProducao: string[];
  addProdutoProducao: (nome: string) => boolean;
  updateProdutoProducao: (oldNome: string, newNome: string) => boolean;
  deleteProdutoProducao: (nome: string) => void;
  addProducao: (item: Omit<ProducaoItem, 'id'>) => void;
  updateProducao: (item: ProducaoItem) => void;
  deleteProducao: (id: string) => void;

  // Cartões & Parcelas
  cartoes: CartaoConta[];
  parcelas: Parcela[];
  addCartao: (cartao: Omit<CartaoConta, 'id'>) => void;
  pagarParcela: (parcelaId: string) => void;

  // Alertas
  alertas: AlertaPendencia[];
  resolverAlerta: (alertaId: string) => void;

  // Cálculos consolidados da obra
  totaisPorCategoria: Record<CategoriaDespesa, number>;
  totalGeralObra: number;
  totalMaoDeObra: number;
  totalMaoDeObraPaga: number;
  totalMaoDeObraPendente: number;
  saldoTetoMaoDeObra: number;
  totalAPagar: number;
  totalTrilhosProduzidos: number;
  totalPlacasProduzidas: number;
  totalMetrosBatidos: number;
  custoIndicativoTrilho: number;

  // Auth
  isAuthenticated: boolean;
  login: (userId?: string) => void;
  logout: () => void;

  // Toast Notification
  toast: ToastNotification | null;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info', title?: string) => void;
  hideToast: () => void;

  // Supabase Sync
  isSyncing: boolean;
  sincronizarComSupabase: () => Promise<void>;

  // Reset
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'obra_juscelino_mola_v1_';

function getStoredOrDefault<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export const DEFAULT_UNIDADES_MEDIDA = [
  'Unidade',
  'saco',
  'm²',
  'm³',
  'm',
  'barra 12m',
  'kg',
  'milheiro',
  'litros',
  'dúzia',
];

export const DEFAULT_CATEGORIAS_MATERIAIS = [
  'Alvenaria',
  'Sapata',
  'Laje',
  'Hidráulico',
  'Elétrico',
  'Piso',
  'Pintura',
  'Acabamento',
  'Produção Trilhos',
  'Abastecimento',
  'Equipamentos',
  'Estrutural',
];

export const DEFAULT_PRODUTOS_PRODUCAO = [
  'Trilho de Laje',
  'Placa de Concreto',
  'Outro artefato de cimento',
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [tabFilter, setTabFilter] = useState<string | null>(null);

  const navigateToTabWithFilter = (tab: TabType, filter?: string) => {
    setActiveTab(tab);
    setTabFilter(filter || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    getStoredOrDefault('isAuthenticated', true)
  );

  const login = (userId?: string) => {
    if (userId) {
      setActiveUserId(userId);
    }
    setIsAuthenticated(true);
    setStored('isAuthenticated', true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setStored('isAuthenticated', false);
  };

  // State slices
  const [obras, setObras] = useState<Obra[]>(() => {
    const raw = getStoredOrDefault<Obra[]>('obras', INITIAL_OBRAS);
    return raw.map(o => {
      const upperName = o.nome ? o.nome.toUpperCase() : '';
      if (o.id === 'obra-juscelino-mola') {
        return {
          ...o,
          nome: upperName,
          valorVenda: o.valorVenda !== undefined ? o.valorVenda : 185000,
          etapaAtual: o.etapaAtual || 'Alvenaria',
        };
      }
      if (o.id === 'obra-futura-parque') {
        return {
          ...o,
          nome: upperName,
          valorVenda: o.valorVenda !== undefined ? o.valorVenda : 270000,
          etapaAtual: o.etapaAtual || 'Sapata',
        };
      }
      return {
        ...o,
        nome: upperName,
      };
    });
  });
  const [activeObraId, setActiveObraId] = useState<string>(() => obras[0]?.id || 'obra-juscelino-mola');
  const [etapas, setEtapas] = useState<Etapa[]>(() => getStoredOrDefault('etapas', INITIAL_ETAPAS));
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const raw = getStoredOrDefault('usuarios', INITIAL_USUARIOS);
    return raw.map((u: any) => {
      let perfil: PerfilUsuario = u.perfil;
      if (u.id === 'user-natanael' || (perfil as string) === 'admin_master') {
        perfil = 'master';
      } else if ((perfil as string) === 'mestre_obra') {
        perfil = 'operador';
      } else if ((perfil as string) === 'socio_investidor') {
        perfil = 'admin';
      }
      return {
        ...u,
        nome: u.nome ? u.nome.toUpperCase() : '',
        perfil,
        email: u.email?.replace('alberto.mestre@', 'alberto.operador@') || u.email,
      };
    });
  });
  const [activeUserId, setActiveUserId] = useState<string>(() => usuarios[0]?.id || 'user-natanael');
  const [cartoes, setCartoes] = useState<CartaoConta[]>(() => getStoredOrDefault('cartoes', INITIAL_CARTOES));
  const [materiais, setMateriais] = useState<Material[]>(() => {
    const loaded = getStoredOrDefault('materiais', INITIAL_MATERIAIS);
    return loaded.map((m: Material) =>
      m.id === 'mat-brita' || m.nome?.trim().toLowerCase() === 'brita 1'
        ? { ...m, nome: 'BRITA 1' }
        : m
    );
  });
  const [trabalhadores, setTrabalhadores] = useState<Trabalhador[]>(() => getStoredOrDefault('trabalhadores', INITIAL_TRABALHADORES));
  const [despesas, setDespesas] = useState<Despesa[]>(() => {
    const loaded = getStoredOrDefault('despesas', INITIAL_DESPESAS);
    return loaded.map((d: Despesa) => ({
      ...d,
      itens: (d.itens || []).map(it =>
        it.materialId === 'mat-brita' || it.materialNome?.trim().toLowerCase() === 'brita 1'
          ? { ...it, materialNome: 'BRITA 1' }
          : it
      ),
    }));
  });
  const [diarias, setDiarias] = useState<Diaria[]>(() => getStoredOrDefault('diarias', INITIAL_DIARIAS));
  const [recibos, setRecibos] = useState<ReciboPagamento[]>(() => getStoredOrDefault('recibos', []));
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() => {
    const loaded = getStoredOrDefault('orcamentos', INITIAL_ORCAMENTOS);
    return loaded.map((orc: Orcamento) => ({
      ...orc,
      itens: (orc.itens || []).map(it =>
        it.materialId === 'mat-brita' || it.materialNome?.trim().toLowerCase() === 'brita 1'
          ? { ...it, materialNome: 'BRITA 1' }
          : it
      ),
    }));
  });
  const [producao, setProducao] = useState<ProducaoItem[]>(() => getStoredOrDefault('producao', INITIAL_PRODUCAO));
  const [parcelas, setParcelas] = useState<Parcela[]>(() => getStoredOrDefault('parcelas', INITIAL_PARCELAS));
  const [alertas, setAlertas] = useState<AlertaPendencia[]>(() => getStoredOrDefault('alertas', INITIAL_ALERTAS));
  const [unidadesMedida, setUnidadesMedida] = useState<string[]>(() =>
    getStoredOrDefault('unidades_medida', DEFAULT_UNIDADES_MEDIDA)
  );
  const [categoriasMateriais, setCategoriasMateriais] = useState<string[]>(() =>
    getStoredOrDefault('categorias_materiais', DEFAULT_CATEGORIAS_MATERIAIS)
  );
  const [produtosProducao, setProdutosProducao] = useState<string[]>(() =>
    getStoredOrDefault('produtos_producao', DEFAULT_PRODUTOS_PRODUCAO)
  );
  const [masterEmail, setMasterEmail] = useState<string>(() => getStoredOrDefault('master_email', 'natanaeljobs@gmail.com'));
  const [solicitacoesAcesso, setSolicitacoesAcesso] = useState<SolicitacaoAcesso[]>(() => {
    const raw = getStoredOrDefault('solicitacoes_acesso', [
      {
        id: 'solic-1',
        nome: 'Carlos Eduardo Silveira',
        email: 'carlos.eng@construtora.com',
        mensagem: 'Engenheiro civil da Obra Juscelino Mola. Solicito liberação de acesso para acompanhar relatórios e lançamento de notas de materiais.',
        data: '2026-11-03 09:15',
        status: 'pendente',
      },
      {
        id: 'solic-2',
        nome: 'Marcos Vinícius Barbosa',
        email: 'marcos.encarregado@gmail.com',
        mensagem: 'Encarregado de obras do canteiro. Preciso lançar diárias de pedreiros e conferir chegada de vergalhões e cimento.',
        data: '2026-11-02 14:30',
        status: 'aprovado',
      },
    ]);
    return raw.map((s: any): SolicitacaoAcesso => ({
      id: s.id,
      nome: s.nome,
      email: s.email ? s.email.replace('marcos.mestre@', 'marcos.encarregado@') : s.email,
      mensagem: s.mensagem ? s.mensagem.replace(/mestre de obras/gi, 'Encarregado de obras') : s.mensagem,
      data: s.data,
      status: s.status === 'aprovado' || s.status === 'recusado' ? s.status : 'pendente',
    }));
  });

  // Toast state
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sincronização inicial e bidirecional com o Supabase
  const sincronizarComSupabase = async () => {
    setIsSyncing(true);
    try {
      // 1. Carregar Obras
      const obrasRemotas = await ObrasService.listar();
      if (obrasRemotas.length > 0) {
        setObras(prev => {
          const mapa = new Map(prev.map(o => [o.id, o]));
          obrasRemotas.forEach(o => mapa.set(o.id, { ...mapa.get(o.id), ...o }));
          return Array.from(mapa.values());
        });
      }

      // 2. Carregar Trabalhadores
      const trabRemotos = await TrabalhadoresService.listarPorObra();
      if (trabRemotos.length > 0) {
        setTrabalhadores(prev => {
          const mapa = new Map(prev.map(t => [t.id, t]));
          trabRemotos.forEach(t => mapa.set(t.id, { ...mapa.get(t.id), ...t }));
          return Array.from(mapa.values());
        });
      }

      // 3. Carregar Despesas da Obra Ativa se existir
      if (activeObraId) {
        const despRemotas = await DespesasService.listarPorObra(activeObraId);
        if (despRemotas.length > 0) {
          setDespesas(prev => {
            const outrasObras = prev.filter(d => d.obraId !== activeObraId);
            const mapa = new Map(prev.filter(d => d.obraId === activeObraId).map(d => [d.id, d]));
            despRemotas.forEach(d => mapa.set(d.id, { ...mapa.get(d.id), ...d }));
            return [...Array.from(mapa.values()), ...outrasObras];
          });
        }
      }
    } catch (err) {
      console.warn('Falha na sincronização em nuvem (mantendo offline/local):', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    sincronizarComSupabase();
  }, []);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success', title?: string) => {
    const defaultTitle =
      type === 'success' ? 'Sucesso' : type === 'error' ? 'Erro' : type === 'warning' ? 'Atenção' : 'Aviso';
    setToast({
      id: String(Date.now() + Math.random()),
      type,
      title: title || defaultTitle,
      message,
    });
  };

  const hideToast = () => {
    setToast(null);
  };

  // Sync state to local storage
  useEffect(() => setStored('obras', obras), [obras]);
  useEffect(() => setStored('etapas', etapas), [etapas]);
  useEffect(() => setStored('usuarios', usuarios), [usuarios]);
  useEffect(() => setStored('cartoes', cartoes), [cartoes]);
  useEffect(() => setStored('materiais', materiais), [materiais]);
  useEffect(() => setStored('unidades_medida', unidadesMedida), [unidadesMedida]);
  useEffect(() => setStored('categorias_materiais', categoriasMateriais), [categoriasMateriais]);
  useEffect(() => setStored('trabalhadores', trabalhadores), [trabalhadores]);
  useEffect(() => setStored('despesas', despesas), [despesas]);
  useEffect(() => setStored('diarias', diarias), [diarias]);
  useEffect(() => setStored('recibos', recibos), [recibos]);
  useEffect(() => setStored('orcamentos', orcamentos), [orcamentos]);
  useEffect(() => setStored('producao', producao), [producao]);
  useEffect(() => setStored('produtos_producao', produtosProducao), [produtosProducao]);
  useEffect(() => setStored('parcelas', parcelas), [parcelas]);
  useEffect(() => setStored('alertas', alertas), [alertas]);
  useEffect(() => setStored('master_email', masterEmail), [masterEmail]);
  useEffect(() => setStored('solicitacoes_acesso', solicitacoesAcesso), [solicitacoesAcesso]);

  const activeObra = useMemo(() => {
    return obras.find(o => o.id === activeObraId) || obras[0];
  }, [obras, activeObraId]);

  const activeUser = useMemo(() => {
    return usuarios.find(u => u.id === activeUserId) || usuarios[0];
  }, [usuarios, activeUserId]);

  // Consolidated financial metrics for the active obra
  const obraDespesas = useMemo(() => {
    return despesas.filter(d => d.obraId === activeObra.id);
  }, [despesas, activeObra.id]);

  const obraDiarias = useMemo(() => {
    return diarias.filter(d => d.obraId === activeObra.id);
  }, [diarias, activeObra.id]);

  const totaisPorCategoria = useMemo(() => {
    const totals: Record<CategoriaDespesa, number> = {
      materiais: 0,
      mao_de_obra: 0,
      trilhos_producao: 0,
      abastecimentos: 0,
      equipamentos: 0,
      outros: 0,
    };

    obraDespesas.forEach(d => {
      totals[d.categoria] = (totals[d.categoria] || 0) + Number(d.valorTotalNota || 0);
    });

    // Mão de obra vem do somatório de todas as diárias (pagas + pendentes)
    const totalDiarias = obraDiarias.reduce((sum, dia) => sum + Number(dia.valorTotal || 0), 0);
    totals.mao_de_obra = totalDiarias;

    return totals;
  }, [obraDespesas, obraDiarias]);

  const totalGeralObra = useMemo(() => {
    const sumDespesasNaoMaoDeObra = obraDespesas
      .filter(d => d.categoria !== 'mao_de_obra')
      .reduce((sum, d) => sum + Number(d.valorTotalNota || 0), 0);
    const sumDiarias = obraDiarias.reduce((sum, dia) => sum + Number(dia.valorTotal || 0), 0);
    return sumDespesasNaoMaoDeObra + sumDiarias;
  }, [obraDespesas, obraDiarias]);

  const totalMaoDeObra = useMemo(() => {
    return obraDiarias.reduce((sum, dia) => sum + Number(dia.valorTotal || 0), 0);
  }, [obraDiarias]);

  const totalMaoDeObraPaga = useMemo(() => {
    return obraDiarias
      .filter(d => d.statusPagamento === 'pago')
      .reduce((sum, dia) => sum + Number(dia.valorTotal || 0), 0);
  }, [obraDiarias]);

  const totalMaoDeObraPendente = useMemo(() => {
    return obraDiarias
      .filter(d => d.statusPagamento === 'pendente')
      .reduce((sum, dia) => sum + Number(dia.valorTotal || 0), 0);
  }, [obraDiarias]);

  const saldoTetoMaoDeObra = useMemo(() => {
    return (activeObra.tetoMaoDeObra || 32000) - totalMaoDeObra;
  }, [activeObra.tetoMaoDeObra, totalMaoDeObra]);

  const parcelasAVencerTotal = useMemo(() => {
    return parcelas
      .filter(p => p.status === 'a_vencer')
      .reduce((sum, p) => sum + Number(p.valorParcela || 0), 0);
  }, [parcelas]);

  const totalAPagar = useMemo(() => {
    return totalMaoDeObraPendente + parcelasAVencerTotal;
  }, [totalMaoDeObraPendente, parcelasAVencerTotal]);

  const totalTrilhosProduzidos = useMemo(() => {
    return producao
      .filter(p => p.obraId === activeObra.id && (p.produto === 'trilho' || p.produto.toLowerCase().includes('trilho')))
      .reduce((sum, p) => sum + p.quantidade, 0);
  }, [producao, activeObra.id]);

  const totalPlacasProduzidas = useMemo(() => {
    return producao
      .filter(p => p.obraId === activeObra.id && (p.produto === 'placa_cimento' || p.produto.toLowerCase().includes('placa')))
      .reduce((sum, p) => sum + p.quantidade, 0);
  }, [producao, activeObra.id]);

  const totalMetrosBatidos = useMemo(() => {
    return producao
      .filter(p => p.obraId === activeObra.id)
      .reduce((sum, p) => sum + (p.quantidade * (p.comprimentoMetros || 0)), 0);
  }, [producao, activeObra.id]);

  const custoIndicativoTrilho = useMemo(() => {
    const custoMateriaisTrilhos = totaisPorCategoria.trilhos_producao || 0;
    if (totalTrilhosProduzidos === 0) return 0;
    return custoMateriaisTrilhos / totalTrilhosProduzidos;
  }, [totaisPorCategoria.trilhos_producao, totalTrilhosProduzidos]);

  // Operations
  const addObra = (novaObra: Obra) => {
    setObras(prev => [novaObra, ...prev]);
    setActiveObraId(novaObra.id);
    ObrasService.criar(novaObra).then(salva => {
      if (salva) {
        setObras(prev => prev.map(o => (o.id === novaObra.id ? { ...o, id: salva.id } : o)));
        if (activeObraId === novaObra.id) {
          setActiveObraId(salva.id);
        }
      }
    });
  };

  const updateObra = (obra: Obra) => {
    setObras(prev => prev.map(o => (o.id === obra.id ? obra : o)));
    ObrasService.atualizar(obra.id, obra);
  };

  const deleteObra = (id: string) => {
    if (obras.length <= 1) return;
    const obra = obras.find(o => o.id === id);
    setObras(prev => prev.filter(o => o.id !== id));
    ObrasService.remover(id);
    if (activeObraId === id) {
      const remaining = obras.filter(o => o.id !== id);
      if (remaining.length > 0) setActiveObraId(remaining[0].id);
    }
    if (obra) {
      showToast(`Obra "${obra.nome}" excluída com sucesso.`, 'success', 'Obra excluída');
    }
  };

  const updateEtapaStatus = (id: string, status: Etapa['status']) => {
    setEtapas(prev => prev.map(e => (e.id === id ? { ...e, status } : e)));
  };

  const addUsuario = (user: Usuario) => {
    setUsuarios(prev => [...prev, user]);
  };

  const updateUsuario = (user: Usuario) => {
    setUsuarios(prev => prev.map(u => (u.id === user.id ? user : u)));
  };

  const deleteUsuario = (id: string) => {
    const user = usuarios.find(u => u.id === id);
    setUsuarios(prev => prev.filter(u => u.id !== id));
    if (user) {
      showToast(`Usuário "${user.nome}" excluído com sucesso.`, 'success', 'Usuário excluído');
    }
  };

  const updateMasterEmail = (newEmail: string) => {
    setMasterEmail(newEmail.trim());
  };

  const registrarSolicitacaoAcesso = (dados: { nome: string; email: string; mensagem: string }) => {
    const nova: SolicitacaoAcesso = {
      id: `solic-${Date.now()}`,
      nome: dados.nome,
      email: dados.email,
      mensagem: dados.mensagem,
      data: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pendente',
    };
    setSolicitacoesAcesso(prev => [nova, ...prev]);
  };

  const atualizarStatusSolicitacao = (id: string, status: 'pendente' | 'aprovado' | 'recusado') => {
    setSolicitacoesAcesso(prev => prev.map(s => (s.id === id ? { ...s, status } : s)));
  };

  const excluirSolicitacaoAcesso = (id: string) => {
    setSolicitacoesAcesso(prev => prev.filter(s => s.id !== id));
  };

  const addMaterial = (mat: Omit<Material, 'id' | 'dataCadastro'>): Material => {
    const novo: Material = {
      ...mat,
      id: `mat-${Date.now()}`,
      dataCadastro: getTodayISO(),
    };
    setMateriais(prev => [...prev, novo]);
    return novo;
  };

  const updateMaterial = (material: Material) => {
    setMateriais(prev => prev.map(m => (m.id === material.id ? material : m)));
  };

  const deleteMaterial = (id: string) => {
    const mat = materiais.find(m => m.id === id);
    setMateriais(prev => prev.filter(m => m.id !== id));
    if (mat) {
      showToast(`Material "${mat.nome}" foi excluído`, 'success');
    }
  };

  const addUnidadeMedida = (nome: string): boolean => {
    const trimmed = nome.trim();
    if (!trimmed) return false;
    if (unidadesMedida.some(u => u.toLowerCase() === trimmed.toLowerCase())) return false;
    setUnidadesMedida(prev => [...prev, trimmed]);
    return true;
  };

  const updateUnidadeMedida = (oldNome: string, newNome: string): boolean => {
    const trimmedNew = newNome.trim();
    if (!trimmedNew || oldNome.toLowerCase() === trimmedNew.toLowerCase()) return false;
    setUnidadesMedida(prev => prev.map(u => (u.toLowerCase() === oldNome.toLowerCase() ? trimmedNew : u)));
    // Atualiza automaticamente materiais já vinculados
    setMateriais(prev =>
      prev.map(m =>
        m.unidadePadrao.toLowerCase() === oldNome.toLowerCase() ? { ...m, unidadePadrao: trimmedNew } : m
      )
    );
    // Atualiza itens de despesas
    setDespesas(prev =>
      prev.map(d => ({
        ...d,
        itens: d.itens.map(item =>
          item.unidade.toLowerCase() === oldNome.toLowerCase() ? { ...item, unidade: trimmedNew } : item
        ),
      }))
    );
    return true;
  };

  const deleteUnidadeMedida = (nome: string) => {
    setUnidadesMedida(prev => prev.filter(u => u.toLowerCase() !== nome.toLowerCase()));
  };

  const addCategoriaMaterial = (nome: string): boolean => {
    const trimmed = nome.trim();
    if (!trimmed) return false;
    if (categoriasMateriais.some(c => c.toLowerCase() === trimmed.toLowerCase())) return false;
    setCategoriasMateriais(prev => [...prev, trimmed]);
    return true;
  };

  const updateCategoriaMaterial = (oldNome: string, newNome: string): boolean => {
    const trimmedNew = newNome.trim();
    if (!trimmedNew || oldNome.toLowerCase() === trimmedNew.toLowerCase()) return false;
    setCategoriasMateriais(prev => prev.map(c => (c.toLowerCase() === oldNome.toLowerCase() ? trimmedNew : c)));
    // Atualiza automaticamente materiais já vinculados
    setMateriais(prev =>
      prev.map(m =>
        m.categoriaSugerida && m.categoriaSugerida.toLowerCase() === oldNome.toLowerCase()
          ? { ...m, categoriaSugerida: trimmedNew }
          : m
      )
    );
    return true;
  };

  const deleteCategoriaMaterial = (nome: string) => {
    setCategoriasMateriais(prev => prev.filter(c => c.toLowerCase() !== nome.toLowerCase()));
  };

  const addProdutoProducao = (nome: string): boolean => {
    const trimmed = nome.trim();
    if (!trimmed) return false;
    if (produtosProducao.some(p => p.toLowerCase() === trimmed.toLowerCase())) return false;
    setProdutosProducao(prev => [...prev, trimmed]);
    return true;
  };

  const updateProdutoProducao = (oldNome: string, newNome: string): boolean => {
    const trimmedNew = newNome.trim();
    if (!trimmedNew || oldNome.toLowerCase() === trimmedNew.toLowerCase()) return false;
    setProdutosProducao(prev => prev.map(p => (p.toLowerCase() === oldNome.toLowerCase() ? trimmedNew : p)));
    setProducao(prev =>
      prev.map(item =>
        item.produto.toLowerCase() === oldNome.toLowerCase() ||
        (oldNome === 'Trilho de Laje' && item.produto === 'trilho') ||
        (oldNome === 'Placa de Concreto' && item.produto === 'placa_cimento')
          ? { ...item, produto: trimmedNew }
          : item
      )
    );
    return true;
  };

  const deleteProdutoProducao = (nome: string) => {
    setProdutosProducao(prev => prev.filter(p => p.toLowerCase() !== nome.toLowerCase()));
  };

  const addDespesa = (despesaData: Omit<Despesa, 'id' | 'criadoEm'>) => {
    const somaItens = despesaData.itens.reduce((acc, item) => acc + item.valorTotal, 0);
    const diferenca = Number((despesaData.valorTotalNota - somaItens).toFixed(2));
    const statusConferencia: Despesa['statusConferencia'] =
      Math.abs(diferenca) > 0.05
        ? 'diferenca_rateio'
        : !despesaData.comprovanteUrl || despesaData.formaPagamento === 'nao_informado'
        ? 'pendente_info'
        : 'ok';

    const nova: Despesa = {
      ...despesaData,
      id: `desp-${Date.now()}`,
      valorSomaItens: somaItens,
      diferencaRateio: diferenca,
      statusConferencia,
      criadoEm: new Date().toISOString(),
    };

    setDespesas(prev => [nova, ...prev]);

    // Persistência assíncrona no Supabase
    DespesasService.criar(nova).then(salva => {
      if (salva) {
        setDespesas(prev => prev.map(d => (d.id === nova.id ? { ...d, id: salva.id } : d)));
      }
    });

    // Check if alerts should be generated
    if (Math.abs(diferenca) > 0.05) {
      const alerta: AlertaPendencia = {
        id: `alerta-${Date.now()}`,
        tipo: 'diferenca_rateio',
        titulo: 'Diferença de rateio registrada',
        descricao: `Despesa "${nova.descricao}" possui R$ ${Math.abs(diferenca).toFixed(2)} de diferença em relação aos itens.`,
        severidade: 'alta',
        entidadeId: nova.id,
        moduloDestino: 'despesas',
        dataGerado: getTodayISO(),
      };
      setAlertas(prev => [alerta, ...prev]);
    }
  };

  const updateDespesa = (despesa: Despesa) => {
    const somaItens = despesa.itens.reduce((acc, item) => acc + item.valorTotal, 0);
    const diferenca = Number((despesa.valorTotalNota - somaItens).toFixed(2));
    const statusConferencia: Despesa['statusConferencia'] =
      Math.abs(diferenca) > 0.05
        ? 'diferenca_rateio'
        : !despesa.comprovanteUrl || despesa.formaPagamento === 'nao_informado'
        ? 'pendente_info'
        : 'ok';

    const atualizada: Despesa = {
      ...despesa,
      valorSomaItens: somaItens,
      diferencaRateio: diferenca,
      statusConferencia,
      atualizadoEm: new Date().toISOString(),
    };

    setDespesas(prev => prev.map(d => (d.id === despesa.id ? atualizada : d)));
  };

  const deleteDespesa = (id: string) => {
    const desp = despesas.find(d => d.id === id);
    setDespesas(prev => prev.filter(d => d.id !== id));
    setAlertas(prev => prev.filter(a => a.entidadeId !== id));
    DespesasService.remover(id);
    if (desp) {
      showToast(`Despesa "${desp.descricao}" excluída com sucesso.`, 'success', 'Despesa excluída');
    }
  };

  const addTrabalhador = (trab: Omit<Trabalhador, 'id' | 'dataAdmissao'>) => {
    const novo: Trabalhador = {
      ...trab,
      id: `trab-${Date.now()}`,
      dataAdmissao: getTodayISO(),
    };
    setTrabalhadores(prev => [...prev, novo]);
    TrabalhadoresService.criar(novo, activeObraId).then(salvo => {
      if (salvo) {
        setTrabalhadores(prev => prev.map(t => (t.id === novo.id ? { ...t, id: salvo.id } : t)));
      }
    });
  };

  const updateTrabalhador = (trab: Trabalhador) => {
    setTrabalhadores(prev => prev.map(t => (t.id === trab.id ? trab : t)));
    TrabalhadoresService.atualizar(trab.id, trab);
  };

  const addDiaria = (diariaData: Omit<Diaria, 'id'>) => {
    const nova: Diaria = {
      ...diariaData,
      id: `diaria-${Date.now()}`,
    };
    setDiarias(prev => [nova, ...prev]);
  };

  const updateDiaria = (diaria: Diaria) => {
    setDiarias(prev => prev.map(d => (d.id === diaria.id ? diaria : d)));
  };

  const deleteDiaria = (id: string) => {
    setDiarias(prev => prev.filter(d => d.id !== id));
    showToast(`Diária excluída com sucesso.`, 'success', 'Diária excluída');
  };

  const marcarDiariasPagas = (diariasIds: string[], comprovanteUrl?: string) => {
    const today = getTodayISO();
    setDiarias(prev =>
      prev.map(d => {
        if (diariasIds.includes(d.id)) {
          return {
            ...d,
            statusPagamento: 'pago',
            dataPagamento: today,
            comprovanteUrl: comprovanteUrl || d.comprovanteUrl,
          };
        }
        return d;
      })
    );
    // Dismiss corresponding alerts
    setAlertas(prev => prev.filter(a => !diariasIds.includes(a.entidadeId)));
  };

  const emitirRecibo = (dados: {
    numeroRecibo?: string;
    trabalhadorId?: string;
    trabalhadorManual?: {
      nome: string;
      cpf?: string;
      funcao?: string;
    };
    diariasIds: string[];
    periodoInicio: string;
    periodoFim: string;
    motivo?: string;
    responsavelNome?: string;
    localCidade?: string;
    marcarComoPagas?: boolean;
  }): ReciboPagamento => {
    const trabalhador = dados.trabalhadorId ? trabalhadores.find(t => t.id === dados.trabalhadorId) : undefined;
    const selecionadas = diarias.filter(d => dados.diariasIds.includes(d.id));
    const total = selecionadas.reduce((sum, d) => sum + d.valorTotal, 0);

    const nomeTrabalhador = dados.trabalhadorManual?.nome || trabalhador?.nome || 'Trabalhador';
    const cpfTrabalhador = dados.trabalhadorManual?.cpf || trabalhador?.cpf || 'Não informado';
    const funcaoTrabalhador = dados.trabalhadorManual?.funcao || trabalhador?.funcao || 'Serviços Gerais';
    const numeroFinal = dados.numeroRecibo?.trim() || `REC-${new Date().getFullYear()}-${String(recibos.length + 1).padStart(3, '0')}`;

    const novoRecibo: ReciboPagamento = {
      id: `rec-${Date.now()}`,
      obraId: activeObra.id,
      numeroRecibo: numeroFinal,
      trabalhadorId: dados.trabalhadorId || 'manual',
      trabalhadorNome: nomeTrabalhador,
      trabalhadorCpf: cpfTrabalhador,
      trabalhadorFuncao: funcaoTrabalhador,
      responsavelNome: dados.responsavelNome || activeUser.nome || 'Natanael (Responsável)',
      periodoInicio: dados.periodoInicio,
      periodoFim: dados.periodoFim,
      diasEspecificos: selecionadas.map(d => d.data),
      valorTotal: total,
      valorPorExtenso: valorPorExtenso(total),
      motivo: dados.motivo || `Pagamento de serviços prestados de mão de obra na ${activeObra.nome}`,
      diariasIds: dados.diariasIds,
      dataEmissao: getTodayISO(),
      localCidade: dados.localCidade || 'Goiânia - GO',
    };

    setRecibos(prev => [novoRecibo, ...prev]);

    if (dados.marcarComoPagas && dados.diariasIds.length > 0) {
      marcarDiariasPagas(dados.diariasIds);
    }

    return novoRecibo;
  };

  const updateRecibo = (recibo: ReciboPagamento) => {
    setRecibos(prev => prev.map(r => (r.id === recibo.id ? recibo : r)));
    showToast(`Recibo "${recibo.numeroRecibo}" atualizado com sucesso.`, 'success');
  };

  const deleteRecibo = (id: string, restaurarDiarias = false) => {
    const rec = recibos.find(r => r.id === id);
    if (!rec) return;

    if (restaurarDiarias && rec.diariasIds && rec.diariasIds.length > 0) {
      setDiarias(prev =>
        prev.map(d => (rec.diariasIds.includes(d.id) ? { ...d, statusPagamento: 'pendente', dataPagamento: undefined } : d))
      );
    }

    setRecibos(prev => prev.filter(r => r.id !== id));
    showToast(`Recibo "${rec.numeroRecibo}" excluído do histórico.`, 'success', 'Recibo excluído');
  };

  const addOrcamento = (orc: Omit<Orcamento, 'id' | 'criadoEm'>) => {
    const novo: Orcamento = {
      ...orc,
      id: `orc-${Date.now()}`,
      criadoEm: new Date().toISOString(),
    };
    setOrcamentos(prev => [novo, ...prev]);
  };

  const updateOrcamento = (orc: Orcamento) => {
    setOrcamentos(prev => prev.map(o => (o.id === orc.id ? orc : o)));
  };

  const deleteOrcamento = (id: string) => {
    const orc = orcamentos.find(o => o.id === id);
    setOrcamentos(prev => prev.filter(o => o.id !== id));
    if (orc) {
      showToast(`Orçamento de "${orc.fornecedorEmpresa}" excluído com sucesso.`, 'success', 'Orçamento excluído');
    }
  };

  const converterOrcamentoEmDespesa = (orcamentoId: string, formaPagamento: Despesa['formaPagamento']) => {
    const orc = orcamentos.find(o => o.id === orcamentoId);
    if (!orc) return;

    // Build items for the new expense
    const itensDespesa: Despesa['itens'] = orc.itens.map(item => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      materialId: item.materialId || 'mat-generico',
      materialNome: item.materialNome,
      quantidade: item.quantidade,
      unidade: item.unidade,
      valorUnitario: item.precoUnitarioCotado,
      valorTotal: item.valorTotalCotado,
      etapaId: activeObra.etapaAtualId || 'etapa-2',
      destino: 'obra',
    }));

    const novaDespesaId = `desp-${Date.now()}`;
    const novaDespesa: Despesa = {
      id: novaDespesaId,
      obraId: activeObra.id,
      descricao: `Compra convertida do orçamento ${orc.identificacao} - ${orc.fornecedorEmpresa}`,
      data: getTodayISO(),
      categoria: 'materiais',
      fornecedorNome: orc.fornecedorEmpresa,
      etapaId: activeObra.etapaAtualId || 'etapa-2',
      compradorNome: activeUser.nome,
      formaPagamento,
      valorTotalNota: orc.valorTotal,
      valorSomaItens: orc.valorTotal,
      diferencaRateio: 0,
      itens: itensDespesa,
      comprovanteUrl: orc.comprovanteOuPdfUrl,
      statusConferencia: 'ok',
      observacoes: `Convertido a partir do orçamento ${orc.identificacao}. ${orc.observacoes || ''}`,
      criadoPor: activeUser.nome,
      criadoEm: new Date().toISOString(),
    };

    setDespesas(prev => [novaDespesa, ...prev]);

    // Update quote status without duplicating totals
    setOrcamentos(prev =>
      prev.map(o =>
        o.id === orcamentoId
          ? {
              ...o,
              status: 'convertido_em_compra',
              despesaConvertidaId: novaDespesaId,
            }
          : o
      )
    );
  };

  const addProducao = (item: Omit<ProducaoItem, 'id'>) => {
    const novo: ProducaoItem = {
      ...item,
      id: `prod-${Date.now()}`,
    };
    setProducao(prev => [novo, ...prev]);
    showToast('Lote de produção registrado com sucesso!', 'success', 'Produção registrada');
  };

  const updateProducao = (item: ProducaoItem) => {
    setProducao(prev => prev.map(p => (p.id === item.id ? item : p)));
    showToast('Registro de produção atualizado com sucesso!', 'success', 'Produção atualizada');
  };

  const deleteProducao = (id: string) => {
    setProducao(prev => prev.filter(p => p.id !== id));
    showToast('Registro de produção excluído com sucesso.', 'success', 'Produção excluída');
  };

  const addCartao = (cartao: Omit<CartaoConta, 'id'>) => {
    const novo: CartaoConta = {
      ...cartao,
      id: `cartao-${Date.now()}`,
    };
    setCartoes(prev => [...prev, novo]);
  };

  const pagarParcela = (parcelaId: string) => {
    setParcelas(prev =>
      prev.map(p =>
        p.id === parcelaId ? { ...p, status: 'paga', dataPagamento: getTodayISO() } : p
      )
    );
  };

  const resolverAlerta = (alertaId: string) => {
    setAlertas(prev => prev.filter(a => a.id !== alertaId));
  };

  const resetToSampleData = () => {
    localStorage.clear();
    setObras(INITIAL_OBRAS);
    setActiveObraId('obra-juscelino-mola');
    setEtapas(INITIAL_ETAPAS);
    setUsuarios(INITIAL_USUARIOS);
    setActiveUserId('user-natanael');
    setCartoes(INITIAL_CARTOES);
    setMateriais(INITIAL_MATERIAIS);
    setTrabalhadores(INITIAL_TRABALHADORES);
    setDespesas(INITIAL_DESPESAS);
    setDiarias(INITIAL_DIARIAS);
    setRecibos([]);
    setOrcamentos(INITIAL_ORCAMENTOS);
    setProducao(INITIAL_PRODUCAO);
    setParcelas(INITIAL_PARCELAS);
    setAlertas(INITIAL_ALERTAS);
    setUnidadesMedida(DEFAULT_UNIDADES_MEDIDA);
    setCategoriasMateriais(DEFAULT_CATEGORIAS_MATERIAIS);
    setProdutosProducao(DEFAULT_PRODUTOS_PRODUCAO);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        tabFilter,
        setTabFilter,
        navigateToTabWithFilter,
        obras,
        activeObra,
        setActiveObraId,
        addObra,
        updateObra,
        deleteObra,
        etapas,
        updateEtapaStatus,
        usuarios,
        activeUser,
        setActiveUserId,
        addUsuario,
        updateUsuario,
        deleteUsuario,
        masterEmail,
        updateMasterEmail,
        solicitacoesAcesso,
        registrarSolicitacaoAcesso,
        atualizarStatusSolicitacao,
        excluirSolicitacaoAcesso,
        despesas: obraDespesas,
        addDespesa,
        updateDespesa,
        deleteDespesa,
        materiais,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        unidadesMedida,
        categoriasMateriais,
        addUnidadeMedida,
        updateUnidadeMedida,
        deleteUnidadeMedida,
        addCategoriaMaterial,
        updateCategoriaMaterial,
        deleteCategoriaMaterial,
        trabalhadores,
        diarias: obraDiarias,
        addTrabalhador,
        updateTrabalhador,
        addDiaria,
        updateDiaria,
        deleteDiaria,
        marcarDiariasPagas,
        recibos,
        emitirRecibo,
        updateRecibo,
        deleteRecibo,
        orcamentos,
        addOrcamento,
        updateOrcamento,
        deleteOrcamento,
        converterOrcamentoEmDespesa,
        producao,
        produtosProducao,
        addProdutoProducao,
        updateProdutoProducao,
        deleteProdutoProducao,
        addProducao,
        updateProducao,
        deleteProducao,
        cartoes,
        parcelas,
        addCartao,
        pagarParcela,
        alertas,
        resolverAlerta,
        totaisPorCategoria,
        totalGeralObra,
        totalMaoDeObra,
        totalMaoDeObraPaga,
        totalMaoDeObraPendente,
        saldoTetoMaoDeObra,
        totalAPagar,
        totalTrilhosProduzidos,
        totalPlacasProduzidas,
        totalMetrosBatidos,
        custoIndicativoTrilho,
        resetToSampleData,
        isAuthenticated,
        login,
        logout,
        toast,
        showToast,
        hideToast,
        isSyncing,
        sincronizarComSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Usuario, PerfilUsuario, Obra, PermissaoModulo, SolicitacaoAcesso } from '../../types';
import { formatDateBR, getTodayISO } from '../../utils/date';
import { formatBRL } from '../../utils/currency';
import { Modal } from '../common/Modal';
import {
  UserPlus,
  Building,
  Plus,
  Mail,
  CheckCircle2,
  Clock,
  Inbox,
  ShieldCheck,
  ShieldAlert,
  Check,
  X as XIcon,
  Search,
  Pencil,
  Trash2,
  Ban,
  UserCheck,
  RotateCcw,
  SlidersHorizontal,
  CheckSquare,
  Shield,
  Eye,
  FileEdit,
  Trash,
} from 'lucide-react';

export const ETAPAS_CRONOGRAMA = [
  { numero: 1, nome: 'Sapata' },
  { numero: 2, nome: 'Alvenaria' },
  { numero: 3, nome: 'Laje' },
  { numero: 4, nome: 'Hidráulico' },
  { numero: 5, nome: 'Elétrico' },
  { numero: 6, nome: 'Reboco' },
  { numero: 7, nome: 'Piso' },
  { numero: 8, nome: 'Cerâmica' },
  { numero: 9, nome: 'Gesso' },
  { numero: 10, nome: 'Pintura' },
  { numero: 11, nome: 'Acabamento' },
] as const;

export const UsuariosView: React.FC = () => {
  const {
    usuarios,
    activeUser,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    setActiveUserId,
    obras,
    activeObra,
    setActiveObraId,
    addObra,
    updateObra,
    deleteObra,
    masterEmail,
    updateMasterEmail,
    solicitacoesAcesso,
    atualizarStatusSolicitacao,
    excluirSolicitacaoAcesso,
    setActiveTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'obras' | 'configuracoes'>('usuarios');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isObraModalOpen, setIsObraModalOpen] = useState(false);

  // Table Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | PerfilUsuario>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Edit Permissions Modal
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Delete User Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  // Master email settings form & modal
  const [configEmailInput, setConfigEmailInput] = useState(masterEmail || 'natanaeljobs@gmail.com');
  const [emailSavedSuccess, setEmailSavedSuccess] = useState(false);
  const [isMasterEmailModalOpen, setIsMasterEmailModalOpen] = useState(false);

  // Solicitações Table Filters & Search
  const [solicSearchTerm, setSolicSearchTerm] = useState('');
  const [solicStatusFilter, setSolicStatusFilter] = useState<'all' | 'pendente' | 'aprovado' | 'recusado'>('all');
  const [viewingSolic, setViewingSolic] = useState<SolicitacaoAcesso | null>(null);
  const [solicToDelete, setSolicToDelete] = useState<SolicitacaoAcesso | null>(null);
  const [solicAprovandoId, setSolicAprovandoId] = useState<string | null>(null);

  // New User form
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('admin');
  const [userSavedSuccess, setUserSavedSuccess] = useState(false);

  // Obra form & edit/delete states
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [obraToDelete, setObraToDelete] = useState<Obra | null>(null);
  const [obraNome, setObraNome] = useState('');
  const [obraEndereco, setObraEndereco] = useState('');
  const [obraOrcamentoInput, setObraOrcamentoInput] = useState('150.000,00');
  const [obraTetoMaoDeObraInput, setObraTetoMaoDeObraInput] = useState('38.000,00');
  const [obraValorVendaInput, setObraValorVendaInput] = useState('');
  const [obraStatus, setObraStatus] = useState<'em_andamento' | 'planejamento' | 'concluida' | 'cancelada'>('em_andamento');
  const [obraEtapaAtual, setObraEtapaAtual] = useState('Sapata');
  const [obraSavedSuccess, setObraSavedSuccess] = useState(false);

  // Obra em foco para o Cronograma de 11 Etapas
  const [selectedObraTimelineId, setSelectedObraTimelineId] = useState<string>(activeObra?.id || obras[0]?.id || '');

  const obraEmFoco = useMemo(() => {
    return obras.find(o => o.id === selectedObraTimelineId) || activeObra || obras[0];
  }, [obras, selectedObraTimelineId, activeObra]);

  const getStepIndexForObra = (obra?: Obra): number => {
    if (!obra) return 1;
    if (obra.status === 'concluida' || (obra.etapaAtual || '').toLowerCase().includes('conclu')) return 12;
    const etapa = (obra.etapaAtual || '').trim().toLowerCase();
    const found = ETAPAS_CRONOGRAMA.findIndex(
      e => e.nome.toLowerCase() === etapa || etapa.includes(e.nome.toLowerCase())
    );
    return found !== -1 ? found + 1 : 1;
  };


  // Obras Table Filter & Search
  const [obraSearchTerm, setObraSearchTerm] = useState('');
  const [obraStatusFilter, setObraStatusFilter] = useState<'all' | 'ativo' | 'inativo' | 'em_andamento' | 'planejamento' | 'concluida' | 'cancelada'>('all');
  const [obraEtapaFilter, setObraEtapaFilter] = useState<string>('all');

  const etapasDisponiveis = useMemo(() => {
    const defaultEtapas = [...ETAPAS_CRONOGRAMA.map(e => e.nome), 'Concluído'];
    const fromObras = obras.map(o => o.etapaAtual).filter(Boolean) as string[];
    return Array.from(new Set([...defaultEtapas, ...fromObras]));
  }, [obras]);

  const filteredObras = useMemo(() => {
    return obras.filter(obra => {
      const isAtivo = obra.status === 'em_andamento' || obra.status === 'andamento' || obra.status === 'planejamento';
      const matchesSearch =
        !obraSearchTerm ||
        obra.nome.toLowerCase().includes(obraSearchTerm.toLowerCase()) ||
        (obra.endereco && obra.endereco.toLowerCase().includes(obraSearchTerm.toLowerCase()));

      const matchesStatus =
        obraStatusFilter === 'all'
          ? true
          : obraStatusFilter === 'ativo'
          ? isAtivo
          : obraStatusFilter === 'inativo'
          ? !isAtivo
          : obraStatusFilter === 'em_andamento'
          ? obra.status === 'em_andamento' || obra.status === 'andamento'
          : obraStatusFilter === 'planejamento'
          ? obra.status === 'planejamento'
          : obraStatusFilter === 'concluida'
          ? obra.status === 'concluida'
          : obraStatusFilter === 'cancelada'
          ? obra.status === 'cancelada'
          : true;

      const matchesEtapa =
        obraEtapaFilter === 'all'
          ? true
          : (obra.etapaAtual || 'Fundação').toLowerCase() === obraEtapaFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesEtapa;
    });
  }, [obras, obraSearchTerm, obraStatusFilter, obraEtapaFilter]);

  const getObraStatusBadge = (status: string) => {
    switch (status) {
      case 'concluida':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60 whitespace-nowrap shrink-0 tracking-wide">
            Concluído
          </span>
        );
      case 'cancelada':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 whitespace-nowrap shrink-0 tracking-wide">
            Cancelada
          </span>
        );
      case 'planejamento':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 whitespace-nowrap shrink-0 tracking-wide">
            Projetando
          </span>
        );
      case 'em_andamento':
      case 'andamento':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0085db] dark:text-blue-400 border border-[#0085db]/20 whitespace-nowrap shrink-0 tracking-wide">
            Operante
          </span>
        );
    }
  };

  const formatMoneyInput = (val: number | undefined | null): string => {
    if (val === undefined || val === null || isNaN(val) || val === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleCurrencyInputChange = (value: string, setter: (val: string) => void) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setter('');
      return;
    }
    const num = parseFloat(digits) / 100;
    setter(
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num)
    );
  };

  const parseMoney = (str: string): number => {
    if (!str) return 0;
    const clean = str.replace(/\./g, '').replace(',', '.');
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  };

  const modulosList: { key: keyof Usuario['permissoes']; label: string; description: string }[] = [
    { key: 'dashboard', label: 'Dashboard', description: '' },
    { key: 'despesas', label: 'Despesas', description: '' },
    { key: 'materiais', label: 'Materiais', description: '' },
    { key: 'maoDeObra', label: 'Diárias', description: '' },
    { key: 'recibos', label: 'Recibos', description: '' },
    { key: 'orcamentos', label: 'Orçamentos', description: '' },
    { key: 'producao', label: 'Produção', description: '' },
    { key: 'cartoes', label: 'Cartões', description: '' },
    { key: 'usuarios', label: 'Permissões', description: '' },
    { key: 'relatorios', label: 'Relatórios', description: '' },
  ];

  // Filtering users
  const filteredUsers = useMemo(() => {
    return usuarios.filter(u => {
      const matchesSearch =
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.perfil === roleFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.ativo) ||
        (statusFilter === 'inactive' && !u.ativo);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usuarios, searchTerm, roleFilter, statusFilter]);

  // Helper to format date for Solicitacoes table
  const formatSolicData = (dateStr: string) => {
    if (!dateStr) return '-';
    if (dateStr.includes('-') && dateStr.length >= 10) {
      const parts = dateStr.split(' ');
      const [y, m, d] = parts[0].split('-');
      const time = parts[1] || '';
      if (y && m && d) {
        return `${d}/${m}/${y}${time ? ` ${time}` : ''}`;
      }
    }
    return dateStr;
  };

  // Filtering Solicitacoes
  const filteredSolicitacoes = useMemo(() => {
    return solicitacoesAcesso.filter(s => {
      const matchesSearch =
        !solicSearchTerm ||
        s.nome.toLowerCase().includes(solicSearchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(solicSearchTerm.toLowerCase()) ||
        (s.mensagem && s.mensagem.toLowerCase().includes(solicSearchTerm.toLowerCase()));

      const matchesStatus =
        solicStatusFilter === 'all' || s.status === solicStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [solicitacoesAcesso, solicSearchTerm, solicStatusFilter]);

  const handleStartAprovarSolicitacao = (solic: SolicitacaoAcesso) => {
    setNome(solic.nome);
    setEmail(solic.email);
    setPerfil('operador');
    setSolicAprovandoId(solic.id);
    setIsUserModalOpen(true);
  };

  const handleOpenEditPermissions = (user: Usuario) => {
    // Clone user object for isolated modal editing
    setEditingUser(JSON.parse(JSON.stringify(user)));
    setIsPermissionsModalOpen(true);
    setSaveSuccessMsg(false);
  };

  const handleToggleModulePerm = (
    moduleKey: keyof Usuario['permissoes'],
    action: keyof PermissaoModulo
  ) => {
    if (!editingUser) return;
    setEditingUser(prev => {
      if (!prev) return prev;
      const currentVal = prev.permissoes[moduleKey]?.[action] ?? false;
      return {
        ...prev,
        permissoes: {
          ...prev.permissoes,
          [moduleKey]: {
            ...prev.permissoes[moduleKey],
            [action]: !currentVal,
          },
        },
      };
    });
  };

  const handleToggleColumnAll = (action: keyof PermissaoModulo) => {
    if (!editingUser) return;
    setEditingUser(prev => {
      if (!prev) return prev;
      const allEnabled = modulosList.every(m => prev.permissoes[m.key]?.[action]);
      const nextPerms = { ...prev.permissoes };
      modulosList.forEach(m => {
        nextPerms[m.key] = {
          ...nextPerms[m.key],
          [action]: !allEnabled,
        };
      });
      return { ...prev, permissoes: nextPerms };
    });
  };

  const handleQuickAction = (mode: 'all' | 'view_only' | 'default' | 'none') => {
    if (!editingUser) return;
    setEditingUser(prev => {
      if (!prev) return prev;
      const nextPerms = { ...prev.permissoes };

      if (mode === 'all') {
        modulosList.forEach(m => {
          nextPerms[m.key] = { visualizar: true, criar: true, editar: true, excluir: true };
        });
      } else if (mode === 'view_only') {
        modulosList.forEach(m => {
          nextPerms[m.key] = { visualizar: true, criar: false, editar: false, excluir: false };
        });
      } else if (mode === 'none') {
        modulosList.forEach(m => {
          nextPerms[m.key] = { visualizar: false, criar: false, editar: false, excluir: false };
        });
      } else if (mode === 'default') {
        const p = prev.perfil;
        const isMaster = p === 'master';
        const isAdmin = p === 'admin';

        modulosList.forEach(m => {
          if (isMaster) {
            nextPerms[m.key] = { visualizar: true, criar: true, editar: true, excluir: true };
          } else if (isAdmin) {
            nextPerms[m.key] = {
              visualizar: true,
              criar: m.key !== 'usuarios',
              editar: m.key !== 'usuarios',
              excluir: m.key !== 'usuarios' && m.key !== 'cartoes',
            };
          } else {
            // Operador
            const hasAccess = ['dashboard', 'despesas', 'materiais', 'maoDeObra', 'recibos', 'orcamentos', 'producao', 'relatorios'].includes(m.key);
            nextPerms[m.key] = {
              visualizar: hasAccess,
              criar: ['despesas', 'materiais', 'maoDeObra', 'recibos', 'orcamentos', 'producao'].includes(m.key),
              editar: ['despesas', 'maoDeObra', 'producao'].includes(m.key),
              excluir: false,
            };
          }
        });
      }

      return { ...prev, permissoes: nextPerms };
    });
  };

  const handleRoleChange = (newRole: PerfilUsuario) => {
    if (!editingUser) return;
    setEditingUser(prev => {
      if (!prev) return prev;
      const nextPerms = { ...prev.permissoes };
      if (newRole === 'master') {
        modulosList.forEach(m => {
          nextPerms[m.key] = { visualizar: true, criar: true, editar: true, excluir: true };
        });
      } else if (newRole === 'admin' && prev.perfil !== 'admin') {
        modulosList.forEach(m => {
          nextPerms[m.key] = {
            visualizar: true,
            criar: m.key !== 'usuarios',
            editar: m.key !== 'usuarios',
            excluir: m.key !== 'usuarios' && m.key !== 'cartoes',
          };
        });
      } else if (newRole === 'operador' && prev.perfil !== 'operador') {
        modulosList.forEach(m => {
          const hasAccess = ['dashboard', 'despesas', 'materiais', 'maoDeObra', 'recibos', 'orcamentos', 'producao', 'relatorios'].includes(m.key);
          nextPerms[m.key] = {
            visualizar: hasAccess,
            criar: ['despesas', 'materiais', 'maoDeObra', 'recibos', 'orcamentos', 'producao'].includes(m.key),
            editar: ['despesas', 'maoDeObra', 'producao'].includes(m.key),
            excluir: false,
          };
        });
      }
      return {
        ...prev,
        perfil: newRole,
        permissoes: nextPerms,
      };
    });
  };

  const handleSavePermissions = () => {
    if (!editingUser) return;
    updateUsuario(editingUser);
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setIsPermissionsModalOpen(false);
      setEditingUser(null);
    }, 600);
  };

  const handleToggleUserStatus = (user: Usuario) => {
    updateUsuario({ ...user, ativo: !user.ativo });
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteUsuario(userToDelete.id);
    setUserToDelete(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;

    const basePermissions = {
      visualizar: true,
      criar: perfil === 'master' || perfil === 'admin' || perfil === 'operador',
      editar: perfil === 'master' || perfil === 'admin',
      excluir: perfil === 'master',
    };

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const newUser: Usuario = {
      id: `user-${Date.now()}`,
      nome: nome.trim().toUpperCase(),
      email: email.trim(),
      perfil,
      avatarColor: 'bg-[#f6f9fc] text-[#707a82]',
      ativo: true,
      dataCadastro: formattedDate,
      permissoes: {
        dashboard: { ...basePermissions, visualizar: true },
        despesas: basePermissions,
        materiais: basePermissions,
        maoDeObra: basePermissions,
        recibos: basePermissions,
        orcamentos: basePermissions,
        producao: basePermissions,
        cartoes: { ...basePermissions, criar: perfil === 'master' || perfil === 'admin', editar: perfil === 'master' || perfil === 'admin' },
        usuarios: { ...basePermissions, visualizar: perfil === 'master' || perfil === 'admin', criar: perfil === 'master' },
        relatorios: { ...basePermissions, visualizar: true },
      },
    };

    addUsuario(newUser);
    if (solicAprovandoId) {
      atualizarStatusSolicitacao(solicAprovandoId, 'aprovado');
    }
    setUserSavedSuccess(true);
    setTimeout(() => {
      setUserSavedSuccess(false);
      setIsUserModalOpen(false);
      setSolicAprovandoId(null);
      setNome('');
      setEmail('');
    }, 1200);
  };

  const handleOpenEditObra = (obra: Obra) => {
    setEditingObra(obra);
    setObraNome(obra.nome);
    setObraEndereco(obra.endereco);
    setObraOrcamentoInput(obra.orcamentoTotal ? formatMoneyInput(obra.orcamentoTotal) : '');
    setObraTetoMaoDeObraInput(obra.tetoMaoDeObra ? formatMoneyInput(obra.tetoMaoDeObra) : '');
    setObraValorVendaInput(obra.valorVenda ? formatMoneyInput(obra.valorVenda) : '');
    setObraStatus(obra.status === 'andamento' ? 'em_andamento' : obra.status);
    setObraEtapaAtual(obra.etapaAtual || (obra.status === 'concluida' ? 'Concluído' : 'Sapata'));
    setIsObraModalOpen(true);
  };

  const handleConfirmDeleteObra = () => {
    if (!obraToDelete) return;
    deleteObra(obraToDelete.id);
    setObraToDelete(null);
  };

  const handleSaveObra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obraNome.trim()) return;

    const orcamentoTotal = parseMoney(obraOrcamentoInput) || 100000;
    const tetoMaoDeObra = parseMoney(obraTetoMaoDeObraInput) || 30000;
    const valorVenda = obraValorVendaInput ? parseMoney(obraValorVendaInput) : undefined;
    let finalStatus: Obra['status'] = obraStatus;
    let finalEtapa: string = obraEtapaAtual;

    if (finalStatus === 'concluida') {
      finalEtapa = 'Concluído';
    } else {
      // Se não é concluída (operante, cancelada, planejamento) mas a etapa ainda é 'Concluído', retrocede para etapa válida
      if (finalEtapa.toLowerCase().includes('conclu')) {
        finalEtapa = finalStatus === 'planejamento' ? 'Sapata' : 'Acabamento';
      }
    }

    const matchedCronograma = ETAPAS_CRONOGRAMA.find(
      e => e.nome.toLowerCase() === finalEtapa.toLowerCase()
    );
    const etapaAtualId = matchedCronograma ? `etapa-${matchedCronograma.numero}` : (editingObra?.etapaAtualId || 'etapa-1');

    if (editingObra) {
      const updated: Obra = {
        ...editingObra,
        nome: obraNome.trim().toUpperCase(),
        endereco: obraEndereco.trim() || 'Endereço a definir',
        orcamentoTotal,
        tetoMaoDeObra,
        valorVenda,
        status: finalStatus,
        etapaAtual: finalEtapa,
        etapaAtualId,
      };
      updateObra(updated);
    } else {
      const novaObra: Obra = {
        id: `obra-${Date.now()}`,
        nome: obraNome.trim().toUpperCase(),
        endereco: obraEndereco.trim() || 'Endereço a definir',
        dataInicio: getTodayISO(),
        orcamentoTotal,
        tetoMaoDeObra,
        etapaAtualId,
        valorVenda,
        status: finalStatus,
        etapaAtual: finalEtapa,
      };
      addObra(novaObra);
    }

    setObraSavedSuccess(true);
    setTimeout(() => {
      setObraSavedSuccess(false);
      setIsObraModalOpen(false);
      setEditingObra(null);
      setObraNome('');
      setObraEndereco('');
      setObraOrcamentoInput('150.000,00');
      setObraTetoMaoDeObraInput('38.000,00');
      setObraValorVendaInput('');
      setObraStatus('em_andamento');
      setObraEtapaAtual('Sapata');
    }, 1200);
  };

  const handleSaveMasterEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configEmailInput.trim()) return;
    updateMasterEmail(configEmailInput.trim());
    setEmailSavedSuccess(true);
    setTimeout(() => {
      setEmailSavedSuccess(false);
      setIsMasterEmailModalOpen(false);
    }, 1200);
  };

  const getRoleBadge = (p: PerfilUsuario) => {
    const isMaster = p === 'master';
    const label = isMaster ? 'Master' : p === 'admin' ? 'Admin' : 'Operador';
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] ${
        isMaster ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-[#707a82] dark:text-[#7c8fac] font-medium'
      }`}>
        {label}
      </span>
    );
  };

  if (activeUser.perfil !== 'master') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-[24px] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] shadow-xl text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-[#111c2d] dark:text-white">
          Acesso Restrito ao Perfil <span className="text-amber-600 dark:text-amber-400">Master</span>
        </h2>
        <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-2 leading-relaxed">
          O gerenciamento de permissões, usuários e obras simultâneas é exclusivo para o perfil <strong className="text-amber-600 dark:text-amber-400">Master</strong>.
        </p>
        <div className="mt-4 p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-xs">
          <span className="text-[#707a82] dark:text-[#7c8fac]">Usuário atual: </span>
          <strong className="text-[#111c2d] dark:text-white">{activeUser.nome}</strong>
          <span className="ml-1 text-[10px] px-2 py-0.5 rounded-md bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 font-bold uppercase">
            {activeUser.perfil === 'admin' ? 'Admin' : 'Operador'}
          </span>
        </div>
        <div className="mt-6 space-y-2">
          <button
            onClick={() => {
              const masterUser = usuarios.find(u => u.perfil === 'master') || usuarios[0];
              if (masterUser) setActiveUserId(masterUser.id);
            }}
            className="w-full py-2.5 px-4 bg-[#0085db] text-white text-xs font-bold rounded-xl shadow-md shadow-[#0085db]/25 hover:bg-[#0071ba] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Entrar como Perfil <strong className="text-amber-300">Master</strong> (Natanael)</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full py-2 px-4 border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] hover:text-[#111c2d] dark:hover:text-white text-xs font-semibold rounded-xl hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-all cursor-pointer"
          >
            Voltar para o Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Top Discreet Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e6ecf1] dark:border-[#333f55] pb-3">
        <button
          onClick={() => setActiveSubTab('usuarios')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 uppercase ${
            activeSubTab === 'usuarios'
              ? 'bg-[#0085db] text-white shadow-sm shadow-[#0085db]/25'
              : 'text-[#707a82] hover:text-[#0085db] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>PERMISSÕES</span>
        </button>

        <button
          onClick={() => setActiveSubTab('obras')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 uppercase ${
            activeSubTab === 'obras'
              ? 'bg-[#0085db] text-white shadow-sm shadow-[#0085db]/25'
              : 'text-[#707a82] hover:text-[#0085db] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>OBRAS</span>
        </button>

        <button
          onClick={() => setActiveSubTab('configuracoes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 uppercase ${
            activeSubTab === 'configuracoes'
              ? 'bg-[#0085db] text-white shadow-sm shadow-[#0085db]/25'
              : 'text-[#707a82] hover:text-[#0085db] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>SOLICITAÇÕES</span>
          {solicitacoesAcesso.filter(s => s.status === 'pendente').length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-bold">
              {solicitacoesAcesso.filter(s => s.status === 'pendente').length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'usuarios' ? (
        <div className="space-y-6">
          {/* Section Header matching mockup (Users / Manage user accounts, roles, and permissions. + Add User) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white font-sans">
                Permissões
              </h1>
              <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5 font-sans">
                Gerencie contas e permissões
              </p>
            </div>

            <button
              onClick={() => setIsUserModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0085db] hover:bg-[#0071ba] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#0085db]/25 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar usuário</span>
            </button>
          </div>

          {/* Filter Toolbar matching mockup */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-3 sm:p-4 shadow-xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 shrink-0">Perfil:</span>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value as 'all' | PerfilUsuario)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40 cursor-pointer"
                >
                  <option value="all">Todos os Perfis</option>
                  <option value="master">Master</option>
                  <option value="admin">Admin</option>
                  <option value="operador">Operador</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 shrink-0">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40 cursor-pointer"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              {/* Clear / Reset Filters */}
              {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-[#0085db] bg-[#0085db]/10 hover:bg-[#0085db]/20 dark:bg-[#0085db]/20 dark:hover:bg-[#0085db]/30 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* Corporate Data Table matching image_551c4a2e.png */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[20px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] bg-zinc-50/70 dark:bg-[#162232]/50 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-5 sm:px-6">Usuário</th>
                    <th className="py-4 px-4 sm:px-6">Perfil</th>
                    <th className="py-4 px-4 sm:px-6">Status</th>
                    <th className="py-4 px-4 sm:px-6">Cadastro</th>
                    <th className="py-4 px-5 sm:px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55] text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400">
                        Nenhum usuário encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const isCurrentUser = user.id === activeUser.id;
                      const isMaster = user.perfil === 'master';

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-zinc-50/80 dark:hover:bg-[#162232]/60 transition-colors"
                        >
                          {/* User Column */}
                          <td className="py-4 px-5 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#0085db] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                {user.nome.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-bold text-xs sm:text-sm text-[#111c2d] dark:text-white uppercase"
                                    style={{ textTransform: 'uppercase' }}
                                  >
                                    {user.nome?.toUpperCase()}
                                  </span>
                                  {isCurrentUser && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] dark:text-[#7c8fac] border border-[#e6ecf1] dark:border-[#333f55]">
                                      Você
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac] block">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Roles Column */}
                          <td className="py-4 px-4 sm:px-6">
                            {getRoleBadge(user.perfil)}
                          </td>

                          {/* Status Column */}
                          <td className="py-4 px-4 sm:px-6">
                            {user.ativo ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                Inativo
                              </span>
                            )}
                          </td>

                          {/* Joined Column */}
                          <td className="py-4 px-4 sm:px-6 text-zinc-600 dark:text-zinc-400 tabular-nums">
                            {user.dataCadastro || '01/12/2025'}
                          </td>

                          {/* Actions Column matching mockup (Pencil, Ban/Toggle, Trash) */}
                          <td className="py-4 px-5 sm:px-6 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Switch profile for testing if not current user */}
                              {!isCurrentUser && (
                                <button
                                  onClick={() => setActiveUserId(user.id)}
                                  title={`Assumir perfil de ${user.nome} para teste`}
                                  className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}

                              {/* Edit Permissions Modal Button (Pencil icon) */}
                              <button
                                onClick={() => handleOpenEditPermissions(user)}
                                title="Editar permissões e checkboxes de acesso"
                                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-[#0085db] hover:bg-zinc-100 dark:hover:bg-[#1f2d42] transition-all cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              {/* Toggle Active/Inactive (Ban icon) */}
                              <button
                                onClick={() => handleToggleUserStatus(user)}
                                title={user.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                  user.ativo
                                    ? 'text-zinc-600 dark:text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                }`}
                              >
                                <Ban className="w-4 h-4" />
                              </button>

                              {/* Delete User (Trash icon) */}
                              <button
                                onClick={() => setUserToDelete(user)}
                                title="Excluir usuário"
                                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
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
        </div>
      ) : activeSubTab === 'obras' ? (
        /* Obras List */
        <div className="space-y-6">
          {/* Section Header matching Permissões */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white font-sans">
                Obras
              </h1>
              <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5 font-sans">
                Gerencie canteiros, orçamentos e etc.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingObra(null);
                setObraNome('');
                setObraEndereco('');
                setObraOrcamentoInput('150.000,00');
                setObraTetoMaoDeObraInput('38.000,00');
                setObraValorVendaInput('');
                setObraStatus('em_andamento');
                setObraEtapaAtual('Sapata');
                setIsObraModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0085db] hover:bg-[#0071ba] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#0085db]/25 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar obra</span>
            </button>
          </div>

          {/* Filter Toolbar matching Permissões */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-3 sm:p-4 shadow-xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar obras..."
                  value={obraSearchTerm}
                  onChange={e => setObraSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40"
                />
                {obraSearchTerm && (
                  <button
                    onClick={() => setObraSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 shrink-0">Status:</span>
                <select
                  value={obraStatusFilter}
                  onChange={e => setObraStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40 cursor-pointer"
                >
                  <option value="all">Todos os status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="em_andamento">Operante</option>
                  <option value="planejamento">Projetando</option>
                  <option value="concluida">Concluído</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* Etapa Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 shrink-0">Etapa:</span>
                <select
                  value={obraEtapaFilter}
                  onChange={e => setObraEtapaFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40 cursor-pointer"
                >
                  <option value="all">Todas as etapas</option>
                  {etapasDisponiveis.map(etapa => (
                    <option key={etapa} value={etapa}>{etapa}</option>
                  ))}
                </select>
              </div>

              {/* Clear / Reset Filters */}
              {(obraSearchTerm || obraStatusFilter !== 'all' || obraEtapaFilter !== 'all') && (
                <button
                  onClick={() => {
                    setObraSearchTerm('');
                    setObraStatusFilter('all');
                    setObraEtapaFilter('all');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-[#0085db] bg-[#0085db]/10 hover:bg-[#0085db]/20 dark:bg-[#0085db]/20 dark:hover:bg-[#0085db]/30 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* Corporate Data Table matching Permissões (Mais largo e fino) */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[20px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] bg-zinc-50/70 dark:bg-[#162232]/50 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-5 sm:px-6">Obra</th>
                    <th className="py-4 px-4 sm:px-6">Status</th>
                    <th className="py-4 px-4 sm:px-6">Etapa</th>
                    <th className="py-4 px-4 sm:px-6">Orçamento & Valores</th>
                    <th className="py-4 px-5 sm:px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55] text-xs">
                  {filteredObras.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400">
                        Nenhuma obra encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredObras.map(obra => {
                      const isCurrent = obra.id === activeObra.id;
                      const isAtivo = obra.status === 'em_andamento' || obra.status === 'andamento' || obra.status === 'planejamento';
                      const currentStep = getStepIndexForObra(obra);
                      const isAllCompleted = obra.status === 'concluida' || (obra.etapaAtual || '').toLowerCase().includes('conclu');

                      return (
                        <React.Fragment key={obra.id}>
                          {/* Linha principal com informações da obra */}
                          <tr
                            className="hover:bg-zinc-50/80 dark:hover:bg-[#162232]/60 transition-colors"
                          >
                            {/* Obra Column */}
                            <td className="py-4 px-5 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#0085db] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                  <Building className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <span
                                      className="font-bold text-xs sm:text-sm text-[#111c2d] dark:text-white uppercase"
                                      style={{ textTransform: 'uppercase' }}
                                    >
                                      {obra.nome?.toUpperCase()}
                                    </span>
                                    {isCurrent && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0085db]/10 text-[#0085db] border border-[#0085db]/20 whitespace-nowrap shrink-0 uppercase">
                                        EM USO
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac] block uppercase mt-0.5">
                                    {obra.endereco || 'Sem endereço informado'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Status Column (Opções fixas, sem dropdown) */}
                            <td className="py-4 px-4 sm:px-6">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap shrink-0 ${
                                    isAtivo
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/60'
                                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/60'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      isAtivo ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                                    }`}
                                  />
                                  <span>{isAtivo ? 'Ativo' : 'Inativo'}</span>
                                </span>

                                {getObraStatusBadge(obra.status)}
                              </div>
                            </td>

                            {/* Etapa Column (Opção fixa, sem dropdown) */}
                            <td className="py-4 px-4 sm:px-6">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold py-1 px-2.5 rounded-xl border border-[#0085db]/20 bg-blue-50/70 dark:bg-blue-950/30 text-[#0085db] dark:text-blue-400 whitespace-nowrap">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    isAllCompleted ? 'bg-emerald-500' : 'bg-[#0085db]'
                                  }`}
                                />
                                <span>
                                  {obra.status === 'concluida' || (obra.etapaAtual || '').toLowerCase().includes('conclu')
                                    ? 'Concluído'
                                    : (() => {
                                        const matched = ETAPAS_CRONOGRAMA.find(
                                          e => e.nome.toLowerCase() === (obra.etapaAtual || '').toLowerCase()
                                        );
                                        return matched ? `${matched.numero} - ${matched.nome}` : (obra.etapaAtual || '1 - Sapata');
                                      })()}
                                </span>
                              </span>
                            </td>

                            {/* Orçamento & Valores Column */}
                            <td className="py-4 px-4 sm:px-6">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs sm:text-sm text-[#111c2d] dark:text-white tabular-nums">
                                    {formatBRL(obra.orcamentoTotal)}
                                  </span>
                                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                                    (Custo)
                                  </span>
                                </div>

                                <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac] tabular-nums block">
                                  Mão de obra: <strong className="text-[#0085db] font-semibold">{formatBRL(obra.tetoMaoDeObra)}</strong>
                                </span>

                                {obra.valorVenda !== undefined && obra.valorVenda > 0 ? (
                                  <div className="pt-1 mt-1 border-t border-[#e6ecf1] dark:border-[#333f55] space-y-0.5 text-[11px] tabular-nums">
                                    <div className="flex items-center justify-between gap-3 text-[#707a82] dark:text-[#7c8fac]">
                                      <span>Venda:</span>
                                      <strong className="text-[#111c2d] dark:text-white font-bold">
                                        {formatBRL(obra.valorVenda)}
                                      </strong>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-[#707a82] dark:text-[#7c8fac]">Possível lucro:</span>
                                      <strong
                                        className={`font-bold ${
                                          obra.valorVenda - obra.orcamentoTotal >= 0
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-rose-600 dark:text-rose-400'
                                        }`}
                                      >
                                        {formatBRL(obra.valorVenda - obra.orcamentoTotal)}
                                      </strong>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-zinc-400 italic block">
                                    Venda não informada
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions Column */}
                            <td className="py-4 px-5 sm:px-6 text-right">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                {/* Switch Active Obra button if not current */}
                                {!isCurrent && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveObraId(obra.id);
                                    }}
                                    title={`Tornar ${obra.nome} a obra ativa`}
                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-[#0085db] hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
                                  >
                                    <Building className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Edit Obra Modal Button (Pencil icon) */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditObra(obra);
                                  }}
                                  title="Editar obra"
                                  className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-[#0085db] hover:bg-zinc-100 dark:hover:bg-[#1f2d42] transition-all cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>

                                {/* Delete Obra Button (Trash icon) */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setObraToDelete(obra);
                                  }}
                                  title="Excluir obra"
                                  className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Linha individual da régua de 11 etapas + Concluído para cada obra */}
                          <tr className="border-b border-[#e6ecf1] dark:border-[#333f55]">
                            <td colSpan={5} className="px-5 sm:px-6 pt-1 pb-4 bg-zinc-50/40 dark:bg-[#162232]/20">
                              <div className="overflow-x-auto py-1 scrollbar-thin">
                                <div className="min-w-[840px] px-2">
                                  <div className="relative w-full">
                                    {/* Linha conectora de fundo e progresso */}
                                    <div className="absolute top-3 -translate-y-1/2 left-3 right-3 h-1.5 z-0 pointer-events-none">
                                      <div className="w-full h-full bg-[#6b7280] dark:bg-zinc-700 rounded-full" />
                                      <div
                                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                                          isAllCompleted ? 'bg-emerald-500' : 'bg-[#0085db]'
                                        }`}
                                        style={{
                                          width: `${isAllCompleted ? 100 : Math.max(0, ((currentStep - 1) / 11) * 100)}%`,
                                        }}
                                      />
                                    </div>

                                    {/* 11 Etapas Numeradas + Etapa Concluído */}
                                    <div className="relative flex items-start justify-between w-full z-10">
                                      {ETAPAS_CRONOGRAMA.map(etapa => {
                                        const isFilled = isAllCompleted || etapa.numero <= currentStep;

                                        return (
                                          <div
                                            key={etapa.numero}
                                            title={`Etapa ${etapa.numero}: ${etapa.nome}`}
                                            className="flex flex-col items-center group select-none cursor-default"
                                          >
                                            <div
                                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all shadow-xs ${
                                                isAllCompleted
                                                  ? 'bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-950/60'
                                                  : isFilled
                                                  ? 'bg-[#0085db] ring-2 ring-blue-100 dark:ring-blue-950/60'
                                                  : 'bg-[#6b7280] dark:bg-zinc-600 text-white'
                                              }`}
                                            >
                                              {etapa.numero}
                                            </div>

                                            <span
                                              className={`mt-1.5 text-[10px] font-bold tracking-wider text-center select-none transition-colors ${
                                                isAllCompleted
                                                  ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                                                  : isFilled
                                                  ? 'text-[#0085db] dark:text-blue-400 font-extrabold'
                                                  : 'text-zinc-400 dark:text-zinc-500 font-medium'
                                              }`}
                                            >
                                              {etapa.nome}
                                            </span>
                                          </div>
                                        );
                                      })}

                                      {/* 12º Nó: Concluído */}
                                      <div
                                        title="Etapa Concluída"
                                        className="flex flex-col items-center group select-none cursor-default"
                                      >
                                        <div
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white transition-all shadow-xs ${
                                            isAllCompleted
                                              ? 'bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-950/60'
                                              : 'bg-[#6b7280] dark:bg-zinc-600 text-white'
                                          }`}
                                        >
                                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </div>

                                        <span
                                          className={`mt-1.5 text-[10px] font-bold tracking-wider text-center select-none transition-colors ${
                                            isAllCompleted
                                              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                                              : 'text-zinc-400 dark:text-zinc-500 font-medium'
                                          }`}
                                        >
                                          Concluído
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Solicitações de Acesso no estilo corporativo de Permissões */
        <div className="space-y-6">
          {/* Section Header matching Permissões */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white font-sans">
                Solicitações
              </h1>
              <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5 font-sans">
                Gerencie pedidos de novos acessos e aprovações
              </p>
            </div>

            <button
              onClick={() => {
                setConfigEmailInput(masterEmail || 'natanaeljobs@gmail.com');
                setIsMasterEmailModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0085db] hover:bg-[#0071ba] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#0085db]/25 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Mail className="w-4 h-4" />
              <span>Configurar e-mail</span>
            </button>
          </div>

          {/* Filter Toolbar matching Permissões */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-3 sm:p-4 shadow-xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar solicitações por nome, e-mail ou justificativa..."
                  value={solicSearchTerm}
                  onChange={e => setSolicSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40"
                />
                {solicSearchTerm && (
                  <button
                    onClick={() => setSolicSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 shrink-0">Status:</span>
                <select
                  value={solicStatusFilter}
                  onChange={e => setSolicStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0085db]/40 cursor-pointer"
                >
                  <option value="all">Todos os Status ({solicitacoesAcesso.length})</option>
                  <option value="pendente">Pendentes ({solicitacoesAcesso.filter(s => s.status === 'pendente').length})</option>
                  <option value="aprovado">Aprovadas ({solicitacoesAcesso.filter(s => s.status === 'aprovado').length})</option>
                  <option value="recusado">Recusadas ({solicitacoesAcesso.filter(s => s.status === 'recusado').length})</option>
                </select>
              </div>

              {/* Clear / Reset Filters */}
              {(solicSearchTerm || solicStatusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSolicSearchTerm('');
                    setSolicStatusFilter('all');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-[#0085db] bg-[#0085db]/10 hover:bg-[#0085db]/20 dark:bg-[#0085db]/20 dark:hover:bg-[#0085db]/30 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* Corporate Data Table matching Permissões */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[20px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] bg-zinc-50/70 dark:bg-[#162232]/50 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-5 sm:px-6">Solicitante</th>
                    <th className="py-4 px-4 sm:px-6">Justificativa</th>
                    <th className="py-4 px-4 sm:px-6">Status</th>
                    <th className="py-4 px-4 sm:px-6">Data</th>
                    <th className="py-4 px-5 sm:px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55] text-xs">
                  {filteredSolicitacoes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400">
                        Nenhuma solicitação encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredSolicitacoes.map(solic => {
                      const isPendente = solic.status === 'pendente';
                      const isAprovado = solic.status === 'aprovado';

                      return (
                        <tr
                          key={solic.id}
                          className="hover:bg-zinc-50/80 dark:hover:bg-[#162232]/60 transition-colors"
                        >
                          {/* Solicitante Column */}
                          <td className="py-4 px-5 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#0085db] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                {solic.nome.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span
                                  className="font-bold text-xs sm:text-sm text-[#111c2d] dark:text-white uppercase block"
                                  style={{ textTransform: 'uppercase' }}
                                >
                                  {solic.nome?.toUpperCase()}
                                </span>
                                <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac] block">
                                  {solic.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Justificativa Column */}
                          <td className="py-4 px-4 sm:px-6 max-w-xs sm:max-w-md">
                            <div className="space-y-1">
                              <p className="text-xs text-[#111c2d] dark:text-zinc-200 line-clamp-2 leading-relaxed">
                                &ldquo;{solic.mensagem}&rdquo;
                              </p>
                              {solic.mensagem.length > 80 && (
                                <button
                                  type="button"
                                  onClick={() => setViewingSolic(solic)}
                                  className="text-[11px] font-semibold text-[#0085db] hover:underline cursor-pointer inline-flex items-center gap-1"
                                >
                                  Ver completa
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="py-4 px-4 sm:px-6">
                            {isPendente ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 whitespace-nowrap">
                                Pendente
                              </span>
                            ) : isAprovado ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60 whitespace-nowrap">
                                Aprovado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 whitespace-nowrap">
                                Recusado
                              </span>
                            )}
                          </td>

                          {/* Data Column */}
                          <td className="py-4 px-4 sm:px-6 text-zinc-600 dark:text-zinc-400 tabular-nums whitespace-nowrap">
                            {formatSolicData(solic.data)}
                          </td>

                          {/* Actions Column */}
                          <td className="py-4 px-5 sm:px-6 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Visualizar Mensagem Completa */}
                              <button
                                onClick={() => setViewingSolic(solic)}
                                title="Ver mensagem completa"
                                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-[#0085db] hover:bg-zinc-100 dark:hover:bg-[#1f2d42] transition-all cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Ações para Pendente */}
                              {isPendente && (
                                <>
                                  <button
                                    onClick={() => handleStartAprovarSolicitacao(solic)}
                                    title="Aprovar e cadastrar usuário"
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer"
                                  >
                                    <UserPlus className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => atualizarStatusSolicitacao(solic.id, 'recusado')}
                                    title="Recusar solicitação"
                                    className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {/* Ações para Recusado */}
                              {solic.status === 'recusado' && (
                                <button
                                  onClick={() => atualizarStatusSolicitacao(solic.id, 'pendente')}
                                  title="Reabrir solicitação como pendente"
                                  className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all cursor-pointer"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}

                              {/* Excluir Solicitação */}
                              <button
                                onClick={() => setSolicToDelete(solic)}
                                title="Excluir solicitação"
                                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
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
        </div>
      )}

      {/* MODAL: Permissions Matrix & Role Editing Popup (when clicking Edit / Pencil icon) */}
      <Modal
        isOpen={isPermissionsModalOpen && !!editingUser}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setEditingUser(null);
        }}
        title="Editar usuário"
        subtitle={editingUser?.perfil === 'master' ? 'Master' : editingUser?.perfil === 'admin' ? 'Admin' : 'Operador'}
        maxWidth="2xl"
      >
        {editingUser && (
          <div className="space-y-4">
            {/* User Details & Role Selector */}
            <div className="p-4 rounded-2xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#e6ecf1] dark:border-[#333f55]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#0085db]" />
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                    DADOS DA CONTA
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nome */}
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.nome}
                    onChange={e => setEditingUser({ ...editingUser, nome: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Perfil de Acesso */}
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Perfil
                  </label>
                  <select
                    value={editingUser.perfil}
                    onChange={e => handleRoleChange(e.target.value as PerfilUsuario)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] cursor-pointer"
                  >
                    <option value="master">Master (Acesso Total Irrestrito)</option>
                    <option value="admin">Admin</option>
                    <option value="operador">Operador</option>
                  </select>
                </div>

                {/* Status da Conta */}
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Status
                  </label>
                  <select
                    value={editingUser.ativo ? 'ativo' : 'inativo'}
                    onChange={e => setEditingUser({ ...editingUser, ativo: e.target.value === 'ativo' })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] cursor-pointer"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Master Banner if Master */}
            {editingUser.perfil === 'master' && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  <strong className="text-amber-600 dark:text-amber-400 font-bold">Master:</strong> Este perfil possui privilégios totais e irrestritos por padrão em todas as telas e rotinas do sistema.
                </span>
              </div>
            )}

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Ações Rápidas:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickAction('all')}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Marcar Todos
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAction('view_only')}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Apenas Ver
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAction('default')}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Padrão do Perfil
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAction('none')}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Desmarcar
                </button>
              </div>
            </div>

            {/* Matrix Table with Checkboxes */}
            <div className="border border-[#e6ecf1] dark:border-[#333f55] rounded-xl overflow-hidden">
              <div className="max-h-[360px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-zinc-100 dark:bg-[#162232] z-10 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider border-b border-[#e6ecf1] dark:border-[#333f55]">
                    <tr>
                      <th className="py-2.5 px-3">Módulo</th>
                      <th className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleColumnAll('visualizar')}
                          className="hover:text-[#0085db] transition-colors cursor-pointer inline-flex items-center justify-center font-bold w-full uppercase"
                          title="Clique para alternar toda a coluna"
                        >
                          <span>VER</span>
                        </button>
                      </th>
                      <th className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleColumnAll('criar')}
                          className="hover:text-[#0085db] transition-colors cursor-pointer inline-flex items-center justify-center font-bold w-full uppercase"
                          title="Clique para alternar toda a coluna"
                        >
                          <span>CRIAR</span>
                        </button>
                      </th>
                      <th className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleColumnAll('editar')}
                          className="hover:text-[#0085db] transition-colors cursor-pointer inline-flex items-center justify-center font-bold w-full uppercase"
                          title="Clique para alternar toda a coluna"
                        >
                          <span>EDITAR</span>
                        </button>
                      </th>
                      <th className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleColumnAll('excluir')}
                          className="hover:text-[#0085db] transition-colors cursor-pointer inline-flex items-center justify-center font-bold w-full uppercase"
                          title="Clique para alternar toda a coluna"
                        >
                          <span>EXCLUIR</span>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55] text-xs">
                    {modulosList.map(mod => {
                      const perm = editingUser.permissoes[mod.key] || {
                        visualizar: false,
                        criar: false,
                        editar: false,
                        excluir: false,
                      };

                      return (
                        <tr
                          key={mod.key}
                          className="hover:bg-zinc-50 dark:hover:bg-[#162232]/50 transition-colors"
                        >
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-[#111c2d] dark:text-white block">
                              {mod.label}
                            </span>
                          </td>

                          {/* Visualizar */}
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={perm.visualizar}
                              onChange={() => handleToggleModulePerm(mod.key, 'visualizar')}
                              className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db] cursor-pointer accent-[#0085db]"
                            />
                          </td>

                          {/* Criar */}
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={perm.criar}
                              onChange={() => handleToggleModulePerm(mod.key, 'criar')}
                              className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db] cursor-pointer accent-[#0085db]"
                            />
                          </td>

                          {/* Editar */}
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={perm.editar}
                              onChange={() => handleToggleModulePerm(mod.key, 'editar')}
                              className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db] cursor-pointer accent-[#0085db]"
                            />
                          </td>

                          {/* Excluir */}
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={perm.excluir}
                              onChange={() => handleToggleModulePerm(mod.key, 'excluir')}
                              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between">
              <div>
                {saveSuccessMsg && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    Alterações e permissões salvas com sucesso!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPermissionsModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Confirm Delete User */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Confirmar exclusão"
        subtitle="Esta ação removerá o usuário do sistema"
        maxWidth="sm"
      >
        {userToDelete && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Tem certeza que deseja remover o usuário <strong>&ldquo;{userToDelete.nome}&rdquo;</strong>?
            </p>
            {userToDelete.perfil === 'master' && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
                Aviso: Este usuário possui perfil <strong className="text-amber-600 dark:text-amber-400 font-bold">Master</strong>. Como administrador Master, você tem autorização total para excluí-lo.
              </div>
            )}
            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Excluir</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: New User */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSolicAprovandoId(null);
        }}
        title={solicAprovandoId ? 'Aprovar solicitação & Criar conta' : 'Cadastrar usuário'}
        subtitle={solicAprovandoId ? 'Defina o perfil de acesso e salve para liberar o colaborador' : 'Defina perfil e permissões de acesso ao aplicativo.'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveUser} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Nome *
            </label>
            <input
              type="text"
              required
              placeholder="Digite seu nome aqui"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              E-mail *
            </label>
            <input
              type="email"
              required
              placeholder="Digite seu e-mail aqui"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Perfil
            </label>
            <select
              value={perfil}
              onChange={e => setPerfil(e.target.value as PerfilUsuario)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold"
            >
              <option value="master">Master (Acesso total)</option>
              <option value="admin">Admin</option>
              <option value="operador">Operador</option>
            </select>
          </div>

          {userSavedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Usuário cadastrado com sucesso!</span>
            </div>
          )}

          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsUserModalOpen(false);
                setSolicAprovandoId(null);
              }}
              className="px-3.5 py-2 text-xs text-[#707a82] hover:text-[#111c2d] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
            >
              {solicAprovandoId ? 'Aprovar & Criar Usuário' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New / Edit Obra */}
      <Modal
        isOpen={isObraModalOpen}
        onClose={() => {
          setIsObraModalOpen(false);
          setEditingObra(null);
        }}
        title={editingObra ? 'Editar obra' : 'Cadastrar obra'}
        subtitle="Gerencie canteiros, orçamentos e etc."
        maxWidth="md"
      >
        <form onSubmit={handleSaveObra} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Nome da obra
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Obra Residencial Primavera"
              value={obraNome}
              onChange={e => setObraNome(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Endereço / Local
            </label>
            <input
              type="text"
              placeholder="Rua, Quadra, Lote, Bairro"
              value={obraEndereco}
              onChange={e => setObraEndereco(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Orçamento estimado (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#707a82] dark:text-[#7c8fac] select-none">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={obraOrcamentoInput}
                  onChange={e => handleCurrencyInputChange(e.target.value, setObraOrcamentoInput)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] font-semibold tabular-nums"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Total mão de obra (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#707a82] dark:text-[#7c8fac] select-none">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={obraTetoMaoDeObraInput}
                  onChange={e => handleCurrencyInputChange(e.target.value, setObraTetoMaoDeObraInput)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] font-semibold tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Valor da venda (R$) (Opcional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#707a82] dark:text-[#7c8fac] select-none">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={obraValorVendaInput}
                  onChange={e => handleCurrencyInputChange(e.target.value, setObraValorVendaInput)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db] font-semibold tabular-nums"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Status *
              </label>
              <select
                value={obraStatus}
                onChange={e => {
                  const val = e.target.value as 'em_andamento' | 'planejamento' | 'concluida' | 'cancelada';
                  setObraStatus(val);
                  if (val === 'concluida') {
                    setObraEtapaAtual('Concluído');
                  } else if (obraEtapaAtual === 'Concluído') {
                    // Retrocedendo de concluída para operante, cancelada ou planejamento
                    setObraEtapaAtual(val === 'planejamento' ? 'Sapata' : 'Acabamento');
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
              >
                <option value="em_andamento">Operante</option>
                <option value="concluida">Concluído</option>
                <option value="cancelada">Cancelada</option>
                <option value="planejamento">Projetando</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Etapa *
            </label>
            <select
              value={obraEtapaAtual}
              onChange={e => {
                const val = e.target.value;
                setObraEtapaAtual(val);
                if (val === 'Concluído') {
                  setObraStatus('concluida');
                } else if (obraStatus === 'concluida') {
                  // Se mudar a etapa saindo de Concluído, retrocede status para operante
                  setObraStatus('em_andamento');
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
            >
              {ETAPAS_CRONOGRAMA.map(e => (
                <option key={e.numero} value={e.nome}>
                  {e.numero} - {e.nome}
                </option>
              ))}
              <option value="Concluído">Concluído</option>
            </select>
          </div>

          {obraSavedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Salvo com sucesso!</span>
            </div>
          )}

          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsObraModalOpen(false);
                setEditingObra(null);
              }}
              className="px-3.5 py-2 text-xs text-[#707a82] hover:text-[#111c2d] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Confirm Delete Obra */}
      <Modal
        isOpen={!!obraToDelete}
        onClose={() => setObraToDelete(null)}
        title="Confirmar exclusão"
        subtitle="Esta ação removerá a obra do sistema"
        maxWidth="sm"
      >
        {obraToDelete && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Tem certeza que deseja remover a obra <strong>&ldquo;{obraToDelete.nome}&rdquo;</strong>?
            </p>
            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setObraToDelete(null)}
                className="px-3.5 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteObra}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-xs cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Configurar E-mail Master */}
      <Modal
        isOpen={isMasterEmailModalOpen}
        onClose={() => setIsMasterEmailModalOpen(false)}
        title="E-mail do Administrador Master"
        subtitle="Endereço para notificações de novos acessos"
        maxWidth="md"
      >
        <form onSubmit={handleSaveMasterEmail} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-xs text-[#707a82] dark:text-[#7c8fac] flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#0085db] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Quando qualquer colaborador clicar em <strong>&ldquo;Solicitar acesso&rdquo;</strong> na tela de login, os dados e a justificativa serão gravados no sistema e notificados para este e-mail.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5">
              E-mail para Recebimento de Solicitações *
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707a82] pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={configEmailInput}
                onChange={e => setConfigEmailInput(e.target.value)}
                placeholder="master@libraconstrutora.com.br"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>
          </div>

          {emailSavedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Configuração salva com sucesso!</span>
            </div>
          )}

          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsMasterEmailModalOpen(false)}
              className="px-3.5 py-2 text-xs text-[#707a82] hover:text-[#111c2d] dark:hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar E-mail</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Visualizar Justificativa da Solicitação */}
      <Modal
        isOpen={!!viewingSolic}
        onClose={() => setViewingSolic(null)}
        title="Detalhes da Solicitação de Acesso"
        subtitle="Justificativa enviada pelo colaborador na tela de login"
        maxWidth="md"
      >
        {viewingSolic && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
              <div className="w-10 h-10 rounded-full bg-[#0085db] text-white font-bold text-sm flex items-center justify-center shrink-0">
                {viewingSolic.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-[#111c2d] dark:text-white uppercase truncate">
                    {viewingSolic.nome}
                  </span>
                  {viewingSolic.status === 'pendente' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60">
                      Pendente
                    </span>
                  ) : viewingSolic.status === 'aprovado' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60">
                      Aprovado
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60">
                      Recusado
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#707a82] dark:text-[#7c8fac] block">
                  {viewingSolic.email}
                </span>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> Solicitado em {formatSolicData(viewingSolic.data)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5 uppercase tracking-wider text-[10px]">
                Mensagem / Justificativa
              </label>
              <div className="p-3.5 rounded-xl bg-[#fafbfd] dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-xs text-[#111c2d] dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                &ldquo;{viewingSolic.mensagem}&rdquo;
              </div>
            </div>

            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex flex-wrap justify-between items-center gap-2">
              <button
                type="button"
                onClick={() => setViewingSolic(null)}
                className="px-3.5 py-2 text-xs text-[#707a82] hover:text-[#111c2d] dark:hover:text-white cursor-pointer"
              >
                Fechar
              </button>

              <div className="flex items-center gap-2">
                {viewingSolic.status === 'pendente' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        atualizarStatusSolicitacao(viewingSolic.id, 'recusado');
                        setViewingSolic(null);
                      }}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 cursor-pointer"
                    >
                      Recusar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const target = viewingSolic;
                        setViewingSolic(null);
                        handleStartAprovarSolicitacao(target);
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Aprovar & Criar Conta</span>
                    </button>
                  </>
                )}
                {viewingSolic.status === 'recusado' && (
                  <button
                    type="button"
                    onClick={() => {
                      atualizarStatusSolicitacao(viewingSolic.id, 'pendente');
                      setViewingSolic(null);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 cursor-pointer"
                  >
                    Reabrir como Pendente
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Confirmar Exclusão de Solicitação */}
      <Modal
        isOpen={!!solicToDelete}
        onClose={() => setSolicToDelete(null)}
        title="Confirmar exclusão"
        subtitle="Esta ação removerá o pedido de acesso do histórico"
        maxWidth="sm"
      >
        {solicToDelete && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Tem certeza que deseja excluir o pedido de acesso de <strong>&ldquo;{solicToDelete.nome}&rdquo;</strong>?
            </p>
            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSolicToDelete(null)}
                className="px-3.5 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  excluirSolicitacaoAcesso(solicToDelete.id);
                  setSolicToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-xs cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

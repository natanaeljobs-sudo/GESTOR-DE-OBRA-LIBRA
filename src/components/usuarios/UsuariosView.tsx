import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Usuario, PerfilUsuario, Obra, PermissaoModulo } from '../../types';
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
    addObra,
    updateObra,
    deleteObra,
    masterEmail,
    updateMasterEmail,
    solicitacoesAcesso,
    atualizarStatusSolicitacao,
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

  // Master email settings form
  const [configEmailInput, setConfigEmailInput] = useState(masterEmail || 'natanaeljobs@gmail.com');
  const [emailSavedSuccess, setEmailSavedSuccess] = useState(false);
  const [filterSolicitacoes, setFilterSolicitacoes] = useState<'todas' | 'pendente' | 'aprovado' | 'recusado'>('todas');

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
  const [obraOrcamento, setObraOrcamento] = useState<number>(150000);
  const [obraTetoMaoDeObra, setObraTetoMaoDeObra] = useState<number>(38000);
  const [obraValorVenda, setObraValorVenda] = useState<number | ''>('');
  const [obraStatus, setObraStatus] = useState<'em_andamento' | 'planejamento' | 'concluida' | 'cancelada'>('em_andamento');
  const [obraEtapaAtual, setObraEtapaAtual] = useState('Fundação');

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
      nome: nome.trim(),
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
    setUserSavedSuccess(true);
    setTimeout(() => {
      setUserSavedSuccess(false);
      setIsUserModalOpen(false);
      setNome('');
      setEmail('');
    }, 1200);
  };

  const handleOpenEditObra = (obra: Obra) => {
    setEditingObra(obra);
    setObraNome(obra.nome);
    setObraEndereco(obra.endereco);
    setObraOrcamento(obra.orcamentoTotal);
    setObraTetoMaoDeObra(obra.tetoMaoDeObra);
    setObraValorVenda(obra.valorVenda ?? '');
    setObraStatus(obra.status === 'andamento' ? 'em_andamento' : obra.status);
    setObraEtapaAtual(obra.etapaAtual || 'Fundação');
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

    if (editingObra) {
      const updated: Obra = {
        ...editingObra,
        nome: obraNome.trim(),
        endereco: obraEndereco.trim() || 'Endereço a definir',
        orcamentoTotal: obraOrcamento || 100000,
        tetoMaoDeObra: obraTetoMaoDeObra || 30000,
        valorVenda: obraValorVenda !== '' ? Number(obraValorVenda) : undefined,
        status: obraStatus,
        etapaAtual: obraEtapaAtual || 'Fundação',
      };
      updateObra(updated);
    } else {
      const novaObra: Obra = {
        id: `obra-${Date.now()}`,
        nome: obraNome.trim(),
        endereco: obraEndereco.trim() || 'Endereço a definir',
        dataInicio: getTodayISO(),
        orcamentoTotal: obraOrcamento || 100000,
        tetoMaoDeObra: obraTetoMaoDeObra || 30000,
        etapaAtualId: 'etapa-1',
        valorVenda: obraValorVenda !== '' ? Number(obraValorVenda) : undefined,
        status: obraStatus,
        etapaAtual: obraEtapaAtual || 'Fundação',
      };
      addObra(novaObra);
    }

    setIsObraModalOpen(false);
    setEditingObra(null);
    setObraNome('');
    setObraEndereco('');
    setObraValorVenda('');
    setObraStatus('em_andamento');
    setObraEtapaAtual('Fundação');
  };

  const handleSaveMasterEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configEmailInput.trim()) return;
    updateMasterEmail(configEmailInput.trim());
    setEmailSavedSuccess(true);
    setTimeout(() => setEmailSavedSuccess(false), 3000);
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111c2d] dark:text-white tracking-tight">
                Permissões
              </h1>
              <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-1">
                Gerencie contas e permissões
              </p>
            </div>

            <button
              onClick={() => setIsUserModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0085db] hover:bg-[#0071ba] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#0085db]/25 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Usuário</span>
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
                                  <span className="font-bold text-xs sm:text-sm text-[#111c2d] dark:text-white">
                                    {user.nome}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
                Gestão de obras
              </h2>
              <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                Múltiplas obras com orçamentos diferentes
              </p>
            </div>

            <button
              onClick={() => setIsObraModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar obra</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {obras.map(obra => {
              const isCurrent = obra.id === activeObra.id;
              const statusLabel = obra.status === 'em_andamento' || obra.status === 'andamento' ? 'EM ANDAMENTO' : obra.status === 'concluida' ? 'CONCLUÍDA' : obra.status === 'cancelada' ? 'CANCELADA' : 'PLANEJAMENTO';
              const statusColor = obra.status === 'em_andamento' || obra.status === 'andamento' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : obra.status === 'concluida' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : obra.status === 'cancelada' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
              const previsaoLucro = obra.valorVenda ? obra.valorVenda - obra.orcamentoTotal : null;

              return (
                <div
                  key={obra.id}
                  className={`bg-white dark:bg-[#111c2d] border rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between ${
                    isCurrent
                      ? 'border-[#0085db] ring-2 ring-[#0085db]/20'
                      : 'border-[#e6ecf1] dark:border-[#333f55]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#707a82] uppercase tracking-wider">
                            Início: {formatDateBR(obra.dataInicio)}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#0085db] text-white">
                              Obra Ativa
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold text-[#111c2d] dark:text-white mt-1">
                          {obra.nome}
                        </h3>
                        <p className="text-xs text-[#707a82] mt-0.5">{obra.endereco}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditObra(obra)}
                          className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-[#0085db]/10 hover:text-[#0085db] flex items-center justify-center transition-colors cursor-pointer"
                          title="Editar Obra"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setObraToDelete(obra)}
                          className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-rose-500/10 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Excluir Obra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#707a82]">
                        <span>Orçamento Previsto:</span>
                        <span className="font-bold text-[#111c2d] dark:text-white tabular-nums">
                          {formatBRL(obra.orcamentoTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#707a82]">
                        <span>Teto Fechado Mão de Obra:</span>
                        <span className="font-bold text-[#0085db] tabular-nums">
                          {formatBRL(obra.tetoMaoDeObra)}
                        </span>
                      </div>
                      {obra.valorVenda !== undefined && obra.valorVenda > 0 && (
                        <>
                          <div className="flex justify-between text-[#707a82]">
                            <span>Valor de Venda:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                              {formatBRL(obra.valorVenda)}
                            </span>
                          </div>
                          {previsaoLucro !== null && (
                            <div className="flex justify-between text-[#707a82]">
                              <span>Previsão de Lucro:</span>
                              <span className={`font-bold tabular-nums ${previsaoLucro >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                                {formatBRL(previsaoLucro)}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex items-center gap-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-lg font-bold border ${statusColor}`}>
                      {statusLabel}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg font-bold border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 uppercase">
                      ETAPA: {obra.etapaAtual || 'FUNDAÇÃO'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Configurações do Master & Solicitações de Acesso */
        <div className="space-y-6">
          {/* Card 1: E-mail do Administrador Master para Notificações */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[22px] p-5 sm:p-6 shadow-[0px_2px_8px_rgba(37,83,185,0.06)] dark:shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0085db]/10 dark:bg-[#0085db]/20 text-[#0085db] flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-[#111c2d] dark:text-white">
                      E-mail do Administrador Master
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      Configuração Ativa
                    </span>
                  </div>
                  <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-1 max-w-2xl leading-relaxed">
                    Cadastre o e-mail oficial do Administrador Master que receberá as mensagens e pedidos de novos acessos enviados pelos colaboradores na tela de login (&ldquo;Solicitar acesso&rdquo;).
                  </p>
                </div>
              </div>

              <div className="shrink-0 bg-[#f6f9fc] dark:bg-[#1a2535] px-3.5 py-2 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-right">
                <span className="block text-[10px] font-semibold text-[#707a82] uppercase">E-mail Cadastrado</span>
                <span className="text-xs font-bold text-[#0085db]">{masterEmail}</span>
              </div>
            </div>

            <form onSubmit={handleSaveMasterEmail} className="mt-5 space-y-4">
              <div className="max-w-xl">
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5">
                  E-mail para Recebimento de Solicitações *
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
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
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar E-mail</span>
                  </button>
                </div>
              </div>

              {emailSavedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Configuração salva com sucesso! Todas as novas solicitações da tela de login serão direcionadas para <strong>{masterEmail}</strong>.</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535]/60 border border-[#e6ecf1] dark:border-[#333f55] text-[11px] text-[#707a82] dark:text-[#7c8fac] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0085db] shrink-0" />
                <span>Integração ativa com a tela de login: quando qualquer colaborador clica em &ldquo;Solicitar acesso&rdquo;, a mensagem e os dados de contato são gravados e encaminhados diretamente para este endereço.</span>
              </div>
            </form>
          </div>

          {/* Card 2: Solicitações de Acesso Recebidas */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[22px] p-5 sm:p-6 shadow-[0px_2px_8px_rgba(37,83,185,0.06)] dark:shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#111c2d] dark:text-white">
                    Solicitações de Acesso Recebidas ({solicitacoesAcesso.length})
                  </h3>
                  <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                    Mensagens e justificativas enviadas por usuários na tela de login
                  </p>
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {(['todas', 'pendente', 'aprovado', 'recusado'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterSolicitacoes(f)}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                      filterSolicitacoes === f
                        ? 'bg-[#0085db] text-white shadow-xs'
                        : 'text-[#707a82] bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-[#e6ecf1] dark:hover:bg-[#253245]'
                    }`}
                  >
                    {f === 'todas' ? 'Todas' : f === 'pendente' ? 'Pendentes' : f === 'aprovado' ? 'Aprovadas' : 'Recusadas'}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="mt-4 space-y-3">
              {solicitacoesAcesso
                .filter(s => filterSolicitacoes === 'todas' || s.status === filterSolicitacoes)
                .map(solic => {
                  const isPendente = solic.status === 'pendente';
                  const isAprovado = solic.status === 'aprovado';
                  return (
                    <div
                      key={solic.id}
                      className="p-4 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#fafbfd] dark:bg-[#162232] hover:border-[#0085db]/40 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-[#111c2d] dark:text-white">
                            {solic.nome}
                          </span>
                          <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">
                            • {solic.email}
                          </span>
                          <span className="text-[10px] text-[#707a82] dark:text-[#7c8fac] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {solic.data}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPendente
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                : isAprovado
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                            }`}
                          >
                            {isPendente ? 'Pendente' : isAprovado ? 'Aprovado' : 'Recusado'}
                          </span>
                        </div>

                        {/* Text box / message entered by user */}
                        <div className="p-3 rounded-lg bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] text-xs text-[#111c2d] dark:text-slate-200">
                          <span className="block text-[10px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider mb-1">
                            Mensagem / Justificativa da Solicitação:
                          </span>
                          <p className="whitespace-pre-line leading-relaxed italic">
                            &ldquo;{solic.mensagem}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 shrink-0 justify-end">
                        {isPendente && (
                          <>
                            <button
                              onClick={() => {
                                setNome(solic.nome);
                                setEmail(solic.email);
                                setPerfil('operador');
                                atualizarStatusSolicitacao(solic.id, 'aprovado');
                                setIsUserModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Aprovar & Criar Conta</span>
                            </button>
                            <button
                              onClick={() => atualizarStatusSolicitacao(solic.id, 'recusado')}
                              className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/50 cursor-pointer transition-colors"
                            >
                              Recusar
                            </button>
                          </>
                        )}
                        {isAprovado && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            Liberado
                          </span>
                        )}
                        {solic.status === 'recusado' && (
                          <button
                            onClick={() => atualizarStatusSolicitacao(solic.id, 'pendente')}
                            className="px-2.5 py-1 text-xs text-[#707a82] hover:text-[#111c2d] dark:hover:text-white underline cursor-pointer"
                          >
                            Reabrir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              {solicitacoesAcesso.filter(s => filterSolicitacoes === 'todas' || s.status === filterSolicitacoes).length === 0 && (
                <div className="text-center py-8 text-xs text-[#707a82]">
                  Nenhuma solicitação encontrada nesta categoria.
                </div>
              )}
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
        onClose={() => setIsUserModalOpen(false)}
        title="Cadastrar usuário"
        subtitle="Defina perfil e permissões de acesso ao aplicativo."
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
              onClick={() => setIsUserModalOpen(false)}
              className="px-3.5 py-2 text-xs text-[#707a82] hover:text-[#111c2d] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
            >
              Cadastrar Usuário
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
        title={editingObra ? 'Editar Obra' : 'Cadastrar Nova Obra'}
        subtitle="Gerencie canteiros, orçamentos, status e valor de venda."
        maxWidth="md"
      >
        <form onSubmit={handleSaveObra} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Nome da Obra *
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
                Orçamento Estimado (R$)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={obraOrcamento}
                onChange={e => setObraOrcamento(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Teto Mão de Obra (R$)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={obraTetoMaoDeObra}
                onChange={e => setObraTetoMaoDeObra(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Valor de Venda (R$) (Opcional)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Ex: 200000"
                value={obraValorVenda}
                onChange={e => setObraValorVenda(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Status *
              </label>
              <select
                value={obraStatus}
                onChange={e => setObraStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
              >
                <option value="em_andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
                <option value="planejamento">Planejamento</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Etapa Atual
            </label>
            <input
              type="text"
              placeholder="Ex: Fundação, Estrutura, Alvenaria, Acabamento"
              value={obraEtapaAtual}
              onChange={e => setObraEtapaAtual(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
            />
          </div>

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
              Salvar Obra
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

    </div>
  );
};

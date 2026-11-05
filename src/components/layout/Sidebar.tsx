import React, { useState } from 'react';
import { useApp, TabType } from '../../context/AppContext';
import {
  Building2,
  ChevronDown,
  Check,
  PlusCircle,
  LayoutDashboard,
  Receipt,
  Package,
  Users2,
  FileCheck2,
  Scale,
  Hammer,
  CreditCard,
  AlertTriangle,
  FileSpreadsheet,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    alertas,
    logout,
    obras,
    activeObra,
    setActiveObraId,
    activeUser,
    navigateToTabWithFilter,
  } = useApp();

  const [showObraMenu, setShowObraMenu] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'alertas', label: 'Pendências', icon: AlertTriangle, badge: alertas.length },
    { id: 'despesas', label: 'Despesas', icon: Receipt },
    { id: 'orcamentos', label: 'Orçamentos', icon: Scale },
    { id: 'cartoes', label: 'Cartões', icon: CreditCard },
    { id: 'maodeobra', label: 'Diárias', icon: Users2 },
    { id: 'recibos', label: 'Recibos', icon: FileCheck2 },
    { id: 'producao', label: 'Produção', icon: Hammer },
    { id: 'materiais', label: 'Materiais', icon: Package },
    { id: 'relatorios', label: 'Relatórios', icon: FileSpreadsheet },
    { id: 'usuarios', label: 'Permissões', icon: ShieldCheck },
  ];

  const isTabAllowed = (tabId: TabType): boolean => {
    if (!activeUser) return true;
    if (activeUser.perfil === 'master') return true;
    if (tabId === 'usuarios') return false; // Exclusivo de Master

    const permMap: Record<string, keyof typeof activeUser.permissoes> = {
      dashboard: 'dashboard',
      alertas: 'dashboard',
      despesas: 'despesas',
      orcamentos: 'orcamentos',
      cartoes: 'cartoes',
      maodeobra: 'maoDeObra',
      recibos: 'recibos',
      producao: 'producao',
      materiais: 'materiais',
      relatorios: 'relatorios',
      usuarios: 'usuarios',
    };

    const permKey = permMap[tabId];
    if (permKey && activeUser.permissoes && activeUser.permissoes[permKey]) {
      return activeUser.permissoes[permKey].visualizar !== false;
    }
    return true;
  };

  const visibleNavItems = navItems.filter(item => isTabAllowed(item.id));

  return (
    <aside className="hidden lg:flex flex-col w-[265px] shrink-0 bg-white dark:bg-[#111c2d] border-r border-[#e6ecf1] dark:border-[#333f55] p-4 justify-between h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto print:hidden">
      <div className="space-y-4">
        
        {/* Obra Selector Button at the top of aside */}
        <div className="relative pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
          <button
            onClick={() => setShowObraMenu(!showObraMenu)}
            className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#f6f9fc] hover:bg-[#e6ecf1] dark:bg-[#1a2535] dark:hover:bg-[#1f2d40] text-[#111c2d] dark:text-white transition-colors border border-[#e6ecf1] dark:border-[#333f55] cursor-pointer"
            title="Clique para alternar a obra ativa"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <span className="block text-xs font-bold text-[#111c2d] dark:text-white truncate uppercase">
                  {activeObra.nome}
                </span>
                <span className="block text-[10px] text-[#707a82] dark:text-[#7c8fac] uppercase font-semibold tracking-wider">
                  OBRA ATIVA
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#707a82] shrink-0" />
          </button>

          {showObraMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowObraMenu(false)}
              />
              <div className="absolute left-0 mt-2 w-full rounded-[18px] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-bold text-[#707a82] uppercase tracking-wider">
                  OBRAS DO SISTEMA
                </div>
                {obras.map(o => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setActiveObraId(o.id);
                      setShowObraMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      o.id === activeObra.id
                        ? 'bg-[#0085db]/10 text-[#0085db] font-bold'
                        : 'text-[#111c2d] dark:text-[#7c8fac] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] hover:text-[#111c2d] dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate uppercase">{o.nome}</span>
                    {o.id === activeObra.id && (
                      <Check className="w-3.5 h-3.5 text-[#0085db] ml-2 shrink-0" />
                    )}
                  </button>
                ))}
                {activeUser.perfil === 'master' && (
                  <>
                    <div className="border-t border-[#e6ecf1] dark:border-[#333f55] my-1" />
                    <button
                      onClick={() => {
                        setShowObraMenu(false);
                        navigateToTabWithFilter('usuarios');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#0085db] hover:bg-[#0085db]/10 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Gerenciar
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Navigation Buttons: Dashboard, Pendências, Despesas, etc. */}
        <nav className="space-y-1">
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0085db] text-white shadow-sm shadow-[#0085db]/25 font-bold'
                    : 'text-[#111c2d] dark:text-[#7c8fac] hover:bg-[#0085db]/10 hover:text-[#0085db] dark:hover:bg-[#1a2535] dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#707a82] dark:text-[#7c8fac]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-white text-[#0085db]'
                        : 'bg-[#fb977d] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: Sair da página / Logout */}
      <div className="pt-4 border-t border-[#e6ecf1] dark:border-[#333f55]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-[#fb977d] hover:bg-[#fb977d]/15 transition-all cursor-pointer"
          title="Sair do sistema e ir para a página de Login"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 shrink-0 text-[#fb977d]" />
            <span className="truncate">Sair</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

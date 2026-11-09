import React, { useState } from 'react';
import { useApp, TabType } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  Users2,
  Scale,
  Menu,
  X,
  FileCheck2,
  Package,
  Hammer,
  CreditCard,
  AlertTriangle,
  FileSpreadsheet,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, alertas, logout, activeUser } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isTabAllowed = (tabId: TabType): boolean => {
    if (!activeUser) return true;
    if (activeUser.perfil === 'master') return true;
    if (tabId === 'usuarios') return false;

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

  interface MobileTabItem {
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }

  const allPrimaryTabs: MobileTabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'despesas', label: 'Despesas', icon: Receipt },
    { id: 'maodeobra', label: 'Diárias', icon: Users2 },
    { id: 'orcamentos', label: 'Orçamentos', icon: Scale },
  ];

  const allSecondaryTabs: MobileTabItem[] = [
    { id: 'recibos', label: 'Recibos', icon: FileCheck2 },
    { id: 'materiais', label: 'Materiais', icon: Package },
    { id: 'producao', label: 'Produção', icon: Hammer },
    { id: 'cartoes', label: 'Cartões', icon: CreditCard },
    { id: 'alertas', label: 'Pendências', icon: AlertTriangle, badge: alertas.length },
    { id: 'relatorios', label: 'Relatórios', icon: FileSpreadsheet },
    { id: 'usuarios', label: 'Permissões', icon: ShieldCheck },
  ];

  const primaryTabs = allPrimaryTabs.filter(tab => isTabAllowed(tab.id));
  const secondaryTabs = allSecondaryTabs.filter(tab => isTabAllowed(tab.id));

  const isMoreActive = secondaryTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* Fixed and floating bottom navigation bar */}
      <nav className="lg:hidden fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 w-auto sm:w-[calc(100%-2rem)] max-w-2xl z-50 bg-white/95 dark:bg-[#111c2d]/95 backdrop-blur-md border border-[#e6ecf1] dark:border-[#333f55] rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 h-16 px-2 sm:px-6 transition-all print:hidden">
        <div className="grid grid-cols-5 items-center h-full w-full max-w-xl mx-auto">
          {primaryTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowMoreMenu(false);
                }}
                className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#0085db] font-bold'
                    : 'text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* More Tabs button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 relative transition-colors cursor-pointer ${
              isMoreActive || showMoreMenu
                ? 'text-[#0085db] font-bold'
                : 'text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <Menu className={`w-5 h-5 ${(isMoreActive || showMoreMenu) ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {alertas.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#fb977d]" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
              Mais
            </span>
          </button>
        </div>
      </nav>

      {/* "Mais" Bottom Sheet Drawer */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="flex-1"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="bg-white dark:bg-[#111c2d] rounded-t-[24px] border-t border-[#e6ecf1] dark:border-[#333f55] p-5 shadow-2xl max-h-[82vh] overflow-y-auto">
            {/* Grab handle */}
            <div className="w-12 h-1 rounded-full bg-[#e6ecf1] dark:bg-[#333f55] mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55] mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#707a82] dark:text-[#7c8fac]">
                Módulos do Sistema
              </h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-lg text-[#707a82] hover:text-[#111c2d] dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {secondaryTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0085db]/10 border-[#0085db]/30 text-[#0085db] font-bold'
                        : 'bg-[#f6f9fc] dark:bg-[#1a2535] border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-[#7c8fac] hover:bg-[#e6ecf1]'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0 text-[#0085db]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold leading-tight truncate">{tab.label}</p>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#fb977d] text-white">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-between items-center">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  logout();
                }}
                className="text-xs text-[#fb977d] hover:text-[#d5745b] flex items-center gap-1.5 py-2 cursor-pointer font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="px-4 py-2 text-xs font-bold bg-[#0085db] text-white rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

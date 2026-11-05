import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Sun,
  Moon,
  Building2,
  Bell,
  ChevronDown,
  PlusCircle,
  ShieldCheck,
  Check,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    activeObra,
    obras,
    setActiveObraId,
    activeUser,
    usuarios,
    setActiveUserId,
    alertas,
    navigateToTabWithFilter,
    logout,
    setActiveTab,
  } = useApp();

  const [showObraMenu, setShowObraMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pendingCount = alertas.length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#111c2d]/90 backdrop-blur-md border-b border-[#e6ecf1] dark:border-[#333f55] transition-colors print:hidden">
      <div className="w-full px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Obra Context (Visible on mobile where sidebar is hidden) */}
        <div className="flex items-center gap-3 shrink-0 lg:hidden">
          {/* Obra Selector Pill/Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowObraMenu(!showObraMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#f6f9fc] hover:bg-[#e6ecf1] dark:bg-[#1a2535] dark:hover:bg-[#1f2d40] text-[#111c2d] dark:text-white transition-colors border border-[#e6ecf1] dark:border-[#333f55]"
            >
              <Building2 className="w-3.5 h-3.5 text-[#0085db] shrink-0" />
              <span className="max-w-[120px] sm:max-w-[190px] truncate">{activeObra.nome}</span>
              <ChevronDown className="w-3 h-3 text-[#707a82] shrink-0" />
            </button>

            {showObraMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowObraMenu(false)}
                />
                <div className="absolute left-0 mt-2 w-72 rounded-[18px] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#707a82] uppercase tracking-wider">
                    Obras do Sistema
                  </div>
                  {obras.map(o => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setActiveObraId(o.id);
                        setShowObraMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
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
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#0085db] hover:bg-[#0085db]/10 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
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
        </div>


        {/* Zone 3: Actions (PWA install, Alerts, User switch, Theme toggle) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Active User Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-all cursor-pointer"
              title="Menu do usuário"
            >
              <div
                className="w-7 h-7 min-w-7 min-h-7 rounded-full bg-[#0085db] text-white text-xs font-bold flex items-center justify-center shrink-0 aspect-square"
              >
                {activeUser.nome.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-xs font-bold text-[#111c2d] dark:text-white leading-tight">
                  {activeUser.nome}
                </span>
                <span className="block text-[10px] capitalize">
                  {activeUser.perfil === 'master' ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Master</span>
                  ) : activeUser.perfil === 'admin' ? (
                    <span className="text-[#707a82] dark:text-[#7c8fac]">Admin</span>
                  ) : (
                    <span className="text-[#707a82] dark:text-[#7c8fac]">Operador</span>
                  )}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#707a82] shrink-0" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-72 rounded-[20px] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] shadow-2xl z-50 p-2.5 animate-in fade-in zoom-in-95 duration-100">
                  {/* User Profile Header Card */}
                  <div className="p-3 rounded-2xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 min-w-10 min-h-10 rounded-full bg-[#0085db] text-white font-black text-sm flex items-center justify-center shrink-0 aspect-square shadow-sm">
                      {activeUser.nome.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-[#111c2d] dark:text-white truncate">
                          {activeUser.nome}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] ${
                          activeUser.perfil === 'master' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-[#707a82] dark:text-[#7c8fac] font-medium'
                        }`}>
                          {activeUser.perfil === 'master' ? 'Master' : activeUser.perfil === 'admin' ? 'Admin' : 'Operador'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] truncate" title={activeUser.email}>
                        {activeUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Switch to Master Quick Action when not Master */}
                  {activeUser.perfil !== 'master' && (
                    <button
                      onClick={() => {
                        const masterUser = usuarios.find(u => u.perfil === 'master') || usuarios[0];
                        if (masterUser) setActiveUserId(masterUser.id);
                        setShowUserMenu(false);
                      }}
                      className="w-full mb-2 p-2.5 rounded-xl bg-[#0085db] hover:bg-[#0071ba] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>Entrar como Perfil <strong className="text-amber-300">Master</strong></span>
                    </button>
                  )}

                  {/* Alternar Perfil (Disponível para testar e alternar papéis) */}
                  <div className="px-2.5 py-1 text-[10px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider flex items-center justify-between">
                    <span>Alternar Perfil</span>
                    <span className="text-[9px] font-medium text-[#0085db]">Clique para testar</span>
                  </div>
                  <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                    {usuarios.map(u => {
                      const isUCurrent = u.id === activeUser.id;
                      const roleLabel = u.perfil === 'master' ? 'Master' : u.perfil === 'admin' ? 'Admin' : 'Operador';
                      const isMaster = u.perfil === 'master';
                      const badgeColor = `bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] ${
                        isMaster ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-[#707a82] dark:text-[#7c8fac] font-medium'
                      }`;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            setActiveUserId(u.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                            isUCurrent
                              ? 'bg-[#0085db]/10 text-[#0085db] font-bold ring-1 ring-[#0085db]/30'
                              : 'text-[#111c2d] dark:text-[#7c8fac] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] hover:text-[#111c2d] dark:hover:text-white'
                          }`}
                        >
                          <div className="w-5 h-5 min-w-5 min-h-5 rounded-full bg-[#0085db] text-white text-[10px] font-bold flex items-center justify-center shrink-0 aspect-square">
                            {u.nome.charAt(0)}
                          </div>
                          <span className="flex-1 truncate">{u.nome}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${badgeColor}`}>
                            {roleLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#e6ecf1] dark:border-[#333f55] my-1.5" />

                  {/* MASTER ONLY OR SHORTCUT */}
                  {activeUser.perfil === 'master' ? (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigateToTabWithFilter('usuarios');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#0085db] hover:bg-[#0085db]/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0 text-[#0085db]" />
                      <span>Central de Permissões</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab('dashboard');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#111c2d] dark:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0 text-[#0085db]" />
                      <span>Meu Painel Principal</span>
                    </button>
                  )}

                  <div className="border-t border-[#e6ecf1] dark:border-[#333f55] my-1.5" />

                  {/* Sair da conta (Logout) */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Sair da conta</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#707a82] dark:text-[#7c8fac] hover:bg-[#0085db]/10 hover:text-[#0085db] dark:hover:bg-[#1a2535] dark:hover:text-white transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            aria-label="Alternar tema de cores"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#f8c076]" />
            ) : (
              <Moon className="w-4 h-4 text-[#707a82]" />
            )}
          </button>

          {/* Pending Alerts Indicator */}
          <button
            onClick={() => navigateToTabWithFilter('alertas')}
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#707a82] dark:text-[#7c8fac] hover:bg-[#0085db]/10 hover:text-[#0085db] dark:hover:bg-[#1a2535] dark:hover:text-white transition-colors cursor-pointer"
            title={`${pendingCount} pendência(s) e alertas`}
            aria-label="Alertas e pendências"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#fb977d] text-white text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

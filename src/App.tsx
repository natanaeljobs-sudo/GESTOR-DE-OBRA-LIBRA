import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { OfflineIndicator } from './components/layout/OfflineIndicator';
import { Toast } from './components/common/Toast';

import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { DespesasView } from './components/despesas/DespesasView';
import { MateriaisView } from './components/materiais/MateriaisView';
import { MaoDeObraView } from './components/maodeobra/MaoDeObraView';
import { RecibosView } from './components/recibos/RecibosView';
import { OrcamentosView } from './components/orcamentos/OrcamentosView';
import { ProducaoView } from './components/producao/ProducaoView';
import { CartoesView } from './components/cartoes/CartoesView';
import { AlertasView } from './components/alertas/AlertasView';
import { UsuariosView } from './components/usuarios/UsuariosView';
import { RelatoriosView } from './components/relatorios/RelatoriosView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'despesas' && <DespesasView />}
      {activeTab === 'materiais' && <MateriaisView />}
      {activeTab === 'maodeobra' && <MaoDeObraView />}
      {activeTab === 'recibos' && <RecibosView />}
      {activeTab === 'orcamentos' && <OrcamentosView />}
      {activeTab === 'producao' && <ProducaoView />}
      {activeTab === 'cartoes' && <CartoesView />}
      {activeTab === 'alertas' && <AlertasView />}
      {activeTab === 'usuarios' && <UsuariosView />}
      {activeTab === 'relatorios' && <RelatoriosView />}
    </div>
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#f0f5f9] dark:bg-[#15263a] text-[#111c2d] dark:text-white flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header />

      {/* Desktop Body Split with Sidebar */}
      <div className="flex-1 flex flex-row">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <MainContent />
        </main>
      </div>

      {/* Mobile Fixed Navigation */}
      <MobileNav />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Action Notification Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

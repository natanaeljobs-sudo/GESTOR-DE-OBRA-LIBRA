import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:right-auto md:max-w-md z-50 flex items-center gap-2 rounded-xl bg-amber-600 text-white px-4 py-2.5 text-xs font-semibold shadow-lg">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
      <span>Modo Offline — Dados locais ativos. Você pode continuar lançando no canteiro.</span>
    </div>
  );
};

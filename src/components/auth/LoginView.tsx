import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  UserPlus,
  CheckCircle2,
  X,
  Send,
  Mail,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { usuarios, login, theme, toggleTheme, masterEmail, registrarSolicitacaoAcesso } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Solicitar acesso modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqNome, setReqNome] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqMensagem, setReqMensagem] = useState('');
  const [reqSubmitted, setReqSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = email.trim().toLowerCase();
    let matchedUser = usuarios.find(
      u =>
        u.email.toLowerCase() === query ||
        u.nome.toLowerCase().includes(query) ||
        u.id === query ||
        (query === 'master' && u.perfil === 'master')
    );
    if (!matchedUser) {
      matchedUser = usuarios.find(u => u.perfil === 'master') || usuarios[0];
    }
    login(matchedUser?.id);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqNome.trim() || !reqEmail.trim() || !reqMensagem.trim()) return;
    registrarSolicitacaoAcesso({
      nome: reqNome.trim(),
      email: reqEmail.trim(),
      mensagem: reqMensagem.trim(),
    });
    setReqSubmitted(true);
    setTimeout(() => {
      setReqSubmitted(false);
      setIsRequestModalOpen(false);
      setReqNome('');
      setReqEmail('');
      setReqMensagem('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#e8eef3] dark:bg-[#0c1825] text-[#111c2d] dark:text-white flex items-start lg:items-center justify-center p-4 pt-8 sm:pt-10 md:pt-12 lg:p-10 relative overflow-x-hidden overflow-y-auto transition-colors selection:bg-[#0085db] selection:text-white">
      
      {/* Background Architectural Diagonal Accent Stripes (as seen in the reference presentation) */}
      <div className="absolute top-0 right-0 w-[55vw] h-[55vw] bg-linear-to-bl from-slate-300/40 via-transparent to-transparent dark:from-slate-800/40 pointer-events-none -mr-32 -mt-32" />
      <div className="absolute top-0 right-0 w-32 h-64 bg-linear-to-b from-[#0085db]/25 to-transparent -rotate-45 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-96 bg-linear-to-t from-[#0085db]/20 to-transparent rotate-45 pointer-events-none" />
      {/* Main Split Login Card - Wide Rectangular Aspect Ratio */}
      <div className="w-full max-w-md md:max-w-xl lg:max-w-[1160px] rounded-[28px] bg-white dark:bg-[#111c2d] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-[#e6ecf1] dark:border-[#333f55] overflow-hidden flex flex-col lg:flex-row lg:min-h-[540px] z-10 transition-all mb-8 lg:mb-0">
        
        {/* Left Hero Panel: Hidden on mobile and tablet, shown on desktop (pure clean crop without background artifacts) */}
        <div className="hidden lg:flex lg:w-[58%] relative bg-slate-950 overflow-hidden select-none">
          <img
            src="/assets/aistudio/login_hero_clean.png"
            alt="Libra Construtora - Construindo um futuro melhor"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Right Form Panel: Full width on mobile/tablet, 42% on desktop */}
        <div className="w-full lg:w-[42%] p-6 sm:p-8 lg:p-9 flex flex-col justify-between bg-white dark:bg-[#111c2d] relative">
          
          {/* Light / Dark Mode Toggle Button - Integrated directly inside the login card */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100/90 hover:bg-slate-200 dark:bg-[#1a2535] dark:hover:bg-[#253245] border border-[#e6ecf1] dark:border-[#333f55] shadow-xs flex items-center justify-center text-[#707a82] hover:text-[#0085db] dark:text-[#a0aec0] dark:hover:text-white transition-all cursor-pointer"
              title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              aria-label="Alternar tema claro/escuro"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#f8c076]" />
              ) : (
                <Moon className="w-4 h-4 text-[#707a82]" />
              )}
            </button>
          </div>
          
          <div>
            {/* Corporate Logo: LIBRA CONSTRUTORA (Transparent PNG) */}
            <div className="flex flex-col items-center mb-3">
              <img
                src="/assets/aistudio/Captura_de_tela_2026-11-03_155101-removebg-preview_6dfab585.png"
                alt="Libra Construtora"
                className="h-28 sm:h-32 w-auto object-contain transition-all dark:invert dark:hue-rotate-180"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="text-left mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#111c2d] dark:text-white tracking-tight">
                Bem-vindo!
              </h2>
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5 font-medium">
                Acesse sua conta para continuar
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Field 1: Usuario ou e-mail */}
              <div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707a82] pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Usuário ou e-mail"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-full border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#1a2535] text-[#111c2d] dark:text-white placeholder-[#707a82] dark:placeholder-[#7c8fac] focus:outline-hidden focus:ring-2 focus:ring-[#0085db] transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Senha */}
              <div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707a82] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 text-xs rounded-full border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#1a2535] text-[#111c2d] dark:text-white placeholder-[#707a82] dark:placeholder-[#7c8fac] focus:outline-hidden focus:ring-2 focus:ring-[#0085db] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707a82] hover:text-[#111c2d] dark:hover:text-white cursor-pointer transition-colors"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db]"
                  />
                  <span className="text-[#707a82] dark:text-[#7c8fac] text-xs">
                    Lembrar de mim
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Para redefinição de acesso, contate o perfil Master (Natanael).')}
                  className="text-xs font-semibold text-[#0085db] hover:underline cursor-pointer"
                >
                  Esqueceu sua senha?
                </button>
              </div>

              {/* Primary Entrar Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#111c2d] dark:bg-[#0085db] hover:bg-[#1f2d40] dark:hover:bg-[#0071ba] active:scale-[0.98] text-white text-xs font-bold tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
              >
                <span>Entrar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* Quick Master Access Section */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#707a82] dark:text-slate-400 mb-2">
                <span>Acesso Rápido para Teste</span>
                <span className="text-[10px] text-[#0085db] font-bold">1 clique</span>
              </div>

              {/* One-click button for Master */}
              <button
                type="button"
                onClick={() => {
                  const masterUser = usuarios.find(u => u.perfil === 'master') || usuarios[0];
                  if (masterUser) login(masterUser.id);
                }}
                className="w-full py-2.5 px-3 mb-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-[#0085db]/15 dark:hover:bg-[#0085db]/25 border border-blue-200 dark:border-blue-500/30 text-[#0085db] dark:text-blue-300 text-xs font-bold flex items-center justify-between transition-all cursor-pointer group"
                title="Entrar diretamente com o perfil Master"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0085db] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    M
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-[#111c2d] dark:text-white leading-none">
                      Natanael Dias <span className="text-amber-600 dark:text-amber-400 font-bold">(Master)</span>
                    </span>
                    <span className="text-[10px] text-[#707a82] dark:text-slate-400">
                      natanaeljobs@gmail.com
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0085db] text-white group-hover:bg-[#0071ba] transition-colors">
                  Acessar
                </span>
              </button>

              {/* Other demo roles */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const adminUser = usuarios.find(u => u.perfil === 'admin') || usuarios[1];
                    if (adminUser) login(adminUser.id);
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span>Ives (Admin)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const opUser = usuarios.find(u => u.perfil === 'operador') || usuarios[2];
                    if (opUser) login(opUser.id);
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Alberto (Operador)</span>
                </button>
              </div>
            </div>

            {/* Divider "ou" */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e6ecf1] dark:border-[#333f55]" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#111c2d] text-xs text-[#707a82]">
                ou
              </span>
            </div>

            {/* Secondary Action: Solicitar acesso */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full py-2.5 rounded-full border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#1a2535] hover:bg-[#f6f9fc] dark:hover:bg-[#202f43] text-xs font-semibold text-[#111c2d] dark:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#707a82] dark:text-[#0085db]" />
                <span>Solicitar acesso</span>
              </button>
            </div>

          </div>

          {/* Bottom Right Diagonal Blue Shape Accent (as in screenshot) */}
          <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-6 bg-[#0085db] -rotate-45 translate-y-3 translate-x-5" />
          </div>

          {/* Bottom Footer Note */}
          <div className="text-center pt-4 text-[10px] text-[#707a82]">
            © 2026 · SISTEMA - FEITO POR NATANAEL DIAS
          </div>

        </div>

      </div>

      {/* Modal: Solicitar Acesso */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#111c2d] rounded-2xl border border-[#e6ecf1] dark:border-[#333f55] shadow-2xl p-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setIsRequestModalOpen(false);
                setReqSubmitted(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {reqSubmitted ? (
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#111c2d] dark:text-white max-w-xs mx-auto leading-snug">
                  Sua solicitação de acesso foi enviada com sucesso
                </h3>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0085db]/10 dark:bg-[#0085db]/20 flex items-center justify-center text-[#0085db]">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111c2d] dark:text-white">
                      Solicitar acesso
                    </h3>
                    <p className="text-xs text-[#707a82] dark:text-slate-400">
                      Plataforma Libra Construtora
                    </p>
                  </div>
                </div>

                <form onSubmit={handleRequestSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#111c2d] dark:text-slate-200 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      required
                      value={reqNome}
                      onChange={(e) => setReqNome(e.target.value)}
                      placeholder="Nome ou sobrenome"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#1a2535] text-xs text-[#111c2d] dark:text-white placeholder-[#707a82] focus:outline-none focus:border-[#0085db] focus:ring-1 focus:ring-[#0085db]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111c2d] dark:text-slate-200 mb-1">
                      E-mail
                    </label>
                    <input
                      type="text"
                      required
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="E-mail"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#1a2535] text-xs text-[#111c2d] dark:text-white placeholder-[#707a82] focus:outline-none focus:border-[#0085db] focus:ring-1 focus:ring-[#0085db]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111c2d] dark:text-slate-200 mb-1">
                      Mensagem
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reqMensagem}
                      onChange={(e) => setReqMensagem(e.target.value)}
                      placeholder="Descreva sua função na obra, cargo ou motivo da solicitação de acesso..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#1a2535] text-xs text-[#111c2d] dark:text-white placeholder-[#707a82] dark:placeholder-[#7c8fac] focus:outline-none focus:border-[#0085db] focus:ring-1 focus:ring-[#0085db] resize-none transition-all"
                    />
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#707a82] dark:text-[#7c8fac]">
                      <Mail className="w-3.5 h-3.5 text-[#0085db] shrink-0" />
                      <span>Encaminhado ao e-mail do Master</span>
                    </div>
                  </div>


                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(false)}
                      className="px-4 py-2 rounded-full border border-[#e6ecf1] dark:border-[#333f55] text-xs font-medium text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#0085db] hover:bg-[#0071ba] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Enviar solicitação</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

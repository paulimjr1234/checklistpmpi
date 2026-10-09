import React, { useState } from 'react';
import {
  ClipboardList,
  Shield,
  FolderArchive,
  Cloud,
  CloudRain,
  CloudSun,
  ChevronRight,
  CloudOff,
  CloudCog,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { HeaderBanner } from '../components/HeaderBanner';
import { AdminPasswordModal } from '../components/AdminPasswordModal';
import { AppScreen } from '../types';
import { storage } from '../data/storage';

interface HomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onStartNewChecklist: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onStartNewChecklist,
}) => {
  const [passwordModalTarget, setPasswordModalTarget] = useState<AppScreen | null>(null);
  const [isDriveConnected, setIsDriveConnected] = useState<boolean>(storage.isDriveConnected());
  const [driveEmail, setDriveEmail] = useState<string | null>(storage.getDriveEmail());
  const [showDriveConnectModal, setShowDriveConnectModal] = useState(false);
  const [emailInput, setEmailInput] = useState('policia.militar.pi@pm.pi.gov.br');

  const handleOpenProtected = (target: AppScreen) => {
    setPasswordModalTarget(target);
  };

  const handlePasswordSuccess = () => {
    if (passwordModalTarget) {
      const target = passwordModalTarget;
      setPasswordModalTarget(null);
      onNavigate(target);
    }
  };

  const handleConnectDrive = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim() || 'policia.militar.pi@pm.pi.gov.br';
    storage.setDriveConnection(true, email);
    setIsDriveConnected(true);
    setDriveEmail(email);
    setShowDriveConnectModal(false);
  };

  const handleDisconnectDrive = () => {
    storage.setDriveConnection(false);
    setIsDriveConnected(false);
    setDriveEmail(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        {/* Institutional Banner */}
        <HeaderBanner />

        {/* Content Container */}
        <main className="max-w-xl mx-auto px-4 py-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2240]">
              Opções Principais
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              Viatura e Gestão
            </span>
          </div>

          {/* 1. NOVO CHECKLIST */}
          <div
            role="button"
            tabIndex={0}
            data-testid="menu_btn_novo_checklist"
            onClick={onStartNewChecklist}
            onKeyDown={(e) => e.key === 'Enter' && onStartNewChecklist()}
            className="group w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#0A2240]/40 transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="w-13 h-13 rounded-xl bg-[#E8EEF6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-7 h-7 text-[#0A2240]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-base text-[#0A2240] tracking-tight">
                  NOVO CHECKLIST
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0A2240]/10 text-[#0A2240]">
                  Acesso Rápido
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                Iniciar vistoria técnica e preenchimento de checklist da viatura
              </p>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0A2240] group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          {/* 2. UNIDADE */}
          <div
            role="button"
            tabIndex={0}
            data-testid="menu_btn_unidade"
            onClick={() => handleOpenProtected('ADMIN_UNITS')}
            onKeyDown={(e) => e.key === 'Enter' && handleOpenProtected('ADMIN_UNITS')}
            className="group w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="w-13 h-13 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-7 h-7 text-purple-700" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-base text-[#0A2240] tracking-tight">
                  UNIDADE
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Administrativo
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                Estrutura administrativa e seleção do Grande Comando e Batalhão
              </p>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          {/* 3. CHECKLISTS SALVOS */}
          <div
            role="button"
            tabIndex={0}
            data-testid="menu_btn_checklists_salvos"
            onClick={() => handleOpenProtected('SAVED_CHECKLISTS')}
            onKeyDown={(e) => e.key === 'Enter' && handleOpenProtected('SAVED_CHECKLISTS')}
            className="group w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="w-13 h-13 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FolderArchive className="w-7 h-7 text-emerald-700" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-base text-[#0A2240] tracking-tight">
                  CHECKLISTS SALVOS
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Histórico
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                Consultar relatórios finalizados, visualizar e compartilhar PDFs
              </p>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          {/* 4. GOOGLE DRIVE */}
          <div
            data-testid="card_google_drive"
            className={`w-full rounded-2xl p-5 border transition-all ${
              isDriveConnected
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isDriveConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-[#0A2240]'
                  }`}
                >
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">GOOGLE DRIVE</h3>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-[220px]">
                    {isDriveConnected && driveEmail
                      ? driveEmail
                      : isDriveConnected
                      ? 'Conta autorizada'
                      : 'Sincronização em nuvem'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                  isDriveConnected
                    ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 border-slate-300 text-slate-600'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isDriveConnected ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                {isDriveConnected ? 'Conectado' : 'Não conectado'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {isDriveConnected
                ? 'Estrutura organizada automaticamente no Google Drive: CHECKLIST VTR → [ANO] → [MÊS] → [DIA].'
                : 'Conecte sua conta Google para enviar os PDFs dos relatórios diretamente para as pastas oficiais do Drive.'}
            </p>

            {isDriveConnected ? (
              <button
                type="button"
                data-testid="btn_disconnect_google_drive"
                onClick={handleDisconnectDrive}
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CloudOff className="w-4 h-4" />
                DESCONECTAR GOOGLE DRIVE
              </button>
            ) : (
              <button
                type="button"
                data-testid="btn_connect_google_drive"
                onClick={() => setShowDriveConnectModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0A2240] hover:bg-[#071930] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Cloud className="w-4 h-4 text-[#FFD54F]" />
                CONECTAR GOOGLE DRIVE
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/50">
        PMPI • Segurança Pública em Defesa da Sociedade
      </footer>

      {/* Admin Password Modal */}
      {passwordModalTarget && (
        <AdminPasswordModal
          targetLabel={passwordModalTarget === 'ADMIN_UNITS' ? 'UNIDADE' : 'CHECKLISTS SALVOS'}
          onSuccess={handlePasswordSuccess}
          onClose={() => setPasswordModalTarget(null)}
        />
      )}

      {/* Connect Drive Modal */}
      {showDriveConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0A2240] px-5 py-4 flex items-center gap-3 text-white">
              <div className="p-2 bg-white/10 rounded-lg">
                <Cloud className="w-5 h-5 text-[#FFD54F]" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">CONECTAR GOOGLE DRIVE</h3>
                <p className="text-xs text-slate-300">Sincronização em Nuvem de Relatórios</p>
              </div>
            </div>

            <form onSubmit={handleConnectDrive} className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Informe a conta institucional do Google Drive para o envio automatizado dos checklists gerados:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail institucional da Unidade
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] focus:ring-1 focus:ring-[#0A2240] outline-none"
                  placeholder="ex: 29bpm@pm.pi.gov.br"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Pastas de Destino:</div>
                <div>• CHECKLIST VTR / 2026 / 10 / 09</div>
                <div>• Nomenclatura oficial PMPI com parte numerada e motorista</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDriveConnectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0A2240] hover:bg-[#071930] rounded-lg shadow-sm transition-colors"
                >
                  Conectar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

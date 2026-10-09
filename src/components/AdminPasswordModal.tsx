import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { storage } from '../data/storage';

interface AdminPasswordModalProps {
  targetLabel: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  targetLabel,
  onSuccess,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (storage.checkAdminPassword(password)) {
      setHasError(false);
      onSuccess();
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0A2240] px-5 py-4 flex items-center gap-3 text-white">
          <div className="p-2 bg-white/10 rounded-lg">
            <Shield className="w-5 h-5 text-[#FFD54F]" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide">SENHA ADMINISTRATIVA</h3>
            <p className="text-xs text-slate-300">Controle de Acesso Institucional</p>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5">
          <p className="text-xs text-slate-600 mb-4">
            Para acessar a seção de <strong className="text-slate-800">{targetLabel}</strong>, informe a senha administrativa:
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Senha de Administrador
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setHasError(false);
                }}
                autoFocus
                placeholder="Digite a senha"
                data-testid="admin_password_input"
                className={`w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border outline-none transition-colors ${
                  hasError
                    ? 'border-red-500 bg-red-50/50 text-red-900 focus:border-red-600'
                    : 'border-slate-300 focus:border-[#0A2240] focus:ring-1 focus:ring-[#0A2240]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {hasError && (
              <p className="text-xs text-red-600 font-medium pt-1">
                Senha incorreta. Acesso negado. (Padrão: admin)
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="confirm_admin_password_btn"
              className="px-5 py-2 text-xs font-bold text-white bg-[#0A2240] hover:bg-[#071930] rounded-lg shadow-sm transition-colors"
            >
              Acessar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

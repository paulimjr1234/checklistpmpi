import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  Plus,
  Shield,
  CheckCircle2,
  Building2,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { storage } from '../data/storage';
import { GrandCommand, PoliceUnit } from '../types';

interface AdminUnitScreenProps {
  onNavigateBack: () => void;
  onUnitChanged?: () => void;
}

export const AdminUnitScreen: React.FC<AdminUnitScreenProps> = ({
  onNavigateBack,
  onUnitChanged,
}) => {
  const [grandCommands] = useState<GrandCommand[]>(storage.getGrandCommands());
  const [policeUnits, setPoliceUnits] = useState<PoliceUnit[]>(storage.getPoliceUnits());
  const [configuredUnit, setConfiguredUnit] = useState(storage.getConfiguredUnit());

  const [selectedCmdCode, setSelectedCmdCode] = useState<string>(() => {
    return configuredUnit.cmdCode || 'CPM';
  });

  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassChars, setShowPassChars] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitAbbrev, setNewUnitAbbrev] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [addUnitError, setAddUnitError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectUnit = (unit: PoliceUnit) => {
    const currentCmd = grandCommands.find((c) => c.code === selectedCmdCode);
    const cmdName = currentCmd ? currentCmd.name : selectedCmdCode;
    storage.setConfiguredUnit(selectedCmdCode, cmdName, unit.abbreviation, unit.name);
    setConfiguredUnit({
      cmdCode: selectedCmdCode,
      cmdName,
      unitAbbrev: unit.abbreviation,
      unitName: unit.name,
    });
    showToast(`Unidade configurada: ${unit.abbreviation} — ${unit.name}`);
    if (onUnitChanged) onUnitChanged();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storage.checkAdminPassword(currentPassword)) {
      setPasswordError('Senha atual incorreta.');
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError('A nova senha não pode estar em branco.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação da senha não coincide.');
      return;
    }
    storage.setAdminPassword(newPassword.trim());
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    showToast('Senha administrativa alterada com sucesso!');
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitAbbrev.trim() || !newUnitName.trim()) {
      setAddUnitError('Preencha todos os campos da nova unidade.');
      return;
    }

    const added = storage.addPoliceUnit({
      grandCommandCode: selectedCmdCode,
      abbreviation: newUnitAbbrev.trim(),
      name: newUnitName.trim(),
    });

    setPoliceUnits(storage.getPoliceUnits());
    setShowAddUnitModal(false);
    setNewUnitAbbrev('');
    setNewUnitName('');
    setAddUnitError(null);
    showToast(`Unidade cadastrada: ${added.abbreviation}`);
  };

  const currentSelectedCmd = grandCommands.find((c) => c.code === selectedCmdCode);
  const filteredUnits = policeUnits.filter((u) => u.grandCommandCode === selectedCmdCode);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#0A2240] text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 h-15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="admin_back_button"
              onClick={onNavigateBack}
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold tracking-tight">UNIDADE OPERACIONAL</h1>
              <p className="text-[11px] text-slate-300">Grandes Comandos & Batalhões</p>
            </div>
          </div>

          <button
            type="button"
            data-testid="admin_change_password_action"
            onClick={() => {
              setPasswordError(null);
              setShowPasswordModal(true);
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Alterar Senha Administrativa"
          >
            <Lock className="w-4 h-4 text-[#FFD54F]" />
            <span className="hidden sm:inline">Alterar Senha</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-[#0A2240] text-white px-5 py-2.5 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* 1. BANNER: UNIDADE ATUALMENTE CONFIGURADA */}
        <section
          data-testid="card_active_configured_unit"
          className="bg-[#E8EEF6] border-2 border-[#0A2240] rounded-2xl p-5 shadow-xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[#0A2240] flex items-center justify-center text-white">
              <Shield className="w-3.5 h-3.5 text-[#FFD54F]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A2240]">
              Unidade Atualmente Configurada
            </span>
          </div>

          <div className="mt-1">
            <h2 className="text-2xl font-black text-[#041021] tracking-tight">
              {configuredUnit.unitAbbrev || 'NÃO DEFINIDA'}
            </h2>
            <p className="text-sm font-medium text-slate-700 mt-0.5">
              {configuredUnit.unitName || 'Selecione uma unidade abaixo'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs mt-3 pt-2 border-t border-[#0A2240]/15">
            <span className="font-semibold text-slate-600">Grande Comando:</span>
            <span className="font-bold text-[#0A2240]">{configuredUnit.cmdName}</span>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E6F4EA] text-[#1B7339] text-xs font-bold border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ativa para o Novo Checklist (preenchimento automático)
          </div>
        </section>

        {/* 2. SELEÇÃO DO GRANDE COMANDO */}
        <section className="space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A2240]">
              1. Selecione o Grande Comando
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toque em um Grande Comando para visualizar os seus respectivos Batalhões e Companhias:
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {grandCommands.map((cmd) => {
              const isSelected = cmd.code === selectedCmdCode;
              return (
                <button
                  key={cmd.code}
                  type="button"
                  data-testid={`chip_cmd_${cmd.code}`}
                  onClick={() => setSelectedCmdCode(cmd.code)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#0A2240] text-white border-[#0A2240] shadow-xs'
                      : 'bg-white text-[#0A2240] border-slate-200 hover:border-[#0A2240]/40'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {cmd.code}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. LISTAGEM DAS UNIDADES */}
        <section className="space-y-3">
          {/* Breadcrumb Info Box */}
          <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-2xs">
              <Building2 className="w-5 h-5 text-[#0A2240]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#0A2240] uppercase tracking-wider">
                UNIDADE → {selectedCmdCode}
              </div>
              <div className="text-xs font-semibold text-slate-800">
                {currentSelectedCmd?.name || selectedCmdCode}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A2240]">
              2. Selecione a Unidade / Batalhão
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toque na unidade desejada para defini-la como a unidade de serviço do aplicativo:
            </p>
          </div>

          {filteredUnits.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
              Nenhuma unidade cadastrada para este Grande Comando.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredUnits.map((unit) => {
                const isSelected =
                  unit.abbreviation.toLowerCase() === configuredUnit.unitAbbrev.toLowerCase() ||
                  unit.name.toLowerCase() === configuredUnit.unitName.toLowerCase();

                return (
                  <div
                    key={unit.id}
                    data-testid={`unit_item_${unit.abbreviation}`}
                    onClick={() => handleSelectUnit(unit)}
                    className={`rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#E8EEF6] border-[#0A2240] shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0A2240]">
                          {unit.abbreviation}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#E6F4EA] text-[#1B7339] border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            SELECIONADA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {unit.name}
                      </p>
                    </div>

                    <button
                      type="button"
                      data-testid={`btn_select_unit_${unit.abbreviation}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectUnit(unit);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B7339] text-white shadow-2xs'
                          : 'bg-[#0A2240] text-white hover:bg-[#071930]'
                      }`}
                    >
                      {isSelected ? 'Ativa' : 'Selecionar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Button (Cadastrar Nova Unidade) */}
      <button
        type="button"
        data-testid="fab_add_unit"
        onClick={() => {
          setAddUnitError(null);
          setShowAddUnitModal(true);
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#0A2240] text-white shadow-xl hover:bg-[#071930] flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
        aria-label="Adicionar Batalhão / Unidade"
        title="Cadastrar Nova Unidade"
      >
        <Plus className="w-6 h-6 text-[#FFD54F]" />
      </button>

      {/* MODAL: ALTERAR SENHA ADMINISTRATIVA */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0A2240] px-5 py-4 flex items-center gap-3 text-white">
              <div className="p-2 bg-white/10 rounded-lg">
                <Lock className="w-5 h-5 text-[#FFD54F]" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">ALTERAR SENHA</h3>
                <p className="text-xs text-slate-300">Segurança Administrativa</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-3.5">
              <p className="text-xs text-slate-600">
                Informe a senha atual e defina a nova senha de acesso administrativo:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Senha Atual
                </label>
                <input
                  type={showPassChars ? 'text' : 'password'}
                  required
                  data-testid="input_current_password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Senha atual (padrão: admin)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type={showPassChars ? 'text' : 'password'}
                  required
                  data-testid="input_new_password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type={showPassChars ? 'text' : 'password'}
                  required
                  data-testid="input_confirm_new_password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="showPass"
                  checked={showPassChars}
                  onChange={(e) => setShowPassChars(e.target.checked)}
                  className="rounded text-[#0A2240]"
                />
                <label htmlFor="showPass" className="text-xs text-slate-600 cursor-pointer select-none">
                  Mostrar caracteres
                </label>
              </div>

              {passwordError && (
                <p className="text-xs text-red-600 font-semibold">{passwordError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  data-testid="btn_confirm_change_password"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0A2240] hover:bg-[#071930] rounded-lg shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRAR NOVA UNIDADE */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0A2240] px-5 py-4 flex items-center gap-3 text-white">
              <div className="p-2 bg-white/10 rounded-lg">
                <Building2 className="w-5 h-5 text-[#FFD54F]" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">NOVA UNIDADE / BATALHÃO</h3>
                <p className="text-xs text-slate-300">Vincular a: {selectedCmdCode}</p>
              </div>
            </div>

            <form onSubmit={handleAddUnit} className="p-5 space-y-3.5">
              <p className="text-xs text-slate-600 font-medium">
                Vincular ao comando:{' '}
                <strong className="text-[#0A2240]">
                  {currentSelectedCmd?.name || selectedCmdCode}
                </strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sigla da Unidade (ex: 31º BPM)
                </label>
                <input
                  type="text"
                  required
                  data-testid="input_new_unit_abbrev"
                  value={newUnitAbbrev}
                  onChange={(e) => setNewUnitAbbrev(e.target.value)}
                  placeholder="Ex: 31º BPM"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo (ex: 31º Batalhão)
                </label>
                <input
                  type="text"
                  required
                  data-testid="input_new_unit_name"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="Ex: 31º Batalhão de Polícia Militar"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] outline-none"
                />
              </div>

              {addUnitError && (
                <p className="text-xs text-red-600 font-semibold">{addUnitError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  data-testid="btn_save_new_unit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0A2240] hover:bg-[#071930] rounded-lg shadow-sm"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

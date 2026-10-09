import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Lock,
  Info,
  Camera,
  Check,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Save,
  Trash2,
  RefreshCw,
  Car,
} from 'lucide-react';
import { ChecklistFormData, ChecklistRecord } from '../types';
import { storage } from '../data/storage';
import { RANKS_LIST, SERVICE_MODALITIES } from '../data/defaultData';
import { generateChecklistPdf } from '../utils/pdfGenerator';

interface NewChecklistScreenProps {
  onNavigateBack: () => void;
  onFinishChecklist: (record: ChecklistRecord) => void;
}

export const NewChecklistScreen: React.FC<NewChecklistScreenProps> = ({
  onNavigateBack,
  onFinishChecklist,
}) => {
  const configuredUnit = storage.getConfiguredUnit();

  const getInitialDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const [form, setForm] = useState<ChecklistFormData>({
    verificationDate: getInitialDate(),
    grandCommand: configuredUnit.cmdName || 'COMANDO DE POLICIAMENTO METROPOLITANO',
    unitName: `${configuredUnit.unitAbbrev} — ${configuredUnit.unitName}`,
    vehicleModel: '',
    vehiclePlate: '',
    serviceModality: 'Ordinário',
    responsibleRank: 'Soldado',
    responsibleName: '',
    commanderName: '',
    driverName: '',
    patrolman01Name: '',
    patrolman02Name: '',
    initialMileage: '',
    oilStatus: 'SEM ALTERAÇÃO',
    oilReason: '',
    radiatorWaterStatus: 'SEM ALTERAÇÃO',
    radiatorWaterReason: '',
    tiresStatus: 'SIM',
    tiresReason: '',
    lightbarStatus: 'SEM ALTERAÇÃO',
    lightbarReason: '',
    radioStatus: 'SEM ALTERAÇÃO',
    radioReason: '',
    spareTireStatus: 'SEM ALTERAÇÃO',
    spareTireReason: '',
    jackStatus: 'SEM ALTERAÇÃO',
    jackReason: '',
    headlightsStatus: 'SEM ALTERAÇÃO',
    headlightsReason: '',
    airConditioningStatus: 'SEM ALTERAÇÃO',
    airConditioningReason: '',
    photoFrontPath: null,
    photoDriverSidePath: null,
    photoPassengerSidePath: null,
    photoRearPath: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePhotoCapture = (slotIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setForm((prev) => {
          switch (slotIndex) {
            case 0:
              return { ...prev, photoFrontPath: dataUrl };
            case 1:
              return { ...prev, photoDriverSidePath: dataUrl };
            case 2:
              return { ...prev, photoPassengerSidePath: dataUrl };
            case 3:
              return { ...prev, photoRearPath: dataUrl };
            default:
              return prev;
          }
        });
        showToast('Fotografia capturada com sucesso!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate placeholder vehicle silhouette / simulation photo if camera unavailable
  const generateSimulatedPhoto = (slotIndex: number, label: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background
      ctx.fillStyle = '#0F3A53';
      ctx.fillRect(0, 0, 640, 480);

      // Gold stripe
      ctx.fillStyle = '#C8961D';
      ctx.fillRect(0, 460, 640, 20);

      // Car silhouette placeholder
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('POLÍCIA MILITAR DO ESTADO DO PIAUÍ', 320, 100);

      ctx.fillStyle = '#FFD54F';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(label.toUpperCase(), 320, 240);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '18px sans-serif';
      ctx.fillText(`VTR: ${form.vehicleModel || 'PMPI'} - ${form.vehiclePlate || 'VIATURA'}`, 320, 290);
      ctx.fillText(`Registro Digital Oficial • ${new Date().toLocaleDateString('pt-BR')}`, 320, 330);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setForm((prev) => {
        switch (slotIndex) {
          case 0:
            return { ...prev, photoFrontPath: dataUrl };
          case 1:
            return { ...prev, photoDriverSidePath: dataUrl };
          case 2:
            return { ...prev, photoPassengerSidePath: dataUrl };
          case 3:
            return { ...prev, photoRearPath: dataUrl };
          default:
            return prev;
        }
      });
      showToast(`Registro de "${label}" gerado.`);
    }
  };

  const handleFinalize = async () => {
    setErrorMessage(null);

    // Validations matching original Kotlin logic
    if (!form.grandCommand.trim() || !form.unitName.trim()) {
      setErrorMessage('Grande Comando e Unidade não estão configurados. Acesse a aba UNIDADE.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.vehicleModel.trim() || !form.vehiclePlate.trim()) {
      setErrorMessage('Preencha o Modelo e a Placa da Viatura.');
      return;
    }
    if (!form.driverName.trim()) {
      setErrorMessage('Informe o Nome Completo do Motorista da Viatura.');
      return;
    }
    if (!form.initialMileage.trim()) {
      setErrorMessage('Informe a Quilometragem Inicial da Viatura.');
      return;
    }

    // Validation of mandatory reasons
    if (form.oilStatus === 'COM ALTERAÇÃO' && !form.oilReason.trim()) {
      setErrorMessage('Informe o motivo da alteração no Óleo do Motor antes de finalizar o checklist.');
      return;
    }
    if (form.radiatorWaterStatus === 'COM ALTERAÇÃO' && !form.radiatorWaterReason.trim()) {
      setErrorMessage('Informe o motivo da alteração na Água do Radiador antes de finalizar o checklist.');
      return;
    }
    if (form.tiresStatus === 'NÃO' && !form.tiresReason.trim()) {
      setErrorMessage('Informe o motivo da alteração nos Pneus antes de finalizar o checklist.');
      return;
    }
    if (form.lightbarStatus === 'COM ALTERAÇÃO' && !form.lightbarReason.trim()) {
      setErrorMessage('Informe o motivo da alteração no Giroflex / Sinalizador antes de finalizar o checklist.');
      return;
    }
    if (form.radioStatus === 'COM ALTERAÇÃO' && !form.radioReason.trim()) {
      setErrorMessage('Informe o motivo da alteração no Rádio Comunicador antes de finalizar o checklist.');
      return;
    }
    if (form.spareTireStatus === 'COM ALTERAÇÃO' && !form.spareTireReason.trim()) {
      setErrorMessage('Informe o motivo da alteração no Estepe antes de finalizar o checklist.');
      return;
    }
    if (form.jackStatus === 'COM ALTERAÇÃO' && !form.jackReason.trim()) {
      setErrorMessage('Informe o motivo da alteração no Macaco Hidráulico antes de finalizar o checklist.');
      return;
    }
    if (form.headlightsStatus === 'COM ALTERAÇÃO' && !form.headlightsReason.trim()) {
      setErrorMessage('Informe o motivo da alteração nos Faróis antes de finalizar o checklist.');
      return;
    }
    if (form.airConditioningStatus === 'COM ALTERAÇÃO' && !form.airConditioningReason.trim()) {
      setErrorMessage('Informe o motivo da alteração no Ar-Condicionado antes de finalizar o checklist.');
      return;
    }

    // Validation of mandatory 4 photos
    if (!form.photoFrontPath) {
      setErrorMessage('É necessário registrar a fotografia da frente da viatura para finalizar o checklist.');
      return;
    }
    if (!form.photoDriverSidePath) {
      setErrorMessage('É necessário registrar a fotografia do lado do motorista para finalizar o checklist.');
      return;
    }
    if (!form.photoPassengerSidePath) {
      setErrorMessage('É necessário registrar a fotografia do lado do passageiro para finalizar o checklist.');
      return;
    }
    if (!form.photoRearPath) {
      setErrorMessage('É necessário registrar a fotografia da parte traseira da viatura para finalizar o checklist.');
      return;
    }

    setIsProcessing(true);

    try {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const completedDateFormatted = `${dd}/${mm}/${yyyy} — ${hh}:${min}`;
      const completedTimestampMillis = now.getTime();

      const nextNum = storage.getNextReportNumber();

      const newRecord: ChecklistRecord = {
        id: Date.now(),
        reportNumber: nextNum,
        verificationDate: form.verificationDate,
        grandCommand: form.grandCommand,
        unitName: form.unitName,
        vehiclePrefix: '',
        vehicleModel: form.vehicleModel.trim(),
        vehiclePlate: form.vehiclePlate.trim().toUpperCase(),
        serviceModality: form.serviceModality,
        responsibleRank: form.responsibleRank,
        responsibleName: form.responsibleName || form.driverName,
        commanderName: form.commanderName,
        driverName: form.driverName.trim(),
        patrolman01Name: form.patrolman01Name,
        patrolman02Name: form.patrolman02Name,
        initialMileage: form.initialMileage.trim(),
        oilStatus: form.oilStatus,
        oilReason: form.oilReason.trim(),
        radiatorWaterStatus: form.radiatorWaterStatus,
        radiatorWaterReason: form.radiatorWaterReason.trim(),
        tiresStatus: form.tiresStatus,
        tiresReason: form.tiresReason.trim(),
        lightbarStatus: form.lightbarStatus,
        lightbarReason: form.lightbarReason.trim(),
        radioStatus: form.radioStatus,
        radioReason: form.radioReason.trim(),
        spareTireStatus: form.spareTireStatus,
        spareTireReason: form.spareTireReason.trim(),
        jackStatus: form.jackStatus,
        jackReason: form.jackReason.trim(),
        headlightsStatus: form.headlightsStatus,
        headlightsReason: form.headlightsReason.trim(),
        airConditioningStatus: form.airConditioningStatus,
        airConditioningReason: form.airConditioningReason.trim(),
        photoFrontPath: form.photoFrontPath,
        photoDriverSidePath: form.photoDriverSidePath,
        photoPassengerSidePath: form.photoPassengerSidePath,
        photoRearPath: form.photoRearPath,
        completedDateFormatted,
        completedTimestampMillis,
      };

      // Generate PDF
      const { dataUrl } = await generateChecklistPdf(newRecord);
      newRecord.pdfDataUri = dataUrl;

      // Save in storage
      storage.saveChecklist(newRecord);

      setIsProcessing(false);
      onFinishChecklist(newRecord);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(`Erro ao finalizar checklist: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const photoSlots = [
    { title: '1. Frente da Viatura', key: 'photoFrontPath', path: form.photoFrontPath },
    { title: '2. Lado do Motorista', key: 'photoDriverSidePath', path: form.photoDriverSidePath },
    { title: '3. Lado do Passageiro', key: 'photoPassengerSidePath', path: form.photoPassengerSidePath },
    { title: '4. Parte Traseira da Viatura', key: 'photoRearPath', path: form.photoRearPath },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#0A2240] text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 h-15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="checklist_back_button"
              onClick={onNavigateBack}
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold tracking-tight">NOVO CHECKLIST</h1>
              <p className="text-[11px] text-slate-300">Inspeção Operacional de Viatura</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-[#0A2240] text-white px-5 py-2.5 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex items-start gap-3 text-red-800 animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs font-medium leading-relaxed">
              <span className="font-bold block text-red-900 mb-0.5">Atenção</span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* ================= 1. IDENTIFICAÇÃO E UNIDADE ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2240] pb-2 border-b border-slate-100">
            1. Identificação e Unidade (Bloqueados)
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Data de Verificação *
            </label>
            <input
              type="text"
              data-testid="input_verification_date"
              value={form.verificationDate}
              onChange={(e) => setForm({ ...form, verificationDate: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grande Comando *
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                disabled
                data-testid="input_grand_command_locked"
                value={form.grandCommand}
                className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border border-[#0A2240]/40 bg-[#E8EEF6]/50 text-[#041021] font-semibold cursor-not-allowed select-none"
              />
              <Lock className="w-4 h-4 text-[#0A2240] absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-[11px] text-[#0A2240] font-medium mt-1 block">
              Definido na aba Unidade (somente leitura)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unidade / Batalhão *
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                disabled
                data-testid="input_unit_name_locked"
                value={form.unitName}
                className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border border-[#0A2240]/40 bg-[#E8EEF6]/50 text-[#041021] font-semibold cursor-not-allowed select-none"
              />
              <Lock className="w-4 h-4 text-[#0A2240] absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-[11px] text-[#0A2240] font-medium mt-1 block">
              Definido na aba Unidade (somente leitura)
            </span>
          </div>

          <div className="bg-[#E8EEF6] border border-[#0A2240]/25 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#041021]">
            <Info className="w-4 h-4 text-[#0A2240] shrink-0 mt-0.5" />
            <span>
              Para alterar a unidade de serviço, acerte a configuração na aba UNIDADE com a senha de administrador.
            </span>
          </div>
        </div>

        {/* ================= 2. DADOS DA VIATURA ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2240] pb-2 border-b border-slate-100">
            2. Dados da Viatura (Digitação Manual)
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Modelo da Viatura *
            </label>
            <input
              type="text"
              data-testid="input_vehicle_model"
              placeholder="Ex: Toyota Hilux / Duster / Ranger"
              value={form.vehicleModel}
              onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Placa da Viatura *
            </label>
            <input
              type="text"
              data-testid="input_vehicle_plate"
              placeholder="Ex: PIX-2901 ou RNB-3A12"
              value={form.vehiclePlate}
              onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Modalidade do Serviço *
            </label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_MODALITIES.map((mod) => {
                const isSelected = form.serviceModality === mod;
                return (
                  <button
                    key={mod}
                    type="button"
                    data-testid={`chip_modality_${mod}`}
                    onClick={() => setForm({ ...form, serviceModality: mod })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#0A2240] text-white border-[#0A2240] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {mod}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= 3. MOTORISTA DA VIATURA ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2240] pb-2 border-b border-slate-100">
            3. Motorista da Viatura
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Posto / Graduação do Motorista *
            </label>
            <select
              data-testid="dropdown_responsible_rank"
              value={form.responsibleRank}
              onChange={(e) => setForm({ ...form, responsibleRank: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] outline-none bg-white"
            >
              {RANKS_LIST.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome Completo do Motorista da Viatura *
            </label>
            <input
              type="text"
              data-testid="input_driver_name"
              placeholder="Digite o nome completo do motorista"
              value={form.driverName}
              onChange={(e) => setForm({ ...form, driverName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] outline-none"
            />
          </div>
        </div>

        {/* ================= 4. QUILOMETRAGEM ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2240] pb-2 border-b border-slate-100">
            4. Quilometragem da Viatura
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Km Inicial *
            </label>
            <input
              type="number"
              inputMode="numeric"
              data-testid="input_initial_mileage"
              placeholder="Ex: 85200"
              value={form.initialMileage}
              onChange={(e) => setForm({ ...form, initialMileage: e.target.value.replace(/\D/g, '') })}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#0A2240] outline-none"
            />
          </div>
        </div>

        {/* ================= 5. CONDIÇÕES TÉCNICAS E MECÂNICAS ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2240]">
              5. Condições Técnicas e Mecânicas
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Indique o estado de cada item. Havendo alteração, descreva obrigatoriamente o motivo.
            </p>
          </div>

          {/* Helper: Technical Check Item Component */}
          {[
            {
              title: 'Óleo do Motor',
              keyStatus: 'oilStatus',
              keyReason: 'oilReason',
              tagPrefix: 'oil',
              status: form.oilStatus,
              reason: form.oilReason,
            },
            {
              title: 'Água do Radiador',
              keyStatus: 'radiatorWaterStatus',
              keyReason: 'radiatorWaterReason',
              tagPrefix: 'water',
              status: form.radiatorWaterStatus,
              reason: form.radiatorWaterReason,
            },
            {
              title: 'Giroflex / Sinalizador',
              keyStatus: 'lightbarStatus',
              keyReason: 'lightbarReason',
              tagPrefix: 'lightbar',
              status: form.lightbarStatus,
              reason: form.lightbarReason,
            },
            {
              title: 'Rádio Comunicador',
              keyStatus: 'radioStatus',
              keyReason: 'radioReason',
              tagPrefix: 'radio',
              status: form.radioStatus,
              reason: form.radioReason,
            },
            {
              title: 'Estepe',
              keyStatus: 'spareTireStatus',
              keyReason: 'spareTireReason',
              tagPrefix: 'spare',
              status: form.spareTireStatus,
              reason: form.spareTireReason,
            },
            {
              title: 'Macaco Hidráulico',
              keyStatus: 'jackStatus',
              keyReason: 'jackReason',
              tagPrefix: 'jack',
              status: form.jackStatus,
              reason: form.jackReason,
            },
            {
              title: 'Faróis e Iluminação',
              keyStatus: 'headlightsStatus',
              keyReason: 'headlightsReason',
              tagPrefix: 'headlights',
              status: form.headlightsStatus,
              reason: form.headlightsReason,
            },
            {
              title: 'Ar-Condicionado',
              keyStatus: 'airConditioningStatus',
              keyReason: 'airConditioningReason',
              tagPrefix: 'ac',
              status: form.airConditioningStatus,
              reason: form.airConditioningReason,
            },
          ].map((item) => {
            const isAltered = item.status === 'COM ALTERAÇÃO';
            return (
              <div
                key={item.tagPrefix}
                className={`p-4 rounded-xl border transition-all ${
                  isAltered ? 'bg-red-50/40 border-red-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-800">
                    {item.title}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid={`${item.tagPrefix}_sem_alteracao`}
                      onClick={() => setForm({ ...form, [item.keyStatus]: 'SEM ALTERAÇÃO' })}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        item.status === 'SEM ALTERAÇÃO'
                          ? 'bg-[#1B7339] text-white border-[#1B7339] shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      SEM ALTERAÇÃO
                    </button>
                    <button
                      type="button"
                      data-testid={`${item.tagPrefix}_com_alteracao`}
                      onClick={() => setForm({ ...form, [item.keyStatus]: 'COM ALTERAÇÃO' })}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        isAltered
                          ? 'bg-[#B3261E] text-white border-[#B3261E] shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      COM ALTERAÇÃO
                    </button>
                  </div>
                </div>

                {isAltered && (
                  <div className="mt-3 pt-3 border-t border-red-200/80 space-y-2">
                    <div className="flex gap-2">
                      <textarea
                        data-testid={`${item.tagPrefix}_input_reason`}
                        value={item.reason}
                        onChange={(e) => setForm({ ...form, [item.keyReason]: e.target.value })}
                        placeholder="Descreva detalhadamente o problema encontrado..."
                        rows={2}
                        className="w-full p-2.5 text-xs rounded-lg border border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white outline-none"
                      />
                      <button
                        type="button"
                        data-testid={`${item.tagPrefix}_btn_save_reason`}
                        onClick={() => {
                          if (item.reason.trim()) {
                            showToast('Relato salvo com sucesso!');
                          } else {
                            showToast('Digite o motivo da alteração antes de salvar.');
                          }
                        }}
                        className="px-3 rounded-lg bg-[#0A2240] text-white hover:bg-[#071930] flex items-center justify-center shrink-0"
                        title="Salvar Relato"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[11px] text-red-600 font-medium block">
                      * Obrigatório detalhar a anomalia para finalizar.
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Special case: Pneus em Bom Estado (SIM / NÃO) */}
          {(() => {
            const isAlteredTires = form.tiresStatus === 'NÃO';
            return (
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isAlteredTires ? 'bg-red-50/40 border-red-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-800">
                    Pneus em Bom Estado de Conservação
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid="tires_sim"
                      onClick={() => setForm({ ...form, tiresStatus: 'SIM' })}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        form.tiresStatus === 'SIM'
                          ? 'bg-[#1B7339] text-white border-[#1B7339] shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      SIM (EM BOM ESTADO)
                    </button>
                    <button
                      type="button"
                      data-testid="tires_nao"
                      onClick={() => setForm({ ...form, tiresStatus: 'NÃO' })}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        isAlteredTires
                          ? 'bg-[#B3261E] text-white border-[#B3261E] shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      NÃO (COM PROBLEMA)
                    </button>
                  </div>
                </div>

                {isAlteredTires && (
                  <div className="mt-3 pt-3 border-t border-red-200/80 space-y-2">
                    <div className="flex gap-2">
                      <textarea
                        data-testid="tires_input_reason"
                        value={form.tiresReason}
                        onChange={(e) => setForm({ ...form, tiresReason: e.target.value })}
                        placeholder="Ex: Pneu dianteiro direito careca, rasgo na lateral, etc."
                        rows={2}
                        className="w-full p-2.5 text-xs rounded-lg border border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white outline-none"
                      />
                      <button
                        type="button"
                        data-testid="tires_btn_save_reason"
                        onClick={() => {
                          if (form.tiresReason.trim()) {
                            showToast('Relato salvo com sucesso!');
                          } else {
                            showToast('Digite o motivo da alteração dos pneus antes de salvar.');
                          }
                        }}
                        className="px-3 rounded-lg bg-[#0A2240] text-white hover:bg-[#071930] flex items-center justify-center shrink-0"
                        title="Salvar Relato"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[11px] text-red-600 font-medium block">
                      * Obrigatório detalhar o estado dos pneus.
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* ================= 6. REGISTRO FOTOGRÁFICO OBRIGATÓRIO ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2240]">
              6. Registro Fotográfico Obrigatório (4 Ângulos)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              As 4 fotografias oficiais são obrigatórias para finalizar a vistoria:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photoSlots.map((slot, index) => {
              const hasPhoto = Boolean(slot.path);
              return (
                <div
                  key={index}
                  data-testid={`photo_slot_${index}`}
                  className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                    hasPhoto
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#0A2240]">
                      {slot.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasPhoto
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {hasPhoto ? 'Registrada' : 'Pendente'}
                    </span>
                  </div>

                  {/* Photo Preview or Placeholder */}
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-200 flex items-center justify-center mb-3">
                    {hasPhoto ? (
                      <img
                        src={slot.path!}
                        alt={slot.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <Camera className="w-8 h-8 mx-auto mb-1 stroke-1" />
                        <span className="text-[11px]">Nenhuma foto registrada</span>
                      </div>
                    )}
                  </div>

                  {/* Hidden camera / file input */}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={(el) => {
                      fileInputRefs[index].current = el;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoCapture(index, file);
                    }}
                    className="hidden"
                  />

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid={`btn_capture_photo_${index}`}
                      onClick={() => fileInputRefs[index].current?.click()}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#0A2240] hover:bg-[#071930] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#FFD54F]" />
                      {hasPhoto ? 'Tirar Outra' : 'Abrir Câmera'}
                    </button>

                    <button
                      type="button"
                      onClick={() => generateSimulatedPhoto(index, slot.title)}
                      className="py-2 px-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                      title="Gerar registro padrão institucional (amostra)"
                    >
                      <Car className="w-3.5 h-3.5" />
                    </button>

                    {hasPhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => {
                            switch (index) {
                              case 0:
                                return { ...prev, photoFrontPath: null };
                              case 1:
                                return { ...prev, photoDriverSidePath: null };
                              case 2:
                                return { ...prev, photoPassengerSidePath: null };
                              case 3:
                                return { ...prev, photoRearPath: null };
                              default:
                                return prev;
                            }
                          });
                        }}
                        className="py-2 px-2.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                        title="Remover fotografia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 7. BOTÃO FINALIZAR ================= */}
        <div className="pt-2">
          <button
            type="button"
            data-testid="btn_finalize_checklist"
            disabled={isProcessing}
            onClick={handleFinalize}
            className={`w-full py-4 px-6 rounded-2xl text-white font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer ${
              isProcessing
                ? 'bg-[#0A2240]/80 cursor-not-allowed'
                : 'bg-[#0A2240] hover:bg-[#071930] hover:scale-[1.01]'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                GERANDO RELATÓRIO EM PDF...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 text-[#FFD54F]" />
                FINALIZAR RELATÓRIO
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

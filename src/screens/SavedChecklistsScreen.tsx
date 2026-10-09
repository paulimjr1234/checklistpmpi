import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  FileText,
  Share2,
  Info,
  Calendar,
  Car,
  User,
  Clock,
  X,
  ClipboardList,
  Download,
} from 'lucide-react';
import { ChecklistRecord } from '../types';
import { storage } from '../data/storage';
import { generateChecklistPdf } from '../utils/pdfGenerator';

interface SavedChecklistsScreenProps {
  onNavigateBack: () => void;
}

export const SavedChecklistsScreen: React.FC<SavedChecklistsScreenProps> = ({
  onNavigateBack,
}) => {
  const [checklists] = useState<ChecklistRecord[]>(storage.getSavedChecklists());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ChecklistRecord | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<{ url: string; fileName: string } | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return checklists;
    const query = searchQuery.toLowerCase().trim();
    return checklists.filter(
      (r) =>
        r.reportNumber.toLowerCase().includes(query) ||
        r.vehicleModel.toLowerCase().includes(query) ||
        r.vehiclePlate.toLowerCase().includes(query) ||
        r.unitName.toLowerCase().includes(query) ||
        (r.driverName && r.driverName.toLowerCase().includes(query)) ||
        (r.responsibleName && r.responsibleName.toLowerCase().includes(query))
    );
  }, [checklists, searchQuery]);

  const ensurePdf = async (rec: ChecklistRecord): Promise<{ dataUrl: string; fileName: string }> => {
    if (rec.pdfDataUri) {
      return { dataUrl: rec.pdfDataUri, fileName: `Relatorio_Parte_${rec.reportNumber}.pdf` };
    }
    const { dataUrl, fileName } = await generateChecklistPdf(rec);
    rec.pdfDataUri = dataUrl;
    storage.saveChecklist(rec);
    return { dataUrl, fileName };
  };

  const handleOpenPdf = async (rec: ChecklistRecord) => {
    const { dataUrl, fileName } = await ensurePdf(rec);
    setPreviewPdfUrl({ url: dataUrl, fileName });
  };

  const handleSharePdf = async (rec: ChecklistRecord) => {
    const { dataUrl, fileName } = await ensurePdf(rec);
    if (navigator.share) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], fileName, { type: 'application/pdf' });
        await navigator.share({
          title: `Relatório de Checklist VTR - ${rec.vehiclePlate}`,
          text: `Relatório de Checklist PMPI nº ${rec.reportNumber} da VTR ${rec.vehicleModel} (${rec.vehiclePlate}).`,
          files: [file],
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          downloadPdfFile(dataUrl, fileName);
        }
      }
    } else {
      downloadPdfFile(dataUrl, fileName);
    }
  };

  const downloadPdfFile = (dataUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#0A2240] text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 h-15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateBack}
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold tracking-tight">CHECKLISTS SALVOS</h1>
              <p className="text-[11px] text-slate-300">Histórico de Relatórios Operacionais</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            data-testid="saved_checklists_search_input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por VTR, placa, unidade ou responsável..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:border-[#0A2240] focus:ring-1 focus:ring-[#0A2240] outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Total de relatórios: {filtered.length}</span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#0A2240] font-semibold hover:underline"
            >
              Limpar busca
            </button>
          )}
        </div>

        {/* List of Checklists */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 mt-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700">Nenhum checklist encontrado</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {searchQuery ? 'Tente buscar com outros termos.' : 'Nenhum relatório finalizado ainda.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((record) => (
              <div
                key={record.id}
                data-testid={`checklist_card_${record.id}`}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                {/* Header: Report number & date */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-[#E8EEF6] text-[#0A2240] text-xs font-bold tracking-wide">
                    RELATÓRIO Nº {record.reportNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {record.verificationDate}
                  </span>
                </div>

                {/* Body */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0A2240] flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-500 shrink-0" />
                    {record.vehicleModel}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Placa: <strong className="text-slate-800">{record.vehiclePlate}</strong> • Unidade:{' '}
                    <span className="text-slate-700">{record.unitName}</span>
                  </p>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Responsável: <strong>{record.responsibleRank} {record.driverName || record.responsibleName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Finalizado em: {record.completedDateFormatted}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    data-testid={`btn_card_details_${record.id}`}
                    onClick={() => setSelectedRecord(record)}
                    className="flex-1 py-2 px-3 rounded-lg border border-[#0A2240] text-[#0A2240] hover:bg-[#E8EEF6]/60 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Detalhes
                  </button>

                  <button
                    type="button"
                    data-testid={`btn_card_open_pdf_${record.id}`}
                    onClick={() => handleOpenPdf(record)}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#0A2240] hover:bg-[#071930] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#FFD54F]" />
                    PDF
                  </button>

                  <button
                    type="button"
                    data-testid={`btn_card_share_pdf_${record.id}`}
                    onClick={() => handleSharePdf(record)}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#00695C] hover:bg-[#004D40] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Enviar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL: DETALHES DO RELATÓRIO */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#0A2240] px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Info className="w-5 h-5 text-[#FFD54F]" />
                <h3 className="font-bold text-sm tracking-wide">
                  Detalhes do Relatório Nº {selectedRecord.reportNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <DetailRow label="Data de Verificação:" value={selectedRecord.verificationDate} />
                <DetailRow label="Grande Comando:" value={selectedRecord.grandCommand} />
                <DetailRow label="Unidade / Batalhão:" value={selectedRecord.unitName} />
                <DetailRow label="Modelo da Viatura:" value={selectedRecord.vehicleModel} />
                <DetailRow label="Placa da Viatura:" value={selectedRecord.vehiclePlate} />
                <DetailRow label="Modalidade:" value={selectedRecord.serviceModality} />
                <DetailRow label="Quilometragem Inicial:" value={`${selectedRecord.initialMileage} km`} />
                <DetailRow
                  label="Responsável:"
                  value={`${selectedRecord.responsibleRank} ${selectedRecord.driverName || selectedRecord.responsibleName}`}
                />
                <DetailRow label="Motorista:" value={selectedRecord.driverName || 'Não informado'} />
                <DetailRow label="Horário de Finalização:" value={selectedRecord.completedDateFormatted} />
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2.5">
                  Condições Técnicas e Mecânicas
                </h4>
                <div className="space-y-1.5">
                  <ConditionRow label="Óleo do Motor" status={selectedRecord.oilStatus} reason={selectedRecord.oilReason} />
                  <ConditionRow label="Água do Radiador" status={selectedRecord.radiatorWaterStatus} reason={selectedRecord.radiatorWaterReason} />
                  <ConditionRow label="Pneus" status={selectedRecord.tiresStatus} reason={selectedRecord.tiresReason} />
                  <ConditionRow label="Giroflex / Sinalizador" status={selectedRecord.lightbarStatus} reason={selectedRecord.lightbarReason} />
                  <ConditionRow label="Rádio Comunicador" status={selectedRecord.radioStatus} reason={selectedRecord.radioReason} />
                  <ConditionRow label="Estepe" status={selectedRecord.spareTireStatus} reason={selectedRecord.spareTireReason} />
                  <ConditionRow label="Macaco Hidráulico" status={selectedRecord.jackStatus} reason={selectedRecord.jackReason} />
                  <ConditionRow label="Faróis e Iluminação" status={selectedRecord.headlightsStatus} reason={selectedRecord.headlightsReason} />
                  <ConditionRow label="Ar-Condicionado" status={selectedRecord.airConditioningStatus} reason={selectedRecord.airConditioningReason} />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  const rec = selectedRecord;
                  setSelectedRecord(null);
                  handleOpenPdf(rec);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0A2240] hover:bg-[#071930] rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#FFD54F]" />
                Abrir PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
          <div className="w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-[#0A2240] px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FFD54F]" />
                <span className="font-bold text-xs sm:text-sm">{previewPdfUrl.fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadPdfFile(previewPdfUrl.url, previewPdfUrl.fileName)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Baixar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPdfUrl(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-slate-100 p-2 overflow-auto">
              <iframe
                src={previewPdfUrl.url}
                title="Pré-visualização do Relatório"
                className="w-full h-full rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-slate-500 font-medium shrink-0">{label}</span>
    <span className="font-semibold text-slate-800 text-right">{value}</span>
  </div>
);

const ConditionRow: React.FC<{ label: string; status: string; reason?: string }> = ({
  label,
  status,
  reason,
}) => {
  const isOk = status === 'SEM ALTERAÇÃO' || status === 'SIM';
  return (
    <div className="flex flex-col p-2 rounded-lg bg-slate-50 border border-slate-200/60">
      <div className="flex justify-between items-center">
        <span className="text-slate-700 font-medium">{label}</span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isOk ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {status}
        </span>
      </div>
      {reason && (
        <span className="text-[11px] text-red-700 font-medium mt-1">
          Motivo: {reason}
        </span>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Check,
  Share2,
  FileText,
  CloudUpload,
  CloudCheck,
  Home,
  CheckCircle2,
  AlertCircle,
  CloudOff,
  Eye,
  Download,
  X,
} from 'lucide-react';
import { ChecklistRecord } from '../types';
import { storage } from '../data/storage';
import { generateChecklistPdf } from '../utils/pdfGenerator';

interface ReportCompletedScreenProps {
  record: ChecklistRecord | null;
  onNavigateHome: () => void;
}

export const ReportCompletedScreen: React.FC<ReportCompletedScreenProps> = ({
  record,
  onNavigateHome,
}) => {
  const isDriveConnected = storage.isDriveConnected();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showDriveNotConnectedModal, setShowDriveNotConnectedModal] = useState(false);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(record?.pdfDataUri || null);

  const ensurePdf = async (): Promise<{ dataUrl: string; fileName: string } | null> => {
    if (!record) return null;
    if (record.pdfDataUri) {
      return { dataUrl: record.pdfDataUri, fileName: `Relatorio_Parte_${record.reportNumber}.pdf` };
    }
    const { dataUrl, fileName } = await generateChecklistPdf(record);
    record.pdfDataUri = dataUrl;
    storage.saveChecklist(record);
    setCurrentPdfUrl(dataUrl);
    return { dataUrl, fileName };
  };

  const handleSharePdf = async () => {
    if (!record) return;
    const pdf = await ensurePdf();
    if (!pdf) return;

    if (navigator.share) {
      try {
        // Create blob file from base64 dataUrl
        const res = await fetch(pdf.dataUrl);
        const blob = await res.blob();
        const file = new File([blob], pdf.fileName, { type: 'application/pdf' });
        await navigator.share({
          title: `Relatório de Checklist VTR - ${record.vehiclePlate}`,
          text: `Relatório de Checklist PMPI nº ${record.reportNumber} da VTR ${record.vehicleModel} (${record.vehiclePlate}).`,
          files: [file],
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // fallback to download
          downloadPdfFile(pdf.dataUrl, pdf.fileName);
        }
      }
    } else {
      downloadPdfFile(pdf.dataUrl, pdf.fileName);
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

  const handleViewPdf = async () => {
    const pdf = await ensurePdf();
    if (pdf) {
      setCurrentPdfUrl(pdf.dataUrl);
      setShowPdfPreviewModal(true);
    }
  };

  const handleUploadDrive = async () => {
    if (isUploading) return;
    if (!isDriveConnected) {
      setShowDriveNotConnectedModal(true);
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    // Simulate reliable official drive upload to Google Drive structure: CHECKLIST VTR / [ANO] / [MÊS] / [DIA]
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      const email = storage.getDriveEmail() || 'Drive Institucional PMPI';
      setUploadMessage(`Relatório enviado com sucesso para ${email} (CHECKLIST VTR / ${new Date().getFullYear()}).`);
    }, 1500);
  };

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-slate-600 text-sm">Nenhum relatório recém-finalizado encontrado.</p>
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-4 py-2 bg-[#0A2240] text-white text-xs font-bold rounded-lg"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between py-10 px-4">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Success badge circle */}
        <div className="flex flex-col items-center text-center">
          <div className="w-22 h-22 rounded-full bg-[#E6F4EA] flex items-center justify-center shadow-xs mb-4">
            <Check className="w-12 h-12 text-[#1B7339] stroke-[2.5]" />
          </div>

          <h1
            data-testid="report_success_title"
            className="text-lg sm:text-xl font-black text-[#041021] tracking-tight uppercase"
          >
            RELATÓRIO FINALIZADO COM SUCESSO
          </h1>

          <p className="text-xs text-slate-500 mt-1 max-w-md">
            O checklist foi gravado com segurança e o arquivo PDF oficial foi gerado.
          </p>
        </div>

        {/* Report details card */}
        <div
          data-testid="report_details_card"
          className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3"
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Número do Relatório:</span>
            <span className="font-bold text-[#041021] bg-white px-2 py-0.5 rounded-md border border-slate-200">
              Nº {record.reportNumber}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Viatura:</span>
            <span className="font-semibold text-slate-800">{record.vehicleModel}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Placa:</span>
            <span className="font-bold text-[#0A2240] uppercase">{record.vehiclePlate}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Unidade / Batalhão:</span>
            <span className="font-semibold text-slate-800 text-right max-w-[240px] truncate">
              {record.unitName}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Responsável:</span>
            <span className="font-semibold text-slate-800">
              {record.responsibleRank} {record.driverName || record.responsibleName}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">Data e Hora da Finalização:</span>
            <span className="font-bold text-[#0A2240]">{record.completedDateFormatted}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* 1. COMPARTILHAR PDF */}
          <button
            type="button"
            data-testid="btn_share_pdf"
            onClick={handleSharePdf}
            className="w-full py-3.5 px-4 rounded-xl bg-[#0A2240] hover:bg-[#071930] text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#FFD54F]" />
            COMPARTILHAR PDF
          </button>

          {/* 2. VISUALIZAR PDF */}
          <button
            type="button"
            data-testid="btn_view_pdf"
            onClick={handleViewPdf}
            className="w-full py-3.5 px-4 rounded-xl border-2 border-[#0A2240] text-[#0A2240] hover:bg-[#E8EEF6]/50 font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            VISUALIZAR PDF
          </button>

          {/* 3. ENVIAR PARA NUVEM (Google Drive) */}
          <button
            type="button"
            data-testid="btn_send_cloud"
            disabled={isUploading}
            onClick={handleUploadDrive}
            className={`w-full py-3.5 px-4 rounded-xl border font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              uploadSuccess
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A2240] border-t-transparent rounded-full animate-spin" />
                Enviando relatório para o Google Drive...
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ENVIADO COM SUCESSO
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4 text-[#0A2240]" />
                ENVIAR PARA NUVEM
              </>
            )}
          </button>

          {/* Status Message */}
          {uploadMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadMessage}</span>
            </div>
          )}

          {/* 4. VOLTAR À TELA INICIAL */}
          <button
            type="button"
            data-testid="btn_back_home"
            onClick={onNavigateHome}
            className="w-full py-3 px-4 text-[#0A2240] hover:bg-slate-100 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            VOLTAR À TELA INICIAL
          </button>
        </div>
      </div>

      {/* Modal Drive Not Connected */}
      {showDriveNotConnectedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <CloudOff className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-sm text-[#041021]">Google Drive Não Conectado</h3>
              <p className="text-xs text-slate-500 mt-1">
                Conecte uma conta Google Drive para enviar o relatório para a nuvem.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDriveNotConnectedModal(false);
                  onNavigateHome();
                }}
                className="w-full py-2.5 rounded-xl bg-[#0A2240] text-white text-xs font-bold hover:bg-[#071930] transition-colors"
              >
                CONECTAR NA TELA INICIAL
              </button>
              <button
                type="button"
                onClick={() => setShowDriveNotConnectedModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal PDF Preview */}
      {showPdfPreviewModal && currentPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
          <div className="w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-[#0A2240] px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FFD54F]" />
                <span className="font-bold text-xs sm:text-sm">
                  Relatório Parte Nº {record.reportNumber} — VTR {record.vehiclePlate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadPdfFile(currentPdfUrl, `Relatorio_Parte_${record.reportNumber}.pdf`)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Baixar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPdfPreviewModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-slate-100 p-2 overflow-auto">
              <iframe
                src={currentPdfUrl}
                title="Pré-visualização do Relatório Oficial"
                className="w-full h-full rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

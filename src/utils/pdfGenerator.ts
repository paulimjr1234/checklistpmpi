import { jsPDF } from 'jspdf';
import { ChecklistRecord } from '../types';

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function sanitizeString(str: string): string {
  const withoutAccents = removeAccents(str);
  return withoutAccents.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export function formatNumeroParte(parteNumero: string): string {
  const trimmed = parteNumero.trim();
  if (!trimmed) return '001';
  if (/^\d+$/.test(trimmed)) {
    return trimmed.padStart(3, '0');
  }
  const match = /^(\d+)[/\\-].*/.exec(trimmed);
  if (match) {
    return match[1].padStart(3, '0');
  }
  const sanitized = sanitizeString(trimmed);
  return sanitized || '001';
}

export function formatDataServico(dataServico: string, fallbackTimestamp = Date.now()): string {
  const trimmed = dataServico.trim();
  if (trimmed) {
    const digits = trimmed.replace(/\D/g, '');
    if (/^\d{4}[-/.]\d{2}[-/.]\d{2}/.test(trimmed) && digits.length >= 8) {
      const yyyy = digits.slice(0, 4);
      const mm = digits.slice(4, 6);
      const dd = digits.slice(6, 8);
      return `${dd}${mm}${yyyy}`;
    }
    const dmyMatch = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/.exec(trimmed);
    if (dmyMatch) {
      const dd = dmyMatch[1].padStart(2, '0');
      const mm = dmyMatch[2].padStart(2, '0');
      let yyyy = dmyMatch[3];
      if (yyyy.length === 2) yyyy = `20${yyyy}`;
      return `${dd}${mm}${yyyy}`;
    }
    if (digits.length === 8) {
      return digits;
    }
  }
  const d = new Date(fallbackTimestamp);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

export function formatNomeElaborador(nome: string): string {
  const raw = nome.trim() || 'Policial_Militar';
  const sanitized = sanitizeString(raw);
  return sanitized || 'Policial_Militar';
}

export function getPdfFileName(record: ChecklistRecord): string {
  const numParte = formatNumeroParte(record.reportNumber);
  const data = formatDataServico(record.verificationDate, record.completedTimestampMillis);
  const driverOrResp = record.driverName || record.responsibleName;
  const elaborador = formatNomeElaborador(driverOrResp);
  return `Relatorio_Parte_${numParte}_${data}_${elaborador}.pdf`;
}

// Convert image url to base64 Data URL
async function loadImageDataUrl(src: string): Promise<string | null> {
  if (src.startsWith('data:image')) {
    return src;
  }
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateChecklistPdf(record: ChecklistRecord): Promise<{ doc: jsPDF; fileName: string; dataUrl: string }> {
  const fileName = getPdfFileName(record);

  // A4: 595.28 x 841.89 points
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN_X = 36;

  // Institutional Colors
  const COLOR_AZUL_PETROLEO: [number, number, number] = [15, 58, 83];
  const COLOR_DOURADO: [number, number, number] = [201, 162, 39];
  const COLOR_AZUL_CLARO: [number, number, number] = [240, 245, 249];
  const COLOR_CARD_BG: [number, number, number] = [250, 252, 254];
  const COLOR_TEXTO: [number, number, number] = [15, 23, 42];
  const COLOR_TEXTO_MUTED: [number, number, number] = [148, 163, 184];
  const COLOR_BORDA_SUAVE: [number, number, number] = [226, 232, 240];
  const COLOR_SUCCESS: [number, number, number] = [27, 115, 57];
  const COLOR_SUCCESS_BG: [number, number, number] = [230, 244, 234];
  const COLOR_ALERT: [number, number, number] = [179, 38, 30];
  const COLOR_ALERT_BG: [number, number, number] = [252, 232, 230];

  const brasaoDataUrl = await loadImageDataUrl('/brasao_pmpi.png');

  const motoristaDisplayName = (record.driverName || record.responsibleName || 'POLICIAL MILITAR').toUpperCase();
  const watermarkPosto = (record.responsibleRank || 'PMPI').toUpperCase();
  const horaFinalizacao = record.completedDateFormatted.includes('—')
    ? record.completedDateFormatted.split('—')[1].trim()
    : new Date(record.completedTimestampMillis).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const footerWatermark = `MOTORISTA: ${motoristaDisplayName} (${watermarkPosto}) | FINALIZADO ÀS: ${horaFinalizacao}`;

  function drawHeader(isPageTwo: boolean) {
    const headerHeight = 74;

    // Header Background
    doc.setFillColor(...COLOR_AZUL_PETROLEO);
    doc.rect(0, 0, PAGE_WIDTH, headerHeight, 'F');

    // Gold Stripe
    doc.setFillColor(...COLOR_DOURADO);
    doc.rect(0, headerHeight, PAGE_WIDTH, 2.5, 'F');

    // PMPI Coat of arms
    let textLeftMargin = MARGIN_X;
    if (brasaoDataUrl) {
      const targetSize = 44;
      const badgeY = (headerHeight - targetSize) / 2;
      try {
        doc.addImage(brasaoDataUrl, 'PNG', MARGIN_X, badgeY, targetSize, targetSize);
        textLeftMargin = MARGIN_X + targetSize + 12;
      } catch {
        textLeftMargin = MARGIN_X;
      }
    }

    // Line 1: Kicker Dourado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_DOURADO);
    const headerTop = record.grandCommand
      ? `POLÍCIA MILITAR DO ESTADO DO PIAUÍ | ${record.grandCommand.toUpperCase()}`
      : 'POLÍCIA MILITAR DO ESTADO DO PIAUÍ';
    doc.text(headerTop, textLeftMargin, 24);

    // Line 2: Unidade
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(255, 255, 255);
    const unitClean = (record.unitName || 'QUARTEL DO COMANDO GERAL').toUpperCase();
    doc.text(unitClean, textLeftMargin, 42);

    // Line 3: Subtítulo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(230, 240, 246);
    const subTitle = isPageTwo ? 'REGISTRO FOTOGRÁFICO DA VIATURA' : 'RELATÓRIO DE CHECKLIST DE VIATURA';
    doc.text(subTitle, textLeftMargin, 59);

    // Número da parte
    const numParte = formatNumeroParte(record.reportNumber);
    const parteText = `PARTE Nº ${numParte}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const parteWidth = doc.getTextWidth(parteText);
    doc.text(parteText, PAGE_WIDTH - MARGIN_X - parteWidth, 59);
  }

  function drawWatermark() {
    doc.saveGraphicsState();
    // jsPDF rotated text at center
    const centerX = PAGE_WIDTH / 2;
    const centerY = PAGE_HEIGHT / 2;

    doc.setTextColor(15, 58, 83);
    // Low opacity simulation via textColor or GState
    const gState = (doc as any).GState ? new (doc as any).GState({ opacity: 0.08 }) : null;
    if (gState) {
      (doc as any).setGState(gState);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('CHECKLIST DE VIATURA — PMPI', centerX, centerY - 24, { align: 'center', angle: -32 });

    doc.setFontSize(16);
    doc.text(motoristaDisplayName, centerX, centerY + 2, { align: 'center', angle: -32 });

    doc.setFontSize(12.5);
    doc.text(`MOTORISTA | ${watermarkPosto}`, centerX, centerY + 26, { align: 'center', angle: -32 });

    doc.restoreGraphicsState();
  }

  function drawFooter(page: number) {
    const footerLineY = PAGE_HEIGHT - 38;
    const footerY = PAGE_HEIGHT - 26;
    const watermarkY = PAGE_HEIGHT - 14;

    doc.setDrawColor(...COLOR_BORDA_SUAVE);
    doc.setLineWidth(0.8);
    doc.line(MARGIN_X, footerLineY, PAGE_WIDTH - MARGIN_X, footerLineY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_TEXTO_MUTED);
    const footerUnit = record.unitName || 'PMPI';
    const footerLeft = footerUnit.includes('PMPI') ? footerUnit : `${footerUnit} | PMPI`;
    doc.text(footerLeft, MARGIN_X, footerY);

    const pageText = `Página ${page} de 2`;
    const pageTextW = doc.getTextWidth(pageText);
    doc.text(pageText, PAGE_WIDTH - MARGIN_X - pageTextW, footerY);

    doc.setFontSize(6.8);
    doc.text(footerWatermark, PAGE_WIDTH / 2, watermarkY, { align: 'center' });
  }

  function drawSectionHeader(title: string, startY: number): number {
    const barHeight = 18;
    doc.setFillColor(...COLOR_AZUL_CLARO);
    doc.roundedRect(MARGIN_X, startY, PAGE_WIDTH - 2 * MARGIN_X, barHeight, 3, 3, 'F');

    // Left border strip
    doc.setFillColor(...COLOR_AZUL_PETROLEO);
    doc.rect(MARGIN_X, startY, 4, barHeight, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_AZUL_PETROLEO);
    doc.text(title, MARGIN_X + 10, startY + 12.5);

    return startY + barHeight + 8;
  }

  // ==========================================
  // PÁGINA 1
  // ==========================================
  drawWatermark();
  drawHeader(false);

  let currentY = 88;
  currentY = drawSectionHeader('I – IDENTIFICAÇÃO DO SERVIÇO E DA VIATURA', currentY);

  const identCardTop = currentY;
  const identHeight = 84;
  const contentWidth = PAGE_WIDTH - 2 * MARGIN_X;

  // Identification Box
  doc.setFillColor(...COLOR_CARD_BG);
  doc.setDrawColor(...COLOR_BORDA_SUAVE);
  doc.setLineWidth(0.6);
  doc.roundedRect(MARGIN_X, identCardTop, contentWidth, identHeight, 4, 4, 'FD');

  let identY = identCardTop + 14;
  doc.setFontSize(8.5);

  // Linha 1: Unidade
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_TEXTO);
  doc.text('UNIDADE: ', MARGIN_X + 10, identY);
  const wUnidade = doc.getTextWidth('UNIDADE: ');
  doc.setFont('helvetica', 'normal');
  const unitFull = `${record.unitName}${record.grandCommand ? ` (${record.grandCommand})` : ''}`;
  doc.text(unitFull, MARGIN_X + 10 + wUnidade, identY);

  // Linha 2: Data & Modalidade
  identY += 14;
  doc.setFont('helvetica', 'bold');
  doc.text('DATA DA VERIFICAÇÃO: ', MARGIN_X + 10, identY);
  const wData = doc.getTextWidth('DATA DA VERIFICAÇÃO: ');
  doc.setFont('helvetica', 'normal');
  const dataVal = record.verificationDate || 'Não informada';
  doc.text(dataVal, MARGIN_X + 10 + wData, identY);

  const modStartX = MARGIN_X + 10 + wData + doc.getTextWidth(dataVal) + 24;
  doc.setFont('helvetica', 'bold');
  doc.text('MODALIDADE: ', modStartX, identY);
  const wMod = doc.getTextWidth('MODALIDADE: ');
  doc.setFont('helvetica', 'normal');
  doc.text(record.serviceModality || 'Ordinário', modStartX + wMod, identY);

  // Divider
  identY += 13;
  doc.setDrawColor(...COLOR_BORDA_SUAVE);
  doc.line(MARGIN_X + 10, identY - 4, PAGE_WIDTH - MARGIN_X - 10, identY - 4);

  // Linha 3: Modelo, Placa, Km
  doc.setFont('helvetica', 'bold');
  doc.text('MODELO: ', MARGIN_X + 10, identY + 7);
  const wModLabel = doc.getTextWidth('MODELO: ');
  doc.setFont('helvetica', 'normal');
  const vtrVal = record.vehicleModel || 'Viatura Operacional';
  doc.text(vtrVal, MARGIN_X + 10 + wModLabel, identY + 7);

  const placaStartX = MARGIN_X + 10 + wModLabel + doc.getTextWidth(vtrVal) + 16;
  doc.setFont('helvetica', 'bold');
  doc.text('PLACA: ', placaStartX, identY + 7);
  const wPlaca = doc.getTextWidth('PLACA: ');
  doc.setFont('helvetica', 'normal');
  const placaVal = record.vehiclePlate || '---';
  doc.text(placaVal, placaStartX + wPlaca, identY + 7);

  const kmStartX = placaStartX + wPlaca + doc.getTextWidth(placaVal) + 16;
  doc.setFont('helvetica', 'bold');
  doc.text('KM INICIAL: ', kmStartX, identY + 7);
  const wKm = doc.getTextWidth('KM INICIAL: ');
  doc.setFont('helvetica', 'normal');
  const kmVal = record.initialMileage ? `${record.initialMileage} km` : 'Não informado';
  doc.text(kmVal, kmStartX + wKm, identY + 7);

  // Linha 4: Motorista
  identY += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('MOTORISTA DA VIATURA: ', MARGIN_X + 10, identY + 7);
  const wMot = doc.getTextWidth('MOTORISTA DA VIATURA: ');
  doc.setFont('helvetica', 'normal');
  const motVal = `${record.responsibleRank} ${record.driverName || record.responsibleName}`.trim() || 'Não informado';
  doc.text(motVal, MARGIN_X + 10 + wMot, identY + 7);

  currentY = identCardTop + identHeight + 12;

  // --- II. CONDIÇÕES TÉCNICAS E MECÂNICAS ---
  currentY = drawSectionHeader('II – CONDIÇÕES TÉCNICAS E MECÂNICAS DA VIATURA', currentY);

  const checkItems = [
    { title: '1. Óleo do Motor', status: record.oilStatus, reason: record.oilReason },
    { title: '2. Água do Radiador', status: record.radiatorWaterStatus, reason: record.radiatorWaterReason },
    { title: '3. Pneus em Bom Estado de Conservação', status: record.tiresStatus, reason: record.tiresReason },
    { title: '4. Giroflex / Sinalizador Visual e Sonoro', status: record.lightbarStatus, reason: record.lightbarReason },
    { title: '5. Rádio Comunicador', status: record.radioStatus, reason: record.radioReason },
    { title: '6. Estepe da Viatura', status: record.spareTireStatus, reason: record.spareTireReason },
    { title: '7. Macaco Hidráulico e Chave de Roda', status: record.jackStatus, reason: record.jackReason },
    { title: '8. Faróis, Lanternas e Iluminação', status: record.headlightsStatus, reason: record.headlightsReason },
    { title: '9. Ar-Condicionado / Climatização', status: record.airConditioningStatus, reason: record.airConditioningReason },
  ];

  const tableLeft = MARGIN_X;
  const tableRight = PAGE_WIDTH - MARGIN_X;
  const totalW = tableRight - tableLeft;
  const itemColW = totalW * 0.64;
  const defaultRowH = 19;

  // Table header
  doc.setFillColor(...COLOR_AZUL_PETROLEO);
  doc.roundedRect(tableLeft, currentY, totalW, defaultRowH, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('ITEM VERIFICADO', tableLeft + 8, currentY + 12.5);
  doc.text('SITUAÇÃO / CONFORMIDADE', tableLeft + itemColW + 8, currentY + 12.5);

  currentY += defaultRowH;

  for (let i = 0; i < checkItems.length; i++) {
    const item = checkItems[i];
    const isAlt = i % 2 === 1;
    const hasReason = Boolean(item.reason && item.reason.trim());
    const rowH = hasReason ? 28 : defaultRowH;

    if (isAlt) {
      doc.setFillColor(...COLOR_CARD_BG);
      doc.rect(tableLeft, currentY, totalW, rowH, 'F');
    }

    doc.setDrawColor(...COLOR_BORDA_SUAVE);
    doc.setLineWidth(0.6);
    doc.rect(tableLeft, currentY, totalW, rowH, 'S');
    doc.line(tableLeft + itemColW, currentY, tableLeft + itemColW, currentY + rowH);

    // Item label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_TEXTO);

    if (hasReason) {
      doc.text(item.title, tableLeft + 8, currentY + 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLOR_ALERT);
      const truncatedReason = item.reason.length > 60 ? `${item.reason.slice(0, 57)}...` : item.reason;
      doc.text(`Motivo da alteração: ${truncatedReason}`, tableLeft + 8, currentY + 22);
    } else {
      doc.text(item.title, tableLeft + 8, currentY + 12.5);
    }

    // Status Badge
    const isOk = item.status === 'SEM ALTERAÇÃO' || item.status === 'SIM';
    const badgeBg = isOk ? COLOR_SUCCESS_BG : COLOR_ALERT_BG;
    const badgeTextCol = isOk ? COLOR_SUCCESS : COLOR_ALERT;
    const displayStatus = item.status === 'SIM'
      ? 'SIM (EM BOM ESTADO)'
      : item.status === 'NÃO'
      ? 'NÃO (COM ALTERAÇÃO)'
      : item.status;

    const badgeX = tableLeft + itemColW + 8;
    const badgeW = totalW - itemColW - 16;
    const badgeY = currentY + (rowH - 14) / 2;
    doc.setFillColor(...badgeBg);
    doc.roundedRect(badgeX, badgeY, badgeW, 14, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...badgeTextCol);
    doc.text(displayStatus, badgeX + badgeW / 2, badgeY + 9.5, { align: 'center' });

    currentY += rowH;
  }

  drawFooter(1);

  // ==========================================
  // PÁGINA 2: REGISTRO FOTOGRÁFICO & ASSINATURA
  // ==========================================
  doc.addPage();
  drawWatermark();
  drawHeader(true);

  let currentY2 = 88;
  currentY2 = drawSectionHeader('REGISTRO FOTOGRÁFICO OBRIGATÓRIO (4 ÂNGULOS)', currentY2);

  const photos = [
    { caption: '1. Frente da Viatura', path: record.photoFrontPath, index: 0 },
    { caption: '2. Lado do Motorista', path: record.photoDriverSidePath, index: 1 },
    { caption: '3. Lado do Passageiro', path: record.photoPassengerSidePath, index: 2 },
    { caption: '4. Parte Traseira da Viatura', path: record.photoRearPath, index: 3 },
  ];

  const spacing = 12;
  const photoW = (contentWidth - spacing) / 2;
  const photoH = 215;

  for (const item of photos) {
    const row = Math.floor(item.index / 2);
    const col = item.index % 2;
    const x = MARGIN_X + col * (photoW + spacing);
    const y = currentY2 + row * (photoH + spacing + 6);

    // Frame Card
    doc.setFillColor(...COLOR_CARD_BG);
    doc.setDrawColor(...COLOR_BORDA_SUAVE);
    doc.setLineWidth(0.8);
    doc.roundedRect(x, y, photoW, photoH, 4, 4, 'FD');

    // Caption Bar
    const capH = 18;
    doc.setFillColor(...COLOR_AZUL_CLARO);
    doc.roundedRect(x, y, photoW, capH, 4, 4, 'F');

    // Left accent stripe
    doc.setFillColor(...COLOR_AZUL_PETROLEO);
    doc.rect(x, y, 3.5, capH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_AZUL_PETROLEO);
    doc.text(item.caption, x + 8, y + 12);

    // Image Area
    const imgX = x + 4;
    const imgY = y + capH + 4;
    const imgW = photoW - 8;
    const imgH = photoH - capH - 8;

    if (item.path) {
      try {
        const photoDataUrl = await loadImageDataUrl(item.path);
        if (photoDataUrl) {
          doc.addImage(photoDataUrl, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'FAST');
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...COLOR_TEXTO_MUTED);
          doc.text('Registro fotográfico não anexado', x + photoW / 2, y + photoH / 2, { align: 'center' });
        }
      } catch {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...COLOR_TEXTO_MUTED);
        doc.text('Registro fotográfico capturado', x + photoW / 2, y + photoH / 2, { align: 'center' });
      }
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLOR_TEXTO_MUTED);
      doc.text('Registro fotográfico não anexado', x + photoW / 2, y + photoH / 2, { align: 'center' });
    }
  }

  currentY2 += 2 * photoH + spacing + 14;

  // Assinatura do motorista
  currentY2 = drawSectionHeader('ASSINATURA DO MOTORISTA', currentY2);

  const signBoxTop = currentY2;
  const signBoxH = 68;

  doc.setFillColor(...COLOR_CARD_BG);
  doc.setDrawColor(...COLOR_BORDA_SUAVE);
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN_X, signBoxTop, contentWidth, signBoxH, 4, 4, 'FD');

  // Gold accent bar
  doc.setFillColor(...COLOR_DOURADO);
  doc.rect(MARGIN_X, signBoxTop, 3.5, signBoxH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_AZUL_PETROLEO);
  doc.text('MOTORISTA RESPONSÁVEL PELA CONDUÇÃO DA VIATURA', MARGIN_X + 12, signBoxTop + 16);

  const driverRank = record.responsibleRank || 'PM';
  const driverFullName = record.driverName || record.responsibleName || 'Motorista da Viatura';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR_TEXTO);
  doc.text(`${driverRank} ${driverFullName}`.toUpperCase(), MARGIN_X + 12, signBoxTop + 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_TEXTO);
  doc.text(`Documento assinado digitalmente | Finalizado em: ${record.completedDateFormatted}`, MARGIN_X + 12, signBoxTop + 44);

  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXTO_MUTED);
  doc.text('Documento gerado e autenticado pelo Sistema Digital de Checklist da PMPI', MARGIN_X + 12, signBoxTop + 57);

  drawFooter(2);

  const dataUrl = doc.output('datauristring');
  return { doc, fileName, dataUrl };
}

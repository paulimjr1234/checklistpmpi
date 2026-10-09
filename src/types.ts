export interface GrandCommand {
  code: string; // CPM, CPLMN, CPSA, CPCE, CPE, CPCOM, COPAer, CPTRAN, CPA
  name: string;
}

export interface PoliceUnit {
  id: number;
  grandCommandCode: string;
  name: string;
  abbreviation: string;
}

export interface Officer {
  id: number;
  rank: string;
  fullName: string;
  warName: string;
}

export interface Vehicle {
  id: number;
  prefix: string;
  model: string;
  plate: string;
  linkedUnit: string;
}

export interface ChecklistRecord {
  id: number;
  reportNumber: string; // Ex: 001
  verificationDate: string; // Ex: 13/09/2026
  grandCommand: string; // Ex: CPM
  unitName: string; // Ex: 29º BPM - 29º Batalhão de Polícia Militar
  vehiclePrefix: string;
  vehicleModel: string; // Ex: Toyota Hilux
  vehiclePlate: string; // Ex: PIX-2901
  serviceModality: string; // Ordinário, Diário, Planejada
  responsibleRank: string; // Ex: Soldado
  responsibleName: string; // Ex: Paulo Henrique
  commanderName: string;
  driverName: string;
  patrolman01Name: string;
  patrolman02Name: string;
  initialMileage: string;
  oilStatus: string; // SEM ALTERAÇÃO / COM ALTERAÇÃO
  oilReason: string;
  radiatorWaterStatus: string; // SEM ALTERAÇÃO / COM ALTERAÇÃO
  radiatorWaterReason: string;
  tiresStatus: string; // SIM / NÃO
  tiresReason: string;
  lightbarStatus: string; // SEM ALTERAÇÃO / COM ALTERAÇÃO
  lightbarReason: string;
  radioStatus: string; // SEM ALTERAÇÃO / COM ALTERAÇÃO
  radioReason: string;
  spareTireStatus: string; // SEM ALTERAÇÃO / COM ALTERAÇÃO
  spareTireReason: string;
  jackStatus: string; // SEM ALTERAÇÃO / COM ALTERAÇÃO
  jackReason: string;
  headlightsStatus: string; // SEM ALTERAÇÃO / COM ALTERAÇÃO
  headlightsReason: string;
  airConditioningStatus: string; // SEM ALTERAÇÃO / COM ALTERAÇÃO
  airConditioningReason: string;
  photoFrontPath: string | null;
  photoDriverSidePath: string | null;
  photoPassengerSidePath: string | null;
  photoRearPath: string | null;
  completedDateFormatted: string; // Ex: 13/09/2026 — 20:35
  completedTimestampMillis: number;
  pdfDataUri?: string | null;
}

export interface ChecklistFormData {
  verificationDate: string;
  grandCommand: string;
  unitName: string;
  vehicleModel: string;
  vehiclePlate: string;
  serviceModality: string;
  responsibleRank: string;
  responsibleName: string;
  commanderName: string;
  driverName: string;
  patrolman01Name: string;
  patrolman02Name: string;
  initialMileage: string;
  oilStatus: string;
  oilReason: string;
  radiatorWaterStatus: string;
  radiatorWaterReason: string;
  tiresStatus: string;
  tiresReason: string;
  lightbarStatus: string;
  lightbarReason: string;
  radioStatus: string;
  radioReason: string;
  spareTireStatus: string;
  spareTireReason: string;
  jackStatus: string;
  jackReason: string;
  headlightsStatus: string;
  headlightsReason: string;
  airConditioningStatus: string;
  airConditioningReason: string;
  photoFrontPath: string | null;
  photoDriverSidePath: string | null;
  photoPassengerSidePath: string | null;
  photoRearPath: string | null;
}

export type AppScreen = 'HOME' | 'NEW_CHECKLIST' | 'REPORT_COMPLETED' | 'ADMIN_UNITS' | 'SAVED_CHECKLISTS';

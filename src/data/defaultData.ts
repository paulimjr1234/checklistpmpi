import { GrandCommand, PoliceUnit } from '../types';

export const DEFAULT_GRAND_COMMANDS: GrandCommand[] = [
  { code: 'CPM', name: 'COMANDO DE POLICIAMENTO METROPOLITANO' },
  { code: 'CPLMN', name: 'COMANDO DE POLICIAMENTO DO LITORAL MEIO-NORTE' },
  { code: 'CPSA', name: 'COMANDO DE POLICIAMENTO DO SEMIÁRIDO' },
  { code: 'CPCE', name: 'COMANDO DE POLICIAMENTO DOS CERRADOS' },
  { code: 'CPE', name: 'COMANDO DE POLICIAMENTO ESPECIALIZADO' },
  { code: 'CPCOM', name: 'COMANDO DE POLÍCIA COMUNITÁRIA' },
  { code: 'COPAer', name: 'COMANDO DE AVIAÇÃO E OPERAÇÕES AÉREAS' },
  { code: 'CPTRAN', name: 'COMANDO DE POLICIAMENTO DE TRÂNSITO' },
  { code: 'CPA', name: 'COMANDO DE POLICIAMENTO AMBIENTAL' },
];

export const DEFAULT_POLICE_UNITS: PoliceUnit[] = [
  // CPM
  { id: 1, grandCommandCode: 'CPM', name: '1º Batalhão de Polícia Militar', abbreviation: '1º BPM' },
  { id: 2, grandCommandCode: 'CPM', name: '5º Batalhão de Polícia Militar', abbreviation: '5º BPM' },
  { id: 3, grandCommandCode: 'CPM', name: '6º Batalhão de Polícia Militar', abbreviation: '6º BPM' },
  { id: 4, grandCommandCode: 'CPM', name: '8º Batalhão de Polícia Militar', abbreviation: '8º BPM' },
  { id: 5, grandCommandCode: 'CPM', name: '9º Batalhão de Polícia Militar', abbreviation: '9º BPM' },
  { id: 6, grandCommandCode: 'CPM', name: '13º Batalhão de Polícia Militar', abbreviation: '13º BPM' },
  { id: 7, grandCommandCode: 'CPM', name: '16º Batalhão de Polícia Militar', abbreviation: '16º BPM' },
  { id: 8, grandCommandCode: 'CPM', name: '17º Batalhão de Polícia Militar', abbreviation: '17º BPM' },
  { id: 9, grandCommandCode: 'CPM', name: '18º Batalhão de Polícia Militar', abbreviation: '18º BPM' },
  { id: 10, grandCommandCode: 'CPM', name: '21º Batalhão de Polícia Militar', abbreviation: '21º BPM' },
  { id: 11, grandCommandCode: 'CPM', name: '22º Batalhão de Polícia Militar', abbreviation: '22º BPM' },
  { id: 12, grandCommandCode: 'CPM', name: '26º Batalhão de Polícia Militar', abbreviation: '26º BPM' },
  { id: 13, grandCommandCode: 'CPM', name: '29º Batalhão de Polícia Militar', abbreviation: '29º BPM' },
  { id: 14, grandCommandCode: 'CPM', name: 'Batalhão de Policiamento de Guardas', abbreviation: 'BPGdas' },

  // CPLMN
  { id: 15, grandCommandCode: 'CPLMN', name: '2º Batalhão de Polícia Militar', abbreviation: '2º BPM' },
  { id: 16, grandCommandCode: 'CPLMN', name: '12º Batalhão de Polícia Militar', abbreviation: '12º BPM' },
  { id: 17, grandCommandCode: 'CPLMN', name: '15º Batalhão de Polícia Militar', abbreviation: '15º BPM' },
  { id: 18, grandCommandCode: 'CPLMN', name: '24º Batalhão de Polícia Militar', abbreviation: '24º BPM' },
  { id: 19, grandCommandCode: 'CPLMN', name: '25º Batalhão de Polícia Militar', abbreviation: '25º BPM' },
  { id: 20, grandCommandCode: 'CPLMN', name: '27º Batalhão de Polícia Militar', abbreviation: '27º BPM' },
  { id: 21, grandCommandCode: 'CPLMN', name: '30º Batalhão de Polícia Militar', abbreviation: '30º BPM' },

  // CPSA
  { id: 22, grandCommandCode: 'CPSA', name: '4º Batalhão de Polícia Militar', abbreviation: '4º BPM' },
  { id: 23, grandCommandCode: 'CPSA', name: '11º Batalhão de Polícia Militar', abbreviation: '11º BPM' },
  { id: 24, grandCommandCode: 'CPSA', name: '14º Batalhão de Polícia Militar', abbreviation: '14º BPM' },
  { id: 25, grandCommandCode: 'CPSA', name: '20º Batalhão de Polícia Militar', abbreviation: '20º BPM' },
  { id: 26, grandCommandCode: 'CPSA', name: '23º Batalhão de Polícia Militar', abbreviation: '23º BPM' },

  // CPCE
  { id: 27, grandCommandCode: 'CPCE', name: '3º Batalhão de Polícia Militar', abbreviation: '3º BPM' },
  { id: 28, grandCommandCode: 'CPCE', name: '7º Batalhão de Polícia Militar', abbreviation: '7º BPM' },
  { id: 29, grandCommandCode: 'CPCE', name: '10º Batalhão de Polícia Militar', abbreviation: '10º BPM' },
  { id: 30, grandCommandCode: 'CPCE', name: '19º Batalhão de Polícia Militar', abbreviation: '19º BPM' },
  { id: 31, grandCommandCode: 'CPCE', name: '28º Batalhão de Polícia Militar', abbreviation: '28º BPM' },

  // CPE
  { id: 32, grandCommandCode: 'CPE', name: 'Batalhão de Operações Policiais Especiais', abbreviation: 'BOPE' },
  { id: 33, grandCommandCode: 'CPE', name: 'Batalhão de Polícia Rondas Ostensivas de Natureza Especial', abbreviation: 'RONE' },
  { id: 34, grandCommandCode: 'CPE', name: 'Batalhão de Polícia de Choque', abbreviation: 'BPCHOQUE' },
  { id: 35, grandCommandCode: 'CPE', name: 'Batalhão de Polícia Rondas Ostensivas com Apoio de Motocicletas', abbreviation: 'ROCAM' },
  { id: 36, grandCommandCode: 'CPE', name: 'Batalhão Especial de Policiamento do Interior', abbreviation: 'BEPI' },
  { id: 37, grandCommandCode: 'CPE', name: 'Regimento de Policiamento Montado', abbreviation: 'RPMont' },

  // CPCOM
  { id: 38, grandCommandCode: 'CPCOM', name: 'Coordenadoria Estadual do Programa Educacional de Resistência às Drogas e à Violência', abbreviation: 'PROERD' },
  { id: 39, grandCommandCode: 'CPCOM', name: 'Coordenadoria Estadual do Programa Preventivo e Educativo Social Mirim', abbreviation: 'CPMirim' },
  { id: 40, grandCommandCode: 'CPCOM', name: 'Coordenadoria de Prevenção e Enfrentamento à Violência Doméstica', abbreviation: 'Patrulha Maria da Penha' },
  { id: 41, grandCommandCode: 'CPCOM', name: 'Companhia Independente de Policiamento Escolar', abbreviation: 'CIPE' },
  { id: 42, grandCommandCode: 'CPCOM', name: 'Companhia Independente de Ciclopatrulhamento', abbreviation: 'CICLOPATRULHA' },

  // COPAer
  { id: 43, grandCommandCode: 'COPAer', name: 'Batalhão de Operações Aéreas', abbreviation: 'BOPAer' },
  { id: 44, grandCommandCode: 'COPAer', name: '1ª Companhia Independente de Operações Aéreas', abbreviation: '1ª CIOPAer' },
  { id: 45, grandCommandCode: 'COPAer', name: '2ª Companhia Independente de Operações Aéreas', abbreviation: '2ª CIOPAer' },
  { id: 46, grandCommandCode: 'COPAer', name: '3ª Companhia Independente de Operações Aéreas', abbreviation: '3ª CIOPAer' },

  // CPTRAN
  { id: 47, grandCommandCode: 'CPTRAN', name: 'Batalhão de Policiamento de Trânsito', abbreviation: 'BPTRAN' },
  { id: 48, grandCommandCode: 'CPTRAN', name: 'Batalhão de Policiamento Rodoviário Estadual', abbreviation: 'BPRE' },
  { id: 49, grandCommandCode: 'CPTRAN', name: '1ª Companhia Independente de Policiamento de Trânsito', abbreviation: '1ª CITRAN' },
  { id: 50, grandCommandCode: 'CPTRAN', name: '2ª Companhia Independente de Policiamento de Trânsito', abbreviation: '2ª CITRAN' },
  { id: 51, grandCommandCode: 'CPTRAN', name: '3ª Companhia Independente de Policiamento de Trânsito', abbreviation: '3ª CITRAN' },

  // CPA
  { id: 52, grandCommandCode: 'CPA', name: 'Batalhão de Policiamento Ambiental', abbreviation: 'BPA' },
  { id: 53, grandCommandCode: 'CPA', name: '1ª Companhia Independente de Policiamento Ambiental', abbreviation: '1ª CIPA' },
  { id: 54, grandCommandCode: 'CPA', name: '2ª Companhia Independente de Policiamento Ambiental', abbreviation: '2ª CIPA' },
  { id: 55, grandCommandCode: 'CPA', name: '3ª Companhia Independente de Policiamento Ambiental', abbreviation: '3ª CIPA' },
];

export const RANKS_LIST = [
  'Soldado',
  'Cabo',
  '3º Sargento',
  '2º Sargento',
  '1º Sargento',
  'Subtenente',
  'Aspirante a Oficial',
  '2º Tenente',
  '1º Tenente',
  'Capitão',
  'Major',
  'Tenente-Coronel',
  'Coronel',
];

export const SERVICE_MODALITIES = ['Ordinário', 'Diário', 'Planejada'];

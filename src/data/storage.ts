import { GrandCommand, PoliceUnit, ChecklistRecord } from '../types';
import { DEFAULT_GRAND_COMMANDS, DEFAULT_POLICE_UNITS } from './defaultData';

const KEY_ADMIN_PASSWORD = 'pmpi_admin_password';
const KEY_CONFIGURED_CMD_CODE = 'pmpi_configured_cmd_code';
const KEY_CONFIGURED_CMD_NAME = 'pmpi_configured_cmd_name';
const KEY_CONFIGURED_UNIT_ABBREV = 'pmpi_configured_unit_abbrev';
const KEY_CONFIGURED_UNIT_NAME = 'pmpi_configured_unit_name';
const KEY_POLICE_UNITS = 'pmpi_police_units';
const KEY_CHECKLISTS = 'pmpi_saved_checklists';
const KEY_DRIVE_CONNECTED = 'pmpi_drive_connected';
const KEY_DRIVE_EMAIL = 'pmpi_drive_email';

export const storage = {
  getAdminPassword(): string {
    return localStorage.getItem(KEY_ADMIN_PASSWORD) || 'admin';
  },

  setAdminPassword(password: string): void {
    localStorage.setItem(KEY_ADMIN_PASSWORD, password);
  },

  checkAdminPassword(input: string): boolean {
    return input.trim() === this.getAdminPassword().trim();
  },

  getConfiguredUnit(): { cmdCode: string; cmdName: string; unitAbbrev: string; unitName: string } {
    return {
      cmdCode: localStorage.getItem(KEY_CONFIGURED_CMD_CODE) || 'CPM',
      cmdName: localStorage.getItem(KEY_CONFIGURED_CMD_NAME) || 'COMANDO DE POLICIAMENTO METROPOLITANO',
      unitAbbrev: localStorage.getItem(KEY_CONFIGURED_UNIT_ABBREV) || '29º BPM',
      unitName: localStorage.getItem(KEY_CONFIGURED_UNIT_NAME) || '29º Batalhão de Polícia Militar',
    };
  },

  setConfiguredUnit(cmdCode: string, cmdName: string, unitAbbrev: string, unitName: string): void {
    localStorage.setItem(KEY_CONFIGURED_CMD_CODE, cmdCode);
    localStorage.setItem(KEY_CONFIGURED_CMD_NAME, cmdName);
    localStorage.setItem(KEY_CONFIGURED_UNIT_ABBREV, unitAbbrev);
    localStorage.setItem(KEY_CONFIGURED_UNIT_NAME, unitName);
  },

  getGrandCommands(): GrandCommand[] {
    return DEFAULT_GRAND_COMMANDS;
  },

  getPoliceUnits(): PoliceUnit[] {
    const raw = localStorage.getItem(KEY_POLICE_UNITS);
    if (!raw) {
      localStorage.setItem(KEY_POLICE_UNITS, JSON.stringify(DEFAULT_POLICE_UNITS));
      return DEFAULT_POLICE_UNITS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_POLICE_UNITS;
    }
  },

  addPoliceUnit(unit: Omit<PoliceUnit, 'id'>): PoliceUnit {
    const units = this.getPoliceUnits();
    const newId = units.length > 0 ? Math.max(...units.map(u => u.id)) + 1 : 1;
    const newUnit: PoliceUnit = { ...unit, id: newId };
    units.push(newUnit);
    localStorage.setItem(KEY_POLICE_UNITS, JSON.stringify(units));
    return newUnit;
  },

  getSavedChecklists(): ChecklistRecord[] {
    const raw = localStorage.getItem(KEY_CHECKLISTS);
    if (!raw) return [];
    try {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  getNextReportNumber(): string {
    const list = this.getSavedChecklists();
    const nextNum = list.length + 1;
    return String(nextNum).padStart(3, '0');
  },

  saveChecklist(record: ChecklistRecord): ChecklistRecord {
    const list = this.getSavedChecklists();
    const existingIndex = list.findIndex(r => r.id === record.id);
    if (existingIndex >= 0) {
      list[existingIndex] = record;
    } else {
      list.unshift(record); // add at beginning (descending order)
    }
    localStorage.setItem(KEY_CHECKLISTS, JSON.stringify(list));
    return record;
  },

  isDriveConnected(): boolean {
    return localStorage.getItem(KEY_DRIVE_CONNECTED) === 'true';
  },

  getDriveEmail(): string | null {
    return localStorage.getItem(KEY_DRIVE_EMAIL);
  },

  setDriveConnection(connected: boolean, email?: string): void {
    localStorage.setItem(KEY_DRIVE_CONNECTED, connected ? 'true' : 'false');
    if (connected && email) {
      localStorage.setItem(KEY_DRIVE_EMAIL, email);
    } else {
      localStorage.removeItem(KEY_DRIVE_EMAIL);
    }
  },
};

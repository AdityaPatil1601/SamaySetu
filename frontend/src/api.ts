import type {
  TimetableConfig,
  TimetableResult,
  ValidationReport,
  DiagnosticReport,
  ScheduledSession,
} from './types';

const API_BASE = '/api/timetable';

export async function fetchDefaultConfig(): Promise<TimetableConfig> {
  const res = await fetch(`${API_BASE}/config/default`);
  if (!res.ok) throw new Error('Failed to load default configuration');
  return res.json();
}

export async function fetchSavedConfig(): Promise<TimetableConfig> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('Failed to load saved configuration');
  return res.json();
}

export async function saveActiveConfig(config: TimetableConfig): Promise<TimetableConfig> {
  const res = await fetch(`${API_BASE}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to save configuration');
  return res.json();
}

export async function generateTimetableApi(config?: TimetableConfig): Promise<TimetableResult> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: config ? JSON.stringify(config) : undefined,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Solver execution failed on backend');
  }
  return res.json();
}

export async function validateTimetableApi(
  config: TimetableConfig,
  sessions: ScheduledSession[]
): Promise<ValidationReport> {
  const res = await fetch(`${API_BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config, sessions }),
  });
  if (!res.ok) throw new Error('Independent validation request failed');
  return res.json();
}

export async function fetchCurrentTimetable(): Promise<TimetableResult | null> {
  const res = await fetch(`${API_BASE}/current`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchCurrentDiagnostics(): Promise<DiagnosticReport | null> {
  const res = await fetch(`${API_BASE}/diagnostics`);
  if (!res.ok) return null;
  return res.json();
}

import { ProgressMap } from './types';

const STORAGE_KEY = 'se-roadmap-progress-v1';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadBrowserProgress(): ProgressMap {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, boolean] => (
        typeof entry[0] === 'string' && typeof entry[1] === 'boolean'
      ))
    );
  } catch (error) {
    console.error('Falha ao carregar progresso local:', error);
    return {};
  }
}

export function saveBrowserProgress(progress: ProgressMap) {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress ?? {}));
  } catch (error) {
    console.error('Falha ao salvar progresso local:', error);
  }
}

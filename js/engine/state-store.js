// localStorage-backed progress state. Survives closing/reopening the
// tab (unlike the old sessionStorage-based version). Schema-versioned
// so a future incompatible shape change doesn't crash on old data.

const STORAGE_KEY = 'nossa-constelacao-progress-v2';
const SCHEMA_VERSION = 1;

function defaultState(firstChapterId) {
  return {
    schemaVersion: SCHEMA_VERSION,
    hasOpenedCover: false,
    completedChapters: [],
    currentChapterId: firstChapterId ?? null,
    chapterProgress: {},
  };
}

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeRaw(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore storage failures (private browsing, quota, etc.) */
  }
}

/** Returns the current state, creating a default one (not yet persisted) if none exists. */
export function getState(firstChapterId) {
  return readRaw() ?? defaultState(firstChapterId);
}

/**
 * Shallow-merges `patch` into the stored state and persists it.
 * `patch.chapterProgress` is merged per-chapter-id; setting a chapter's
 * value to `undefined` removes its resume entry entirely.
 */
export function saveState(patch) {
  const current = readRaw() ?? defaultState(patch.currentChapterId ?? null);
  const next = { ...current };

  if (patch.hasOpenedCover !== undefined) next.hasOpenedCover = patch.hasOpenedCover;
  if (patch.completedChapters !== undefined) next.completedChapters = patch.completedChapters;
  if (patch.currentChapterId !== undefined) next.currentChapterId = patch.currentChapterId;

  if (patch.chapterProgress !== undefined) {
    next.chapterProgress = { ...current.chapterProgress };
    for (const [id, value] of Object.entries(patch.chapterProgress)) {
      if (value === undefined) {
        delete next.chapterProgress[id];
      } else {
        next.chapterProgress[id] = { ...next.chapterProgress[id], ...value };
      }
    }
  }

  writeRaw(next);
  return next;
}

/** Wipes all saved progress (used by the "back to start" dev shortcut). */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore storage failures */
  }
}

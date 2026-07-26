// Thin wrapper around the chapter manifest + dynamic import().
// Keeps the progressive-loading contract in one place: a chapter's
// content module is only fetched here, at the moment it's reached.

export async function loadChapterModule(chapters, id) {
  const entry = chapters.find((c) => c.id === id);
  if (!entry) {
    throw new Error(`Capítulo desconhecido: ${id}`);
  }
  const mod = await entry.load();
  return mod.default;
}

export function chapterIndex(chapters, id) {
  return chapters.findIndex((c) => c.id === id);
}

export function nextChapterId(chapters, afterId) {
  const idx = chapterIndex(chapters, afterId);
  if (idx === -1 || idx + 1 >= chapters.length) return null;
  return chapters[idx + 1].id;
}

import { book, chapters, comingSoon } from '../../config/story.config.js';
import { getState, saveState } from './state-store.js';
import { loadChapterModule, nextChapterId } from './chapter-loader.js';
import { renderCover } from './renderers/cover.js';
import { renderHub } from './renderers/hub.js';
import { renderNarrative } from './renderers/narrative.js';
import { renderEnigma } from './renderers/enigma.js';
import { renderGallery } from './renderers/gallery.js';
import { renderComingSoon } from './renderers/coming-soon.js';
import { buildConstellation } from './components/constellation.js';
import { renderCollectibleBar } from './components/collectible-bar.js';
import { playPageTurn } from './transitions/page-turn.js';
import { playStarZoom } from './transitions/star-zoom.js';

const RENDERERS = {
  narrative: renderNarrative,
  enigma: renderEnigma,
  gallery: renderGallery,
};

const CHAPTER_IDS = chapters.map((c) => c.id);

export class BookEngine {
  constructor({ appRoot }) {
    this.appRoot = appRoot;
    this.currentOuterEl = null;
    this.collectibleBarEl = null;
    this.miniConstellationEl = null;
  }

  async init() {
    this._ensureCollectibleBar();
    const state = getState(CHAPTER_IDS[0] ?? null);
    this._syncCollectibleBar(state);

    if (!state.hasOpenedCover) {
      this.currentOuterEl = renderCover(this.appRoot, book, {
        onOpen: () => this._onCoverOpened(),
      });
      return;
    }

    const progress = state.currentChapterId ? state.chapterProgress[state.currentChapterId] : undefined;
    if (state.currentChapterId && progress) {
      this._showMiniConstellation(state);
      const chapterData = await loadChapterModule(chapters, state.currentChapterId);
      this.currentOuterEl = this._renderChapterScreen(state.currentChapterId, chapterData, progress);
    } else {
      this.currentOuterEl = this._buildHub(state);
    }
  }

  // ---- persistent overlays (collectible bar, mini constellation) ----

  _ensureCollectibleBar() {
    if (this.collectibleBarEl) return;
    this.collectibleBarEl = document.createElement('div');
    this.collectibleBarEl.className = 'colecionaveis';
    document.body.appendChild(this.collectibleBarEl);
  }

  _syncCollectibleBar(state) {
    renderCollectibleBar(this.collectibleBarEl, state.completedChapters.length);
  }

  _showMiniConstellation(state) {
    this._hideMiniConstellation();
    this.miniConstellationEl = buildConstellation({
      size: 'small',
      ids: CHAPTER_IDS,
      completedIds: state.completedChapters,
      currentId: state.currentChapterId,
    });
    document.body.appendChild(this.miniConstellationEl);
  }

  _hideMiniConstellation() {
    this.miniConstellationEl?.remove();
    this.miniConstellationEl = null;
  }

  // ---- cover ----

  _onCoverOpened() {
    // Pass currentChapterId explicitly: this is the very first write to
    // localStorage, so saveState has no prior record to fall back on and
    // would otherwise default it to null instead of the first chapter.
    const existing = getState(CHAPTER_IDS[0] ?? null);
    const state = saveState({ hasOpenedCover: true, currentChapterId: existing.currentChapterId });
    this._syncCollectibleBar(state);
    this.currentOuterEl = this._buildHub(state);
  }

  // ---- hub ----

  _buildHub(state, { lightUpId = null } = {}) {
    this._hideMiniConstellation();
    return renderHub(
      this.appRoot,
      {
        chapterIds: CHAPTER_IDS,
        completedIds: state.completedChapters,
        currentChapterId: state.currentChapterId,
        lightUpId,
      },
      {
        onSelectChapter: (id, origin) => this._onSelectChapter(id, origin),
        onSelectComingSoon: () => this._onSelectComingSoon(),
      },
    );
  }

  _onSelectComingSoon() {
    this.currentOuterEl.remove();
    this.currentOuterEl = renderComingSoon(this.appRoot, comingSoon);
  }

  // ---- entering a chapter ----

  _onSelectChapter(id, origin) {
    const state = getState(CHAPTER_IDS[0] ?? null);
    const resume = state.chapterProgress[id];
    const modulePromise = loadChapterModule(chapters, id);

    playStarZoom(this.currentOuterEl, origin, async () => {
      const chapterData = await modulePromise;
      this._showMiniConstellation(state);
      const el = this._renderChapterScreen(id, chapterData, resume);
      this.currentOuterEl = el;
      return el;
    });
  }

  _renderChapterScreen(id, chapterData, resume) {
    const render = RENDERERS[chapterData.type];
    if (!render) {
      throw new Error(`Tipo de capítulo desconhecido: "${chapterData.type}" (capítulo "${id}")`);
    }

    const handlers = {
      onSolved: () => saveState({ chapterProgress: { [id]: { enigmaSolved: true } } }),
      onRevealed: () => saveState({ chapterProgress: { [id]: { enigmaSolved: true, enigmaRevealed: true } } }),
      onComplete: () => this._completeChapter(id),
    };

    return chapterData.type === 'enigma'
      ? render(this.appRoot, chapterData, resume, handlers)
      : render(this.appRoot, chapterData, handlers);
  }

  // ---- completing a chapter, back to hub ----

  _completeChapter(id) {
    const state = getState(CHAPTER_IDS[0] ?? null);
    const completed = state.completedChapters.includes(id)
      ? state.completedChapters
      : [...state.completedChapters, id];
    const next = nextChapterId(chapters, id);

    const newState = saveState({
      completedChapters: completed,
      currentChapterId: next,
      chapterProgress: { [id]: undefined },
    });

    this._hideMiniConstellation();
    this._syncCollectibleBar(newState);

    playPageTurn(this.currentOuterEl, () => {
      const el = this._buildHub(newState, { lightUpId: id });
      this.currentOuterEl = el;
      return el;
    });
  }
}

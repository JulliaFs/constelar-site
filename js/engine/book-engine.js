import { book, chapters, comingSoon, finale } from '../../config/story.config.js';
import { getState, saveState, clearState } from './state-store.js';
import { loadChapterModule, nextChapterId } from './chapter-loader.js';
import { renderCover } from './renderers/cover.js';
import { renderHub } from './renderers/hub.js';
import { renderNarrative } from './renderers/narrative.js';
import { renderRiddle } from './renderers/riddle.js';
import { renderGallery } from './renderers/gallery.js';
import { renderConstellationPuzzle } from './renderers/chapter-constellation-puzzle.js';
import { renderAstrolabe } from './renderers/chapter-astrolabe.js';
import { renderComingSoon } from './renderers/coming-soon.js';
import { buildConstellation } from './components/constellation.js';
import { renderCollectibleBar } from './components/collectible-bar.js';
import { playPageTurn } from './transitions/page-turn.js';
import { playStarZoom } from './transitions/star-zoom.js';
import { playFinale } from './transitions/finale.js';

const RENDERERS = {
  narrative: renderNarrative,
  riddle: renderRiddle,
  gallery: renderGallery,
  'constellation-puzzle': renderConstellationPuzzle,
  astrolabe: renderAstrolabe,
};

// Renderer types with a seal→carta resume flow (mid-chapter progress
// worth restoring on refresh: {solved, sealBroken}). narrative/gallery
// have no destructive-to-repeat interaction, so a refresh just restarts
// their single screen — harmless, no resume state needed.
const NEEDS_RESUME_ARG = new Set(['riddle', 'constellation-puzzle', 'astrolabe']);

const CHAPTER_IDS = chapters.map((c) => c.id);

export class BookEngine {
  constructor({ appRoot }) {
    this.appRoot = appRoot;
    this.currentOuterEl = null;
    this.collectibleBarEl = null;
    this.miniConstellationEl = null;
    this.homeButtonEl = null;
  }

  async init() {
    this._ensureCollectibleBar();
    this._ensureHomeButton();
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

  // ---- back-to-start shortcut (TEMPORARY dev/testing convenience) ----

  _ensureHomeButton() {
    if (this.homeButtonEl) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'botao-inicio';
    btn.innerHTML = '<span class="botao-inicio__seta"></span><span>Início</span>';
    btn.addEventListener('click', () => this._resetToStart());
    document.body.appendChild(btn);
    this.homeButtonEl = btn;
  }

  _resetToStart() {
    clearState();
    this._hideMiniConstellation();
    this.currentOuterEl?.remove();
    this.currentOuterEl = null;
    this.init();
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
      onSolved: () => saveState({ chapterProgress: { [id]: { solved: true } } }),
      onSealBroken: () => saveState({ chapterProgress: { [id]: { solved: true, sealBroken: true } } }),
      onComplete: () => this._completeChapter(id),
    };

    return NEEDS_RESUME_ARG.has(chapterData.type)
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

    if (next === null) {
      // Last chapter completed: bespoke ending sequence instead of the
      // normal page-turn back to the hub — this is a terminal screen.
      playFinale(this.currentOuterEl, { appRoot: this.appRoot, finale, chapterIds: CHAPTER_IDS });
      this.currentOuterEl = null;
      return;
    }

    playPageTurn(this.currentOuterEl, () => {
      const el = this._buildHub(newState, { lightUpId: id });
      this.currentOuterEl = el;
      return el;
    });
  }
}

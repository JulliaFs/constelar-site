// ============================================================================
// CAPÍTULO DE EXEMPLO — tipo "narrative", com uma imagem (path inexistente
// de propósito, mesmo motivo do capítulo de galeria: testar o fallback).
// ============================================================================

export default {
  id: 'example-4',
  type: 'narrative',
  title: '[TÍTULO DO CAPÍTULO 4]',
  body: [
    '[PARÁGRAFO PLACEHOLDER FINAL 1]',
    '[PARÁGRAFO PLACEHOLDER FINAL 2]',
  ],
  images: [
    { src: 'assets/chapters/example-4/placeholder-1.jpg', alt: '[ALT PLACEHOLDER]' },
  ],
  advanceLabel: 'Continuar',
  sky: { nebulaTint: 0.05 },
};

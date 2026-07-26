// ============================================================================
// CAPÍTULO DE EXEMPLO — tipo "gallery". Os caminhos de imagem abaixo NÃO
// existem de propósito, para validar o fallback visual de mídia quebrada
// antes de fotos reais serem colocadas em assets/chapters/example-3/.
// ============================================================================

export default {
  id: 'example-3',
  type: 'gallery',
  title: '[TÍTULO DO CAPÍTULO 3 · GALERIA]',

  // Pelo menos 1 item obrigatório. type: 'image' | 'gif'; caption é opcional.
  media: [
    { src: 'assets/chapters/example-3/placeholder-1.jpg', type: 'image', caption: '[LEGENDA PLACEHOLDER 1]' },
    { src: 'assets/chapters/example-3/placeholder-2.jpg', type: 'image' }, // sem legenda, de propósito
    { src: 'assets/chapters/example-3/placeholder-3.gif', type: 'gif', caption: '[LEGENDA PLACEHOLDER 3]' },
  ],

  advanceLabel: 'Continuar',
  sky: { centerY: '52%', nebulaTint: 0.08 },
};

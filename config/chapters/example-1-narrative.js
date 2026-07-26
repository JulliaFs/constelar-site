// ============================================================================
// CAPÍTULO DE EXEMPLO — tipo "narrative". Dados fake para testar a mecânica;
// troque pelos textos reais quando estiverem prontos (schema documentado
// abaixo, campo a campo).
// ============================================================================

export default {
  id: 'example-1',        // deve bater com o id no manifesto de config/story.config.js
  type: 'narrative',       // 'narrative' | 'enigma' | 'gallery'
  title: '[TÍTULO DO CAPÍTULO 1]',

  // Parágrafos do corpo do texto (obrigatório para narrative).
  body: [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. [PARÁGRAFO PLACEHOLDER 1]',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. [PARÁGRAFO PLACEHOLDER 2]',
  ],

  // Imagens opcionais — [] de propósito aqui, para testar o layout sem imagem.
  images: [],

  // Rótulo do botão de avançar (opcional, padrão 'Continuar').
  advanceLabel: 'Continuar',

  // Variação sutil do gradiente de céu (opcional, mesma paleta, sem matiz nova).
  sky: { nebulaTint: 0.05 },
};

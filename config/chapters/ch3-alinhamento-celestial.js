// ============================================================================
// CAPÍTULO 3 — "O Alinhamento Celestial" (tipo astrolabe)
// 3 discos concêntricos, cada um com "slots" posições e um "targetSlot"
// (a posição correta). Os símbolos (sol/lua/estrela/constelação) são
// distribuídos automaticamente pelo renderer — não precisa listar aqui.
// ============================================================================

export default {
  id: 'ch3-alinhamento-celestial',
  type: 'astrolabe',
  title: 'Capítulo III — O Alinhamento Celestial',
  intro: ['Quando Sol e Lua encontram seu equilíbrio, antigos selos voltam a se abrir.'],

  astrolabe: {
    rings: [
      { id: 'externo', slots: 12, targetSlot: 3 },
      { id: 'meio', slots: 8, targetSlot: 5 },
      { id: 'interno', slots: 6, targetSlot: 1 },
    ],
  },

  // Mostrado dentro da carta, depois que o selo se rompe.
  reveal: {
    paragraphs: ['[TEXTO DA CARTA 3 PLACEHOLDER]'],
    continueLabel: 'Fechar',
  },

  sky: { nebulaTint: 0.1 },
};

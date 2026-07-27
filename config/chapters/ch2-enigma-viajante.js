// ============================================================================
// CAPÍTULO 2 — "O Enigma do Viajante" (tipo riddle, apresentação 'pedestal')
// ============================================================================

export default {
  id: 'ch2-enigma-viajante',
  type: 'riddle',
  title: 'Capítulo II — O Enigma do Viajante',
  intro: ['Nem todo caminho é revelado pelas estrelas. Alguns só se abrem para quem encontra a resposta certa.'],

  riddle: {
    presentation: 'pedestal',
    prompt: '[CHARADA PLACEHOLDER]',
    inputLabel: 'Sua resposta',       // opcional
    placeholder: 'Digite aqui...',    // opcional
    submitLabel: 'Confirmar',         // opcional
    // Gerado com: node scripts/generate-answer.mjs "Resposta"
    answerPayload: 'aHt6dnd6bHk=',
    maxTypoDistance: 2,
    gentleRetryMessages: [
      'As estrelas permanecem em silêncio...',
    ],
  },

  // Mostrado dentro da carta, depois que o selo se rompe.
  reveal: {
    paragraphs: ['[TEXTO DA CARTA 2 PLACEHOLDER]'],
    continueLabel: 'Fechar',
  },

  sky: { centerX: '44%', nebulaTint: 0.1 },
};

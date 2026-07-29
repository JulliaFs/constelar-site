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
    // TROQUE por uma charada sua — e regenere o answerPayload abaixo com
    // a resposta nova (node scripts/generate-answer.mjs "resposta").
    prompt: 'Acompanho todo viajante, mas nunca chego antes dele. Sigo seus passos ao sol e desapareço quando a luz se apaga. Quem sou?',
    inputLabel: 'Sua resposta',       // opcional
    placeholder: 'a resposta...',     // opcional
    submitLabel: 'Decifrar',          // opcional
    // Gerado com: node scripts/generate-answer.mjs "sombra"
    answerPayload: 'aHlpdHZ6',
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

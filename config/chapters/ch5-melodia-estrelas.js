// ============================================================================
// CAPÍTULO 5 — "A Melodia das Estrelas" (tipo riddle, apresentação 'melody')
// Sem áudio — só a letra (com lacunas) e a cifra. Ao acertar, dispara o
// final bespoke (config/story.config.js, export "finale").
// ============================================================================

export default {
  id: 'ch5-melodia-estrelas',
  type: 'riddle',
  title: 'Capítulo V — A Melodia das Estrelas',
  intro: ['Algumas lembranças não são escritas nem desenhadas. Elas vivem nas melodias que escolhemos guardar.'],

  riddle: {
    presentation: 'melody',
    lyricLines: [
      '[LINHA 1 DA LETRA, COM ___ NA PALAVRA OMITIDA]',
      '[LINHA 2 DA LETRA PLACEHOLDER]',
    ],
    chordLine: '[CIFRA PLACEHOLDER — ex: Am — F — C — G]',
    inputLabel: 'Qual é a música?',
    placeholder: 'Digite o nome da música...',
    submitLabel: 'Confirmar',
    // A resposta é o nome da música. Gerado com:
    // node scripts/generate-answer.mjs "Nome Da Musica"
    answerPayload: 'aGpwenx0J2hrJ2x0dnU=',
    maxTypoDistance: 2,
    gentleRetryMessages: [
      'A melodia ainda não foi reconhecida...',
    ],
  },

  // Última carta — depois de fechada, o finale bespoke assume (não volta ao mapa).
  reveal: {
    paragraphs: ['[TEXTO DA CARTA FINAL PLACEHOLDER]'],
    continueLabel: 'Fechar',
  },

  sky: { nebulaTint: 0.12 },
};

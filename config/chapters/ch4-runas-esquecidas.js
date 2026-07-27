// ============================================================================
// CAPÍTULO 4 — "As Runas Esquecidas" (tipo riddle, apresentação 'runes')
// ============================================================================

export default {
  id: 'ch4-runas-esquecidas',
  type: 'riddle',
  title: 'Capítulo IV — As Runas Esquecidas',
  intro: ['Nem toda mensagem foi escrita para ser compreendida à primeira vista. Algumas aguardam apenas quem sabe observá-las.'],

  riddle: {
    presentation: 'runes',
    // Frase em português simples — a tablete e a legenda são geradas
    // automaticamente a partir dela (js/utils/runes.js), sempre em sincronia.
    // TROQUE por uma frase real — o answerPayload abaixo precisa ser
    // regenerado pra bater com a frase nova (node scripts/generate-answer.mjs "frase nova").
    runeMessage: 'Segredo Antigo',
    inputLabel: 'Sua resposta',
    placeholder: 'Digite a frase decifrada...',
    submitLabel: 'Confirmar',
    // A resposta certa é a mesma frase acima, sem acento/maiúscula, tolerante
    // a erro de digitação. Gerado com: node scripts/generate-answer.mjs "Segredo Antigo"
    answerPayload: 'dm5we3VoJ3ZrbHlubHo=',
    maxTypoDistance: 2,
    gentleRetryMessages: [
      'As runas permanecem em silêncio...',
    ],
  },

  reveal: {
    paragraphs: ['[TEXTO DA CARTA 4 PLACEHOLDER]'],
    continueLabel: 'Fechar',
  },

  sky: { nebulaTint: 0.1 },
};

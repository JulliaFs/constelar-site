// ============================================================================
// CAPÍTULO DE EXEMPLO — tipo "enigma". Resposta de teste real ("Estrela"),
// tolerante a maiúscula/minúscula, acento e pequenos erros de digitação.
// Troque o enigma, as pistas e a resposta pelos reais quando prontos.
// ============================================================================

export default {
  id: 'example-2',
  type: 'enigma',
  title: '[TÍTULO DO CAPÍTULO 2 · ENIGMA]',

  // Texto curto de contexto antes do enigma (opcional).
  intro: ['[TEXTO DE INTRODUÇÃO PLACEHOLDER — contexto antes do enigma]'],

  riddle: {
    prompt: '[ENIGMA PLACEHOLDER] Que palavra brilha no céu à noite e começa com "E"?',
    hintLines: ['PISTA 1: [placeholder]', 'PISTA 2: [placeholder]'],   // opcional
    inputLabel: 'Sua resposta',    // opcional
    placeholder: 'Digite aqui...', // opcional
    submitLabel: 'Decifrar',       // opcional
    // Gerado com: node scripts/generate-answer.mjs "Estrela"
    answerPayload: 'aHNseXt6bA==',
    maxTypoDistance: 2, // opcional, padrão 2
    gentleRetryMessages: [
      'Quase lá — tente de novo.',
      'Ainda não é essa, mas você está no caminho certo.',
      'Não foi dessa vez. Mais uma tentativa?',
    ],
  },

  // Mostrado depois que o selo de cera é quebrado.
  reveal: {
    paragraphs: [
      '[TEXTO DE REVELAÇÃO PLACEHOLDER 1]',
      '[TEXTO DE REVELAÇÃO PLACEHOLDER 2]',
    ],
    continueLabel: 'Continuar',
  },

  sky: { centerX: '44%', nebulaTint: 0.1 },
};

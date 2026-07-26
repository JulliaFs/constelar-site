// ============================================================================
// CAPÍTULO 1 — conteúdo e enigma.
// Este arquivo só é carregado quando o leitor chega ao capítulo 1
// (carregamento progressivo).
//
// A resposta do enigma NÃO fica em texto simples aqui — veja
// "answerPayload" abaixo e o arquivo scripts/generate-answer.mjs para
// gerar/trocar essa resposta sem expor o valor no código-fonte.
// ============================================================================

export default {
  id: 'chapter-1',
  screens: [
    {
      type: 'puzzle',
      eyebrow: 'capítulo 1 · o enigma',
      title: 'Onde tudo começou',
      intro: 'Duas coordenadas guardam um segredo. Descubra a cidade a que elas pertencem.',
      coordinatesLines: [
        'Latitude: 17°32′25″ S (-17.5403°)',
        'Longitude: 39°44′37″ O (-39.7437°)',
      ],
      inputLabel: 'Nome da cidade',
      placeholder: 'Digite o nome da cidade...',
      submitLabel: 'Confirmar',
      gentleRetryMessages: [
        'Quase lá — tente de novo.',
        'Ainda não é essa, mas você está no caminho certo.',
        'Não foi dessa vez. Mais uma tentativa?',
        'Chegando perto... pense no mapa.',
      ],
      // Gerado com: node scripts/generate-answer.mjs "Nome Da Cidade"
      answerPayload: 'emh7cGx5bSdsaydoeXBsf3Bsew==',
      maxTypoDistance: 2,
    },
    {
      type: 'reveal',
      unlockIcon: '✦',
      unlockLabel: 'Capítulo desbloqueado',
      paragraphs: [
        'Há 22 anos, nessa mesma cidade, uma estrela (chamada sol) nasceu — um dia muito importante.',
        'Foi também onde a nossa história começou.',
      ],
      continueLabel: 'Continuar',
    },
  ],
};

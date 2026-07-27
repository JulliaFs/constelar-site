# Nossa Constelação

Presente de aniversário em formato de jogo narrativo: uma tela de título
("Começar" → pergaminho que se desenrola) revela um mapa de céu, com 5
capítulos bespoke que se desbloqueiam em sequência — cada um com sua própria
mecânica (ligar uma constelação, decifrar uma charada num pedestal, girar um
astrolábio, traduzir runas, reconhecer uma música). Ao completar um capítulo,
o selo se rompe revelando uma carta que se abre e se lê. Depois do 5º
capítulo, uma sequência final bespoke encerra a experiência. Site estático,
sem backend, sem banco de dados, sem login.

## Estrutura

```
index.html                          shell da página (link dos 4 CSS + boot do tsParticles + app.js)

css/tokens.css                       cores, tipografia, espaçamento, sombra, motion (:root) — inclui os
                                      tokens de pergaminho quente (--cor-perg-*), usados só pela capa e pela carta
css/components.css                   componentes reusáveis: moldura de página, botão, selo de cera, carta,
                                      constelação, pedestal, runas, melodia, glifos (sol/lua/estrela/constelação)
css/screens.css                      layout de cada tela (título/pergaminho, mapa, puzzle, astrolábio, enigma,
                                      narrativa, galeria, finale)
css/transitions.css                  flip 3D (virar página), zoom-na-estrela, escurecer (finale)

js/app.js                            ponto de entrada — inicia o tsParticles e a BookEngine
js/engine/book-engine.js             máquina de estados: título → mapa → capítulo → transição → mapa,
                                      com um branch especial pro finale quando o último capítulo termina
js/engine/state-store.js             leitura/escrita do progresso no localStorage
js/engine/chapter-loader.js          wrapper do manifesto de capítulos + import() dinâmico
js/engine/renderers/                 um render por TELA/TIPO — cover, hub, riddle (genérico, ver abaixo),
                                      chapter-constellation-puzzle, chapter-astrolabe, narrative, gallery, coming-soon
js/engine/components/                page-shell, wax-seal, carta, constellation, cta-button, collectible-bar,
                                      particle-burst (estouro dourado + notas musicais flutuantes)
js/engine/transitions/                page-turn.js, star-zoom.js, finale.js (sequência final bespoke)

js/utils/text-match.js               normalização de texto + comparação tolerante a erro de digitação
js/utils/runes.js                    transliteração Latim → runas Elder Futhark (Unicode real) + legenda
                                      auto-derivada
js/utils/constellation-layout.js     posição determinística (não fixa à mão) dos nós no mapa de céu
js/utils/roman-numerals.js           numeração romana dos nós/contador
js/utils/particles-config.js         configuração mínima do tsParticles
js/utils/media-fallback.js           fallback visual para <img> com caminho quebrado

config/story.config.js               textos globais (título) + manifesto dos 5 capítulos + texto do finale
config/chapters/ch1..ch5-*.js        os 5 capítulos reais (mecânica pronta, conteúdo ainda placeholder)
config/chapters/example-*.js         órfãos — capítulos de exemplo da versão anterior, fora do manifesto
config/chapters/chapter-1.js         órfão — conteúdo real da Teixeira de Freitas, formato antigo

scripts/generate-answer.mjs          gera a resposta ofuscada de um enigma/charada

vendor/tsparticles/                  bundle do tsParticles baixado uma vez, servido localmente (sem CDN em runtime)
assets/fonts/                        Cormorant Garamond, Jost, JetBrains Mono e Noto Sans Runic, self-hosted
assets/brand/                        emblema da capa (SVG) + hook pra uma textura de pergaminho real
                                      (assets/brand/pergaminho.jpg — opcional, ver "Textura do pergaminho")
assets/chapters/<id>/                imagens de cada capítulo (só baixadas quando aquele capítulo é alcançado)
```

## Editar textos

Todo o conteúdo visível fica em `config/story.config.js` (textos da tela de
título, manifesto de capítulos, texto do finale) e em `config/chapters/<id>.js`
(conteúdo de cada capítulo — charadas, cartas, frase em runas, letra da
música). Não é necessário mexer em nada dentro de `js/` para trocar um texto.

## Os 5 capítulos

Cada capítulo é um módulo com um campo `type`. Veja `config/chapters/ch1-primeira-luz.js`
até `ch5-melodia-estrelas.js` para o formato completo, comentado campo a campo.

- **`constellation-puzzle`** (capítulo 1): `puzzle.nodes` (6-8 estrelas, posições
  em % `{id,x,y}`) + `puzzle.edges` (pares `[id,id]` — as únicas conexões
  corretas). Clicar estrela A depois estrela B tenta uma conexão; par certo
  acende para sempre, par errado só pisca e some, sem punição/limite.
- **`astrolabe`** (capítulo 3): `astrolabe.rings`, uma lista de
  `{id, slots, targetSlot}` — cada disco tem N posições e uma posição-alvo.
  Os símbolos (sol/lua/estrela/constelação) são distribuídos automaticamente,
  não precisa listar. Arrastar (mouse ou touch) gira o disco; solta e encaixa
  no slot mais próximo. Alinhar os 3 discos nos alvos ao mesmo tempo resolve.
- **`riddle`** (capítulos 2, 4 e 5): um único renderer genérico
  ("digitar uma resposta validada") com um campo `riddle.presentation` que
  só troca a decoração visual:
  - `'pedestal'` (capítulo 2) — pedestal de pedra + pergaminho com `riddle.prompt`.
  - `'runes'` (capítulo 4) — placa de pedra + legenda de tradução, ambas geradas
    a partir de `riddle.runeMessage` (uma frase normal em português — a tablete
    e a legenda nunca ficam fora de sincronia, porque são derivadas dela).
  - `'melody'` (capítulo 5) — pergaminho musical com `riddle.lyricLines`
    (linhas com lacunas `___`) e `riddle.chordLine`. **Sem áudio.**

Em todos os `riddle`: `answerPayload` (ofuscado, ver seção abaixo),
`maxTypoDistance` (padrão 2) e `gentleRetryMessages` (cicla mensagens gentis,
tentativas ilimitadas, nunca vermelho, sem dica/skip — por design).

Todo capítulo tem `reveal.paragraphs` — o conteúdo real da carta, mostrado
depois que o selo se rompe e a carta é aberta. `reveal.continueLabel` é o
texto do botão "Fechar" dentro da carta (fechar = completar o capítulo).

Todos aceitam `sky` opcional para variar sutilmente o gradiente de céu daquele
capítulo (mesma paleta navy/dourada, sem cor nova — mapa e capítulos NÃO usam
o visual de pergaminho, que é exclusivo da tela de título e da carta).

## Resposta de uma charada

A resposta correta **não** fica em texto simples no código — é guardada como
um "payload" ofuscado no campo `riddle.answerPayload`.

```bash
node scripts/generate-answer.mjs "Resposta certa"
```

Copie o valor impresso para `riddle.answerPayload`. No capítulo 4 (runas), a
"resposta certa" gerada aqui deve ser exatamente a mesma frase colocada em
`riddle.runeMessage` (é o que a pessoa precisa decifrar e digitar de volta).

## Textura do pergaminho

A tela de título (capa) usa uma textura de pergaminho feita 100% em CSS por
enquanto. Se você tiver uma imagem de textura de papel/pergaminho com direito
de uso liberado, salve-a em `assets/brand/pergaminho.jpg` — o CSS já está
preparado pra usá-la automaticamente por cima do gradiente (sem precisar
editar nada); sem o arquivo, o gradiente CSS aparece sozinho.

## Adicionar um novo capítulo (6, 7...)

1. Crie `config/chapters/<id>.js` seguindo um dos schemas acima (ou um tipo
   novo, registrando o renderer em `RENDERERS` dentro de `book-engine.js`).
2. Registre `{ id, load: () => import('./chapters/<id>.js') }` no array
   `chapters` de `config/story.config.js` — a posição no array é a ordem de
   desbloqueio. O mapa de céu recalcula sozinho a posição de todas as
   estrelas (não precisa escolher coordenadas à mão).
3. Só o ÚLTIMO capítulo do manifesto dispara o finale bespoke ao ser
   completado — os demais voltam ao mapa normalmente.
4. Imagens/gifs do capítulo vão em `assets/chapters/<id>/` e são referenciados
   por caminho relativo — só são baixados quando aquele capítulo é alcançado.

## Rodar localmente

ES Modules exigem HTTP (não abrem com duplo clique no arquivo). Rode um
servidor estático na pasta do projeto:

```bash
npx serve .
```

ou

```bash
python -m http.server 5500
```

## Deploy no Vercel

Projeto 100% estático — sem variáveis de ambiente, sem build step. Aponte o
Vercel para esta pasta (framework preset "Other") e publique.

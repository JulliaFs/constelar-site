# Nossa Constelação

Presente de aniversário em formato de "jogo narrativo leve": mapa de céu com
capítulos que se desbloqueiam em sequência, cada um com seu próprio tipo de
tela (narrativa, enigma ou galeria). Site estático, sem backend, sem banco de
dados, sem login.

## Estrutura

```
index.html                        shell da página (link dos 4 CSS + boot do tsParticles + app.js)

css/tokens.css                     cores, tipografia, espaçamento, sombra, motion (:root)
css/components.css                 componentes reusáveis (moldura de página, botão, selo de cera,
                                    constelação, campo de enigma, barra de colecionáveis, glifos)
css/screens.css                    layout específico de cada tela (capa, mapa, narrativa, enigma, galeria)
css/transitions.css                flip 3D (virar página) e zoom-na-estrela

js/app.js                          ponto de entrada — inicia o tsParticles e a BookEngine
js/engine/book-engine.js           máquina de estados: capa → mapa → capítulo → transição → mapa
js/engine/state-store.js           leitura/escrita do progresso no localStorage
js/engine/chapter-loader.js        wrapper do manifesto de capítulos + import() dinâmico
js/engine/renderers/               uma função de render por tela (cover, hub, narrative, enigma, gallery, coming-soon)
js/engine/components/              peças de UI reusadas pelos renderers (page-shell, selo, constelação, etc.)
js/engine/transitions/             page-turn.js (flip 3D) e star-zoom.js (zoom ao entrar num capítulo)

js/utils/text-match.js             normalização de texto + comparação tolerante a erro de digitação
js/utils/constellation-layout.js   posição determinística (não fixa à mão) dos nós no mapa de céu
js/utils/roman-numerals.js         numeração romana dos nós/contador
js/utils/particles-config.js       configuração mínima do tsParticles
js/utils/media-fallback.js         fallback visual para <img> com caminho quebrado

config/story.config.js             textos globais (capa) + manifesto de capítulos + texto "em construção"
config/chapters/example-*.js       4 capítulos de EXEMPLO (placeholder) — um de cada tipo, mais um narrativo extra
config/chapters/chapter-1.js       conteúdo REAL e já testado do antigo capítulo 1 (enigma de Teixeira de
                                    Freitas) — não está registrado no manifesto ainda, ver "Migrar o capítulo 1 real"

scripts/generate-answer.mjs        gera a resposta ofuscada de um enigma

vendor/tsparticles/                bundle do tsParticles baixado uma vez, servido localmente (sem CDN em runtime)
assets/fonts/                      Cormorant Garamond, Jost e JetBrains Mono, self-hosted (sem Google Fonts em runtime)
assets/chapters/<id>/              imagens de cada capítulo (só baixadas quando aquele capítulo é alcançado)
```

## Editar textos

Todo o conteúdo visível fica em `config/story.config.js` (textos da capa,
manifesto de capítulos, texto do nó final "em construção") e em
`config/chapters/<id>.js` (conteúdo de cada capítulo). Não é necessário mexer
em nada dentro de `js/` para trocar um texto, adicionar imagens ou ajustar o
enigma de um capítulo já existente.

## Schema de um capítulo

Cada capítulo é um módulo com um campo `type`: `'narrative'`, `'enigma'` ou
`'gallery'`. Veja `config/chapters/example-1-narrative.js`,
`example-2-enigma.js` e `example-3-gallery.js` para o formato completo,
comentado campo a campo. Resumo:

- **narrative**: `title`, `body` (parágrafos), `images` (opcional), `advanceLabel` (opcional).
- **enigma**: tudo do narrativo (sem `body`/`images`, com `intro` opcional no lugar) +
  `riddle` (pergunta, pistas opcionais, `answerPayload`) + `reveal` (parágrafos mostrados
  depois que o selo de cera é quebrado).
- **gallery**: `title`, `media` (lista de imagens/gifs, cada um com `caption` opcional).

Todos aceitam `sky` opcional para variar sutilmente o gradiente de céu daquele
capítulo (mesma paleta, sem cor nova).

## Resposta de um enigma

A resposta correta **não** fica em texto simples no código — é guardada como
um "payload" ofuscado no campo `riddle.answerPayload`.

Para gerar (ou trocar) uma resposta:

```bash
node scripts/generate-answer.mjs "Nome Da Cidade"
```

Copie o valor impresso para `riddle.answerPayload` no arquivo do capítulo. A
validação aceita a resposta com diferenças de maiúscula/minúscula, acentos,
espaços extras e pequenos erros de digitação (`riddle.maxTypoDistance`,
padrão = 2 caracteres de diferença). Errar não tem limite de tentativas, não
mostra dica automática e não tem botão de pular — por design.

## Adicionar um novo capítulo (5, 6...)

1. Crie `config/chapters/<id>.js` seguindo o schema acima.
2. Registre `{ id, load: () => import('./chapters/<id>.js') }` no array
   `chapters` de `config/story.config.js` — a posição no array é a ordem de
   desbloqueio. O mapa de céu recalcula sozinho a posição de todas as
   estrelas (não precisa escolher coordenadas à mão).
3. Imagens/gifs do capítulo vão em `assets/chapters/<id>/` e são referenciados
   por caminho relativo nos campos `images`/`media` — só são baixados quando
   aquele capítulo é efetivamente alcançado.

## Migrar o capítulo 1 real

O enigma de Teixeira de Freitas já testado está em
`config/chapters/chapter-1.js`, no formato antigo (`screens: [...]`). Para
reencaixar no schema novo, mapeie:

| Campo antigo | Campo novo |
|---|---|
| `screens[0].title` / `intro` | `title` / `intro` |
| `screens[0].coordinatesLines` | `riddle.hintLines` |
| `screens[0].inputLabel/placeholder/submitLabel` | `riddle.inputLabel/placeholder/submitLabel` |
| `screens[0].answerPayload/maxTypoDistance/gentleRetryMessages` | `riddle.answerPayload/maxTypoDistance/gentleRetryMessages` |
| `screens[1].paragraphs` | `reveal.paragraphs` |

Depois é só trocar um dos `example-N` no manifesto de `story.config.js` por
esse capítulo migrado.

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

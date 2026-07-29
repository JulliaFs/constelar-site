// Campo estelar vivo: três tamanhos de partícula em três temperaturas de
// cor (branco puro, creme e azul estelar), cada uma com iluminação própria
// (shadow no canvas) e um piscar lento e dessincronizado.
//
// A contagem continua baixa de propósito — isto é atmosfera, não fogos de
// artifício, e não pode competir com o conteúdo nem com a chamada de vídeo.
// O campo estático de estrelas maiores fica em CSS (screens.css); aqui vive
// só o que precisa se mover.

const BRANCO = '#FFFFFF';
const CREME = '#FFF1CE';
const AZUL_ESTELAR = '#A9C7FF';

// Piscar: a opacidade oscila devagar e cada partícula começa em um ponto
// aleatório do ciclo, para o campo nunca pulsar em bloco.
const piscar = (speed) => ({
  value: { min: 0.1, max: 0.72 },
  animation: { enable: true, speed, sync: false, startValue: 'random' },
});

export const particlesConfig = {
  fpsLimit: 60,
  fullScreen: { enable: false },
  background: { color: { value: 'transparent' } },
  particles: {
    number: { value: 64, density: { enable: true, area: 900 } },
    color: { value: [BRANCO, CREME, AZUL_ESTELAR] },
    opacity: piscar(0.3),
    size: { value: { min: 0.6, max: 1.2 } },
    shadow: { enable: true, blur: 6, color: { value: CREME } },
    move: {
      enable: true,
      speed: 0.25,
      direction: 'none',
      random: true,
      straight: false,
      outModes: { default: 'out' },
    },
    links: { enable: false },

    // Os três tamanhos. Cada grupo herda o resto da configuração acima.
    groups: {
      // 1 — poeira miúda, branco puro, o piscar mais rápido.
      poeira: {
        number: { value: 34 },
        size: { value: 0.9 },
        color: { value: BRANCO },
        opacity: piscar(0.5),
        shadow: { enable: true, blur: 5, color: { value: BRANCO } },
      },
      // 2 — estrelas médias, creme quente, halo mais aberto.
      brasa: {
        number: { value: 20 },
        size: { value: 1.8 },
        color: { value: CREME },
        opacity: piscar(0.32),
        shadow: { enable: true, blur: 11, color: { value: CREME } },
      },
      // 3 — as poucas grandes, azul estelar frio, quase paradas.
      farol: {
        number: { value: 8 },
        size: { value: 2.8 },
        color: { value: AZUL_ESTELAR },
        opacity: piscar(0.2),
        shadow: { enable: true, blur: 18, color: { value: AZUL_ESTELAR } },
      },
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'attract' },
      resize: true,
    },
    modes: {
      attract: { distance: 140, duration: 1.2, factor: 1 },
    },
  },
  detectRetina: true,
};

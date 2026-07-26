// Minimal, discreet tsParticles config — soft gold/ivory dust drifting
// slowly, gentle reaction to the mouse. Kept deliberately low-count/
// low-CPU: this must never compete with the content or the video call.

export const particlesConfig = {
  fpsLimit: 60,
  fullScreen: { enable: false },
  background: { color: { value: 'transparent' } },
  particles: {
    number: { value: 34, density: { enable: true, area: 900 } },
    color: { value: ['#F0C869', '#EAF2FF', '#C9A227'] },
    opacity: {
      value: { min: 0.08, max: 0.4 },
      animation: { enable: true, speed: 0.3, sync: false },
    },
    size: { value: { min: 0.6, max: 2 } },
    move: {
      enable: true,
      speed: 0.25,
      direction: 'none',
      random: true,
      straight: false,
      outModes: { default: 'out' },
    },
    links: { enable: false },
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

import { BookEngine } from './engine/book-engine.js';
import { particlesConfig } from './utils/particles-config.js';

const appRoot = document.getElementById('app');
const particlesLayer = document.getElementById('tsparticles-layer');

if (window.tsParticles && particlesLayer) {
  window.tsParticles.load(particlesLayer.id, particlesConfig).catch(() => {
    /* particles are decorative — never block the experience if this fails */
  });
}

const engine = new BookEngine({ appRoot });
engine.init();

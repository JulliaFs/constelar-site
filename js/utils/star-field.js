// Subtle twinkling starfield background. Cheap: a few hundred static
// points redrawn with a slow sine-based opacity flicker.

export function startStarField(canvas) {
  const ctx = canvas.getContext('2d');
  let width, height, stars;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.round((width * height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.6,
    }));
  }

  let rafId;
  function tick(t) {
    ctx.clearRect(0, 0, width, height);
    const time = t / 1000;
    for (const s of stars) {
      const twinkle = 0.55 + 0.45 * Math.sin(time * s.speed + s.phase);
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = '#eef0fb';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize);
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
  };
}

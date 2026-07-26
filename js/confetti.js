// Lightweight, dependency-free confetti burst on a canvas.
// Runs for a short duration then stops and clears itself.

const COLORS = ['#e8c988', '#a99bd8', '#eef0fb', '#9fd8b8', '#e0a7a7'];

export function fireConfetti(canvas, { durationMs = 2600, pieceCount = 140 } = {}) {
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const pieces = Array.from({ length: pieceCount }, () => spawnPiece(width));

  const onResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', onResize);

  const start = performance.now();
  let rafId;

  function spawnPiece(w) {
    return {
      x: Math.random() * w,
      y: -20 - Math.random() * 200,
      size: 6 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speedY: 2 + Math.random() * 2.5,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 8,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    };
  }

  function tick(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, width, height);

    for (const p of pieces) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.spin;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (elapsed < durationMs) {
      rafId = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, width, height);
      window.removeEventListener('resize', onResize);
    }
  }

  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, width, height);
    window.removeEventListener('resize', onResize);
  };
}

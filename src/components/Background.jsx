import { useEffect, useRef } from 'react';

const THEMES = {
  good: {
    bg: '#041a0c',
    overlay: 'linear-gradient(160deg, rgba(0,40,20,0.55), rgba(0,20,10,0.80))',
    colors: ['#00ff88', '#00cc66', '#00aa44'],
    count: 80,
    type: 'firefly',
  },
  moderate: {
    bg: '#1a1000',
    overlay: 'linear-gradient(160deg, rgba(40,28,0,0.55), rgba(25,16,0,0.80))',
    colors: ['#ffcc00', '#ffaa00', '#ff8800'],
    count: 100,
    type: 'blob',
  },
  sensitive: {
    bg: '#1a0800',
    overlay: 'linear-gradient(160deg, rgba(50,18,0,0.55), rgba(30,10,0,0.82))',
    colors: ['#ff6600', '#ff4400', '#ff8833'],
    count: 120,
    type: 'blob',
  },
  unhealthy: {
    bg: '#1a0000',
    overlay: 'linear-gradient(160deg, rgba(50,0,0,0.60), rgba(28,0,0,0.85))',
    colors: ['#ff2200', '#cc0000', '#ff4433'],
    count: 120,
    type: 'blob',
  },
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function makeFirefly(W, H, colors) {
  return {
    x: rand(0, W),
    y: rand(0, H),
    r: rand(1, 3),
    vx: rand(-0.2, 0.2),
    vy: -rand(0.1, 0.5),
    alpha: rand(0.3, 1.0),
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

function makeBlob(W, H, colors, type) {
  const speedScale = type === 'unhealthy' ? 0.6 : type === 'sensitive' ? 0.75 : 1;
  return {
    x: rand(0, W),
    y: rand(0, H),
    r: rand(20, 80),
    vx: rand(-0.15, 0.15) * speedScale,
    vy: rand(-0.12, 0.12) * speedScale,
    alpha: rand(0.04, 0.22),
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

function initParticles(W, H, cfg) {
  const particles = [];
  for (let i = 0; i < cfg.count; i++) {
    particles.push(
      cfg.type === 'firefly'
        ? makeFirefly(W, H, cfg.colors)
        : makeBlob(W, H, cfg.colors, cfg.type)
    );
  }
  return particles;
}

function drawFirefly(ctx, p) {
  // Glow halo
  const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
  halo.addColorStop(0, hexToRgba(p.color, p.alpha * 0.2));
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
  ctx.fillStyle = halo;
  ctx.fill();

  // Core dot
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(p.color, p.alpha);
  ctx.fill();
}

function drawBlob(ctx, p) {
  const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
  grad.addColorStop(0, hexToRgba(p.color, p.alpha));
  grad.addColorStop(1, hexToRgba(p.color, 0));
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function Background({ theme = 'good' }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ rafId: null, particles: [], cfg: null, W: 0, H: 0 });

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;

    const ctx = canvas.getContext('2d');
    const state = stateRef.current;
    const cfg = THEMES[theme] || THEMES.good;

    function resize() {
      state.W = canvas.width  = window.innerWidth;
      state.H = canvas.height = window.innerHeight;
    }

    function start() {
      if (state.rafId) cancelAnimationFrame(state.rafId);
      resize();
      state.cfg = cfg;
      state.particles = initParticles(state.W, state.H, cfg);

      function loop() {
        const { W, H, particles } = state;
        ctx.clearRect(0, 0, W, H);

        for (const p of particles) {
          if (cfg.type === 'firefly') {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -10) {
              p.y = H + 10;
              p.x = Math.random() * W;
            }
            drawFirefly(ctx, p);
          } else {
            p.x += p.vx;
            p.y += p.vy;
            // wrap edges
            if (p.x < -p.r)  p.x = W + p.r;
            if (p.x > W + p.r) p.x = -p.r;
            if (p.y < -p.r)  p.y = H + p.r;
            if (p.y > H + p.r) p.y = -p.r;
            drawBlob(ctx, p);
          }
        }

        state.rafId = requestAnimationFrame(loop);
      }

      state.rafId = requestAnimationFrame(loop);
    }

    start();

    const onResize = () => {
      state.W = canvas.width  = window.innerWidth;
      state.H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(state.rafId);
      window.removeEventListener('resize', onResize);
    };
  }, [theme]);

  const cfg = THEMES[theme] || THEMES.good;
  const reduced = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      {/* Base background color */}
      <div style={{
        position: 'absolute', inset: 0,
        background: cfg.bg,
        transition: 'background 2s ease',
      }} />

      {/* Particle canvas */}
      {!reduced && (
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, display: 'block' }}
        />
      )}

      {/* Overlay gradient — z-index above canvas, transitions smoothly */}
      <div style={{
        position: 'absolute', inset: 0,
        background: cfg.overlay,
        transition: 'background 2s ease',
        zIndex: 1,
      }} />
    </div>
  );
}

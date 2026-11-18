import React, { useEffect, useRef } from 'react';
import { useAppearance } from '../context/AppearanceContext';

export const Background = () => {
  const canvasRef = useRef(null);
  const { settings } = useAppearance();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Particle system for golden sparkles and luminous bokeh
    const particleCount = settings.reduceMotion ? 35 : 75;
    let particles = [];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        // Bias particles toward top-right and left-center to match the reference image's golden light sweeps
        const isLightSweep = Math.random() < 0.6;
        const x = isLightSweep
          ? Math.random() * width * 0.95
          : Math.random() * width;
        const y = Math.random() * height;

        particles.push({
          x,
          y,
          baseRadius: Math.random() * 2.8 + 0.8,
          radius: Math.random() * 2.8 + 0.8,
          isBokeh: Math.random() < 0.18, // some larger soft glowing orbs
          bokehSize: Math.random() * 14 + 8,
          alpha: Math.random() * 0.75 + 0.2,
          baseAlpha: Math.random() * 0.65 + 0.25,
          speedAlpha: (Math.random() * 0.015 + 0.006) * (Math.random() < 0.5 ? 1 : -1),
          vx: (Math.random() - 0.45) * 0.18,
          vy: (Math.random() - 0.5) * 0.16,
          hue: Math.random() < 0.8 ? (42 + Math.random() * 14) : (350 + Math.random() * 30), // Golden yellow & warm blush
          shimmerPhase: Math.random() * Math.PI * 2
        });
      }
    };

    initParticles();

    // Subtle interactive light on cursor
    let mouse = { x: width * 0.6, y: height * 0.4 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle light beam / sunlight wash
      const sunGradient = ctx.createRadialGradient(
        width * 0.8, height * 0.15, 20,
        width * 0.65, height * 0.35, width * 0.75
      );
      sunGradient.addColorStop(0, 'rgba(255, 248, 220, 0.45)');
      sunGradient.addColorStop(0.35, 'rgba(255, 235, 179, 0.22)');
      sunGradient.addColorStop(0.7, 'rgba(240, 220, 255, 0.12)');
      sunGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!settings.reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.shimmerPhase += 0.035;

          // Wrap edges
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;

          // Twinkle alpha
          p.alpha = p.baseAlpha + Math.sin(p.shimmerPhase) * 0.3;
          if (p.alpha < 0.08) p.alpha = 0.08;
          if (p.alpha > 0.95) p.alpha = 0.95;
        }

        if (p.isBokeh) {
          // Soft golden/pastel bokeh circle
          const bokehGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.bokehSize);
          bokehGrad.addColorStop(0, `hsla(${p.hue}, 95%, 72%, ${p.alpha * 0.45})`);
          bokehGrad.addColorStop(0.5, `hsla(${p.hue}, 90%, 65%, ${p.alpha * 0.18})`);
          bokehGrad.addColorStop(1, 'rgba(255, 245, 200, 0)');
          ctx.fillStyle = bokehGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.bokehSize, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Pinpoint golden sparkle with cross-flare
          const rad = p.baseRadius * (1 + Math.sin(p.shimmerPhase) * 0.35);
          const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 3.8);
          glowGrad.addColorStop(0, `rgba(255, 255, 245, ${p.alpha})`);
          glowGrad.addColorStop(0.3, `hsla(${p.hue}, 95%, 70%, ${p.alpha * 0.85})`);
          glowGrad.addColorStop(0.7, `hsla(${p.hue}, 90%, 65%, ${p.alpha * 0.3})`);
          glowGrad.addColorStop(1, 'rgba(255, 220, 100, 0)');

          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad * 3.8, 0, Math.PI * 2);
          ctx.fill();

          // Subtle diamond sparkle flare for brighter stars
          if (p.alpha > 0.6) {
            ctx.strokeStyle = `rgba(255, 252, 230, ${p.alpha * 0.75})`;
            ctx.lineWidth = 0.75;
            const flareLen = rad * 3.2;
            ctx.beginPath();
            ctx.moveTo(p.x - flareLen, p.y);
            ctx.lineTo(p.x + flareLen, p.y);
            ctx.moveTo(p.x, p.y - flareLen);
            ctx.lineTo(p.x, p.y + flareLen);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings.reduceMotion]);

  return (
    <div className="watercolor-background-container" aria-hidden="true">
      {/* Layer 1: Painted watercolor base washes matching the reference image */}
      <div className="watercolor-canvas-layer" />

      {/* Layer 2: Watercolor paper tooth & organic texture */}
      <div className="watercolor-paper-grain" />

      {/* Layer 3: Interactive animated golden dust and light sparkles */}
      <canvas ref={canvasRef} className="watercolor-sparkles-canvas" />

      {/* Layer 4: Soft ambient atmospheric vignette and luminous edge bloom */}
      <div className="watercolor-vignette" />
    </div>
  );
};

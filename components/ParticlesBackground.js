'use client';
import { useEffect, useRef } from 'react';

export default function ParticlesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Create fire embers rising upwards
    const emberCount = 80;
    const embers = Array.from({ length: emberCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.8 + 0.5,
      alpha: Math.random(),
      alphaSpeed: 0.008 + Math.random() * 0.015,
      wobble: Math.random() * Math.PI,
      wobbleSpeed: 0.01 + Math.random() * 0.03,
      speedY: 0.3 + Math.random() * 0.9, // Rise upwards
      // Flame theme colors: orange, fiery red, golden amber
      color: Math.random() > 0.6 
        ? '249, 115, 22'   // Orange
        : Math.random() > 0.3 
          ? '239, 68, 68'  // Red
          : '245, 158, 11', // Gold
    }));

    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      embers.forEach((ember) => {
        // Move embers upwards
        ember.y -= ember.speedY;
        
        // Wobble left and right slightly to mimic flame rise heat wave
        ember.wobble += ember.wobbleSpeed;
        ember.x += Math.sin(ember.wobble) * 0.25;

        // Wrap around boundaries
        if (ember.y < -10) {
          ember.y = canvas.height + 10;
          ember.x = Math.random() * canvas.width;
        }
        if (ember.x < -10) ember.x = canvas.width + 10;
        if (ember.x > canvas.width + 10) ember.x = -10;

        // Twinkle/flicker effect
        ember.alpha += ember.alphaSpeed;
        if (ember.alpha > 1 || ember.alpha < 0.1) {
          ember.alphaSpeed = -ember.alphaSpeed;
        }

        ctx.beginPath();
        // Heat glow effect
        ctx.fillStyle = `rgba(${ember.color}, ${Math.max(0.1, Math.min(ember.alpha, 0.85))})`;
        ctx.shadowColor = `rgba(${ember.color}, 0.5)`;
        ctx.shadowBlur = 12;
        ctx.arc(ember.x, ember.y, ember.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow blur
      });
      
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="pointer-events-none absolute inset-0 h-full w-full" 
    />
  );
}
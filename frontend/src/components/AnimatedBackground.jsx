import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const mouseTrailRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const rays = [];
    for (let i = 0; i < 18; i++) {
      rays.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.7,
        length: 250 + Math.random() * 420,
        width: 26 + Math.random() * 38,
        speed: 0.7 + Math.random() * 1.3,
        angle: 122 + (Math.random() - 0.5) * 16,
        hue: 195 + Math.random() * 45,
        opacity: 0.55 + Math.random() * 0.3,
      });
    }

    const draw = () => {
      // Создаём эффект затухания (вместо clearRect)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(0, 0, width, height);

      // Рисуем неоновые лучи
      rays.forEach((ray) => {
        const progress = Date.now() * ray.speed * 0.028;
        const x = ray.x + Math.cos((ray.angle * Math.PI) / 180) * progress;
        const y = ray.y + Math.sin((ray.angle * Math.PI) / 180) * progress;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((ray.angle * Math.PI) / 180);

        const gradient = ctx.createLinearGradient(-ray.length / 2, 0, ray.length / 2, 0);
        gradient.addColorStop(0, `hsla(${ray.hue}, 100%, 68%, ${ray.opacity * 0.5})`);
        gradient.addColorStop(0.5, `hsla(${ray.hue}, 100%, 78%, ${ray.opacity})`);
        gradient.addColorStop(1, `hsla(${ray.hue}, 100%, 68%, ${ray.opacity * 0.4})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(-ray.length / 2, -ray.width / 2, ray.length, ray.width, ray.width / 2);
        ctx.fill();
        ctx.restore();
      });

      // Рисуем след от курсора
      const trail = mouseTrailRef.current;
      for (let i = 0; i < trail.length; i++) {
        const point = trail[i];
        const alpha = (i / trail.length) * 0.45;

        const gradient = ctx.createRadialGradient(
          point.x, point.y, 20,
          point.x, point.y, 160
        );
        gradient.addColorStop(0, `rgba(200, 230, 255, ${alpha})`);
        gradient.addColorStop(1, 'rgba(200, 230, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 160, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e) => {
      mouseTrailRef.current.push({ x: e.clientX, y: e.clientY });

      // Ограничиваем длину следа
      if (mouseTrailRef.current.length > 22) {
        mouseTrailRef.current.shift();
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedBackground;
import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const rays = [];
    const rayCount = 16;

    for (let i = 0; i < rayCount; i++) {
      rays.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.6,
        length: 220 + Math.random() * 380,
        width: 22 + Math.random() * 42,
        speed: 0.6 + Math.random() * 1.1,
        angle: 125 + (Math.random() - 0.5) * 18,
        opacity: 0.45 + Math.random() * 0.35,
        hue: 200 + Math.random() * 40,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Рисуем лучи
      rays.forEach((ray) => {
        const progress = Date.now() * ray.speed * 0.03;
        const x = ray.x + Math.cos((ray.angle * Math.PI) / 180) * progress;
        const y = ray.y + Math.sin((ray.angle * Math.PI) / 180) * progress;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((ray.angle * Math.PI) / 180);

        // Неоновый градиент
        const gradient = ctx.createLinearGradient(-ray.length / 2, 0, ray.length / 2, 0);
        gradient.addColorStop(0, `hsla(${ray.hue}, 100%, 65%, ${ray.opacity * 0.6})`);
        gradient.addColorStop(0.5, `hsla(${ray.hue}, 100%, 75%, ${ray.opacity})`);
        gradient.addColorStop(1, `hsla(${ray.hue}, 100%, 65%, ${ray.opacity * 0.5})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(-ray.length / 2, -ray.width / 2, ray.length, ray.width, ray.width / 2);
        ctx.fill();
        ctx.restore();
      });

      // Эффект осветления от курсора
      if (mouseRef.current.active) {
        const gradient = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 40,
          mouseRef.current.x, mouseRef.current.y, 280
        );
        gradient.addColorStop(0, 'rgba(255,255,255,0.35)');
        gradient.addColorStop(0.4, 'rgba(200,220,255,0.18)');
        gradient.addColorStop(1, 'rgba(200,220,255,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
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
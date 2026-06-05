import React, { useEffect, useRef } from 'react';

const AnimatedRaysBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const rays = [];
    const rayCount = 14;

    // Создаём лучи
    for (let i = 0; i < rayCount; i++) {
      rays.push({
        x: Math.random() * width * 1.5,
        y: Math.random() * height * -0.5,
        length: 180 + Math.random() * 320,
        width: 18 + Math.random() * 38,
        speed: 0.15 + Math.random() * 0.35,
        angle: 135 + (Math.random() - 0.5) * 12,
        opacity: 0.25 + Math.random() * 0.45,
        offset: Math.random() * 1000,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      rays.forEach((ray, index) => {
        const progress = ((Date.now() + ray.offset) / 1000) * ray.speed;

        // Позиция луча
        const x = ray.x + Math.cos((ray.angle * Math.PI) / 180) * progress * 60;
        const y = ray.y + Math.sin((ray.angle * Math.PI) / 180) * progress * 60;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((ray.angle * Math.PI) / 180);

        // Градиент для объёма (3D-эффект)
        const gradient = ctx.createLinearGradient(
          -ray.length / 2, -ray.width / 2,
          ray.length / 2, ray.width / 2
        );
        gradient.addColorStop(0, `rgba(21, 101, 192, ${ray.opacity * 0.6})`);
        gradient.addColorStop(0.5, `rgba(25, 118, 210, ${ray.opacity})`);
        gradient.addColorStop(1, `rgba(13, 71, 161, ${ray.opacity * 0.5})`);

        ctx.fillStyle = gradient;

        // Рисуем закруглённый прямоугольник (луч)
        ctx.beginPath();
        ctx.roundRect(
          -ray.length / 2,
          -ray.width / 2,
          ray.length,
          ray.width,
          ray.width / 2
        );
        ctx.fill();

        ctx.restore();

        // Плавное исчезание у краёв
        if (x < -200 || y > height + 200) {
          ray.x = width * 0.7 + Math.random() * 400;
          ray.y = -300 - Math.random() * 200;
        }
      });

      requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
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
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedRaysBackground;
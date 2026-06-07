import React from 'react';
import { Box } from '@mui/material';

const AnimatedBackground = () => {
  return (
    <Box
      sx={{
        position: 'fixed',           // ← изменено на fixed
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: `
          linear-gradient(120deg, rgba(0, 180, 255, 0.72) 0%, transparent 22%),
          linear-gradient(42deg, rgba(59, 130, 246, 0.65) 8%, transparent 35%),
          linear-gradient(195deg, rgba(30, 64, 175, 0.68) 18%, transparent 45%),
          linear-gradient(305deg, rgba(14, 165, 233, 0.60) 26%, transparent 52%),
          linear-gradient(155deg, rgba(0, 180, 255, 0.55) 35%, transparent 62%)
        `,
        backgroundSize: '150% 150%',
        animation: 'neonShimmer 8.5s ease-in-out infinite',
        '@keyframes neonShimmer': {
          '0%': { backgroundPosition: '0% 0%' },
          '20%': { backgroundPosition: '48% 28%' },
          '40%': { backgroundPosition: '82% 12%' },
          '60%': { backgroundPosition: '22% 58%' },
          '80%': { backgroundPosition: '65% 78%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedBackground;
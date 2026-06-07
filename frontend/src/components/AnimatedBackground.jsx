import React from 'react';
import { Box } from '@mui/material';

const AnimatedBackground = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(125deg, rgba(21, 101, 192, 0.42) 0%, transparent 30%),
          linear-gradient(48deg, rgba(25, 118, 210, 0.35) 15%, transparent 45%),
          linear-gradient(210deg, rgba(13, 71, 161, 0.38) 25%, transparent 55%),
          linear-gradient(320deg, rgba(30, 136, 229, 0.32) 35%, transparent 65%)
        `,
        backgroundSize: '180% 180%',
        animation: 'strongShimmer 14s ease-in-out infinite',
        '@keyframes strongShimmer': {
          '0%': { backgroundPosition: '0% 0%' },
          '25%': { backgroundPosition: '35% 45%' },
          '50%': { backgroundPosition: '70% 20%' },
          '75%': { backgroundPosition: '25% 65%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedBackground;
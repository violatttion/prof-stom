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
        backgroundImage: `
          linear-gradient(125deg, rgba(13, 71, 161, 0.55) 0%, transparent 28%),
          linear-gradient(48deg, rgba(21, 101, 192, 0.48) 12%, transparent 42%),
          linear-gradient(210deg, rgba(25, 118, 210, 0.52) 22%, transparent 50%),
          linear-gradient(320deg, rgba(30, 136, 229, 0.45) 30%, transparent 62%)
        `,
        backgroundSize: '170% 170%',
        animation: 'strongShimmer 12s ease-in-out infinite',
        '@keyframes strongShimmer': {
          '0%': { backgroundPosition: '0% 0%' },
          '25%': { backgroundPosition: '40% 35%' },
          '50%': { backgroundPosition: '75% 15%' },
          '75%': { backgroundPosition: '30% 60%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedBackground;
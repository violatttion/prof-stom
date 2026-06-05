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
          linear-gradient(125deg, rgba(21, 101, 192, 0.22) 0%, transparent 40%),
          linear-gradient(140deg, rgba(25, 118, 210, 0.18) 12%, transparent 50%),
          linear-gradient(115deg, rgba(13, 71, 161, 0.20) 25%, transparent 62%),
          linear-gradient(135deg, rgba(30, 136, 229, 0.15) 35%, transparent 75%)
        `,
        backgroundSize: '210% 210%',
        animation: 'softRaysMove 45s ease-in-out infinite',
        '@keyframes softRaysMove': {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '35% 40%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedBackground;
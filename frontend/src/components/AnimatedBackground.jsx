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
          linear-gradient(125deg, rgba(21, 101, 192, 0.38) 0%, transparent 35%),
          linear-gradient(140deg, rgba(25, 118, 210, 0.32) 10%, transparent 48%),
          linear-gradient(115deg, rgba(13, 71, 161, 0.35) 22%, transparent 55%),
          linear-gradient(135deg, rgba(30, 136, 229, 0.28) 30%, transparent 65%)
        `,
        backgroundSize: '190% 190%',
        animation: 'softRaysMove 14s ease-in-out infinite',
        '@keyframes softRaysMove': {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '38% 42%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedBackground;
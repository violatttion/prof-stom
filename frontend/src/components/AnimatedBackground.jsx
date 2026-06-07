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
          linear-gradient(140deg, rgba(25, 118, 210, 0.32) 8%, transparent 45%),
          linear-gradient(115deg, rgba(13, 71, 161, 0.35) 18%, transparent 52%),
          linear-gradient(135deg, rgba(30, 136, 229, 0.28) 28%, transparent 65%)
        `,
        backgroundSize: '190% 190%',
        animation: 'softRaysMove 38s ease-in-out infinite',
        '@keyframes softRaysMove': {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '42% 48%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedBackground;
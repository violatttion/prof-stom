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
          linear-gradient(125deg, rgba(21, 101, 192, 0.28) 0%, transparent 38%),
          linear-gradient(140deg, rgba(25, 118, 210, 0.24) 10%, transparent 48%),
          linear-gradient(115deg, rgba(13, 71, 161, 0.26) 22%, transparent 58%),
          linear-gradient(135deg, rgba(30, 136, 229, 0.20) 32%, transparent 70%)
        `,
        backgroundSize: '200% 200%',
        animation: 'softRaysMove 42s ease-in-out infinite',
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
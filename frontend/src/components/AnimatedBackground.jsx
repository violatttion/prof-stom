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
          linear-gradient(120deg, rgba(13, 71, 161, 0.65) 0%, transparent 25%),
          linear-gradient(45deg, rgba(21, 101, 192, 0.58) 10%, transparent 38%),
          linear-gradient(200deg, rgba(25, 118, 210, 0.62) 20%, transparent 48%),
          linear-gradient(310deg, rgba(30, 136, 229, 0.55) 28%, transparent 55%),
          linear-gradient(160deg, rgba(13, 71, 161, 0.50) 38%, transparent 68%)
        `,
        backgroundSize: '160% 160%',
        animation: 'intenseShimmer 9s ease-in-out infinite',
        '@keyframes intenseShimmer': {
          '0%': { backgroundPosition: '0% 0%' },
          '20%': { backgroundPosition: '45% 30%' },
          '40%': { backgroundPosition: '80% 10%' },
          '60%': { backgroundPosition: '25% 55%' },
          '80%': { backgroundPosition: '60% 75%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedBackground;
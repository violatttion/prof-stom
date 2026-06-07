import React from 'react';
import { Box, Container } from '@mui/material';
import AnimatedBackground from './AnimatedBackground';
import MouseTrail from './MouseTrail';

const PageLayout = ({ children, maxWidth = "lg", disableBackground = false }) => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100%', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {!disableBackground && (
        <>
          <AnimatedBackground />
          <MouseTrail />
        </>
      )}

      <Container 
        maxWidth={maxWidth} 
        sx={{ 
          position: 'relative', 
          zIndex: 2, 
          py: 3 
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default PageLayout;
import React from 'react';
import { Box, Container } from '@mui/material';
import AnimatedBackground from './AnimatedBackground';

const PageLayout = ({ children, maxWidth = "lg", disableBackground = false }) => {
  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {!disableBackground && <AnimatedBackground />}
      
      <Container maxWidth={maxWidth} sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default PageLayout;
import React from 'react';
import { Box } from '@chakra-ui/react';

const MainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box
      as='main'
      flex={1}
      p={6}
      bg='gray.50'
      height='calc(100vh - 72px)' // Set a fixed height
      overflowY='auto' // Enable vertical scrolling
      css={{
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          width: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '24px',
        },
      }}
    >
      {children}
    </Box>
  );
};

export default MainContent;

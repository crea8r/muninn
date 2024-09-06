import React from 'react';
import { Box } from '@chakra-ui/react';

const MainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box as='main' flex={1} p={6} bg='gray.50' minH='calc(100vh - 72px)'>
      {children}
    </Box>
  );
};

export default MainContent;

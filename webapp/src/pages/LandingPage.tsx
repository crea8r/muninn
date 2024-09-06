import React from 'react';
import { Box, Heading, Button, VStack, Container } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <Box
      minH='100vh'
      display='flex'
      alignItems='center'
      justifyContent='center'
    >
      <Container maxW='container.md'>
        <VStack spacing={8} textAlign='center'>
          <Heading as='h1' size='2xl'>
            Not another CRM, it's manage your contact your way
          </Heading>
          <Box>
            <Button as={Link} to='/login' colorScheme='blue' size='lg' mr={4}>
              Login
            </Button>
            <Button as={Link} to='/register' colorScheme='green' size='lg'>
              Register
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default LandingPage;

import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Link as ChakraLink,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import authService from 'src/services/authService';
import { login } from 'src/api/auth';
import { useGlobalContext } from 'src/contexts/GlobalContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const toast = useToast();
  const { refreshAll } = useGlobalContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login(username, password);
      authService.login(response.token);
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await refreshAll();
      history.push('/feed');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'An error occurred during login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH='100vh'
      display='flex'
      alignItems='center'
      justifyContent='center'
      bg='gray.50'
    >
      <Box w='full' maxW='md' p={8} bg='white' borderRadius='lg' boxShadow='lg'>
        <VStack spacing={8}>
          <Heading as='h1' size='xl' color='var(--color-primary)'>
            Login to Muninn
          </Heading>
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl id='username' isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  focusBorderColor='var(--color-primary)'
                />
              </FormControl>
              <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  focusBorderColor='var(--color-primary)'
                />
              </FormControl>
              <Button
                type='submit'
                colorScheme='blue'
                width='full'
                bg='var(--color-primary)'
                isLoading={isLoading}
              >
                Login
              </Button>
            </VStack>
          </form>
          <Text>
            Don't have an account?{' '}
            <ChakraLink
              as={RouterLink}
              to='/register'
              color='var(--color-primary)'
            >
              Register here
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginPage;

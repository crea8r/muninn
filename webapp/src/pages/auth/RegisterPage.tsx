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
import { signup } from 'src/api/auth';

const RegisterPage: React.FC = () => {
  const [orgName, setOrgName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const toast = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(orgName, username, password);
      toast({
        title: 'Register successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      history.push('/login');
    } catch (error: any) {
      toast({
        title: 'Regisger failed',
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
            Register for Muninn
          </Heading>
          <form onSubmit={handleRegister} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl id='orgName' isRequired>
                <FormLabel>Organization Name</FormLabel>
                <Input
                  type='text'
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  focusBorderColor='var(--color-primary)'
                />
              </FormControl>
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
                Register
              </Button>
            </VStack>
          </form>
          <Text>
            Already have an account?{' '}
            <ChakraLink
              as={RouterLink}
              to='/login'
              color='var(--color-primary)'
            >
              Login here
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default RegisterPage;

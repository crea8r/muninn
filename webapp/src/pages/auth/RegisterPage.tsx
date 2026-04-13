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
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { signup } from 'src/api/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterPage: React.FC = () => {
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shownPassword, setShownPassword] = useState(false);
  const history = useHistory();
  const toast = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);

    try {
      await signup({ org_name: orgName, email, password });
      toast({
        title: 'Register successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      history.push('/login');
    } catch (error: any) {
      toast({
        title: 'Register failed',
        description: error.message || 'An error occurred during register',
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
                <FormLabel>Email</FormLabel>
                <Input
                  type='text'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  focusBorderColor='var(--color-primary)'
                />
              </FormControl>
              <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={shownPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    focusBorderColor='var(--color-primary)'
                  />
                  <InputRightAddon
                    onClick={() => setShownPassword(!shownPassword)}
                  >
                    {shownPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputRightAddon>
                </InputGroup>
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

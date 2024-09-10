import React from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';
import BreadcrumbComponent from '../../components/Breadcrumb';

const AccountPage: React.FC = () => {
  return (
    <Box>
      <BreadcrumbComponent />
      <Heading as='h1' size='xl' mb={6}>
        Account Settings
      </Heading>
      <VStack spacing={4} align='stretch' maxWidth='500px'>
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input type='text' value='current_username' isReadOnly />
        </FormControl>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input type='email' value='user@example.com' />
        </FormControl>
        <FormControl>
          <FormLabel>New Password</FormLabel>
          <Input type='password' />
        </FormControl>
        <FormControl>
          <FormLabel>Confirm New Password</FormLabel>
          <Input type='password' />
        </FormControl>
        <Button colorScheme='blue' alignSelf='flex-start'>
          Save Changes
        </Button>
      </VStack>
    </Box>
  );
};

export default AccountPage;

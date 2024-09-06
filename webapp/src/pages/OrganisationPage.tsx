import React from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import BreadcrumbComponent from '../components/Breadcrumb';

const OrganisationPage: React.FC = () => {
  const members = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Member' },
  ];

  return (
    <Box>
      <BreadcrumbComponent />
      <Heading as='h1' size='xl' mb={6}>
        Organisation Settings
      </Heading>
      <VStack spacing={6} align='stretch'>
        <Box>
          <Heading as='h2' size='lg' mb={4}>
            Organisation Details
          </Heading>
          <VStack spacing={4} align='stretch' maxWidth='500px'>
            <FormControl>
              <FormLabel>Organisation Name</FormLabel>
              <Input type='text' value='My Organisation' />
            </FormControl>
            <Button colorScheme='blue' alignSelf='flex-start'>
              Update Organisation
            </Button>
          </VStack>
        </Box>
        <Box>
          <Heading as='h2' size='lg' mb={4}>
            Members
          </Heading>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {members.map((member) => (
                <Tr key={member.id}>
                  <Td>{member.name}</Td>
                  <Td>{member.email}</Td>
                  <Td>{member.role}</Td>
                  <Td>
                    <Button size='sm' variant='outline'>
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Button mt={4} colorScheme='blue'>
            Add Member
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default OrganisationPage;

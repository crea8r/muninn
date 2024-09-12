import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  UnorderedList,
  ListItem,
  useDisclosure,
} from '@chakra-ui/react';
import BreadcrumbComponent from '../../components/Breadcrumb';
import { CreateFunnelForm } from '../../components/forms/';
import {
  Funnel,
  FunnelStep,
  NewFunnel,
  NewFunnelStep,
} from '../../types/Funnel';
import { fetchAllFunnels } from '../../api';
import EditFunnelForm from '../../components/forms/funnel/EditFunnelForm';

const FunnelsPage: React.FC = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [isCreateFunnelModalOpen, setIsCreateFunnelModalOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingFunnel, setEditingFunnel] = useState<Funnel | undefined>(
    undefined
  );

  useEffect(() => {
    // TODO: Fetch funnels from API
    fetchAllFunnels().then((funnels) => setFunnels(funnels));
  }, []);

  const handleSave = (funnel: Funnel) => {
    if (editingFunnel) {
      setFunnels(funnels.map((f) => (f.id === funnel.id ? funnel : f)));
    } else {
      setFunnels([...funnels, funnel]);
    }
    setEditingFunnel(undefined);
    onClose();
  };

  const handleEdit = (funnel: Funnel) => {
    setEditingFunnel(funnel);
    onOpen();
  };

  return (
    <Box>
      <BreadcrumbComponent />
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          Funnels
        </Heading>
        <Button
          colorScheme='blue'
          bg='var(--color-primary)'
          onClick={() => setIsCreateFunnelModalOpen(true)}
        >
          New Funnel
        </Button>
      </HStack>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Steps</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {funnels.map((funnel) => (
            <Tr key={funnel.id}>
              <Td fontWeight='bold'>{funnel.name}</Td>
              <Td>{funnel.description}</Td>
              <Td>
                <UnorderedList>
                  {funnel.steps.map((step, index) => (
                    <ListItem key={index}>{step.name}</ListItem>
                  ))}
                </UnorderedList>
              </Td>
              <Td>
                <Button size='sm' onClick={() => handleEdit(funnel)}>
                  Edit
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <CreateFunnelForm
        isOpen={isCreateFunnelModalOpen}
        onClose={() => setIsCreateFunnelModalOpen(false)}
        onSave={(funnel: NewFunnel) => {}}
      />
      <EditFunnelForm
        isOpen={isOpen}
        onClose={onClose}
        funnel={editingFunnel}
        onSave={(e: any) => {}}
      />
    </Box>
  );
};

export default FunnelsPage;

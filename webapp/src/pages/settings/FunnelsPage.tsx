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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import BreadcrumbComponent from '../../components/Breadcrumb';

interface Funnel {
  id: number;
  name: string;
  description: string;
  steps: string[];
}

const FunnelForm: React.FC<{
  funnel?: Funnel;
  onSave: (funnel: Funnel) => void;
  onClose: () => void;
}> = ({ funnel, onSave, onClose }) => {
  const [name, setName] = useState(funnel?.name || '');
  const [description, setDescription] = useState(funnel?.description || '');
  const [steps, setSteps] = useState<string>(funnel?.steps.join('\n') || '');

  const handleSave = () => {
    onSave({
      id: funnel?.id || Date.now(),
      name,
      description,
      steps: steps.split('\n').filter((step) => step.trim() !== ''),
    });
    onClose();
  };

  return (
    <VStack spacing={4}>
      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </FormControl>
      <FormControl>
        <FormLabel>Description</FormLabel>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Steps (one per line)</FormLabel>
        <Textarea value={steps} onChange={(e) => setSteps(e.target.value)} />
      </FormControl>
      <Button colorScheme='blue' onClick={handleSave}>
        Save
      </Button>
    </VStack>
  );
};

const FunnelsPage: React.FC = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingFunnel, setEditingFunnel] = useState<Funnel | undefined>(
    undefined
  );

  useEffect(() => {
    // TODO: Fetch funnels from API
    const dummyFunnels: Funnel[] = [
      {
        id: 1,
        name: 'Sales Pipeline',
        description: 'Standard sales process',
        steps: ['Lead', 'Prospect', 'Negotiation', 'Closed Won', 'Closed Lost'],
      },
      {
        id: 2,
        name: 'Recruitment Process',
        description: 'Hiring workflow',
        steps: [
          'Application Received',
          'Screening',
          'Interview',
          'Offer',
          'Hired',
        ],
      },
    ];
    setFunnels(dummyFunnels);
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
        <Button colorScheme='blue' bg='var(--color-primary)' onClick={onOpen}>
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
                    <ListItem key={index}>{step}</ListItem>
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingFunnel ? 'Edit Funnel' : 'New Funnel'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FunnelForm
              funnel={editingFunnel}
              onSave={handleSave}
              onClose={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FunnelsPage;

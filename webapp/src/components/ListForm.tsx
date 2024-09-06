import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';

interface List {
  id: number;
  name: string;
  description: string;
  filters: string[];
}
const ListForm: React.FC<{
  list?: List;
  onSave: (list: List) => void;
  onClose: () => void;
}> = ({ list, onSave, onClose }) => {
  const [name, setName] = useState(list?.name || '');
  const [description, setDescription] = useState(list?.description || '');
  const [filters, setFilters] = useState<string>(
    list?.filters.join('\n') || ''
  );

  const handleSave = () => {
    onSave({
      id: list?.id || Date.now(),
      name,
      description,
      filters: filters.split('\n').filter((filter) => filter.trim() !== ''),
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
        <FormLabel>Filters (one per line)</FormLabel>
        <Textarea
          value={filters}
          onChange={(e) => setFilters(e.target.value)}
        />
      </FormControl>
      <Button colorScheme='blue' onClick={handleSave}>
        Save
      </Button>
    </VStack>
  );
};

export default ListForm;

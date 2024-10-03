import React, { useState } from 'react';
import {
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import MarkdownEditor from '../mardown/MardownEditor';

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
        <MarkdownEditor
          initialValue={description}
          onChange={setDescription}
          filters={[]}
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

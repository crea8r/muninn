import React, { useState, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { CalendarIcon, EditIcon } from '@chakra-ui/icons';
import { RichTextEditor } from '../rich-text/';
import { NewFact } from '../../types/';

interface FactFormProps {
  onSave: (fact: NewFact) => void;
  objectId: string;
}

const FactForm: React.FC<FactFormProps> = ({ onSave, objectId }) => {
  const [fact, setFact] = useState<NewFact>({
    text: '',
    happened_at: new Date().toLocaleString(),
    location: '',
    object_id: objectId,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [tempLocation, setTempLocation] = useState('');

  const handleChange = (name: string, value: string) => {
    setFact((prevFact) => ({ ...prevFact, [name]: value }));
  };

  const handleSave = (content: string) => {
    onSave({ ...fact, text: content });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    handleChange('happened_at', newDate.toLocaleString());
  };

  const handleLocationSave = () => {
    handleChange('location', tempLocation);
    onClose();
  };

  return (
    <Box>
      <Flex justifyContent='space-between' mb={2}>
        <Flex alignItems='center'>
          <Text mr={2}>{fact.happened_at}</Text>
          <IconButton
            aria-label='Change date'
            icon={<CalendarIcon />}
            size='sm'
            onClick={() => datePickerRef.current?.showPicker()}
          />
          <Input
            ref={datePickerRef}
            type='datetime-local'
            onChange={handleDateChange}
            style={{ position: 'absolute', visibility: 'hidden' }}
          />
        </Flex>
        <Flex alignItems='center'>
          <Text mr={2}>{fact.location || 'Set location'}</Text>
          <IconButton
            aria-label='Change location'
            icon={<EditIcon />}
            size='sm'
            onClick={onOpen}
          />
        </Flex>
      </Flex>

      <RichTextEditor initialValue={fact.text} onSave={handleSave} />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter Location</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
              placeholder='Enter location'
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleLocationSave}>
              Save
            </Button>
            <Button variant='ghost' onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FactForm;

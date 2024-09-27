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
  HStack,
  Spacer,
  useToast,
} from '@chakra-ui/react';
import { CalendarIcon, EditIcon } from '@chakra-ui/icons';
import { RichTextEditor } from '../rich-text/';
import { Fact, Object } from 'src/types/';
import { SpotLightFilter } from '../SpotLight';
import { getInitialValueFromMentionItem } from '../rich-text/utils';
import { FactToUpdate, FactToCreate } from 'src/api/fact';
import dayjs from 'dayjs';

interface FactFormProps {
  onSave: (fact: FactToUpdate | FactToCreate) => void;
  object: Object;
  fact?: Fact;
}

interface FactFormData {
  id?: string;
  text: any;
  happenedAt: string;
  location: string;
  objectIds: string[];
}

const parseInitialFact = (
  initialFact: Fact | undefined,
  object: Object
): FactFormData => {
  return initialFact
    ? {
        id: initialFact.id,
        text: initialFact.text,
        happenedAt: initialFact.happenedAt,
        location: initialFact.location,
        objectIds: initialFact.relatedObjects.map((obj) => obj.id),
      }
    : {
        text: object
          ? getInitialValueFromMentionItem({
              type: SpotLightFilter.OBJECT,
              payload: {
                id: object.id,
                name: object.name,
                description: object.description,
              },
            })
          : '',
        happenedAt: new Date().toLocaleString(),
        location: '',
        objectIds: [],
      };
};

const FactForm: React.FC<FactFormProps> = ({
  onSave,
  object,
  fact: initialFact,
}) => {
  const [fact, setFact] = useState<FactFormData>(
    parseInitialFact(initialFact, object)
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [tempLocation, setTempLocation] = useState('');
  const toast = useToast();

  const handleChange = (name: string, value: string) => {
    setFact((prevFact) => ({ ...prevFact, [name]: value }));
  };

  const handleReset = () => {
    setFact(parseInitialFact(initialFact, object));
  };
  const handleSave = async () => {
    const relatedObjectIds = fact.objectIds;
    if (!relatedObjectIds.length || !relatedObjectIds.includes(object.id)) {
      toast({
        title: 'Error adding fact',
        description: 'Please select at least one object',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    const exisitingObjectIds =
      initialFact?.relatedObjects?.map((obj) => obj.id) || [];
    const toAddObjectIds = relatedObjectIds.filter(
      (id: string) => !exisitingObjectIds.includes(id)
    );
    const toRemoveObjectIds = exisitingObjectIds.filter(
      (id: string) => !relatedObjectIds.includes(id)
    );
    const content =
      typeof fact.text === 'object' ? JSON.stringify(fact.text) : fact.text;
    const toSubmitFact = {
      ...fact,
      happenedAt: dayjs(fact.happenedAt).toISOString(),
      text: content,
      toAddObjectIds: toAddObjectIds,
      toRemoveObjectIds: toRemoveObjectIds,
    };
    try {
      await onSave(toSubmitFact);
      toast({
        title: 'Fact added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (e) {
      toast({
        title: 'Error adding fact',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    handleChange('happenedAt', newDate.toLocaleString());
  };

  const handleLocationSave = () => {
    handleChange('location', tempLocation);
    onClose();
  };

  return (
    <Box width='100%'>
      <Flex justifyContent='space-between' mb={2}>
        <HStack>
          <Text mr={2}>{fact.happenedAt}</Text>
          <div style={{ position: 'relative' }}>
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
              style={{
                position: 'absolute',
                visibility: 'hidden',
              }}
            />
          </div>
        </HStack>
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

      <RichTextEditor
        initialValue={fact.text}
        filters={[SpotLightFilter.OBJECT]}
        onChange={(content: string, relatedItems) => {
          try {
            const jsonContent = JSON.parse(content);
            setFact((prev) => ({
              ...prev,
              text: jsonContent,
            }));
          } catch (e) {
            setFact((prev) => ({ ...prev, text: content }));
          }
          let objIds = relatedItems
            ? relatedItems.map((item: any) => item.payload.id)
            : [];
          setFact((prev) => ({ ...prev, objectIds: objIds }));
        }}
      />
      <HStack width={'100%'} mt={2} mb={2}>
        <Button onClick={handleReset}>Reset</Button>
        <Spacer />
        <Button colorScheme='blue' onClick={handleSave}>
          Save
        </Button>
      </HStack>

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

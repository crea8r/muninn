import React, { useState, useRef, useEffect } from 'react';
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
import MarkdownEditor from 'src/components/mardown/MardownEditor';
import { Fact, Object } from 'src/types/';
import { SpotLightFilter } from '../spot-light/SpotLight';
import { getInitialValueFromMentionItem } from 'src/components/mardown/utils';
import { FactToUpdate, FactToCreate } from 'src/api/fact';
import dayjs from 'dayjs';

interface FactFormProps {
  onSave?: (fact: FactToUpdate | FactToCreate) => void;
  onChange?: (fact: FactToUpdate | FactToCreate) => void;
  requireObject?: Object;
  fact?: Fact | FactToCreate;
  showPanel?: boolean;
  mode?: 'edit' | 'preview';
}

interface FactFormData {
  id?: string;
  text: any;
  happenedAt: string;
  location: string;
  objectIds: string[];
}

const parseInitialFact = (
  initialFact: Fact | FactToCreate | undefined,
  object: Object | undefined
): FactFormData | undefined => {
  const objstr = `@[${object?.name}](object:${object?.id})`;
  if (initialFact) {
    let text = initialFact.text;
    if (object && !text.includes(objstr)) {
      text = `${objstr} ${text}`;
    }
    let tmp: any = {
      text,
      happenedAt: initialFact.happenedAt,
      location: initialFact.location,
      objectIds: [],
    };
    if ('id' in initialFact) {
      tmp['id'] = initialFact.id;
    }
    if ('relatedObjects' in initialFact) {
      tmp['objectIds'] = initialFact.relatedObjects.map((obj) => obj.id);
    }
    if (object && !tmp['objectIds'].includes(object.id)) {
      tmp['objectIds'].push(object.id);
    }
    return tmp;
  }
  if (object) {
    return {
      text: object
        ? getInitialValueFromMentionItem({
            type: SpotLightFilter.OBJECT,
            payload: {
              id: object.id,
              name: object.name,
            },
          })
        : '',
      happenedAt: dayjs().toISOString(),
      location: '',
      objectIds: [],
    };
  }
  return {
    text: '',
    happenedAt: dayjs().toISOString(),
    location: '',
    objectIds: [],
  };
};

const FactForm: React.FC<FactFormProps> = ({
  onSave,
  requireObject = undefined,
  fact: initialFact,
  showPanel = true,
  onChange,
  mode = 'edit',
}) => {
  const [fact, setFact] = useState<any>(
    parseInitialFact(initialFact, requireObject)
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [tempLocation, setTempLocation] = useState('');
  const toast = useToast();
  useEffect(() => {
    setFact(parseInitialFact(initialFact, requireObject));
  }, [initialFact, requireObject]);

  const handleChange = (name: string, value: string) => {
    if (fact) {
      setFact({ ...fact, [name]: value });
    } else {
      setFact({ [name]: value });
    }
    onChange && onChange({ ...fact, [name]: value });
  };

  const handleReset = () => {
    setFact(parseInitialFact(initialFact, requireObject));
  };

  const handleSave = async () => {
    const relatedObjectIds = fact.objectIds;
    if (requireObject && !relatedObjectIds?.includes(requireObject.id)) {
      toast({
        title: 'Error adding fact',
        description: `Please include ${requireObject.name} in the fact.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    let exisitingObjectIds: any[] = [];
    if (initialFact && 'relatedObjects' in initialFact) {
      exisitingObjectIds =
        initialFact?.relatedObjects?.map((obj) => obj.id) || [];
    }

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
    if (onSave) {
      await onSave(toSubmitFact);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    handleChange('happenedAt', dayjs(newDate).toISOString());
  };

  const handleLocationSave = () => {
    handleChange('location', tempLocation);
    onClose();
  };

  return (
    <Box width='100%'>
      <Flex justifyContent='space-between' mb={2}>
        <HStack>
          <Text mr={2}>
            {dayjs(fact.happenedAt).format('YYYY-MM-DD HH:mm')}
          </Text>
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

      <MarkdownEditor
        initialValue={fact.text}
        filters={[SpotLightFilter.OBJECT]}
        mode={mode}
        onChange={(content: string, relatedItems) => {
          let newFact = { ...fact };
          try {
            const jsonContent = JSON.parse(content);
            newFact.text = jsonContent;
          } catch (e) {
            newFact.text = content;
          }
          let objIds = relatedItems
            ? relatedItems.map((item: any) => item.payload.id)
            : [];
          newFact.objectIds = objIds;
          if (onChange) {
            onChange(newFact);
          }
          setFact(newFact);
        }}
      />
      {showPanel && (
        <HStack width={'100%'} mt={2} mb={2}>
          <Button onClick={handleReset}>Reset</Button>
          <Spacer />
          <Button colorScheme='blue' onClick={handleSave}>
            Save
          </Button>
        </HStack>
      )}

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

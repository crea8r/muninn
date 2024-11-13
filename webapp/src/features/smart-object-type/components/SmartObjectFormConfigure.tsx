import React, { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Select,
  Textarea,
  VStack,
  Text,
  Divider,
} from '@chakra-ui/react';
import { SmartObjectFormConfig, SmartObjectFieldConfig } from '../type';
import { DeleteIcon, DragHandleIcon } from '@chakra-ui/icons';
import { ObjectTypeRegistryInstance } from '../utils/registry';
import FaIconList from 'src/components/FaIconList';
import { useSmartObjectFormConfigure } from '../hooks/useSmartObjectFormConfigure';

interface SmartObjectFormConfigureProps {
  initialConfig: SmartObjectFormConfig;
  onConfigChange?: (config: SmartObjectFormConfig) => void;
}

const FieldConfigurationPanel = ({
  field,
  config,
  onConfigChange,
}: {
  field: string;
  config: SmartObjectFieldConfig;
  onConfigChange: (
    field: string,
    changes: Partial<SmartObjectFieldConfig>
  ) => void;
}) => {
  const Configure = ObjectTypeRegistryInstance.get(config.type)?.Configure;
  const [label, setLabel] = useState(config.meta?.label || '');
  const [description, setDescription] = useState(
    config.meta?.description || ''
  );
  return (
    <VStack spacing={4} align='stretch'>
      <FormControl>
        <FormLabel fontWeight={'bold'}>Label</FormLabel>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() =>
            onConfigChange(field, {
              meta: { ...config.meta, label },
            })
          }
        />
      </FormControl>

      <FormControl>
        <FormLabel fontWeight={'bold'}>Description</FormLabel>
        <Textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          onBlur={() =>
            onConfigChange(field, {
              meta: { ...config.meta, description },
            })
          }
          placeholder='Add a helpful description that appears below the field label'
        />
      </FormControl>

      <FormControl>
        <FormLabel
          display={'flex'}
          alignItems={'center'}
          gap={1}
          fontWeight={'bold'}
        >
          {config.meta?.icon ? FaIconList[config.meta?.icon] : null}Icon
        </FormLabel>
        <Select
          value={config.meta?.icon || ''}
          onChange={(e) =>
            onConfigChange(field, {
              meta: {
                ...config.meta,
                icon: e.target.value as keyof typeof FaIconList,
              },
            })
          }
        >
          <option value=''>No Icon</option>
          {Object.keys(FaIconList).map((iconName) => {
            return (
              <option key={iconName} value={iconName}>
                {iconName}
              </option>
            );
          })}
        </Select>
      </FormControl>

      <Box>
        <Text fontWeight='bold' mb={2}>
          Type Configuration
        </Text>
        <Divider mb={2} />
        {Configure && (
          <Configure
            validation={config.validation}
            onChange={(newValidation) =>
              onConfigChange(field, {
                validation: newValidation,
              })
            }
          />
        )}
      </Box>
    </VStack>
  );
};

export const SmartObjectFormConfigure: React.FC<
  SmartObjectFormConfigureProps
> = ({ initialConfig, onConfigChange }) => {
  const {
    config,
    fieldErrors,
    handleConfigChange,
    handleFieldOrder,
    setDraggedField,
    draggedField,
    addField,
    removeField,
  } = useSmartObjectFormConfigure({
    initialConfig,
    onConfigChange,
  });
  console.log('config: ', config);
  const [newFieldData, setNewFieldData] = useState({
    name: '',
    type: 'string',
  });
  const sortedFields = useMemo(() => {
    return Object.entries(config.fields).sort(
      ([, a], [, b]) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0)
    );
  }, [config]);

  return (
    <VStack spacing={4} align={'stretch'}>
      {/* Add New Field Section */}
      <Box p={4} borderWidth={1} borderRadius='md'>
        <Heading size='sm' mb={4}>
          Add New Field
        </Heading>
        <HStack spacing={4}>
          <FormControl isInvalid={!!fieldErrors[newFieldData.name]}>
            <Input
              placeholder='Field Name'
              value={newFieldData.name}
              onChange={(e) =>
                setNewFieldData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
            <FormErrorMessage>
              {fieldErrors[newFieldData.name]?.message}
            </FormErrorMessage>
          </FormControl>
          <Select
            value={newFieldData.type}
            onChange={(e) =>
              setNewFieldData((prev) => ({
                ...prev,
                type: e.target.value,
              }))
            }
            width='200px'
          >
            {Array.from(ObjectTypeRegistryInstance.getAll()).map(([type]) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Button
            colorScheme='blue'
            onClick={() => {
              if (addField(newFieldData.name, newFieldData.type)) {
                setNewFieldData({ name: '', type: 'string' });
              }
            }}
            fontSize={'sm'}
          >
            Add Field
          </Button>
        </HStack>
      </Box>
      <Accordion allowToggle variant={'enclosed'}>
        {sortedFields.map(([field, fieldConfig], index) => {
          return (
            <AccordionItem
              key={field}
              draggable
              onDragStart={() => setDraggedField(field)}
              onDragOver={(e) => {
                e.preventDefault();
                const target = e.currentTarget as HTMLElement;
                const bounds = target.getBoundingClientRect();
                const mouseY = e.clientY;
                const threshold = bounds.top + bounds.height / 2;
                target.style.borderTop =
                  mouseY < threshold ? '2px solid blue' : '';
                target.style.borderBottom =
                  mouseY >= threshold ? '2px solid blue' : '';
              }}
              onDragLeave={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.borderTop = '';
                target.style.borderBottom = '';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const target = e.currentTarget as HTMLElement;
                target.style.borderTop = '';
                target.style.borderBottom = '';

                if (draggedField) {
                  const draggedIndex = sortedFields.findIndex(
                    ([f]) => f === draggedField
                  );
                  const bounds = target.getBoundingClientRect();
                  const mouseY = e.clientY;
                  const threshold = bounds.top + bounds.height / 2;
                  const targetIndex = index + (mouseY >= threshold ? 1 : 0);

                  if (draggedIndex !== targetIndex) {
                    handleFieldOrder(draggedIndex, targetIndex);
                  }
                }
                setDraggedField(null);
              }}
            >
              <AccordionButton background={'gray.100'}>
                <HStack flex='1'>
                  <DragHandleIcon mr={2} cursor='grab' />
                  <Box flex='1' textAlign='left'>
                    <FormControl
                      display='inline-block'
                      isInvalid={!!fieldErrors[field]}
                    >
                      <Text size={'sm'}>{field}</Text>
                      <FormErrorMessage>
                        {fieldErrors[field]?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </Box>
                  <IconButton
                    aria-label='Remove field'
                    icon={<DeleteIcon />}
                    size='sm'
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(field);
                    }}
                    colorScheme={'red'}
                    variant={'outline'}
                    mr={4}
                  />
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <FieldConfigurationPanel
                  field={field}
                  config={fieldConfig}
                  onConfigChange={handleConfigChange}
                />
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </VStack>
  );
};

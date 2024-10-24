import {
  VStack,
  Text,
  Divider,
  Input,
  Box,
  Button,
  Flex,
  Select,
  Spacer,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepSeparator,
  Badge,
  HStack,
} from '@chakra-ui/react';
import React from 'react';
import { ObjectType } from 'src/types';

interface Step1Props {
  objectTypeInput: string;
  setObjectTypeInput: (value: string) => void;
  objectTypes: ObjectType[];
  selectedObjectType: ObjectType | null;
  handleObjectTypeSelect: (ot: any) => void;
}
const Step1 = ({
  objectTypeInput,
  setObjectTypeInput,
  objectTypes,
  handleObjectTypeSelect,
  selectedObjectType,
}: Step1Props) => {
  return (
    <VStack spacing={4} align='stretch'>
      <HStack>
        <Text fontWeight='bold'>Step1: Select Object Type</Text>
        {selectedObjectType && (
          <Badge colorScheme='blue'>{selectedObjectType.name}</Badge>
        )}
      </HStack>

      <Divider />
      <Input
        value={objectTypeInput}
        onChange={(e) => setObjectTypeInput(e.target.value)}
        placeholder='Type to search for object types'
      />
      <Box maxH='200px' overflowY='auto'>
        {objectTypes
          .filter((ot) =>
            ot.name.toLowerCase().includes(objectTypeInput.toLowerCase())
          )
          .map((ot) => {
            return (
              <Button
                key={ot.id}
                onClick={() => handleObjectTypeSelect(ot)}
                variant={selectedObjectType?.id === ot.id ? 'solid' : 'ghost'}
                colorScheme='blue'
                width='100%'
                justifyContent='flex-start'
                mb={2}
              >
                {ot.name}
              </Button>
            );
          })}
      </Box>
    </VStack>
  );
};

interface Step3Props {
  selectedObjectType: any;
  csvData: any[];
  fieldMapping: any;
  setFieldMapping: (value: any) => void;
  idStringColumn: string;
  setIdStringColumn: (value: string) => void;
  nameColumn: string;
  setNameColumn: (value: string) => void;
}
const Step3 = ({
  selectedObjectType,
  csvData,
  fieldMapping,
  idStringColumn,
  setFieldMapping,
  setIdStringColumn,
  nameColumn,
  setNameColumn,
}: Step3Props) => {
  return (
    <VStack spacing={4} align='stretch'>
      <Text fontWeight='bold'>Step 3: Map Fields</Text>
      <Divider />
      {selectedObjectType &&
        Object.entries(selectedObjectType.fields).map(([field, type]) => (
          <Flex key={field} justify='space-between' align='center'>
            <Text>
              {field} ({type as React.ReactNode}):
            </Text>
            <Select
              value={fieldMapping[field] || ''}
              onChange={(e) =>
                setFieldMapping({
                  ...fieldMapping,
                  [field]: e.target.value,
                })
              }
              placeholder='Select column'
              width='60%'
            >
              {csvData[0]?.map((column: any, index: any) => (
                <option key={index} value={column}>
                  {column}
                </option>
              ))}
            </Select>
          </Flex>
        ))}
      <Text fontWeight='bold' mt={4}>
        Select ID String Column:
      </Text>
      <Select
        value={idStringColumn}
        onChange={(e) => setIdStringColumn(e.target.value)}
        placeholder='Select ID string column'
      >
        {csvData[0]?.map((column: any, index: any) => (
          <option key={index} value={column}>
            {column}
          </option>
        ))}
      </Select>
      <Text fontWeight='bold' mt={4}>
        If new object is created, select Name column:
      </Text>
      <Select
        value={nameColumn}
        onChange={(e) => setNameColumn(e.target.value)}
        placeholder='Select object Name column'
      >
        {csvData[0]?.map((column: any, index: any) => (
          <option key={index} value={column}>
            {column}
          </option>
        ))}
      </Select>
    </VStack>
  );
};
interface StepControllerProps {
  step: number;
  setStep: (value: number) => void;
  handleImport: () => void;
  selectedObjectType: any;
  csvData: any[];
  fieldMapping: any;
  idStringColumn: string;
}
const StepController = ({
  step,
  setStep,
  handleImport,
  selectedObjectType,
  csvData,
  fieldMapping,
  idStringColumn,
}: StepControllerProps) => {
  return (
    <Flex width={'100%'}>
      <Spacer />
      {step > 1 && (
        <Button variant='ghost' mr={3} onClick={() => setStep(step - 1)}>
          Previous
        </Button>
      )}
      <Button
        colorScheme='blue'
        onClick={step === 4 ? handleImport : () => setStep(step + 1)}
        isDisabled={
          (step === 1 && !selectedObjectType) ||
          (step === 2 && csvData.length === 0) ||
          (step === 3 &&
            (Object.keys(fieldMapping).length === 0 || !idStringColumn))
        }
      >
        {step === 4 ? 'Start Import' : 'Next'}
      </Button>
    </Flex>
  );
};
const StepNavigation = ({
  step,
  setStep,
  handleImport,
  selectedObjectType,
  csvData,
  fieldMapping,
  idStringColumn,
}: StepControllerProps) => {
  const steps = [
    {
      title: 'Select Object Type',
    },
    {
      title: 'Upload CSV File',
    },
    {
      title: 'Map Fields',
    },
    {
      title: 'Add new fact',
    },
  ];
  return (
    <Stepper index={step - 1}>
      {steps.map((istep, index) => (
        <Step key={index} onClick={() => setStep(index + 1)}>
          <StepIndicator>
            <StepStatus
              active={<StepNumber />}
              complete={<StepIcon />}
              incomplete={<StepNumber />}
            />
          </StepIndicator>
          <StepSeparator />
        </Step>
      ))}
    </Stepper>
  );
};
export { Step1, Step3, StepController, StepNavigation };

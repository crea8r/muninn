import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Badge,
  Heading,
  Collapse,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FunnelStep as FunnelStepType, Object } from 'src/types';
import ObjectCard from './ObjectCard'; // We'll assume this component exists

interface FunnelStepProps {
  step: FunnelStepType;
  objects: Object[];
  onObjectMove: (objectId: string, newStepId: string) => void;
}

const FunnelStep: React.FC<FunnelStepProps> = ({
  step,
  objects,
  onObjectMove,
}) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  const [groupedObjects, setGroupedObjects] = useState<{
    [key: string]: Object[];
  }>({
    ungrouped: objects,
  });

  const handleDragStart = (e: React.DragEvent, objectId: string) => {
    e.dataTransfer.setData('text/plain', objectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const objectId = e.dataTransfer.getData('text/plain');
    onObjectMove(objectId, step.id);
  };

  return (
    <Box
      bg='gray.50'
      p={4}
      borderRadius='md'
      boxShadow='md'
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <VStack align='stretch' spacing={4} width={'260px'}>
        <Box>
          <Heading
            size='md'
            mb={2}
            overflow={'hidden'}
            whiteSpace={'nowrap'}
            textOverflow={'ellipsis'}
          >
            {step.name}
          </Heading>
          <Badge colorScheme='blue'>{objects.length} contacts</Badge>
        </Box>
        <Button onClick={onToggle} variant='outline' size='sm'>
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          {isOpen ? 'Collapse' : 'Expand'}
        </Button>
        <Collapse in={isOpen}>
          <VStack align='stretch' spacing={2}>
            {window.Object.entries(groupedObjects).map(
              ([groupName, groupObjects]) => (
                <Box key={groupName}>
                  {groupName !== 'ungrouped' && (
                    <Text fontWeight='bold' mb={2}>
                      {groupName}
                    </Text>
                  )}
                  {groupObjects.map((obj: Object) => {
                    return (
                      <Box
                        key={obj.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, obj.id)}
                        mt={2}
                      >
                        <ObjectCard object={obj} />
                      </Box>
                    );
                  })}
                </Box>
              )
            )}
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};

export default FunnelStep;

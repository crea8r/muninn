// src/features/automation/components/AutomationList.tsx
import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Text,
  VStack,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { AutomatedAction } from 'src/types/Automation';
import dayjs from 'dayjs';
import { EditIcon, InfoIcon } from '@chakra-ui/icons';
import { FaHistory, FaTrash } from 'react-icons/fa';

interface AutomationListProps {
  automations: AutomatedAction[];
  onEdit: (automation: AutomatedAction) => void;
  onDelete: (id: string) => void;
  onViewLogs: (id: string) => void;
}

export const AutomationList: React.FC<AutomationListProps> = ({
  automations,
  onEdit,
  onDelete,
  onViewLogs,
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'running':
        return 'blue';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };
  const toast = useToast();
  return (
    <Table variant='simple'>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Status</Th>
          <Th>Last Run</Th>
          <Th>Last Execution</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {automations?.map((automation) => (
          <Tr key={automation.id}>
            <Td>
              <HStack align='start' spacing={1} alignItems={'center'}>
                <InfoIcon
                  cursor={'pointer'}
                  onClick={() => {
                    toast({
                      title: automation.description,
                      status: 'info',
                      duration: 5000,
                      isClosable: true,
                    });
                  }}
                />
                <Text fontWeight='bold'>{automation.name}</Text>
              </HStack>
            </Td>
            <Td>
              <Badge colorScheme={automation.isActive ? 'green' : 'gray'}>
                {automation.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Td>
            <Td>
              {automation.lastRunAt
                ? dayjs(automation.lastRunAt).fromNow()
                : 'Never'}
            </Td>
            <Td>
              {automation.lastExecution && (
                <VStack align='start' spacing={1}>
                  <Badge
                    colorScheme={getStatusColor(
                      automation.lastExecution.status
                    )}
                  >
                    {automation.lastExecution.status}
                  </Badge>
                  <Text fontSize='sm'>
                    {automation.lastExecution.objectsAffected} affected
                  </Text>
                </VStack>
              )}
            </Td>
            <Td>
              <HStack spacing={2}>
                <IconButton
                  aria-label='edit'
                  icon={<EditIcon />}
                  size='sm'
                  onClick={() => onEdit(automation)}
                />
                <IconButton
                  aria-label='logs'
                  icon={<FaHistory />}
                  size='sm'
                  variant='outline'
                  onClick={() => onViewLogs(automation.id)}
                />

                <IconButton
                  aria-label='delete'
                  icon={<FaTrash />}
                  size='sm'
                  colorScheme='red'
                  variant='ghost'
                  onClick={() => onDelete(automation.id)}
                />
              </HStack>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

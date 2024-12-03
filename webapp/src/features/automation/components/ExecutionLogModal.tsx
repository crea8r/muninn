// src/features/automation/components/filter/ExecutionLogModal.tsx
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Box,
  Text,
  Badge,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
} from '@chakra-ui/react';
import automationApi from '../service/automation';
import { ExecutionLogEntry } from 'src/types/Automation';
import dayjs from 'dayjs';

interface ExecutionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionId: string;
}

const ITEMS_PER_PAGE = 10;

export const ExecutionLogModal: React.FC<ExecutionLogModalProps> = ({
  isOpen,
  onClose,
  actionId,
}) => {
  const [executions, setExecutions] = useState<ExecutionLogEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await automationApi.getExecutionLogs(
          actionId,
          currentPage,
          ITEMS_PER_PAGE
        );
        setExecutions(response.data);
        setTotalCount(response.totalCount);
      } catch (error) {
        console.error('Error fetching execution logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchLogs();
    }
  }, [actionId, currentPage, isOpen]);

  const getStatusColor = (status: string) => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='2xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Execution History</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Box textAlign='center' py={8}>
              <Spinner />
            </Box>
          ) : (
            <VStack spacing={4} align='stretch'>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th>Started At</Th>
                    <Th>Status</Th>
                    <Th>Results</Th>
                    <Th>Duration</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {executions?.map((execution) => (
                    <Tr key={execution.id}>
                      <Td>
                        {dayjs(execution.startedAt).format('DD MMM YYYY HH:mm')}
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                      </Td>
                      <Td>
                        {execution.objectsAffected} affected
                        {execution.errorMessage && (
                          <Text color='red.500' fontSize='sm'>
                            Error: {execution.errorMessage}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        {execution.completedAt
                          ? dayjs(execution.completedAt).diff(
                              dayjs(execution.startedAt),
                              'ms'
                            ) /
                              1000 +
                            ' s'
                          : '-'}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <HStack justify='space-between' pt={4}>
                <Text>
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{' '}
                  {totalCount} executions
                </Text>
                <HStack>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    isDisabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    isDisabled={currentPage * ITEMS_PER_PAGE >= totalCount}
                  >
                    Next
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

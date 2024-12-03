// src/pages/AutomationsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  InputGroup,
  InputLeftElement,
  Input,
  useDisclosure,
  Text,
  Skeleton,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { AutomationList } from 'src/features/automation/components/AutomationList';
import { useAutomationList } from 'src/features/automation/hooks/useAutomationList';
import { AutomatedAction } from 'src/types/Automation';
import { FaRobot } from 'react-icons/fa';
import { AutomationForm } from 'src/features/automation/components/AutomationForm';
import { BasicPagination } from 'src/components/BasicPagination';
import { ExecutionLogModal } from 'src/features/automation/components/ExecutionLogModal';

const ITEMS_PER_PAGE = 10;

export const AutomationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<AutomatedAction | null>(
    null
  );
  const [selectedActionForLogs, setSelectedActionForLogs] = useState<
    string | null
  >(null);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const {
    automations,
    totalCount,
    currentPage,
    isLoading,
    setCurrentPage,
    fetchAutomations,
    deleteAutomation,
  } = useAutomationList(ITEMS_PER_PAGE);

  const formDisclosure = useDisclosure();
  const logsDisclosure = useDisclosure();

  useEffect(() => {
    fetchAutomations(searchQuery);
  }, [fetchAutomations, searchQuery, currentPage]);

  const handleEdit = (action: AutomatedAction) => {
    setSelectedAction(action);
    formDisclosure.onOpen();
  };

  const handleViewLogs = (actionId: string) => {
    setSelectedActionForLogs(actionId);
    logsDisclosure.onOpen();
  };

  return (
    <Box p={4} background={'white'}>
      <VStack spacing={4} align='stretch'>
        <HStack justify='space-between' color={'var(--color-primary)'}>
          <Heading size='lg'>
            <HStack gap={2}>
              <FaRobot />
              <Text>Automated Actions</Text>
            </HStack>
          </Heading>
        </HStack>
        <Text>
          Every automation will run every 10 minutes, process max 100 objects
          per execution. <br />
          To create an automation, use the object filter and setup condition
          then use the Automation button to create action you want to do with
          the matching objects.
        </Text>

        <InputGroup>
          <InputLeftElement>
            <SearchIcon color='gray.300' />
          </InputLeftElement>
          <Input
            placeholder='Search automations...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        {isLoading ? (
          <Skeleton />
        ) : (
          <>
            <AutomationList
              automations={automations}
              onEdit={handleEdit}
              onDelete={deleteAutomation}
              onViewLogs={handleViewLogs}
            />
            <BasicPagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </VStack>
      {formDisclosure.isOpen && (
        <AutomationForm
          isOpen={formDisclosure.isOpen}
          onClose={formDisclosure.onClose}
          initialData={selectedAction}
          onSuccess={fetchAutomations}
        />
      )}

      {logsDisclosure.isOpen && selectedActionForLogs && (
        <ExecutionLogModal
          isOpen={logsDisclosure.isOpen}
          onClose={logsDisclosure.onClose}
          actionId={selectedActionForLogs}
        />
      )}
    </Box>
  );
};

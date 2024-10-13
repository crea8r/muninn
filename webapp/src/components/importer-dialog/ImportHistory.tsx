import {
  Badge,
  Box,
  Button,
  Flex,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Text,
  Progress,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ImportTask } from 'src/api/import';
import { shortenText } from 'src/utils';

interface ImportHistoryProps {
  importHistory: ImportTask[];
  pageSize: number;
  setPageSize: (value: number) => void;
  currentPage: number;
  setCurrentPage: (value: any) => void;
  totalPages: number;
}

const ImportHistory = ({
  importHistory,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  totalPages,
}: ImportHistoryProps) => {
  dayjs.extend(relativeTime);
  return (
    <VStack spacing={4}>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>File Name</Th>
            <Th>Created At</Th>
          </Tr>
        </Thead>
        <Tbody>
          {importHistory.map((task) => (
            <Tr key={task.id}>
              <Td>
                <Box display={'inline'}>
                  <Badge
                    title={task.error_message ? task.error_message : ''}
                    color={
                      task.status === 'completed'
                        ? 'green.500'
                        : task.status === 'failed'
                        ? 'red.500'
                        : 'gray.500'
                    }
                    _hover={task.error_message ? { cursor: 'help' } : {}}
                  >
                    {task.progress === 0 || task.progress === 100
                      ? task.status
                      : task.progress + '%'}
                  </Badge>
                  <Box title={task.file_name}>
                    {shortenText(task.file_name, 30)}
                  </Box>
                </Box>
              </Td>
              <Td>{dayjs(task.created_at).fromNow()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Flex justifyContent='space-between' alignItems='center' width='100%'>
        <Select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          maxWidth={'200px'}
        >
          <option value='5'>5 per page</option>
          <option value='10'>10 per page</option>
          <option value='20'>20 per page</option>
        </Select>
        <Flex>
          <Button
            onClick={() =>
              setCurrentPage((prev: number) => Math.max(prev - 1, 1))
            }
            isDisabled={currentPage === 1}
            mr={2}
          >
            Previous
          </Button>
          <Text alignSelf='center' mx={2}>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            onClick={() =>
              setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))
            }
            isDisabled={currentPage === totalPages}
            ml={2}
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </VStack>
  );
};

interface ImportingNotificationProps {
  currentImportTask: ImportTask;
}

const ImportingNotification = ({
  currentImportTask,
}: ImportingNotificationProps) => {
  console.log('currentImportTask: ', currentImportTask);
  return (
    <VStack spacing={4}>
      <Text>Importing data from {currentImportTask.file_name}...</Text>
      <Progress value={currentImportTask.progress} width='100%' />
      <Text>{currentImportTask.progress}% complete</Text>
      <Text>
        {currentImportTask.processed_rows} / {currentImportTask.total_rows} rows
        processed
      </Text>
    </VStack>
  );
};

export { ImportHistory, ImportingNotification };

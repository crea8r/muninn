import React, { useState, useRef, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  VStack,
  Text,
  Box,
  Input,
  Flex,
  IconButton,
  Select,
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import { ObjectType } from '../types/Object';

// Mock data for ObjectTypes
const mockObjectTypes: ObjectType[] = [
  {
    id: '1',
    name: 'Person',
    fields: {
      name: 'string',
      age: 'number',
      email: 'string',
    },
    icon: 'file',
  },
  {
    id: '2',
    name: 'Company',
    fields: {
      name: 'string',
      industry: 'string',
      employees: 'number',
    },
    icon: 'file',
  },
  {
    id: '3',
    name: 'Project',
    fields: {
      title: 'string',
      description: 'string',
      startDate: 'date',
      budget: 'number',
    },
    icon: 'file',
  },
];

interface ImporterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImporterDialog: React.FC<ImporterDialogProps> = ({ isOpen, onClose }) => {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [selectedObjectTypes, setSelectedObjectTypes] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').map((row) => row.split(','));
        setCsvData(rows);
      };
      reader.readAsText(file);
    }
  };

  const handleObjectTypeToggle = (objectTypeId: string) => {
    setSelectedObjectTypes((prev) =>
      prev.includes(objectTypeId)
        ? prev.filter((id) => id !== objectTypeId)
        : [...prev, objectTypeId]
    );
  };

  const handleImport = () => {
    // TODO: Implement the actual import logic here
    console.log('Importing data for object types:', selectedObjectTypes);
    console.log('CSV Data:', csvData);
    onClose();
  };

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = csvData.slice(1); // Exclude header row
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        row.some((cell) =>
          cell.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (sortColumn !== null) {
      filtered.sort((a, b) => {
        if (a[sortColumn] < b[sortColumn])
          return sortDirection === 'asc' ? -1 : 1;
        if (a[sortColumn] > b[sortColumn])
          return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [csvData, searchTerm, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='6xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Import CSV</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            <Flex alignItems='center'>
              <Button
                as='label'
                htmlFor='file-upload'
                colorScheme='blue'
                cursor='pointer'
              >
                Choose File
              </Button>
              <Input
                id='file-upload'
                type='file'
                accept='.csv'
                onChange={handleFileChange}
                ref={fileInputRef}
                display='none'
              />
              {fileName && (
                <Text ml={4}>
                  {fileName} ({csvData.length - 1} rows)
                </Text>
              )}
            </Flex>
            {csvData.length > 0 && (
              <Box>
                <Flex mb={4}>
                  <Input
                    placeholder='Search...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    width='100%'
                  />
                  <IconButton
                    aria-label='Search'
                    icon={<SearchIcon />}
                    ml={2}
                    onClick={() => {}} // Add search functionality if needed
                  />
                </Flex>
                <Box overflowX='auto'>
                  <Table variant='simple' size='sm'>
                    <Thead>
                      <Tr>
                        {csvData[0].map((header, index) => (
                          <Th
                            key={index}
                            onClick={() => handleSort(index)}
                            cursor='pointer'
                          >
                            <Flex alignItems='center'>
                              {header}
                              {sortColumn === index &&
                                (sortDirection === 'asc' ? (
                                  <ChevronUpIcon ml={1} />
                                ) : (
                                  <ChevronDownIcon ml={1} />
                                ))}
                            </Flex>
                          </Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paginatedData.map((row, rowIndex) => (
                        <Tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <Td key={cellIndex}>{cell}</Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                <Flex justifyContent='space-between' alignItems='center' mt={4}>
                  <Select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    width='auto'
                  >
                    <option value='5'>5 per page</option>
                    <option value='10'>10 per page</option>
                    <option value='25'>25 per page</option>
                  </Select>
                  <Flex>
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
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
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      isDisabled={currentPage === totalPages}
                      ml={2}
                    >
                      Next
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            )}
            <Text fontWeight='bold'>Select Object Types:</Text>
            {mockObjectTypes.map((objectType) => (
              <Checkbox
                key={objectType.id}
                isChecked={selectedObjectTypes.includes(objectType.id)}
                onChange={() => handleObjectTypeToggle(objectType.id)}
              >
                {objectType.name}
                <Text fontSize='sm' color='gray.500'>
                  Fields:{' '}
                  {Object.entries(objectType.fields)
                    .map(([key, value]) => `${key} (${value})`)
                    .join(', ')}
                </Text>
              </Checkbox>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme='blue'
            mr={3}
            onClick={handleImport}
            isDisabled={
              selectedObjectTypes.length === 0 || csvData.length === 0
            }
          >
            Import
          </Button>
          <Button variant='ghost' onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ImporterDialog;

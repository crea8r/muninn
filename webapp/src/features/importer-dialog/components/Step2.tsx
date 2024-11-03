import React, { useState, useCallback } from 'react';
import {
  VStack,
  Text,
  Divider,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Box,
  Alert,
  AlertIcon,
  Badge,
  HStack,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import Papa from 'papaparse';
import { shortenText } from 'src/utils';

interface Step2Props {
  handleFileChange: (data: string[][], filename: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  fileName: string;
  csvData: string[][];
}

interface FilePreview {
  data: string[][];
  delimiter: string;
  encoding: string;
  hasHeader: boolean;
}

const COMMON_DELIMITERS = [
  { value: ',', label: 'Comma (,)' },
  { value: ';', label: 'Semicolon (;)' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: 'Pipe (|)' },
];

const ENCODINGS = [
  { value: 'UTF-8', label: 'UTF-8' },
  { value: 'ISO-8859-1', label: 'ISO-8859-1' },
  { value: 'ASCII', label: 'ASCII' },
];

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

const Step2: React.FC<Step2Props> = ({
  handleFileChange,
  fileInputRef,
  fileName,
  csvData,
}) => {
  const [filePreview, setFilePreview] = useState<FilePreview>({
    data: [],
    delimiter: ',',
    encoding: 'UTF-8',
    hasHeader: true,
  });
  const [parsingError, setParsingError] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalRows, setTotalRows] = useState(0);

  const analyzeFile = useCallback(
    (file: File) => {
      setIsAnalyzing(true);
      setParsingError('');
      setCurrentPage(1);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const decoder = new TextDecoder('UTF-8');
        let text = decoder.decode(buffer);

        // Try to auto-detect delimiter
        const firstLines = text.split('\n').slice(0, 5).join('\n');
        const delimiters = [',', ';', '\t', '|'];
        let bestDelimiter = ',';
        let maxColumns = 0;

        delimiters.forEach((delimiter) => {
          const columns = firstLines.split('\n')[0].split(delimiter).length;
          if (columns > maxColumns) {
            maxColumns = columns;
            bestDelimiter = delimiter;
          }
        });

        Papa.parse(text, {
          delimiter: bestDelimiter,
          complete: (results) => {
            setFilePreview({
              data: results.data as string[][],
              delimiter: bestDelimiter,
              encoding: 'UTF-8',
              hasHeader: true,
            });
            setTotalRows((results.data as string[][]).length - 1); // Subtract header row
            handleFileChange(results.data as string[][], file.name);
            setIsAnalyzing(false);
          },
          error: (error: any) => {
            setParsingError(error.message);
            setIsAnalyzing(false);
          },
        });
      };

      reader.readAsArrayBuffer(file);
    },
    [handleFileChange]
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeFile(file);
    }
  };

  const handleSettingsChange = async (
    setting: 'delimiter' | 'encoding' | 'hasHeader',
    value: string | boolean
  ) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const newSettings = { ...filePreview, [setting]: value };
    setFilePreview(newSettings);
    setCurrentPage(1);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      Papa.parse(text, {
        delimiter: newSettings.delimiter,
        encoding: newSettings.encoding,
        complete: (results) => {
          setFilePreview({
            ...newSettings,
            data: results.data as string[][],
          });
          setTotalRows((results.data as string[][]).length - 1);
          handleFileChange(results.data as string[][], file.name);
        },
        error: (error: any) => {
          setParsingError(error.message);
        },
      });
    };
    reader.readAsText(file, newSettings.encoding);
  };

  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex =
    (currentPage - 1) * rowsPerPage + (filePreview.hasHeader ? 1 : 0);
  const endIndex = Math.min(startIndex + rowsPerPage, filePreview.data.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const getPreviewRows = () => {
    if (filePreview.data.length === 0) return [];
    return filePreview.data.slice(startIndex, endIndex);
  };

  return (
    <VStack spacing={4} align='stretch'>
      <HStack>
        <Text fontWeight='bold'>Step 2: Upload CSV File</Text>
        {fileName && (
          <Badge colorScheme='blue' title={fileName}>
            {shortenText(fileName, 30)}
          </Badge>
        )}
      </HStack>
      <Divider />

      <Button
        as='label'
        htmlFor='file-upload'
        colorScheme='blue'
        cursor='pointer'
        isLoading={isAnalyzing}
      >
        Choose File
      </Button>
      <Input
        id='file-upload'
        type='file'
        accept='.csv'
        onChange={handleFileSelect}
        ref={fileInputRef}
        display='none'
      />

      {parsingError && (
        <Alert status='error'>
          <AlertIcon />
          {parsingError}
        </Alert>
      )}

      {filePreview.data.length > 0 && (
        <VStack spacing={4} align='stretch'>
          <HStack spacing={4}>
            <Box flex={1}>
              <Text fontWeight='bold' mb={1}>
                Delimiter
              </Text>
              <Select
                value={filePreview.delimiter}
                onChange={(e) =>
                  handleSettingsChange('delimiter', e.target.value)
                }
              >
                {COMMON_DELIMITERS.map((delimiter) => (
                  <option key={delimiter.value} value={delimiter.value}>
                    {delimiter.label}
                  </option>
                ))}
              </Select>
            </Box>
            <Box flex={1}>
              <Text fontWeight='bold' mb={1}>
                Encoding
              </Text>
              <Select
                value={filePreview.encoding}
                onChange={(e) =>
                  handleSettingsChange('encoding', e.target.value)
                }
              >
                {ENCODINGS.map((encoding) => (
                  <option key={encoding.value} value={encoding.value}>
                    {encoding.label}
                  </option>
                ))}
              </Select>
            </Box>
            <Box flex={1}>
              <Text fontWeight='bold' mb={1}>
                First Row is Header
              </Text>
              <Select
                value={filePreview.hasHeader ? 'true' : 'false'}
                onChange={(e) =>
                  handleSettingsChange('hasHeader', e.target.value === 'true')
                }
              >
                <option value='true'>Yes</option>
                <option value='false'>No</option>
              </Select>
            </Box>
          </HStack>

          <Box>
            <Flex justifyContent='space-between' alignItems='center' mb={2}>
              <Text fontWeight='bold'>Preview:</Text>
              <HStack spacing={2}>
                <Text fontSize='sm'>Rows per page:</Text>
                <Select
                  size='sm'
                  width='auto'
                  value={rowsPerPage}
                  onChange={(e) =>
                    handleRowsPerPageChange(Number(e.target.value))
                  }
                >
                  {ROWS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </HStack>
            </Flex>
            <Box overflowX='auto'>
              <Table size='sm' variant='simple'>
                <Thead>
                  <Tr>
                    {filePreview.data[0]?.map((header, index) => (
                      <Th key={index} title={header}>
                        {shortenText(header, 5)}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {getPreviewRows().map((row, rowIndex) => (
                    <Tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <Td key={cellIndex} title={cell}>
                          {shortenText(cell, 10)}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <Flex justifyContent='space-between' alignItems='center' mt={4}>
              <Text fontSize='sm'>
                Showing rows {startIndex} to {endIndex - 1} of {totalRows}
              </Text>
              <HStack spacing={2}>
                <Button
                  size='sm'
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                >
                  Previous
                </Button>
                <NumberInput
                  size='sm'
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(_, value) => handlePageChange(value)}
                  maxW={20}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize='sm'>of {totalPages}</Text>
                <Button
                  size='sm'
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          </Box>
        </VStack>
      )}

      {fileName && <Text color='gray.500'>Total rows: {totalRows}</Text>}
    </VStack>
  );
};

export default Step2;

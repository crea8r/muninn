import React, { useState, useMemo } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Button,
  HStack,
  Box,
  Text,
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

interface ComplexFilterTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
}

function ComplexFilterTable<T extends { id: number | string }>({
  data,
  columns,
  itemsPerPage = 10,
}: ComplexFilterTableProps<T>) {
  const [filters, setFilters] = useState<Partial<Record<keyof T, string>>>({});
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = String(item[key as keyof T]).toLowerCase();
        return itemValue.includes(value.toLowerCase());
      })
    );
  }, [data, filters]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn])
        return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn])
        return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const pageCount = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (column: keyof T) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (column: keyof T, value: string) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
    setCurrentPage(1);
  };

  return (
    <Box>
      <Table variant='simple'>
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={String(column.key)}>
                <Box>
                  <HStack justify='space-between'>
                    <Text>{column.header}</Text>
                    {column.sortable && (
                      <Button size='xs' onClick={() => handleSort(column.key)}>
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          )
                        ) : (
                          <ChevronUpIcon opacity={0.3} />
                        )}
                      </Button>
                    )}
                  </HStack>
                  {column.filterable && (
                    <Input
                      size='sm'
                      placeholder={`Filter ${column.header}`}
                      value={filters[column.key] || ''}
                      onChange={(e) =>
                        handleFilterChange(column.key, e.target.value)
                      }
                      mt={2}
                    />
                  )}
                </Box>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {paginatedData.map((item) => (
            <Tr key={item.id}>
              {columns.map((column) => (
                <Td key={String(column.key)}>
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key])}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <HStack justify='space-between' mt={4}>
        <Text>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, sortedData.length)} of{' '}
          {sortedData.length} results
        </Text>
        <HStack>
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          <Select
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
          >
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                Page {page}
              </option>
            ))}
          </Select>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, pageCount))
            }
            isDisabled={currentPage === pageCount}
          >
            Next
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
}

export default ComplexFilterTable;

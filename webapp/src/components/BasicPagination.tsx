// components/results-panel/Pagination.tsx
import React from 'react';
import { HStack, Button, Text, Select } from '@chakra-ui/react';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export const BasicPagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <HStack spacing={4} justify='space-between'>
      <HStack spacing={2}>
        <Button
          size='sm'
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage <= 1}
        >
          Previous
        </Button>
        <Text
          display={{
            base: 'none',
            md: 'block',
          }}
        >
          {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
        </Text>
        <Button
          size='sm'
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </HStack>

      <HStack spacing={2}>
        <Text fontSize='sm'>Items per page:</Text>
        <Select
          size='sm'
          width='70px'
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value='10'>10</option>
          <option value='20'>20</option>
          <option value='50'>50</option>
          <option value='100'>100</option>
        </Select>
      </HStack>
    </HStack>
  );
};

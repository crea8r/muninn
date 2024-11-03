// components/results-panel/Pagination.tsx
import React from 'react';
import { HStack, Button, Text, Select } from '@chakra-ui/react';
import { useAdvancedFilter } from '../../contexts/AdvancedFilterContext';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalCount,
}) => {
  const { updateFilter } = useAdvancedFilter();
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    updateFilter({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateFilter({ pageSize: newSize, page: 1 });
  };

  return (
    <HStack spacing={4} justify='space-between'>
      <HStack spacing={2}>
        <Button
          size='sm'
          onClick={() => handlePageChange(currentPage - 1)}
          isDisabled={currentPage <= 1}
        >
          Previous
        </Button>
        <Text>
          Page {currentPage} of {totalPages}
        </Text>
        <Button
          size='sm'
          onClick={() => handlePageChange(currentPage + 1)}
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
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
        >
          <option value='10'>10</option>
          <option value='20'>20</option>
          <option value='50'>50</option>
        </Select>
      </HStack>
    </HStack>
  );
};

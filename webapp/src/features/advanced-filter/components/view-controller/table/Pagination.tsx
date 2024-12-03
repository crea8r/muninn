// components/results-panel/Pagination.tsx
import React from 'react';
import { useAdvancedFilter } from '../../../contexts/AdvancedFilterContext';
import { BasicPagination } from 'src/components/BasicPagination';

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

  const handlePageChange = (newPage: number) => {
    updateFilter({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateFilter({ pageSize: newSize, page: 1 });
  };

  return (
    <BasicPagination
      currentPage={currentPage}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
};

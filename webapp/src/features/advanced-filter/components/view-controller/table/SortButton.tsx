import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { VStack } from '@chakra-ui/react';
import { ColumnConfig } from 'src/features/advanced-filter/types/view-config';

const isSortedByColumn = (column: ColumnConfig, sortBy: string) => {
  if (!column.sortable) return false;
  if (!column.objectTypeId) {
    // standard column
    return column.field === sortBy;
  } else {
    // type value column
    return sortBy === `type_value:${column.objectTypeId}:${column.field}`;
  }
};

interface SortButtonProps {
  column: ColumnConfig;
  sortBy: string;
  sortTypeValueField: string;
  sortDirection: 'asc' | 'desc';
  sort: (field: string, ascending: boolean, objectTypeId?: string) => void;
}

export const SortButton = ({
  sortBy,
  sortTypeValueField,
  sortDirection,
  column,
  sort,
}: SortButtonProps) => {
  const sortedByThisColumn = isSortedByColumn(column, sortBy);
  const handleSort = (asc: boolean) => {
    console.log('handle sort: ', column);
    console.log('sortTypeValueField: ', sortTypeValueField);
    sort(column.field, asc, column.objectTypeId);
  };
  return !sortedByThisColumn ? (
    <VStack color={'gray.300'} spacing={0} ml={1}>
      <TriangleUpIcon cursor={'pointer'} onClick={() => handleSort(true)} />
      <TriangleDownIcon cursor={'pointer'} onClick={() => handleSort(false)} />
    </VStack>
  ) : (
    <VStack color={'gray.300'} spacing={0} ml={1}>
      <TriangleUpIcon
        cursor={'pointer'}
        style={sortDirection === 'asc' ? { color: 'black' } : {}}
        onClick={() => {
          handleSort(true);
        }}
      />
      <TriangleDownIcon
        cursor={'pointer'}
        style={sortDirection === 'desc' ? { color: 'black' } : {}}
        onClick={() => {
          handleSort(false);
        }}
      />
    </VStack>
  );
};

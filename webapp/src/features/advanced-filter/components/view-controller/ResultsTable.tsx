// components/view-controller/ResultsTable.tsx
import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Skeleton,
  Tag as ChkTag,
} from '@chakra-ui/react';
import { ColumnConfig } from '../../types/view-config';
import { useResizeColumns } from '../../hooks/useResizeColumns';
import { Pagination } from './Pagination';
import { useAdvancedFilter } from '../../contexts/AdvancedFilterContext';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { Tag, ObjectType } from 'src/types';

interface ResultsTableProps {
  data: any[];
  totalCount: number;
  columns: ColumnConfig[];
  isLoading: boolean;
  density: 'comfortable' | 'compact';
  onColumnResize: (field: string, width: number, objectTypeId?: string) => void;
}

const getCellValue = (
  item: any,
  column: ColumnConfig,
  {
    tags,
    typeValues,
  }: {
    tags: Tag[];
    typeValues: ObjectType[];
  }
) => {
  if (column.objectTypeId) {
    const typeValues = item.type_values?.find(
      (tv: any) => tv.objectTypeId === column.objectTypeId
    );
    return typeValues?.type_values[column.field];
  }
  if (column.field === 'tags') {
    // render all tags
    return (
      <Box
        display={'flex'}
        flexWrap={'wrap'}
        gap={1}
        maxHeight={'150px'}
        overflowY={'auto'}
      >
        {item.tags?.map((item: any) => {
          const tag = tags.find((t) => t.id === item.id);
          return tag ? (
            <ChkTag
              key={tag.id}
              color={tag.color_schema.text}
              bgColor={tag.color_schema.background}
            >
              {tag.name}
            </ChkTag>
          ) : null;
        })}
      </Box>
    );
  }
  if (column.field === 'type_values') {
    // render all type values
    return (
      <Box
        display={'flex'}
        flexWrap={'wrap'}
        gap={1}
        maxHeight={'150px'}
        overflowY={'auto'}
      >
        {item.type_values?.map((item: any) => {
          const typeValue = typeValues.find((t) => t.id === item.objectTypeId);
          return typeValue ? (
            <ChkTag
              key={typeValue.id}
              title={window.Object.keys(item.type_values).join(', ')}
            >
              {typeValue.name}
            </ChkTag>
          ) : null;
        })}
      </Box>
    );
  }
  return item[column.field];
};

const formatValue = (value: any, column: ColumnConfig) => {
  if (!value) return '';

  switch (column.formatType) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'number':
      return Number(value).toLocaleString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'react.element':
      return value;
    default:
      return value.toString();
  }
};

export const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  columns,
  isLoading,
  density,
  onColumnResize,
  totalCount,
}) => {
  const { getResizeProps, columnWidths } = useResizeColumns({
    columns,
    onColumnResize,
  });
  const { filterConfig } = useAdvancedFilter();
  const { page = 1, pageSize = 10 } = filterConfig;
  const { globalData } = useGlobalContext();
  const tags = globalData?.tagData?.tags || [];
  const typeValues = globalData?.objectTypeData?.objectTypes || [];

  return (
    <Box overflowX='auto'>
      <Table size={density === 'compact' ? 'sm' : 'md'} variant='simple'>
        <Thead>
          <Tr>
            {columns.map((column, index) => (
              <Th
                key={`${column.objectTypeId || ''}:${column.field}`}
                width={columnWidths[index]}
                position='relative'
              >
                <Box display='flex' alignItems='center'>
                  {/* <Text>{getColumnLabel(column)}</Text> */}
                  <Text>{column.field}</Text>
                  <Box
                    position='absolute'
                    right={0}
                    top={0}
                    bottom={0}
                    width='4px'
                    cursor='col-resize'
                    {...getResizeProps(index)}
                  />
                </Box>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {isLoading ? (
            // Loading state
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <Tr key={rowIndex}>
                {columns?.map((column, colIndex) => (
                  <Td key={`${column.objectTypeId || ''}:${column.field}`}>
                    <Skeleton height='20px' />
                  </Td>
                ))}
              </Tr>
            ))
          ) : !data || data?.length === 0 ? (
            // Empty state
            <Tr>
              <Td colSpan={columns.length} textAlign='center' py={8}>
                No data available
              </Td>
            </Tr>
          ) : (
            // Data rows
            data?.map((item, rowIndex) => (
              <Tr key={item.id || rowIndex}>
                {columns.map((column) => (
                  <Td
                    key={`${column.objectTypeId || ''}:${column.field}`}
                    maxWidth={column.width}
                    overflow='hidden'
                    textOverflow='ellipsis'
                    whiteSpace='nowrap'
                  >
                    {formatValue(
                      getCellValue(item, column, { tags, typeValues }),
                      column
                    )}
                  </Td>
                ))}
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
      <Box p={2}>
        <Pagination
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
        />
      </Box>
    </Box>
  );
};

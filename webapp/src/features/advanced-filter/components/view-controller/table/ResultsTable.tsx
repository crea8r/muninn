// components/view-controller/ResultsTable.tsx
import React, { useCallback, useMemo, useState } from 'react';
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
  Checkbox,
} from '@chakra-ui/react';
import { ColumnConfig } from '../../../types/view-config';
import { useResizeColumns } from '../../../hooks/useResizeColumns';
import { Pagination } from './Pagination';
import { useAdvancedFilter } from '../../../contexts/AdvancedFilterContext';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { Tag, ObjectType } from 'src/types';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';
import { ActionBar } from './ActionBar';
import { SortButton } from './SortButton';
import { createExportCsvAction } from 'src/features/advanced-filter/actions/export-csv';
import { createAddTagAction } from 'src/features/advanced-filter/actions/add-tag';
import { createAddToFunnelAction } from 'src/features/advanced-filter/actions/add-to-funnel';
import { Link } from 'react-router-dom';
import { createMergeObjectsAction } from 'src/features/advanced-filter/actions/merge-objects';
import { SmartObjectTypeValue } from 'src/features/smart-object-type';

interface ResultsTableProps {
  data: any[];
  selectedItems: any[];
  setSelectedItems: (items: any) => void;
  totalCount: number;
  columns: ColumnConfig[];
  isLoading: boolean;
  density: 'comfortable' | 'compact';
  onColumnResize: (field: string, width: number, objectTypeId?: string) => void;
  onRefresh: () => void;
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
    const itemTypeValues = item.type_values?.find(
      (tv: any) => tv.objectTypeId === column.objectTypeId
    );
    let dataType =
      typeValues.find((t) => t.id === column.objectTypeId).fields[
        column.field
      ] || 'string';
    dataType = typeof dataType === 'string' ? dataType : dataType.type;
    return (
      <SmartObjectTypeValue
        field={column.field}
        config={{
          type: dataType,
        }}
        value={itemTypeValues?.type_values[column.field]}
      />
    );
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
              variant={'outline'}
              colorScheme={'blue'}
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
  if (column.objectTypeId) {
    return value;
  }
  switch (column.formatType) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'number':
      return Number(value).toLocaleString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'react.element':
      return value;
    case 'md':
      return <MarkdownDisplay content={value} />;
    default:
      return value.toString();
  }
};

export const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  selectedItems,
  setSelectedItems,
  columns,
  isLoading,
  density,
  onColumnResize,
  totalCount,
  onRefresh,
}) => {
  const { getResizeProps, columnWidths } = useResizeColumns({
    columns,
    onColumnResize,
  });
  const { filterConfig, updateFilter } = useAdvancedFilter();
  const { page = 1, pageSize = 10 } = filterConfig;
  const { globalData } = useGlobalContext();

  const [selectAll, setSelectAll] = useState(false);

  const tags = globalData?.tagData?.tags || [];
  const typeValues = useMemo(
    () => globalData?.objectTypeData?.objectTypes || [],
    [globalData]
  );
  const sortDirection = filterConfig.ascending ? 'asc' : 'desc';
  let sortBy = filterConfig?.sortBy || 'created_at';
  const sortTypeValueField = filterConfig?.type_value_field || '';

  const getColumnLabel = useCallback(
    (column: ColumnConfig) => {
      if (column.objectTypeId) {
        const typeValue = typeValues.find((t) => t.id === column.objectTypeId);
        return typeValue ? `${typeValue.name}:${column.field}` : column.field;
      }
      return column.label || column.field;
    },
    [typeValues]
  );

  const sort = (field: string, ascending: boolean, objectTypeId?: string) => {
    const updates = {
      type_value_field: objectTypeId ? field : undefined,
      sortBy: objectTypeId ? `type_value:${objectTypeId}:${field}` : field,
      ascending,
    };
    updateFilter({
      ...filterConfig,
      ...updates,
    });
  };

  // select data
  const selectedCount = useMemo(() => selectedItems.length, [selectedItems]);

  const isAllSelected = useMemo(
    () => data && data.length > 0 && selectedCount === data.length,
    [data, selectedCount]
  );

  const isIndeterminate = useMemo(
    () => selectedCount > 0 && data && selectedCount < data.length,
    [data, selectedCount]
  );

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      const newSelected = [
        ...data.filter(
          (item) => !selectedItems.map((i) => i.id).includes(item.id)
        ),
        ...selectedItems,
      ];
      setSelectedItems(newSelected);
      setSelectAll(true);
    }
  }, [data, isAllSelected, selectedItems, setSelectedItems]);

  const handleSelectItem = useCallback(
    (id: string) => {
      const newSelected = [...selectedItems];
      // if item is already selected, remove it
      if (newSelected.filter((item) => item.id === id).length > 0) {
        newSelected.splice(
          newSelected.findIndex((item) => item.id === id),
          1
        );
      } else {
        newSelected.push(data.find((item) => item.id === id));
      }
      setSelectedItems(newSelected);
    },
    [data, selectedItems, setSelectedItems]
  );

  const actions = useMemo(
    () => [
      createExportCsvAction({ columns, getColumnLabel }),
      createAddTagAction(() => {
        setSelectedItems([]);
        onRefresh();
      }),
      createAddToFunnelAction(() => {
        setSelectedItems([]);
        onRefresh();
      }),
      createMergeObjectsAction(() => {
        setSelectedItems([]);
        onRefresh();
      }),
      // ... other actions
    ],
    [columns, getColumnLabel, onRefresh, setSelectedItems]
  );

  return (
    <Box>
      {selectedCount > 0 ? (
        <ActionBar
          selectedCount={selectedCount}
          totalCount={totalCount}
          isSelectedAll={selectAll}
          actions={actions}
          selectedData={selectedItems}
          onClose={() => setSelectedItems([])}
        />
      ) : null}
      <Box overflowX='auto'>
        <Table size={density === 'compact' ? 'sm' : 'md'} variant='simple'>
          <Thead>
            <Tr>
              <Th px={2} width='24px' zIndex={100}>
                <Checkbox
                  isChecked={isAllSelected}
                  isIndeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                />
              </Th>
              {columns.map((column, index) => (
                <Th
                  key={`${column.objectTypeId || ''}:${column.field}`}
                  width={columnWidths[index]}
                  position='relative'
                  textTransform={'capitalize'}
                >
                  <Box
                    display='flex'
                    alignItems='center'
                    alignContent={'space-between'}
                    whiteSpace={'nowrap'}
                    overflow={'ellipsis'}
                  >
                    {column.sortable && (
                      <SortButton
                        column={column}
                        sortBy={sortBy}
                        sortTypeValueField={sortTypeValueField}
                        sortDirection={sortDirection}
                        sort={sort}
                      />
                    )}
                    <Text ml={1} fontSize={'small'}>
                      {getColumnLabel(column)}
                    </Text>
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
                <Tr
                  key={item.id || rowIndex}
                  _hover={{
                    background: 'gray.100',
                  }}
                >
                  <Td px={2}>
                    <Checkbox
                      isChecked={
                        selectedItems.findIndex((i) => i.id === item.id) > -1
                      }
                      onChange={() => handleSelectItem(item.id)}
                    />
                  </Td>
                  {columns.map((column, i) => (
                    <Td
                      key={`${column.objectTypeId || ''}:${column.field}`}
                      maxWidth={column.width}
                      overflow='hidden'
                      textOverflow='ellipsis'
                      whiteSpace='nowrap'
                    >
                      {i === 0 ? (
                        <Link
                          to={`/objects/${item.id}`}
                          style={{
                            textDecoration: 'underline',
                          }}
                          color={'blue.500'}
                        >
                          {formatValue(
                            getCellValue(item, column, { tags, typeValues }),
                            column
                          )}
                        </Link>
                      ) : (
                        formatValue(
                          getCellValue(item, column, { tags, typeValues }),
                          column
                        )
                      )}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
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

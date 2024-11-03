// components/view-controller/ColumnManager.tsx
import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
  Checkbox,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
} from '@chakra-ui/react';
import { DragHandleIcon, AddIcon, CloseIcon } from '@chakra-ui/icons';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { ColumnConfig } from '../../types/view-config';
import { STANDARD_COLUMNS } from '../../constants/default-columns';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { StandardColumn, TypeValueColumn } from '../../types/column-config';
import { ObjectType } from 'src/types';
import { useAdvancedFilter } from '../../contexts/AdvancedFilterContext';

interface ColumnManagerProps {
  columns: ColumnConfig[];
  visibleColumns: ColumnConfig[];
  restrictions: {
    restrictedColumns: string[];
    requiredColumns: string[];
  };
  onToggleColumn: (
    field: string,
    visible: boolean,
    objectTypeId?: string
  ) => void;
  onReorderColumns: (startIndex: number, endIndex: number) => void;
  onRemoveColumn: (field: string, objectTypeId?: string) => void;
  onUpdateWidth: (field: string, width: number, objectTypeId?: string) => void;
  onAddColumn: (column: StandardColumn | TypeValueColumn) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({
  columns,
  visibleColumns,
  restrictions,
  onToggleColumn,
  onReorderColumns,
  onRemoveColumn,
  onUpdateWidth,
  onAddColumn,
}) => {
  const { globalData } = useGlobalContext();
  const objectTypes = globalData?.objectTypeData?.objectTypes || [];
  const { filterConfig } = useAdvancedFilter();
  const filteredTypeIds = filterConfig?.typeIds || [];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Don't allow reordering of restricted columns
    if (
      restrictions.restrictedColumns.includes(visibleColumns[sourceIndex].field)
    ) {
      return;
    }

    onReorderColumns(sourceIndex, destinationIndex);
  };

  const getColumnLabel = (column: ColumnConfig) => {
    if (column.objectTypeId) {
      const objectType = objectTypes.find((t) => t.id === column.objectTypeId);
      return `${objectType?.name || 'Unknown Type'}: ${column.field}`;
    }
    return (
      STANDARD_COLUMNS.find((sc) => sc.field === column.field)?.label ||
      column.field
    );
  };

  const handleStandardColumnAdd = (column: StandardColumn) => {
    onAddColumn({
      ...column,
      // visible: true,
    });
  };

  const handleTypeValueColumnAdd = (objectType: ObjectType, field: string) => {
    onAddColumn({
      field,
      objectTypeId: objectType.id,
      label: `${objectType.name}: ${field}`,
      width: 150, // Default width
      // visible: true,
      sortable: true,
      defaultVisible: true,
      typeFieldKey: field,
    });
  };

  return (
    <VStack spacing={4} align='stretch'>
      <HStack justify='space-between'>
        <Text fontSize='sm' fontWeight='medium'>
          Columns
        </Text>
        <Menu closeOnSelect={true}>
          <MenuButton as={Button} size='sm' leftIcon={<AddIcon />}>
            Add Column
          </MenuButton>
          <MenuList maxHeight='350px' overflow='auto'>
            <MenuGroup title='Standard Columns'>
              {STANDARD_COLUMNS.map((col) => {
                const isDisabled = visibleColumns.some(
                  (vc) => vc.field === col.field
                );
                return (
                  <MenuItem
                    key={col.field}
                    onClick={() => handleStandardColumnAdd(col)}
                    isDisabled={isDisabled}
                  >
                    <HStack justify='space-between' width='100%'>
                      <Text>{col.label}</Text>
                      {isDisabled && (
                        <Text fontSize='xs' color='gray.500'>
                          (Added)
                        </Text>
                      )}
                    </HStack>
                  </MenuItem>
                );
              })}
            </MenuGroup>
            <MenuDivider />
            {objectTypes
              .filter((o: ObjectType) => filteredTypeIds.includes(o.id))
              .map((type: ObjectType) => (
                <MenuGroup key={type.id} title={type.name}>
                  {Object.keys(type.fields).map((field) => {
                    const isDisabled = visibleColumns.some(
                      (vc) => vc.field === field && vc.objectTypeId === type.id
                    );
                    return (
                      <MenuItem
                        key={`${type.id}:${field}`}
                        onClick={() => handleTypeValueColumnAdd(type, field)}
                        isDisabled={isDisabled}
                      >
                        <HStack justify='space-between' width='100%'>
                          <Text>{field}</Text>
                          {isDisabled && (
                            <Text fontSize='xs' color='gray.500'>
                              (Added)
                            </Text>
                          )}
                        </HStack>
                      </MenuItem>
                    );
                  })}
                </MenuGroup>
              ))}
          </MenuList>
        </Menu>
      </HStack>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId='column-list'>
          {(provided, snapshot) => (
            <VStack
              ref={provided.innerRef}
              {...provided.droppableProps}
              spacing={2}
              align='stretch'
              bg={snapshot.isDraggingOver ? 'gray.50' : undefined}
              borderRadius='md'
              minH='100px'
            >
              {visibleColumns.map((column, index) => (
                <Draggable
                  key={`${column.objectTypeId || ''}:${column.field}`}
                  draggableId={`${column.objectTypeId || ''}:${column.field}`}
                  index={index}
                  isDragDisabled={restrictions.restrictedColumns.includes(
                    column.field
                  )}
                >
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      bg={snapshot.isDragging ? 'blue.50' : 'white'}
                      borderWidth={1}
                      borderColor={
                        snapshot.isDragging ? 'blue.200' : 'gray.200'
                      }
                      borderRadius='md'
                      p={2}
                      boxShadow={snapshot.isDragging ? 'md' : undefined}
                      _hover={{ borderColor: 'blue.200' }}
                    >
                      <HStack spacing={2} justify='space-between'>
                        <HStack flex={1} minW={0}>
                          <Box
                            {...provided.dragHandleProps}
                            color='gray.400'
                            _hover={{ color: 'blue.500' }}
                            cursor={
                              restrictions.restrictedColumns.includes(
                                column.field
                              )
                                ? 'not-allowed'
                                : 'grab'
                            }
                          >
                            <DragHandleIcon />
                          </Box>
                          <Box flex={1} minW={0}>
                            <Checkbox
                              isChecked={column.visible}
                              onChange={(e) =>
                                onToggleColumn(
                                  column.field,
                                  e.target.checked,
                                  column.objectTypeId
                                )
                              }
                              isDisabled={restrictions.requiredColumns.includes(
                                column.field
                              )}
                            >
                              <Text isTruncated>{getColumnLabel(column)}</Text>
                            </Checkbox>
                          </Box>
                        </HStack>
                        {!restrictions.requiredColumns.includes(
                          column.field
                        ) && (
                          <IconButton
                            aria-label='Remove column'
                            size='sm'
                            variant='ghost'
                            colorScheme='red'
                            icon={<CloseIcon />}
                            onClick={() =>
                              onRemoveColumn(column.field, column.objectTypeId)
                            }
                          />
                        )}
                      </HStack>
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {visibleColumns.length === 0 && (
                <Box
                  p={4}
                  textAlign='center'
                  color='gray.500'
                  borderWidth={1}
                  borderStyle='dashed'
                  borderRadius='md'
                >
                  No columns selected
                </Box>
              )}
            </VStack>
          )}
        </Droppable>
      </DragDropContext>
    </VStack>
  );
};

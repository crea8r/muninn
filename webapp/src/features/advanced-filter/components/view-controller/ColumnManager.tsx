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
import { ColumnConfig } from '../../types/view-config';
import { STANDARD_COLUMNS } from '../../constants/default-columns';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { StandardColumn, TypeValueColumn } from '../../types/column-config';
import { ObjectType } from 'src/types';
import { useAdvancedFilter } from '../../contexts/AdvancedFilterContext';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';

// Sortable item component
const SortableItem = ({
  column,
  isRestricted,
  isRequired,
  onToggle,
  onRemove,
  getLabel,
}: {
  column: ColumnConfig;
  isRestricted: boolean;
  isRequired: boolean;
  onToggle: (checked: boolean) => void;
  onRemove: () => void;
  getLabel: (column: ColumnConfig) => string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.objectTypeId
      ? `${column.objectTypeId}-${column.field}`
      : column.field,
    disabled: isRestricted,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      borderWidth='1px'
      borderRadius='md'
      borderColor={isDragging ? 'blue.300' : 'gray.200'}
      bg={isDragging ? 'blue.50' : 'white'}
      p={2}
      mb={2}
      _last={{ mb: 0 }}
      opacity={isDragging ? 0.8 : 1}
    >
      <HStack>
        <Box
          {...attributes}
          {...listeners}
          cursor={isRestricted ? 'not-allowed' : 'grab'}
          color={isRestricted ? 'gray.300' : 'gray.500'}
          _hover={!isRestricted ? { color: 'blue.500' } : undefined}
        >
          <DragHandleIcon />
        </Box>
        <Checkbox
          isChecked={column.visible}
          onChange={(e) => onToggle(e.target.checked)}
          isDisabled={isRequired}
          flex={1}
        >
          {getLabel(column)}
        </Checkbox>
        {!isRequired && (
          <IconButton
            aria-label='Remove column'
            icon={<CloseIcon />}
            size='xs'
            variant='ghost'
            colorScheme='red'
            onClick={onRemove}
          />
        )}
      </HStack>
    </Box>
  );
};

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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = visibleColumns.findIndex(
      (col) =>
        (col.objectTypeId ? `${col.objectTypeId}-${col.field}` : col.field) ===
        active.id
    );
    const newIndex = visibleColumns.findIndex(
      (col) =>
        (col.objectTypeId ? `${col.objectTypeId}-${col.field}` : col.field) ===
        over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderColumns(oldIndex, newIndex);
    }
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
      <Box
        borderWidth='1px'
        borderRadius='md'
        borderColor='gray.200'
        bg='white'
        p={2}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={visibleColumns.map((col) =>
              col.objectTypeId ? `${col.objectTypeId}-${col.field}` : col.field
            )}
            strategy={verticalListSortingStrategy}
          >
            {visibleColumns.map((column) => (
              <SortableItem
                key={
                  column.objectTypeId
                    ? `${column.objectTypeId}-${column.field}`
                    : column.field
                }
                column={column}
                isRestricted={
                  restrictions.restrictedColumns.includes(column.field) &&
                  column.objectTypeId === undefined
                }
                isRequired={
                  restrictions.requiredColumns.includes(column.field) &&
                  column.objectTypeId === undefined
                }
                onToggle={(checked) =>
                  onToggleColumn(column.field, checked, column.objectTypeId)
                }
                onRemove={() =>
                  onRemoveColumn(column.field, column.objectTypeId)
                }
                getLabel={getColumnLabel}
              />
            ))}
          </SortableContext>
        </DndContext>

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
      </Box>
    </VStack>
  );
};

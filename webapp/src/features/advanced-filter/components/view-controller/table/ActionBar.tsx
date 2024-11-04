// components/table/ActionBar.tsx
import React from 'react';
import {
  Box,
  HStack,
  Text,
  Button,
  Slide,
  useColorModeValue,
  Tooltip,
  CloseButton,
  Spacer,
} from '@chakra-ui/react';
import { TableAction } from '../../../types/table-actions';

interface ActionBarProps {
  selectedCount: number;
  totalCount: number;
  isSelectedAll: boolean;
  actions: TableAction[];
  selectedData: any[];
  onRefresh?: () => void;
  onClose: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  selectedCount,
  totalCount,
  isSelectedAll,
  actions,
  selectedData,
  onRefresh,
  onClose,
}) => {
  const actionBarBg = useColorModeValue('white', 'gray.800');
  const actionBarBorder = useColorModeValue('gray.200', 'gray.600');

  return (
    <>
      <Slide direction='top' in={selectedCount > 0} style={{ zIndex: 10 }}>
        <Box
          position='absolute'
          top={0}
          left={0}
          right={0}
          p={4}
          bg={actionBarBg}
          borderBottomWidth={1}
          borderColor={actionBarBorder}
          shadow='md'
          width={'100%'}
        >
          <HStack alignContent={'space-between'}>
            <HStack spacing={4}>
              <Text fontWeight='medium'>
                {/* TODO: build select all action */}
                {/* {isSelectedAll
                ? `All ${totalCount} items selected`
                : `${selectedCount} item${
                    selectedCount !== 1 ? 's' : ''
                  } selected`} */}
                {`${selectedCount} item${
                  selectedCount !== 1 ? 's' : ''
                } selected`}
              </Text>
              <HStack spacing={2}>
                {actions.map((action) => (
                  <Tooltip key={action.id} label={action.tooltip}>
                    <Button
                      size='sm'
                      leftIcon={action.icon}
                      onClick={() => action.onClick(selectedData)}
                      isDisabled={action.disabled}
                    >
                      {action.label}
                    </Button>
                  </Tooltip>
                ))}
              </HStack>
            </HStack>
            <Spacer />
            <CloseButton onClick={onClose} />
          </HStack>
        </Box>
      </Slide>
      {/* Render action dialogs */}
      {actions.map(
        (action) =>
          action.DialogComponent && (
            <action.DialogComponent key={action.id} onSuccess={onRefresh} />
          )
      )}
    </>
  );
};

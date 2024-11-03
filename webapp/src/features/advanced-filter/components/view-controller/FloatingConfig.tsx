// components/view-controller/FloatingConfig.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Divider,
  useOutsideClick,
} from '@chakra-ui/react';
import { DisplayDensity, ViewConfigBase } from '../../types/view-config';
import { ColumnManager } from './ColumnManager';
import { DensitySelector } from './DensitySelector';

interface Position {
  top: number;
  right: number;
}

const calculatePosition = (anchorEl: HTMLElement): Position => {
  const rect = anchorEl.getBoundingClientRect();
  const padding = 8; // Space between anchor and panel

  // Calculate initial position
  let position: Position = {
    top: rect.bottom + padding,
    right: window.innerWidth - rect.right,
  };

  // Adjust if panel would go off screen
  const panelHeight = 400; // Approximate height of panel
  const panelWidth = 320; // Width defined in component

  // Adjust vertical position if needed
  if (position.top + panelHeight > window.innerHeight) {
    position.top = Math.max(
      padding,
      window.innerHeight - panelHeight - padding
    );
  }

  // Adjust horizontal position if needed
  if (rect.right - panelWidth < padding) {
    position.right = window.innerWidth - (rect.left + rect.width + padding);
  }

  return position;
};

interface FloatingConfigProps {
  anchorEl: HTMLElement;
  onClose: () => void;
  config: ViewConfigBase;
  viewRestrictions: {
    allowCustomization: boolean;
    restrictedColumns: string[];
    requiredColumns: string[];
  };
  visibleColumns: any[];
  onToggleColumn: (field: string, visible: boolean) => void;
  onReorderColumns: (startIndex: number, endIndex: number) => void;
  onAddColumn: (column: any) => void;
  onRemoveColumn: (field: string, objectTypeId?: string) => void;
  onUpdateWidth: (field: string, width: number, objectTypeId?: string) => void;
  onReset: () => void;
  onDensityChange: (density: DisplayDensity) => void;
}

export const FloatingConfig: React.FC<FloatingConfigProps> = ({
  anchorEl,
  onClose,
  config,
  viewRestrictions,
  visibleColumns,
  onToggleColumn,
  onReorderColumns,
  onAddColumn,
  onRemoveColumn,
  onUpdateWidth,
  onReset,
  onDensityChange,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>(() =>
    calculatePosition(anchorEl)
  );

  useOutsideClick({
    ref: ref,
    handler: onClose,
  });

  // Update position when window resizes
  useEffect(() => {
    const handleResize = () => {
      setPosition(calculatePosition(anchorEl));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [anchorEl]);

  // Update position when anchor element position changes
  useEffect(() => {
    setPosition(calculatePosition(anchorEl));
  }, [anchorEl]);

  useOutsideClick({
    ref: ref,
    handler: onClose,
  });

  const handleReset = useCallback(() => {
    onReset();
  }, [onReset]);

  return (
    <Box
      ref={ref}
      position='fixed'
      width='320px'
      top={`${position.top}px`}
      right={`${position.right}px`}
      bg='white'
      boxShadow='lg'
      borderRadius='md'
      zIndex='popover'
      // Add max height and scroll if content is too long
      maxHeight='calc(100vh - 96px)'
      overflowY='visible'
    >
      <VStack spacing={4} p={4} align='stretch'>
        <HStack justify='space-between'>
          <Text fontWeight='medium'>View Configuration</Text>
          <Button size='sm' variant='ghost' onClick={handleReset}>
            Reset
          </Button>
        </HStack>

        <Divider />

        <DensitySelector value={config.density} onChange={onDensityChange} />

        <Divider />

        <ColumnManager
          columns={config.columns}
          visibleColumns={visibleColumns}
          restrictions={viewRestrictions}
          onToggleColumn={onToggleColumn}
          onReorderColumns={onReorderColumns}
          onRemoveColumn={onRemoveColumn}
          onUpdateWidth={onUpdateWidth}
          onAddColumn={onAddColumn}
        />
      </VStack>
    </Box>
  );
};

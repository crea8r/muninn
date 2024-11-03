// components/view-controller/ViewController.tsx
import React, { useCallback, useState } from 'react';
import { Box, IconButton, Portal, useDisclosure } from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons';
import {
  DisplayDensity,
  ViewConfigBase,
  ViewConfigSource,
} from '../../types/view-config';
import { useViewConfig } from '../../hooks/useViewConfig';
import { useColumnConfig } from '../../hooks/useColumnConfig';
import { FloatingConfig } from './FloatingConfig';
import { ResultsTable } from './ResultsTable';

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

interface ViewControllerProps {
  source: ViewConfigSource;
  initialConfig?: ViewConfigBase;
  onConfigChange?: (config: ViewConfigBase) => void;
  data: any[];
  isLoading?: boolean;
  totalCount: number;
}

export const ViewController: React.FC<ViewControllerProps> = ({
  source,
  initialConfig,
  onConfigChange,
  data,
  isLoading = false,
  totalCount,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [configAnchor, setConfigAnchor] = useState<HTMLElement | null>(null);

  // Use our hooks
  const { config, updateConfig, resetConfig, viewRestrictions } = useViewConfig(
    {
      source,
      initialConfig,
      onConfigChange,
    }
  );

  const {
    visibleColumns,
    toggleColumnVisibility,
    reorderColumns,
    addColumn,
    removeColumn,
    updateColumnWidth,
  } = useColumnConfig({
    config,
    updateConfig,
    viewRestrictions,
  });

  const handleDensityChange = useCallback(
    (density: DisplayDensity) => {
      updateConfig({ density });
    },
    [updateConfig]
  );

  const handleReset = useCallback(() => {
    resetConfig();
  }, [resetConfig]);

  // Handle config button ref for floating panel
  const handleConfigButtonRef = (element: HTMLElement | null) => {
    setConfigAnchor(element);
  };

  return (
    <Box position='relative' height='100%'>
      {/* Config Button */}
      <Box position='absolute' top={0.1} right={4} zIndex={'docked'}>
        <IconButton
          ref={handleConfigButtonRef}
          aria-label='Configure view'
          icon={<SettingsIcon />}
          onClick={onOpen}
          size='xs'
          variant='ghost'
          colorScheme='gray'
          isDisabled={!viewRestrictions.allowCustomization}
        />
      </Box>

      {/* Floating Config Panel */}
      {isOpen && configAnchor && (
        <Portal>
          <FloatingConfig
            {...calculatePosition(configAnchor)}
            anchorEl={configAnchor}
            onClose={onClose}
            config={config}
            viewRestrictions={viewRestrictions}
            visibleColumns={visibleColumns}
            onToggleColumn={toggleColumnVisibility}
            onReorderColumns={reorderColumns}
            onAddColumn={addColumn}
            onRemoveColumn={removeColumn}
            onUpdateWidth={updateColumnWidth}
            onReset={handleReset}
            onDensityChange={handleDensityChange}
          />
        </Portal>
      )}

      {/* Results Display */}
      <Box height='100%' overflow='auto'>
        {config.displayMode === 'table' ? (
          <ResultsTable
            data={data}
            columns={visibleColumns}
            isLoading={isLoading}
            density={config.density}
            onColumnResize={updateColumnWidth}
            totalCount={totalCount}
          />
        ) : (
          // Kanban view will be implemented in future phase
          <Box>Kanban view not implemented yet</Box>
        )}
      </Box>
    </Box>
  );
};

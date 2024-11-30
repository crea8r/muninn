import { Box } from '@chakra-ui/react';
import { AdvancedFilter } from 'src/features/advanced-filter';
import { ViewConfigSource } from 'src/features/advanced-filter/types/view-config';
import { useStoredConfigWithVersion } from 'src/features/advanced-filter/hooks/useStoredConfigWithVersion';
import { FilterConfig } from 'src/types/FilterConfig';
import { ViewConfigBase } from 'src/features/advanced-filter/types/view-config';
import { useCallback } from 'react';

export default function AdvancedListingPage() {
  const { initialConfig, saveConfig } = useStoredConfigWithVersion();

  const viewSource: ViewConfigSource = {
    type: 'temporary',
  };

  const handleFilterChange = useCallback(
    (newFilter: FilterConfig) => {
      if (initialConfig?.view) {
        saveConfig(newFilter, initialConfig.view as ViewConfigBase);
      }
    },
    [initialConfig?.view, saveConfig]
  );

  const handleViewChange = useCallback(
    (newView: ViewConfigBase) => {
      if (initialConfig?.filter) {
        saveConfig(initialConfig.filter as FilterConfig, newView);
      }
    },
    [initialConfig?.filter, saveConfig]
  );

  // Show loading state until config is ready
  if (!initialConfig) {
    return <Box height='calc(100vh - 120px)' bg='white' p={0} />;
  }

  return (
    <Box height='calc(100vh - 120px)' bg='white' p={0}>
      <AdvancedFilter
        viewSource={viewSource}
        initialFilter={initialConfig.filter}
        initialViewConfig={initialConfig.view as ViewConfigBase}
        onFilterChange={handleFilterChange}
        onViewConfigChange={handleViewChange}
      />
    </Box>
  );
}

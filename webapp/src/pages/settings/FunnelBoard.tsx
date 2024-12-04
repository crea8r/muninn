import { Box } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import LoadingPanel from 'src/components/LoadingPanel';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { AdvancedFilter } from 'src/features/advanced-filter';
import { FilterConfig } from 'src/types/FilterConfig';
import {
  ViewConfigBase,
  ViewConfigSource,
} from 'src/features/advanced-filter/types/view-config';
import { Funnel } from 'src/types';

const ALL_SUB_STATUSES = [0, 1, 2];

const FunnelBoard = () => {
  const { funnelId } = useParams<{ funnelId: string }>();
  const { globalData } = useGlobalContext();
  const viewSource: ViewConfigSource = {
    type: 'temporary',
  };
  const [funnel, setFunnel] = useState<Funnel | undefined>();
  const [filterConfig, setFilterConfig] = useState<FilterConfig | undefined>();
  const [viewConfig, setViewConfig] = useState<ViewConfigBase | undefined>();
  useEffect(() => {
    const currentFunnel = globalData?.funnelData?.funnels?.find(
      (funnel) => funnel.id === funnelId
    );
    setFunnel(currentFunnel);
    const allSteps = currentFunnel?.steps?.map((step) => step.id) || [];
    if (allSteps.length === 0) return;
    setFilterConfig((prev: FilterConfig) => {
      const existingSteps = prev?.funnelStepFilter?.stepIds || [];
      const newConfig: FilterConfig = {
        ...prev,
        funnelStepFilter: {
          ...(prev ? prev.funnelStepFilter : {}),
          funnelId,
          stepIds: existingSteps.length === 0 ? allSteps : existingSteps,
          subStatuses: ALL_SUB_STATUSES,
        },
      };
      return newConfig;
    });
  }, [globalData, funnelId]);

  const handleFilterChange = useCallback(
    (newFilter: FilterConfig) => {
      const allSteps = funnel?.steps?.map((step) => step.id) || [];
      const stepIds = newFilter.funnelStepFilter?.stepIds;
      const hasNoStep = !stepIds || stepIds.length === 0;
      const changedFunnel = newFilter.funnelStepFilter?.funnelId !== funnelId;
      if (hasNoStep || changedFunnel) {
        newFilter.funnelStepFilter = {
          funnelId,
          stepIds: allSteps,
          subStatuses: ALL_SUB_STATUSES,
        };
      }
      setFilterConfig(newFilter);
    },
    [funnel?.steps, funnelId]
  );

  const handleViewChange = useCallback((newView: ViewConfigBase) => {
    setViewConfig(newView);
  }, []);
  return (
    <Box>
      <BreadcrumbComponent label={funnel?.name} />
      <Box height='calc(100vh - 120px)' bg='white' p={0}>
        {!filterConfig ? (
          <LoadingPanel />
        ) : (
          <AdvancedFilter
            viewSource={viewSource}
            initialFilter={filterConfig}
            initialViewConfig={viewConfig as ViewConfigBase}
            onFilterChange={handleFilterChange}
            onViewConfigChange={handleViewChange}
          />
        )}
      </Box>
    </Box>
  );
};

export default FunnelBoard;

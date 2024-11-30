import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Flex, IconButton, VStack } from '@chakra-ui/react';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import { getCreatorList } from 'src/api/list';
import { CreatorList } from 'src/types';
import ObjectsByType from 'src/components/views/objects-by-type/ObjectsByType';
import { listTags } from 'src/api/tag';
import { fetchObjectsByTypeAdvanced } from 'src/api/objType';
import ObjectsByFunnel from 'src/components/views/objects-by-funnel/ObjectsByFunnel';
import { getFunnelView } from 'src/api/funnel';
import LoadingPanel from 'src/components/LoadingPanel';
import { AdvancedFilter } from 'src/features/advanced-filter';
import { InfoDialogButton } from 'src/components/InfoDialog';
import { InfoIcon } from '@chakra-ui/icons';
import { FilterConfig } from 'src/types/FilterConfig';

const ViewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [view, setView] = useState<CreatorList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const loadView = async () => {
    setIsLoading(true);
    const resp = await getCreatorList(id);
    setView(resp);
    setIsLoading(false);
  };

  useEffect(() => {
    loadView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFilterChange = (filter: FilterConfig) => {};

  return (
    <Box>
      {isLoading ? (
        <LoadingPanel />
      ) : (
        <>
          <Flex alignItems={'center'} gap={1}>
            <BreadcrumbComponent label={view?.list_name} />
            <InfoDialogButton
              title='View Info'
              content={view?.list_description}
              button={
                <IconButton
                  aria-label='info'
                  icon={<InfoIcon />}
                  variant={'ghost'}
                  color={'var(--color-primary)'}
                  onClick={() => setIsInfoOpen(true)}
                  title='Description'
                  size={'sm'}
                  mb={4}
                />
              }
              isOpen={isInfoOpen}
              onClose={() => setIsInfoOpen(false)}
            />
          </Flex>

          <VStack align='stretch' p={0} spacing={3} background={'white'}>
            {view?.list_filter_setting.version === 'v1' && (
              <AdvancedFilter
                viewSource={{
                  type: 'temporary',
                }}
                initialFilter={view?.list_filter_setting.filter}
                initialViewConfig={view?.list_filter_setting.view}
                onFilterChange={handleFilterChange}
                onViewConfigChange={() => {}}
              />
            )}
            {view?.list_filter_setting.typeId && (
              <ObjectsByType
                typeId={view.list_filter_setting.typeId || ''}
                initFilters={view.list_filter_setting.typeFilter}
                listTags={listTags}
                fetchObjectsByTypeAdvanced={fetchObjectsByTypeAdvanced}
              />
            )}
            {view?.list_filter_setting.funnelId && (
              <ObjectsByFunnel
                funnelId={view.list_filter_setting.funnelId}
                getFunnelView={getFunnelView}
              />
            )}
          </VStack>
        </>
      )}
    </Box>
  );
};

export default ViewDetailPage;

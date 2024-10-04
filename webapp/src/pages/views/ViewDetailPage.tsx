import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Box, Heading, HStack, Button } from '@chakra-ui/react';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import { getCreatorList } from 'src/api/list';
import { CreatorList } from 'src/types';
import ObjectsByType from 'src/components/views/objects-by-type/ObjectsByType';
import { listTags } from 'src/api/tag';
import { fetchObjectsByTypeAdvanced } from 'src/api/objType';
import ObjectsByFunnel from 'src/components/views/objects-by-funnel/ObjectsByFunnel';
import { getFunnelView } from 'src/api/funnel';
import LoadingPanel from 'src/components/LoadingPanel';

const ViewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [view, setView] = useState<CreatorList | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <Box>
      {isLoading ? (
        <LoadingPanel />
      ) : (
        <>
          <BreadcrumbComponent label={view?.list_name} />
          <HStack justify='space-between' mb={6}>
            <Heading as='h1' size='xl' color='var(--color-primary)'>
              {view?.list_name}
            </Heading>
            <Button onClick={() => history.push('/views')}>
              Back to My Views
            </Button>
          </HStack>
          {/* {view.list_description && (
              <Alert status='info' my={2}>
                {view.list_description}
              </Alert>
            )} */}
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
        </>
      )}
    </Box>
  );
};

export default ViewDetailPage;

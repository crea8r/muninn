import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Tag,
  Alert,
} from '@chakra-ui/react';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import { getCreatorList } from 'src/api/list';
import { CreatorList } from 'src/types';
import ObjectsByType from 'src/components/views/objects-by-type/ObjectsByType';
import { listTags } from 'src/api/tag';
import { fetchObjectsByTypeAdvanced } from 'src/api/objType';
import FunnelBoard from '../settings/FunnelBoard';
import ObjectsByFunnel from 'src/components/views/objects-by-funnel/ObjectsByFunnel';
import { getFunnelView } from 'src/api/funnel';

interface Object {
  id: number;
  name: string;
  type: string;
  tags: string[];
}

const ViewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [view, setView] = useState<CreatorList | null>(null);
  const [objects, setObjects] = useState<Object[]>([]);

  const loadView = async () => {
    const resp = await getCreatorList(id);
    setView(resp);
  };

  useEffect(() => {
    loadView();
  }, [id]);

  const handleObjectClick = (objectId: number) => {
    history.push(`/objects/${objectId}`);
  };

  if (!view) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box>
      <BreadcrumbComponent label={view.list_name} />
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          {view.list_name}
        </Heading>
        <Button onClick={() => history.push('/views')}>Back to My Views</Button>
      </HStack>
      {/* {view.list_description && (
        <Alert status='info' my={2}>
          {view.list_description}
        </Alert>
      )} */}
      {view.list_filter_setting.typeId && (
        <ObjectsByType
          typeId={view.list_filter_setting.typeId || ''}
          initFilters={view.list_filter_setting.typeFilter}
          listTags={listTags}
          fetchObjectsByTypeAdvanced={fetchObjectsByTypeAdvanced}
        />
      )}
      {view.list_filter_setting.funnelId && (
        <ObjectsByFunnel
          funnelId={view.list_filter_setting.funnelId}
          getFunnelView={getFunnelView}
        />
      )}
    </Box>
  );
};

export default ViewDetailPage;

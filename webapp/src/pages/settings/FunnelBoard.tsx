import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFunnelView } from 'src/api/funnel';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import ObjectsByFunnel from 'src/components/views/objects-by-funnel/ObjectsByFunnel';
import { Funnel } from 'src/types';

const FunnelBoard = () => {
  const { funnelId } = useParams<{ funnelId: string }>();
  const [funnel, setFunnel] = useState<Funnel | undefined>();
  const handleFetchFunnel = async (funnelId: string) => {
    const response = await getFunnelView(funnelId);
    setFunnel(response.funnel);
    return response;
  };
  return (
    <Box>
      <BreadcrumbComponent label={funnel?.name} />
      <ObjectsByFunnel funnelId={funnelId} getFunnelView={handleFetchFunnel} />
    </Box>
  );
};

export default FunnelBoard;

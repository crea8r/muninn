import React from 'react';
import { Box } from '@chakra-ui/react';
import ObjectDetailPanel from 'src/features/object-detail/ObjectDetailPanel';
import { useParams } from 'react-router-dom';

const TestPage: React.FC = () => {
  const { objectId } = useParams<{ objectId: string }>();
  return (
    <Box height='100%' display='flex' flexDirection='column'>
      <ObjectDetailPanel objectId={objectId} />
    </Box>
  );
};

export default TestPage;

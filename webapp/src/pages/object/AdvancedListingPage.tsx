import { Box } from '@chakra-ui/react';
import { AdvancedFilter } from 'src/features/advanced-filter';
import { ViewConfigSource } from 'src/features/advanced-filter/types/view-config';

export default function AdvancedListingPage() {
  // Example initial config
  const viewSource: ViewConfigSource = {
    type: 'temporary',
  };

  return (
    <Box height='calc(100vh - 120px)' bg='white' p={0}>
      <AdvancedFilter viewSource={viewSource} />
    </Box>
  );
}

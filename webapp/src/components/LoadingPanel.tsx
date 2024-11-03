import { Box, Flex, Spinner } from '@chakra-ui/react';
import { getRandomTip } from 'src/utils/tips';
type LoadingPanelProps = {
  minHeight?: string;
  height?: string;
};
const LoadingPanel = ({
  height = '100%',
  minHeight = '150px',
}: LoadingPanelProps) => {
  return (
    <Flex
      justify='center'
      align='center'
      height={height}
      minHeight={minHeight}
      alignItems={'center'}
    >
      <Spinner />
      <Box ml={4}>{getRandomTip()}</Box>
    </Flex>
  );
};

export default LoadingPanel;

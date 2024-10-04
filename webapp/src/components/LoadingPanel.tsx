import { Flex, Spinner } from '@chakra-ui/react';
type LoadingPanelProps = {
  minHeight?: string;
  height?: string;
};
const LoadingPanel = ({
  height = '100%',
  minHeight = '150px',
}: LoadingPanelProps) => {
  return (
    <Flex justify='center' align='center' height={height} minHeight={minHeight}>
      <Spinner />
    </Flex>
  );
};

export default LoadingPanel;

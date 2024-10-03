import { Box, Text } from '@chakra-ui/react';
import { Fact } from 'src/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import MarkdownDisplay from './mardown/MarkdownDisplay';

type FactItemProps = {
  fact: Fact;
  handleClick: (f: Fact) => void;
};

const FactItem = ({ fact, handleClick }: FactItemProps) => {
  dayjs.extend(relativeTime);
  return (
    <Box
      key={fact.id}
      p={4}
      bg='white'
      borderRadius='md'
      boxShadow='sm'
      onClick={() => handleClick(fact)}
      cursor='pointer'
      _hover={{ boxShadow: 'md' }}
    >
      <MarkdownDisplay content={fact.text} />
      {fact.location && (
        <Text fontSize='sm' color='gray.500' mt={2}>
          Location: {fact.location}
        </Text>
      )}
      <Text fontSize='sm' color='gray.500' mt={1}>
        {dayjs(fact.happenedAt).fromNow()}{' '}
        {dayjs(fact.happenedAt).format('hh:mm A')}
      </Text>
    </Box>
  );
};

export default FactItem;

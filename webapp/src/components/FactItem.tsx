import { Badge, Box, Flex, Link, Text } from '@chakra-ui/react';
import { Fact } from 'src/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import MarkdownDisplay from './mardown/MarkdownDisplay';
import { shortenText } from 'src/utils';

type FactItemProps = {
  fact: Fact;
  handleClick: (f: Fact) => void;
};

const FactItem = ({ fact, handleClick }: FactItemProps) => {
  dayjs.extend(relativeTime);
  const relatedObjects = fact.relatedObjects || [];
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
      <MarkdownDisplay content={fact.text} characterLimit={200} />
      {fact.location && (
        <Text fontSize='sm' color='gray.500' mt={2}>
          Location: {fact.location}
        </Text>
      )}
      <Flex direction={'row'} alignItems={'center'}>
        {fact.creatorName && (
          <Badge textTransform={'none'} mr={2}>
            {fact.creatorName}
          </Badge>
        )}
        <Text fontSize='sm' color='gray.500' mr={2}>
          {dayjs(fact.happenedAt).fromNow()}{' '}
          {dayjs(fact.happenedAt).format('hh:mm A')}
        </Text>
        {relatedObjects.length > 0 &&
          relatedObjects.map((obj) => {
            return (
              <Link
                href={`/objects/${obj.id}`}
                background={'yellow.100'}
                p={1}
                mr={1}
              >
                {shortenText(obj.name, 15)}
              </Link>
            );
          })}
      </Flex>
    </Box>
  );
};

export default FactItem;

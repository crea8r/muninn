import { Object } from 'src/types';
import { Box, Divider, Tag, Text, Wrap } from '@chakra-ui/react';
// import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';

type ObjectCardProps = {
  object: Object;
};
const ObjectCard = ({ object }: ObjectCardProps) => {
  // const history = useHistory();
  return (
    <Box
      id={object.id}
      p={2}
      bg='white'
      borderRadius='md'
      boxShadow='sm'
      cursor={'move'}
      className='draggable'
    >
      <Link to={`/objects/${object.id}`}>
        <Text
          fontWeight={'bold'}
          cursor={'pointer'}
          textDecoration={'underline'}
          color={'var(--color-primary)'}
        >
          {object.name}
        </Text>
      </Link>

      {object.tags && (
        <Wrap mt={2}>
          {object.tags
            .slice(0, object.tags.length > 3 ? 3 : object.tags.length)
            .map((tag) => (
              <Tag
                backgroundColor={tag.color_schema.background}
                color={tag.color_schema.text}
                id={tag.id}
              >
                {tag.name}
              </Tag>
            ))}
        </Wrap>
      )}
      <Divider my={2} />
      <MarkdownDisplay content={object.description} characterLimit={50} />
    </Box>
  );
};

export default ObjectCard;

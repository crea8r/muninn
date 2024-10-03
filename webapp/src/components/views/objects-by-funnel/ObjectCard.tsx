import { Object } from 'src/types';
import { Box, Divider, Tag, Text, Wrap } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';

type ObjectCardProps = {
  object: Object;
};
const ObjectCard = ({ object }: ObjectCardProps) => {
  const history = useHistory();
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
      <Text
        fontWeight={'bold'}
        cursor={'pointer'}
        textDecoration={'underline'}
        onClick={() => {
          history.push(`/objects/${object.id}`);
        }}
      >
        {object.name}
      </Text>
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
      <Text>{object.description}</Text>
    </Box>
  );
};

export default ObjectCard;

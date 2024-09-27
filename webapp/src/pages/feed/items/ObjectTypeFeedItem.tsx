import { Alert, Badge, Box, Text, Tooltip, Wrap } from '@chakra-ui/react';

const ObjectTypeFeedItem: React.FC<{ item: any }> = ({ item }) => {
  return (
    <>
      <Box mb={2}>
        <Text>New TYPE: {item.name}</Text>
        <Wrap mt={2} mb={2}>
          {window.Object.keys(item.fields).map((key) => (
            <Tooltip label={item.fields[key]}>
              <Badge>{key}</Badge>
            </Tooltip>
          ))}
        </Wrap>
      </Box>
      {item.description && <Alert status='success'>{item.description}</Alert>}
    </>
  );
};

export default ObjectTypeFeedItem;

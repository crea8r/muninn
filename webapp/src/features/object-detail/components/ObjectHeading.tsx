import {
  Box,
  Heading,
  HStack,
  VStack,
  Text,
  Tag,
  useToast,
} from '@chakra-ui/react';
import SmartImage from 'src/components/SmartImage';
import { shortenText } from 'src/utils';
import { useObjectDetail } from '../contexts/ObjectDetailContext';
import { EditIcon } from '@chakra-ui/icons';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';
import { ObjectForm } from 'src/components/forms';
import { useState } from 'react';
import { deleteObject, updateObject } from 'src/api';
import { UpdateObject } from 'src/types';
import { useHistory } from 'react-router-dom';

export const ObjectHeading: React.FC = () => {
  const { object, imgUrls, refresh } = useObjectDetail();
  const stepsAndFunnels = object?.stepsAndFunnels || [];
  const steps = stepsAndFunnels.map((step) => step.stepName) || [];
  const tags = object?.tags || [];
  const aliases = object?.aliases || [];
  const [showEditObject, setShowEditObject] = useState(false);
  const history = useHistory();
  const toast = useToast();
  const handleUpdateObject = async (updatedObject: UpdateObject) => {
    toast({
      title: 'Updating object...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    await updateObject(updatedObject);
    refresh();
  };
  const handleDeleteObject = async (id: string) => {
    toast({
      title: 'Deleting object...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    await deleteObject(id);
    history.push('/objects');
  };
  return (
    <VStack width={'100%'} gap={2}>
      <HStack gap={0} width={'100%'}>
        <Heading as='h2' size='md'>
          <HStack>
            <Box style={{ borderRadius: '100%', overflow: 'hidden' }}>
              <SmartImage
                src={imgUrls}
                alt={object?.name || ''}
                style={{
                  height: '32px',
                }}
              />
            </Box>
            <Text
              textDecoration={'underline'}
              onClick={() => history.push('/objects/' + object.id)}
              cursor={'pointer'}
              _hover={{ color: 'blue.500' }}
            >
              {object?.name}
            </Text>
            <EditIcon
              fontSize='x-large'
              cursor={'pointer'}
              onClick={() => setShowEditObject(true)}
              _hover={{ color: 'blue.500' }}
            />
          </HStack>
        </Heading>
      </HStack>
      <Box width={'100%'}>
        <MarkdownDisplay
          content={object?.description || ''}
          characterLimit={500}
        />
      </Box>

      <Box width={'100%'}>
        {aliases.map((alias, idx) => (
          <Tag key={'alias-' + idx} m={1} variant={'outline'}>
            {alias}
          </Tag>
        ))}
        {tags.map((tag) => (
          <Tag
            key={tag.id}
            background={tag.color_schema.background}
            color={tag.color_schema.text}
            m={1}
          >
            {tag.name}
          </Tag>
        ))}
        {steps.map((step, index) => (
          <Tag
            textTransform={'none'}
            variant={'outline'}
            key={index}
            m={1}
            colorScheme='blue'
            title={step}
          >
            {shortenText(step, 10)}
          </Tag>
        ))}
      </Box>
      <ObjectForm
        initialObject={object}
        isOpen={showEditObject}
        onClose={() => setShowEditObject(false)}
        onUpdateObject={handleUpdateObject}
        onDeleteObject={handleDeleteObject}
      />
    </VStack>
  );
};

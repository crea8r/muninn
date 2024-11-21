import React from 'react';
import {
  Box,
  Flex,
  Tag as ChakraTag,
  TagCloseButton,
  TagLabel,
  useToast,
} from '@chakra-ui/react';
import { Tag } from 'src/types';
import { createTag, listTags } from 'src/api/tag';
import TagSuggestion from 'src/components/TagSuggestion';
import { addTagToObject, removeTagFromObject } from 'src/api';
import { useObjectDetail } from '../contexts/ObjectDetailContext';

export const TagInput: React.FC = () => {
  const { object, refresh } = useObjectDetail();
  const tags = object?.tags || [];
  const fetchSuggestions = async (query: string): Promise<Tag[]> => {
    const response = await listTags({ page: 0, pageSize: 10, query });
    return response.tags;
  };
  const toast = useToast();

  const attachTagToObject = async (tagToAttach: Tag) => {
    if (!tags.some((tag) => tag.id === tagToAttach.id)) {
      addTagToObject(object.id, tagToAttach.id);
    }
  };

  const createAndAttachTag = async (text: string) => {
    const newTag = await createTag({
      name: text,
      description: '',
      color_schema: { background: '#e2e8f0', text: '#2d3748' },
    });
    await addTagToObject(object.id, newTag.id);
    refresh();
  };

  const removeTag = async (id: string) => {
    try {
      await removeTagFromObject(object.id, id);

      toast({
        title: 'Success',
        description: `Tag is successfully removed.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error removing the tag.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      refresh();
    }
  };

  return (
    <Box position='relative'>
      <Flex
        flexWrap='wrap'
        alignItems='center'
        minHeight='40px'
        border='1px solid'
        borderColor='gray.200'
        borderRadius='md'
        p={2}
      >
        {tags.map((tag) => (
          <ChakraTag
            backgroundColor={tag.color_schema.background}
            color={tag.color_schema.text}
            key={tag.id}
            margin={1}
          >
            <TagLabel>{tag.name}</TagLabel>
            <TagCloseButton onClick={() => removeTag(tag.id)} />
          </ChakraTag>
        ))}
        <TagSuggestion
          onAttachTag={attachTagToObject}
          onCreateAndAttachTag={createAndAttachTag}
          fetchSuggestions={fetchSuggestions}
        />
      </Flex>
    </Box>
  );
};

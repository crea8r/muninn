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

interface TagInputProps {
  tags: Tag[];
  isReadOnly?: boolean;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  isReadOnly = false,
  onAddTag,
  onRemoveTag,
}) => {
  const fetchSuggestions = async (query: string): Promise<Tag[]> => {
    const response = await listTags({ page: 0, pageSize: 10, query });
    return response.tags;
  };
  const toast = useToast();

  const attachTagToObject = async (tagToAttach: Tag) => {
    if (!tags.some((tag) => tag.id === tagToAttach.id)) {
      await onAddTag(tagToAttach.id);
    }
  };

  const createAndAttachTag = async (text: string) => {
    const newTag = await createTag({
      name: text,
      description: '',
      color_schema: { background: '#e2e8f0', text: '#2d3748' },
    });
    await onAddTag(newTag.id);
  };

  const removeTag = async (id: string) => {
    try {
      await onRemoveTag(id);

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
        {!isReadOnly && (
          <TagSuggestion
            onAttachTag={attachTagToObject}
            onCreateAndAttachTag={createAndAttachTag}
            fetchSuggestions={fetchSuggestions}
          />
        )}
      </Flex>
    </Box>
  );
};

export default TagInput;

import React from 'react';
import { Badge, Text } from '@chakra-ui/react';
import { ContentState } from 'draft-js';

interface MentionSuggestionProps {
  children: React.ReactNode;
  entityKey: string;
  contentState: ContentState;
}

const MentionSuggestion: React.FC<MentionSuggestionProps> = ({
  children,
  entityKey,
  contentState,
}) => {
  const { mention } = contentState.getEntity(entityKey).getData();

  return (
    <Badge
      as='span'
      bg='blue.100'
      color='blue.800'
      fontWeight='bold'
      borderRadius='md'
      px={1}
      cursor='pointer'
      _hover={{ bg: 'blue.200' }}
      onClick={() => {
        // Handle click on mention, e.g., open object or user details
        console.log('Clicked mention:', mention);
      }}
    >
      {children}
    </Badge>
  );
};

export default MentionSuggestion;

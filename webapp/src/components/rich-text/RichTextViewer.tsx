import React from 'react';
import {
  EditorState,
  convertFromRaw,
  CompositeDecorator,
  ContentState,
  Editor,
  ContentBlock,
} from 'draft-js';
import { Box } from '@chakra-ui/react';
import MentionSuggestion from './MentionSuggestion';

interface RichTextViewerProps {
  content: string;
}

const RichTextViewer: React.FC<RichTextViewerProps> = ({ content }) => {
  const createDecorator = () => {
    return new CompositeDecorator([
      {
        strategy: findMentionEntities,
        component: MentionSuggestion,
      },
    ]);
  };

  const getEditorState = (content: string): EditorState => {
    let tmp;
    try {
      tmp = JSON.parse(content);
      tmp = JSON.parse(tmp);
    } catch (e) {}
    try {
      const contentState = convertFromRaw(tmp);
      return EditorState.createWithContent(contentState, createDecorator());
    } catch (e) {
      const contentState = ContentState.createFromText(content);
      return EditorState.createWithContent(contentState, createDecorator());
    }
  };

  const editorState = getEditorState(content);

  return (
    <Box>
      <Editor editorState={editorState} readOnly={true} onChange={() => {}} />
    </Box>
  );
};

function findMentionEntities(
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'MENTION'
    );
  }, callback);
}

export default RichTextViewer;

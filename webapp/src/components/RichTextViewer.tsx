import React from 'react';
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
  convertFromRaw,
  ContentBlock,
} from 'draft-js';
import 'draft-js/dist/Draft.css';

interface RichTextViewerProps {
  content: string;
}

const MentionSpan: React.FC<{ children: React.ReactNode; url: string }> = (
  props
) => (
  <a
    href={props.url}
    target='_blank'
    rel='noopener noreferrer'
    style={{
      color: '#4a90e2',
      backgroundColor: '#f0f8ff',
      padding: '2px 4px',
      borderRadius: '3px',
      textDecoration: 'none',
    }}
  >
    {props.children}
  </a>
);

const RichTextViewer: React.FC<RichTextViewerProps> = ({ content }) => {
  const compositeDecorator = new CompositeDecorator([
    {
      strategy: findMentionEntities,
      component: (props) => {
        const { url } = props.contentState.getEntity(props.entityKey).getData();
        return <MentionSpan {...props} url={url} />;
      },
    },
  ]);

  const createEditorState = (content: string) => {
    console.log('Creating editor state with content:', content);
    try {
      // Try to parse the content as JSON (for Draft.js raw content)
      console.log('Parsing content as JSON ', JSON.parse(content));
      const contentState = convertFromRaw(JSON.parse(content));
      return EditorState.createWithContent(contentState, compositeDecorator);
    } catch (e) {
      // If parsing fails, treat the content as plain text
      console.log('Treating content as plain text');
      return EditorState.createWithContent(
        ContentState.createFromText(content),
        compositeDecorator
      );
    }
  };

  const editorState = createEditorState(content);

  return (
    <div>
      <Editor
        editorState={editorState}
        readOnly={true}
        onChange={() => {}} // No-op function as onChange is required but we don't need it
      />
    </div>
  );
};

function findMentionEntities(
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    if (entityKey === null) {
      return false;
    }
    const entity = contentState.getEntity(entityKey);
    return entity.getType() === 'MENTION';
  }, callback);
}

export default RichTextViewer;

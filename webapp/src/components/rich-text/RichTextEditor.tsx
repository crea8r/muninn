import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
  ContentBlock,
  Modifier,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import debounce from 'lodash/debounce';

interface ObjectSuggestion {
  id: string;
  name: string;
  url: string;
}

interface RichTextEditorProps {
  initialValue: string;
  onSave: (content: string) => void;
  suggestionsPosition?: 'top' | 'bottom';
}

const MentionSpan: React.FC<{ children: React.ReactNode; url: string }> = (
  props
) => (
  <span
    style={{
      color: '#219ebc',
      backgroundColor: '#8ecae6',
      padding: '2px 4px',
      borderRadius: '3px',
      cursor: 'pointer',
    }}
    onClick={() => window.open(props.url, '_blank')}
  >
    {props.children}
  </span>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue,
  onSave,
  suggestionsPosition = 'top',
}) => {
  const editorRef = useRef<Editor>(null);
  const [editorBounds, setEditorBounds] = useState<DOMRect | null>(null);

  const compositeDecorator = new CompositeDecorator([
    {
      strategy: findMentionEntities,
      component: (props) => {
        const { url } = props.contentState.getEntity(props.entityKey).getData();
        return <MentionSpan {...props} url={url} />;
      },
    },
  ]);

  const [editorState, setEditorState] = useState(() => {
    if (initialValue) {
      try {
        const contentState = convertFromRaw(JSON.parse(initialValue));
        return EditorState.createWithContent(contentState, compositeDecorator);
      } catch (e) {
        console.error('Error parsing editor content:', e);
        return EditorState.createEmpty(compositeDecorator);
      }
    }
    return EditorState.createEmpty(compositeDecorator);
  });

  const [suggestions, setSuggestions] = useState<ObjectSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const updateEditorBounds = () => {
      if (editorRef.current) {
        const bounds = editorRef.current.editor?.getBoundingClientRect();
        if (bounds) {
          setEditorBounds(bounds);
        }
      }
    };

    updateEditorBounds();
    window.addEventListener('resize', updateEditorBounds);

    return () => {
      window.removeEventListener('resize', updateEditorBounds);
    };
  }, []);

  const handleEditorChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);

    const selection = newEditorState.getSelection();
    const content = newEditorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    const text = block.getText();
    const cursorPosition = selection.getStartOffset();

    if (text.slice(0, cursorPosition).endsWith('@')) {
      setShowSuggestions(true);
      debouncedFetchSuggestions(text.slice(cursorPosition));
    } else {
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    // In a real application, this would be an API call
    const mockObjects: ObjectSuggestion[] = [
      { id: '1', name: 'John Doe', url: 'https://example.com/john' },
      { id: '2', name: 'Jane Smith', url: 'https://example.com/jane' },
      { id: '3', name: 'Alice Johnson', url: 'https://example.com/alice' },
    ];

    const filteredObjects = mockObjects.filter((obj) =>
      obj.name.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filteredObjects);
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 300),
    []
  );

  const handleMentionClick = (object: ObjectSuggestion) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    const start = selection.getStartOffset() - 1; // Include the '@'
    const end = selection.getEndOffset();

    const mentionText = `@${object.name}`;
    const contentStateWithEntity = contentState.createEntity(
      'MENTION',
      'IMMUTABLE',
      { id: object.id, url: object.url }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newContentState = Modifier.replaceText(
      contentStateWithEntity,
      selection.merge({
        anchorOffset: start,
        focusOffset: end,
      }),
      mentionText,
      editorState.getCurrentInlineStyle(),
      entityKey
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'insert-characters'
    );

    setEditorState(
      RichUtils.toggleLink(
        newEditorState,
        newEditorState.getSelection(),
        entityKey
      )
    );
    setShowSuggestions(false);
  };

  const handleSave = () => {
    const content = editorState.getCurrentContent();
    const rawContent = JSON.stringify(convertToRaw(content));
    onSave(rawContent);
  };

  const handleReset = () => {
    if (initialValue) {
      try {
        const contentState = convertFromRaw(JSON.parse(initialValue));
        setEditorState(
          EditorState.createWithContent(contentState, compositeDecorator)
        );
      } catch (e) {
        console.error('Error parsing editor content:', e);
        setEditorState(EditorState.createEmpty(compositeDecorator));
      }
    } else {
      setEditorState(EditorState.createEmpty(compositeDecorator));
    }
  };

  const getSuggestionsPanelStyle = () => {
    if (!editorBounds) return {};

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      zIndex: 1000,
      maxHeight: '200px',
      overflowY: 'auto',
    };

    if (suggestionsPosition === 'top') {
      return {
        ...baseStyle,
        bottom: '100%',
        marginBottom: '5px',
      };
    } else {
      return {
        ...baseStyle,
        top: '100%',
        marginTop: '5px',
      };
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          border: '1px solid #023047',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '10px',
        }}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleEditorChange}
          placeholder='Type @ to mention an object...'
        />
      </div>
      {showSuggestions && (
        <div style={getSuggestionsPanelStyle()}>
          {suggestions.map((object) => (
            <div
              key={object.id}
              onClick={() => handleMentionClick(object)}
              style={{
                padding: '8px',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#8ecae6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              {object.name}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={handleSave}
          style={{
            marginRight: '10px',
            backgroundColor: '#219ebc',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
        <button
          onClick={handleReset}
          style={{
            backgroundColor: '#ffb703',
            color: '#023047',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
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

export default RichTextEditor;

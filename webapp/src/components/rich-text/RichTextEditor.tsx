import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface RelatedObject {
  object_id: string;
  name: string;
  object_url: string;
}

interface InitialValue {
  content: string;
  related: RelatedObject[];
}

interface RichTextEditorProps {
  initialValue: string | InitialValue;
  onSave: (content: {
    content: string;
    related: {
      added: RelatedObject[];
      removed: RelatedObject[];
    };
  }) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue,
  onSave,
}) => {
  const [content, setContent] = useState('');
  const [relatedObjects, setRelatedObjects] = useState<RelatedObject[]>([]);
  const [suggestions, setSuggestions] = useState<RelatedObject[]>([]);

  useEffect(() => {
    if (typeof initialValue === 'string') {
      setContent(initialValue);
    } else {
      setContent(initialValue.content);
      setRelatedObjects(initialValue.related);
    }
  }, [initialValue]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const lastWord = e.target.value.split(' ').pop() || '';
    if (lastWord.startsWith('@')) {
      debouncedFetchSuggestions(lastWord.slice(1));
    } else {
      setSuggestions([]);
    }
  };

  const fetchSuggestions = async (query: string) => {
    // In a real application, this would be an API call
    const mockObjects: RelatedObject[] = [
      {
        object_id: '1',
        name: 'John Doe',
        object_url: 'https://example.com/john',
      },
      {
        object_id: '2',
        name: 'Jane Smith',
        object_url: 'https://example.com/jane',
      },
      {
        object_id: '3',
        name: 'Alice Johnson',
        object_url: 'https://example.com/alice',
      },
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

  const handleSuggestionClick = (object: RelatedObject) => {
    const words = content.split(' ');
    words[words.length - 1] = `[@${object.name}](${object.object_url})`;
    setContent(words.join(' '));
    setSuggestions([]);
    setRelatedObjects((prev) => [...prev, object]);
  };

  const handleSave = () => {
    const mentionRegex = /\[@([^\]]+)\]\(([^)]+)\)/g;
    const mentions = Array.from(content.matchAll(mentionRegex));
    const currentRelated = mentions.map((match) => ({
      object_id: match[2].split('/').pop() || '',
      name: match[1],
      object_url: match[2],
    }));

    const added = currentRelated.filter(
      (curr) =>
        !relatedObjects.some((prev) => prev.object_id === curr.object_id)
    );
    const removed = relatedObjects.filter(
      (prev) =>
        !currentRelated.some((curr) => curr.object_id === prev.object_id)
    );

    onSave({
      content,
      related: { added, removed },
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        value={content}
        onChange={handleContentChange}
        style={{
          width: '100%',
          minHeight: '200px',
          padding: '10px',
          border: '1px solid #023047',
          borderRadius: '4px',
          marginBottom: '10px',
        }}
        placeholder='Type your content here. Use @ to mention objects.'
      />
      {suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            zIndex: 1000,
          }}
        >
          {suggestions.map((object) => (
            <div
              key={object.object_id}
              onClick={() => handleSuggestionClick(object)}
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
      <button
        onClick={handleSave}
        style={{
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
    </div>
  );
};

export default RichTextEditor;

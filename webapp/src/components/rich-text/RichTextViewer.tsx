import React from 'react';

interface RelatedObject {
  object_id: string;
  name: string;
  object_url: string;
}

interface RichTextViewerProps {
  content: string | { content: string; related: RelatedObject[] };
}

const RichTextViewer: React.FC<RichTextViewerProps> = ({ content }) => {
  const renderContent = (text: string) => {
    const parts = text.split(/(\[@[^\]]+\]\([^)]+\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[@([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const [, name, url] = match;
        return (
          <a
            key={index}
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            style={{
              color: '#219ebc',
              backgroundColor: '#8ecae6',
              padding: '2px 4px',
              borderRadius: '3px',
              textDecoration: 'none',
            }}
          >
            @{name}
          </a>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const contentToRender =
    typeof content === 'string' ? content : content.content;

  return (
    <div
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        padding: '10px',
        border: '1px solid #023047',
        borderRadius: '4px',
      }}
    >
      {renderContent(contentToRender)}
    </div>
  );
};

export default RichTextViewer;

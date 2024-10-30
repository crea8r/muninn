import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Button } from '@chakra-ui/react';
import remarkGfm from 'remark-gfm';

interface MarkdownDisplayProps {
  content: string;
  characterLimit?: number;
  style?: React.CSSProperties;
}

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({
  content,
  characterLimit,
  style,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const renderedContent = useMemo(() => {
    // Replace mentions with links
    const mentionRegex = /@\[([^\]]+)\]\((\w+):([^)]+)\)/g;
    return content.replace(mentionRegex, (_, name, type, id) => {
      const path = type === 'creator' ? `/users/${id}` : `/objects/${id}`;
      return `[${name}](${path})`;
    });
  }, [content]);
  const shouldShorten =
    characterLimit &&
    characterLimit > 0 &&
    renderedContent.length > characterLimit;
  const displayedContent =
    shouldShorten && !isExpanded
      ? `${renderedContent.slice(0, characterLimit)}...`
      : renderedContent;
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const components = {
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href || '#'}
        target='_blank'
        rel='noreferrer'
        style={{ color: 'blue', textDecoration: 'underline' }}
      >
        {children}
      </a>
    ),
  };
  return (
    <Box sx={markdownStyles} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {displayedContent}
      </ReactMarkdown>
      {shouldShorten && (
        <Button
          onClick={toggleExpand}
          color={'blue.300'}
          variant={'link'}
          padding={0}
          style={{
            textDecoration: 'underline',
          }}
        >
          {isExpanded ? 'See less' : 'See more'}
        </Button>
      )}
    </Box>
  );
};

const markdownStyles = {
  'h1, h2, h3, h4, h5, h6': {
    marginTop: '24px',
    marginBottom: '16px',
    fontWeight: 'bold',
    lineHeight: '1.25',
  },
  h1: {
    fontSize: '2em',
    borderBottom: '1px solid #eaecef',
    paddingBottom: '.3em',
  },
  h2: {
    fontSize: '1.5em',
    borderBottom: '1px solid #eaecef',
    paddingBottom: '.3em',
  },
  h3: { fontSize: '1.25em' },
  h4: { fontSize: '1em' },
  h5: { fontSize: '0.875em' },
  h6: { fontSize: '0.85em', color: '#6a737d' },
  'p, ul, ol': { marginBottom: '16px' },
  'ul, ol': { paddingLeft: '.2em' },
  'ul ul, ul ol, ol ul, ol ol': { marginTop: '0', marginBottom: '0' },
  li: { wordWrap: 'break-all' },
  'li > p': { marginTop: '16px' },
  'li + li': { marginTop: '.25em' },
  code: {
    padding: '.2em .4em',
    margin: '0',
    fontSize: '85%',
    backgroundColor: 'rgba(27,31,35,.05)',
    borderRadius: '3px',
  },
  pre: {
    wordWrap: 'normal',
    padding: '16px',
    overflow: 'auto',
    fontSize: '85%',
    lineHeight: '1.45',
    backgroundColor: '#f6f8fa',
    borderRadius: '3px',
  },
  'pre > code': {
    padding: '0',
    margin: '0',
    fontSize: '100%',
    wordBreak: 'normal',
    whiteSpace: 'pre',
    background: 'transparent',
    border: '0',
  },
  table: {
    borderSpacing: '0',
    borderCollapse: 'collapse',
    marginTop: '0',
    marginBottom: '16px',
  },
  'td, th': {
    padding: '6px 13px',
    border: '1px solid #dfe2e5',
  },
  tr: {
    backgroundColor: '#fff',
    borderTop: '1px solid #c6cbd1',
  },
  'tr:nth-child(2n)': {
    backgroundColor: '#f6f8fa',
  },
  img: {
    maxWidth: '100%',
    boxSizing: 'content-box',
    background: '#fff',
  },
  blockquote: {
    padding: '0 1em',
    color: '#6a737d',
    borderLeft: '.25em solid #dfe2e5',
    marginBottom: '16px',
  },
  'blockquote > :first-child': { marginTop: '0' },
  'blockquote > :last-child': { marginBottom: '0' },
  hr: {
    height: '.25em',
    padding: '0',
    margin: '24px 0',
    backgroundColor: '#e1e4e8',
    border: '0',
  },
};

export default MarkdownDisplay;

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { FunnelStep } from 'src/types';

interface ResizableFunnelTableProps {
  steps: FunnelStep[];
  onStepNameClick: (step: FunnelStep) => void;
  onContentClick: (title: string, content: string) => void;
}

const ResizableFunnelTable: React.FC<ResizableFunnelTableProps> = ({
  steps,
  onStepNameClick,
  onContentClick,
}) => {
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    order: 80,
    name: 200,
    definition: 250,
    example: 250,
    action: 250,
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizingColumn = useRef<string | null>(null);
  const startX = useRef<number>(0);

  const handleResizeStart = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    setIsResizing(true);
    resizingColumn.current = column;
    startX.current = e.clientX;
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    resizingColumn.current = null;
  };

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (isResizing && resizingColumn.current) {
        const diff = e.clientX - startX.current;
        setColumnWidths((prev) => ({
          ...prev,
          [resizingColumn.current!]: Math.max(
            prev[resizingColumn.current!] + diff,
            50
          ),
        }));
        startX.current = e.clientX;
      }
    },
    [isResizing]
  );

  useEffect(() => {
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
    return () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResize]);

  const stripMarkdown = (text: string) => {
    return text.replace(/[#*_~`]/g, '').substring(0, 50) + '...';
  };

  return (
    <Box overflowX='auto'>
      <Flex borderBottom='1px' borderColor='gray.200' bg='gray.50'>
        {Object.entries(columnWidths).map(([column, width]) => (
          <Box
            key={column}
            flexShrink={0}
            width={`${width}px`}
            p={2}
            fontWeight='bold'
            position='relative'
          >
            {column.charAt(0).toUpperCase() + column.slice(1)}
            <Box
              position='absolute'
              right={0}
              top={0}
              bottom={0}
              width='2px'
              cursor='col-resize'
              onMouseDown={(e) => handleResizeStart(e, column)}
              bg='gray.300'
            />
          </Box>
        ))}
      </Flex>

      {steps.map((step) => (
        <Flex
          key={step.id}
          borderBottom='1px'
          borderColor='gray.200'
          _hover={{ bg: 'gray.100' }}
        >
          <Box
            flexShrink={0}
            width={`${columnWidths.order}px`}
            p={2}
            borderRight='1px'
            borderColor='gray.200'
          >
            {step.step_order + 1}
          </Box>
          <Box
            flexShrink={0}
            width={`${columnWidths.name}px`}
            p={2}
            borderRight='1px'
            borderColor='gray.200'
            cursor='pointer'
            onClick={() => onStepNameClick(step)}
          >
            <Text fontWeight='bold'>{step.name}</Text>
          </Box>
          <Box
            flexShrink={0}
            width={`${columnWidths.definition}px`}
            p={2}
            borderRight='1px'
            borderColor='gray.200'
            cursor='pointer'
            onClick={() => onContentClick('Definition', step.definition)}
          >
            <Text>{stripMarkdown(step.definition)}</Text>
          </Box>
          <Box
            flexShrink={0}
            width={`${columnWidths.example}px`}
            p={2}
            borderRight='1px'
            borderColor='gray.200'
            cursor='pointer'
            onClick={() => onContentClick('Example', step.example)}
          >
            <Text>{stripMarkdown(step.example)}</Text>
          </Box>
          <Box
            flexShrink={0}
            width={`${columnWidths.action}px`}
            p={2}
            borderRight='1px'
            borderColor='gray.200'
            cursor='pointer'
            onClick={() => onContentClick('Action', step.action)}
          >
            <Text>{stripMarkdown(step.action)}</Text>
          </Box>
        </Flex>
      ))}
    </Box>
  );
};

export default ResizableFunnelTable;

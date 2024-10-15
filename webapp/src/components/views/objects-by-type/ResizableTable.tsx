import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Tag as ChakraTag,
  Flex,
} from '@chakra-ui/react';
import { ObjectWithTags } from 'src/api/objType';
import dayjs from 'dayjs';
import { ObjectType, ObjectTypeFilter } from 'src/types';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';
import { MasterFormElement } from 'src/components/rich-object-form/MasterFormElement';
import { Link } from 'react-router-dom';
import { shortenText } from 'src/utils';

interface ResizableTableProps {
  objectType: ObjectType;
  objects: ObjectWithTags[];
  filter: ObjectTypeFilter;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onObjectClick: (objectId: string) => void;
}

const ResizableTable: React.FC<ResizableTableProps> = ({
  objectType,
  objects,
  filter,
  totalCount,
  currentPage,
  itemsPerPage,
  onPageChange,
  onObjectClick,
}) => {
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
    {}
  );
  const [isResizing, setIsResizing] = useState(false);
  const resizingColumn = useRef<string | null>(null);
  const startX = useRef<number>(0);

  useEffect(() => {
    const initialColumnWidths: any = {
      name: 150,
      'description and tags': 300,
      created_at: 150,
    };
    filter.displayColumns?.forEach((key) => {
      initialColumnWidths[key] = 150;
    });
    setColumnWidths(initialColumnWidths);
  }, [filter]);

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

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const columns = [
    'name',
    'description and tags',
    'created_at',
    ...(filter.displayColumns || []),
  ];

  return (
    <>
      <Box overflowX='auto'>
        <VStack align='stretch' spacing={0}>
          {/* Header */}
          <Flex borderBottom='1px' borderColor='gray.200' bg='gray.50'>
            {columns.map((column) => (
              <Box
                key={column}
                flexShrink={0}
                width={`${columnWidths[column]}px`}
                p={2}
                fontWeight='bold'
                position='relative'
              >
                {column}
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

          {/* Rows */}
          {objects?.map((obj) => (
            <Flex
              key={obj.id}
              borderBottom='1px'
              borderColor='gray.200'
              onClick={() => onObjectClick(obj.id)}
              cursor='pointer'
              _hover={{ bg: 'gray.100' }}
            >
              <Box
                flexShrink={0}
                width={`${columnWidths['name']}px`}
                p={2}
                borderRight={1}
                borderStyle='solid'
                borderColor={'gray.300'}
              >
                <Link
                  to={`/objects/${obj.id}`}
                  style={{
                    textDecoration: 'underline',
                    color: 'var(--color-primary)',
                  }}
                >
                  {shortenText(obj.name, 30)}
                </Link>
              </Box>
              <Box
                flexShrink={0}
                width={`${columnWidths['description and tags']}px`}
                p={2}
                borderRight={1}
                borderStyle='solid'
                borderColor={'gray.300'}
              >
                <MarkdownDisplay
                  content={obj.description}
                  characterLimit={200}
                />
                {obj.tags?.map((tag: any) => (
                  <ChakraTag
                    key={tag.id}
                    size='sm'
                    variant='solid'
                    background={tag.color_schema.background}
                    color={tag.color_schema.text}
                    m={1}
                  >
                    {tag.name}
                  </ChakraTag>
                ))}
              </Box>
              <Box
                flexShrink={0}
                width={`${columnWidths['created_at']}px`}
                p={2}
                borderRight={1}
                borderStyle='solid'
                borderColor={'gray.300'}
              >
                {dayjs(obj.created_at).format('DD MMM YY HH:mm')}
              </Box>
              {filter.displayColumns?.map((field) => (
                <Box
                  key={field}
                  flexShrink={0}
                  width={`${columnWidths[field]}px`}
                  p={2}
                  borderRight={1}
                  borderStyle='solid'
                  borderColor={'gray.300'}
                >
                  {/* {obj.typeValues?.[field]} , {objectType.fields[field]} */}
                  <MasterFormElement
                    key={field}
                    field={field}
                    dataType={objectType.fields[field]}
                    value={obj.typeValues?.[field]}
                  />
                </Box>
              ))}
            </Flex>
          ))}
        </VStack>
      </Box>

      <HStack justifyContent='space-between' mt={4}>
        <Text>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{' '}
          objects
        </Text>
        <HStack>
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </HStack>
      </HStack>
    </>
  );
};

export default ResizableTable;

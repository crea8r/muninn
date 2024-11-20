import React, { useState, useRef } from 'react';
import {
  Box,
  Flex,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
} from '@chakra-ui/react';

interface AliasInputProps {
  value: string[];
  onChange: (aliases: string[]) => void;
  placeholder?: string;
  isReadOnly?: boolean;
}

const AliasInput: React.FC<AliasInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Type and press Enter to add...',
  isReadOnly = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeAlias = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Box
      border='1px solid'
      borderColor='gray.200'
      borderRadius='md'
      p={2}
      minHeight='40px'
    >
      <Flex flexWrap='wrap' gap={2}>
        {value.map((alias, index) => (
          <Tag
            key={index}
            size='md'
            borderRadius='full'
            variant='solid'
            colorScheme='blue'
          >
            <TagLabel>{alias}</TagLabel>
            {!isReadOnly && (
              <TagCloseButton onClick={() => removeAlias(index)} />
            )}
          </Tag>
        ))}
        {!isReadOnly && (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            size='sm'
            border='none'
            _focus={{ outline: 'none', boxShadow: 'none' }}
            flexGrow={1}
            minWidth='120px'
          />
        )}
      </Flex>
    </Box>
  );
};

export default AliasInput;

import React, { useState, useEffect } from 'react';
import {
  VStack,
  Text,
  Divider,
  Box,
  Flex,
  Select,
  Button,
} from '@chakra-ui/react';
import { FactForm } from '../forms';
import { FactToCreate } from 'src/api/fact';
import { listTags } from 'src/api/tag';
import { Tag } from 'src/types';
import { TagInput } from '../TagInput';

interface Step4Props {
  setDefaultFact: (fact: FactToCreate) => void;
  setSelectedTags: (tags: string[]) => void;
  selectedTags: string[];
  columns: string[];
  defaultFact: FactToCreate;
}

const Step4: React.FC<Step4Props> = ({
  setDefaultFact,
  setSelectedTags,
  selectedTags,
  columns,
  defaultFact,
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>(columns[0]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const response = await listTags({ page: 1, pageSize: 100 });
        setAvailableTags(response.tags || []);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);
  const handleAddColumnToFact = () => {
    setDefaultFact({
      ...defaultFact,
      text: `${defaultFact.text} {{${selectedColumn}}}`,
    });
  };

  return (
    <VStack spacing={4} align='stretch'>
      <Box>
        <Text fontWeight='bold'>
          Step 4: Add tags and fact for imported objects
        </Text>
        <Divider mt={2} mb={4} />
      </Box>

      <Box>
        <Text fontWeight='bold' mb={2}>
          Select Tags:
        </Text>
        <Text fontSize='sm' color='gray.600' mb={2}>
          These tags will be attached to all imported objects
        </Text>
        <TagInput
          tags={selectedTags}
          onChange={(selectedTags) => {
            setSelectedTags(selectedTags.map((tag) => tag));
          }}
          availableTags={availableTags}
          isLoading={isLoading}
        />
      </Box>
      <Divider />
      <Box mt={4}>
        <Text fontWeight='bold' mb={2}>
          Add Fact
        </Text>
        <Text fontSize='sm' color='gray.600' mb={2}>
          This fact will be attached to all imported objects, build the text
        </Text>
        <Flex direction={'row'} mb={2}>
          <Select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            mr={4}
          >
            {columns.map((column, index) => (
              <option key={index} value={column}>
                {column}
              </option>
            ))}
          </Select>
          <Button onClick={handleAddColumnToFact}>Add to Fact</Button>
        </Flex>
        <FactForm
          fact={defaultFact}
          onChange={(fact) => {
            setDefaultFact(fact as FactToCreate);
          }}
          showPanel={false}
        />
      </Box>
    </VStack>
  );
};

export default Step4;

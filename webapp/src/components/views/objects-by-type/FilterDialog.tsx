import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  HStack,
  Select,
  Input,
  Tag as ChakraTag,
  Flex,
  TagLabel,
  TagCloseButton,
  Box,
  CheckboxGroup,
  Checkbox,
  TabList,
  Tab,
  Tabs,
  TabPanel,
  TabPanels,
} from '@chakra-ui/react';
import { ListTagsParams } from 'src/api/tag';
import { Tag, ObjectTypeFilter } from 'src/types';
import TagSuggestion from 'src/components/TagSuggestion';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (newFilter: ObjectTypeFilter) => void;
  onSearchTag: (queryParams: ListTagsParams) => void;
  initialFilters: ObjectTypeFilter;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
  onSearchTag,
  initialFilters,
}) => {
  const objectTypeFields = initialFilters.objectTypeFields || {};
  const [selectedFields, setSelectedFields] = useState<{
    [key: string]: string;
  }>(initialFilters.keyValues || {});
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    initialFilters.tags || []
  );
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    initialFilters.displayColumns || []
  );
  const [currentField, setCurrentField] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<string>('');

  useEffect(() => {
    setSelectedFields(initialFilters.keyValues || {});
    setSelectedTags(initialFilters.tags || []);
    setSelectedColumns(initialFilters.displayColumns || []);
  }, [initialFilters]);

  const handleAddFilter = () => {
    if (currentField && currentValue) {
      setSelectedFields((prev) => ({ ...prev, [currentField]: currentValue }));
      handleReset();
    }
  };

  const handleApplyFilter = () => {
    onApplyFilter({
      ...initialFilters,
      keyValues: { ...selectedFields },
      tags: selectedTags,
      displayColumns: selectedColumns,
    });
    onClose();
  };

  const removeField = (key: string) => {
    const tmp = selectedFields;
    delete tmp[key];
    setSelectedFields({ ...tmp });
  };

  const removeTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };

  const handleReset = () => {
    setCurrentField('');
    setCurrentValue('');
  };

  const fetchTagSuggestion = async (query: string): Promise<Tag[]> => {
    const response: any = await onSearchTag({
      page: 0,
      pageSize: 10,
      query,
    });
    return response.tags;
  };

  const onAttachTag = (tagToAttach: Tag) => {
    if (!selectedTags.find((tag) => tag.id === tagToAttach.id)) {
      setSelectedTags((prev) => [...prev, tagToAttach]);
    }
    setCurrentField('');
    setCurrentValue('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Advanced filter dialog</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Filter Setup</Tab>
              <Tab>Displaying Columns ({selectedColumns.length})</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Box>
                  <Box my={2}>
                    <Box mb={1}>Filter by field:</Box>
                    <HStack>
                      <Select
                        placeholder='Select field'
                        value={currentField}
                        onChange={(e) => setCurrentField(e.target.value)}
                      >
                        {Object.entries(objectTypeFields)
                          .filter(
                            ([key, field]) => selectedFields[key] === undefined
                          )
                          .map(([key, field]) => (
                            <option key={key} value={key}>
                              {field.label || key}
                            </option>
                          ))}
                      </Select>
                      <Input
                        placeholder='Enter value'
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                      />
                      <Button onClick={handleAddFilter}>Add</Button>
                    </HStack>
                  </Box>
                  <Box mb={2}>
                    <Box mb={1}>Filter by Tags:</Box>
                    <TagSuggestion
                      onAttachTag={onAttachTag}
                      onCreateAndAttachTag={() => {}}
                      fetchSuggestions={fetchTagSuggestion}
                    />
                  </Box>
                  <Flex
                    flexWrap='wrap'
                    alignItems='center'
                    minHeight='40px'
                    py={2}
                  >
                    {Object.entries(selectedFields).map(([field, value]) => (
                      <ChakraTag key={field} margin={1}>
                        <TagLabel>
                          {field} : {value}
                        </TagLabel>
                        <TagCloseButton onClick={() => removeField(field)} />
                      </ChakraTag>
                    ))}
                    {selectedTags.map((tag) => (
                      <ChakraTag
                        background={tag.color_schema.background}
                        color={tag.color_schema.text}
                        key={tag.id}
                        margin={1}
                        title={tag.description}
                      >
                        tag: {tag.name}
                        <TagCloseButton onClick={() => removeTag(tag.id)} />
                      </ChakraTag>
                    ))}
                  </Flex>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box>
                  <CheckboxGroup value={selectedColumns}>
                    {Object.entries(objectTypeFields).map(([key, field]) => (
                      <Checkbox
                        key={key}
                        value={key}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedColumns((prev) => [...prev, key]);
                          } else {
                            setSelectedColumns((prev) =>
                              prev.filter((col) => col !== key)
                            );
                          }
                        }}
                        mx={1}
                      >
                        {field.label || key}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={handleApplyFilter}>
            Apply Filters
          </Button>
          <Button variant='ghost' onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FilterDialog;

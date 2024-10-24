import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Select,
  useToast,
  Text,
  Badge,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import { ObjectTypeForm } from 'src/components/forms';
import {
  listObjectTypes,
  createObjectType,
  updateObjectType,
  deleteObjectType,
  ListObjectTypesParams,
} from 'src/api/objType';
import { ObjectType } from 'src/types';
import { useHistory } from 'react-router-dom';
import FaIconList from 'src/components/FaIconList';
import LoadingPanel from 'src/components/LoadingPanel';
import LoadingModal from 'src/components/LoadingModal';
import { debounce } from 'lodash';

const ITEMS_PER_PAGE = 6;

const ObjectTypesPage: React.FC = () => {
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingObjectTypeList, setIsLoadingObjectTypeList] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingObjectType, setEditingObjectType] = useState<
    ObjectType | undefined
  >(undefined);
  const toast = useToast();
  const history = useHistory();

  useEffect(() => {
    debounce(fetchObjectTypes, 500)();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const fetchObjectTypes = async () => {
    setIsLoadingObjectTypeList(true);
    try {
      const params: ListObjectTypesParams = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        query: searchQuery,
      };
      const response = await listObjectTypes(params);
      setObjectTypes(response.objectTypes || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      toast({
        title: 'Error fetching object types',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoadingObjectTypeList(false);
  };

  const handleCreateObjectType = async (newObjectType: ObjectType) => {
    try {
      setIsLoading(true);
      await createObjectType({
        name: newObjectType.name,
        description: newObjectType.description || '',
        fields: newObjectType.fields,
        icon: newObjectType.icon,
      });
      await fetchObjectTypes();
      onClose();
      toast({
        title: 'Object type created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error creating object type',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateObjectType = async (updatedObjectType: ObjectType) => {
    try {
      setIsLoading(true);
      await updateObjectType(updatedObjectType.id!, {
        name: updatedObjectType.name,
        description: updatedObjectType.description || '',
        fields: updatedObjectType.fields,
        icon: updatedObjectType.icon,
      });
      await fetchObjectTypes();
      onClose();
      setEditingObjectType(undefined);
      toast({
        title: 'Object type updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating object type',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteObjectType = async (id: string) => {
    const cfm = window.confirm(
      'Are you sure you want to delete this object type?'
    );
    if (!cfm) return;
    try {
      setIsLoading(true);
      await deleteObjectType(id);
      await fetchObjectTypes();
      toast({
        title: 'Object type deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting object type',
        description:
          'The object type might be in use or you may not have permission to delete it.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleEditObjectType = (objectType: ObjectType) => {
    setEditingObjectType(objectType);
    onOpen();
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <Box>
      <BreadcrumbComponent />
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          Data Types
        </Heading>
        <Button
          colorScheme='blue'
          bg='var(--color-primary)'
          onClick={() => {
            setEditingObjectType(undefined);
            onOpen();
          }}
          isDisabled={isLoadingObjectTypeList}
        >
          New Data Type
        </Button>
      </HStack>

      <InputGroup mb={4}>
        <InputLeftElement pointerEvents='none'>
          <SearchIcon color='gray.300' />
        </InputLeftElement>
        <Input
          placeholder='Search in name, description and field name'
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </InputGroup>
      {isLoading || isLoadingObjectTypeList ? (
        <LoadingPanel />
      ) : (
        <>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Fields</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {objectTypes.map((objectType) => (
                <Tr key={objectType.id}>
                  <Td>
                    <VStack align='start' spacing={1}>
                      <HStack>
                        {FaIconList[objectType.icon as keyof typeof FaIconList]}
                        <Text
                          fontWeight='bold'
                          textDecoration={'underline'}
                          _hover={{
                            cursor: 'pointer',
                            background: 'yellow.100',
                          }}
                          onClick={() =>
                            history.push(
                              `/settings/object-types/${objectType.id}`
                            )
                          }
                        >
                          {objectType.name}
                        </Text>
                      </HStack>

                      <Text fontSize='sm' color='gray.600'>
                        {objectType.description}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    {Object.keys(objectType.fields).map((k, index) => (
                      <Badge key={index} mr={2} mb={1}>
                        {k}: {objectType.fields[k]}
                      </Badge>
                    ))}
                  </Td>
                  <Td minWidth='200px'>
                    <Button
                      size='sm'
                      mr={2}
                      onClick={() => handleEditObjectType(objectType)}
                    >
                      Edit
                    </Button>
                    <Button
                      size='sm'
                      colorScheme='red'
                      onClick={() => handleDeleteObjectType(objectType.id!)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Flex justifyContent='space-between' alignItems='center' mt={4}>
            <Box>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{' '}
              {totalCount} object types
            </Box>
            <HStack>
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                isLoading={isLoading}
              >
                Previous
              </Button>
              <Select
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <option key={page} value={page}>
                      Page {page}
                    </option>
                  )
                )}
              </Select>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                isLoading={isLoading}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </>
      )}

      <ObjectTypeForm
        isOpen={isOpen && !isLoading}
        onClose={() => {
          onClose();
          setEditingObjectType(undefined);
        }}
        onSave={
          editingObjectType ? handleUpdateObjectType : handleCreateObjectType
        }
        initialData={editingObjectType}
      />

      <LoadingModal isOpen={isLoading} onClose={() => {}} />
    </Box>
  );
};

export default ObjectTypesPage;

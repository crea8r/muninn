import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  UnorderedList,
  ListItem,
  useDisclosure,
  Input,
  Select,
  Flex,
  useToast,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import BreadcrumbComponent from '../../components/Breadcrumb';
import { CreateFunnelForm, EditFunnelForm } from '../../components/forms/';
import { Funnel, NewFunnel, FunnelUpdate } from '../../types/Funnel';
import {
  fetchAllFunnels,
  createFunnel,
  updateFunnel,
  deleteFunnel,
} from 'src/api/funnel';
import { useHistory } from 'react-router-dom';
import LoadingPanel from 'src/components/LoadingPanel';
import LoadingModal from 'src/components/LoadingModal';

const ITEMS_PER_PAGE = 10;

const FunnelsPage: React.FC = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadFunnels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const loadFunnels = async () => {
    try {
      setIsLoading(true);
      const result = await fetchAllFunnels(
        currentPage,
        ITEMS_PER_PAGE,
        searchQuery
      );
      setFunnels(result.funnels);
      setTotalCount(result.totalCount);
    } catch (error) {
      toast({
        title: 'Error loading funnels',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFunnel = async (newFunnel: NewFunnel) => {
    try {
      setIsLoading(true);
      await createFunnel(newFunnel);
      onCreateClose();
      await loadFunnels();
      toast({
        title: 'Funnel created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error creating funnel',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFunnel = async (funnelUpdate: FunnelUpdate) => {
    try {
      setIsLoading(true);
      await updateFunnel(funnelUpdate);
      onEditClose();
      setEditingFunnel(null);
      await loadFunnels();
      toast({
        title: 'Funnel updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating funnel',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFunnel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this funnel?')) {
      try {
        setIsLoading(true);
        await deleteFunnel(id);
        await loadFunnels();
        toast({
          title: 'Funnel deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error deleting funnel',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (funnel: Funnel) => {
    setEditingFunnel(funnel);
    onEditOpen();
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const history = useHistory();

  return (
    <Box>
      <BreadcrumbComponent />
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          Funnels
        </Heading>
        <Button
          colorScheme='blue'
          bg='var(--color-primary)'
          onClick={onCreateOpen}
          isDisabled={isLoading}
        >
          New Funnel
        </Button>
      </HStack>
      <InputGroup mb={4}>
        <InputLeftElement pointerEvents='none'>
          <SearchIcon color='gray.300' />
        </InputLeftElement>
        <Input
          placeholder='Search in name and description'
          value={searchQuery}
          onChange={handleSearchChange}
          isDisabled={isLoading}
        />
      </InputGroup>
      {isLoading ? (
        <LoadingPanel />
      ) : (
        <>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Steps</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {funnels.map((funnel) => (
                <Tr key={funnel.id}>
                  <Td maxWidth='250px'>
                    <VStack align='left'>
                      <Text
                        fontWeight='bold'
                        textDecoration={'underline'}
                        cursor={'pointer'}
                        onClick={() =>
                          history.push(`/settings/funnels/${funnel.id}`)
                        }
                      >
                        {funnel.name}
                      </Text>
                      <Box>{funnel.description}</Box>
                    </VStack>
                  </Td>
                  <Td>
                    <UnorderedList>
                      {funnel.steps.map((step, index) => (
                        <ListItem key={index}>{step.name}</ListItem>
                      ))}
                    </UnorderedList>
                  </Td>
                  <Td width='200px'>
                    <Button size='sm' onClick={() => handleEdit(funnel)} mr={2}>
                      Edit
                    </Button>
                    <Button
                      size='sm'
                      colorScheme='red'
                      onClick={() => handleDeleteFunnel(funnel.id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Flex justifyContent='space-between' alignItems='center' mt={4}>
            <Text>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{' '}
              {totalCount} funnels
            </Text>
            <HStack>
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
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
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </>
      )}

      <CreateFunnelForm
        isOpen={isCreateOpen && !isLoading}
        onClose={onCreateClose}
        onSave={handleCreateFunnel}
      />
      {editingFunnel && (
        <EditFunnelForm
          isOpen={isEditOpen && !isLoading}
          onClose={onEditClose}
          funnel={editingFunnel}
          onSave={handleUpdateFunnel}
        />
      )}
      <LoadingModal isOpen={isLoading} onClose={() => {}} />
    </Box>
  );
};

export default FunnelsPage;

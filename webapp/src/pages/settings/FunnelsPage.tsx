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
  Select,
  Flex,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import BreadcrumbComponent from '../../components/Breadcrumb';
import { CreateFunnelForm } from '../../components/forms/';
import { Funnel, NewFunnel } from '../../types/Funnel';
import { fetchAllFunnels, createFunnel } from 'src/api/funnel';
import { useHistory } from 'react-router-dom';
import LoadingPanel from 'src/components/LoadingPanel';
import { debounce } from 'lodash';
import {
  FaEdit,
  FaFilter,
  FaFunnelDollar,
  FaQuestionCircle,
} from 'react-icons/fa';
import { shortenText } from 'src/utils';
import {
  UnsavedChangesProvider,
  useUnsavedChangesContext,
} from 'src/contexts/unsaved-changes/UnsavedChange';
import { STORAGE_KEYS, useGlobalContext } from 'src/contexts/GlobalContext';
import LoadingScreen from 'src/components/LoadingScreen';
import { SearchInput } from 'src/components/SearchInput';
import { InfoDialogButton } from 'src/components/InfoDialog';
import { InfoIcon } from '@chakra-ui/icons';

const ITEMS_PER_PAGE =
  parseInt(localStorage.getItem(STORAGE_KEYS.PER_PAGE)) || 10;

const FunnelPageWrapper: React.FC = () => {
  return (
    <UnsavedChangesProvider enabled={true}>
      <FunnelsPage />
    </UnsavedChangesProvider>
  );
};

const FunnelsPage: React.FC = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFunnelList, setIsLoadingFunnelList] = useState(true);
  const [isShowHelp, setIsShowHelp] = useState(false);
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const toast = useToast();
  const { setDirty } = useUnsavedChangesContext();
  const { refreshFunnels } = useGlobalContext();
  useEffect(() => {
    debounce(loadFunnels, 500)();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const loadFunnels = async () => {
    setIsLoadingFunnelList(true);
    try {
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
      setIsLoadingFunnelList(false);
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
      setDirty(false);
    } catch (error) {
      toast({
        title: 'Error creating funnel',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      refreshFunnels();
      setIsLoading(false);
    }
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleView = (funnel: Funnel) => {
    history.push(`/settings/funnels/${funnel.id}/detail`);
  };

  const handleClickFunnelName = (funnel: Funnel) => {
    history.push(`/settings/funnels/${funnel.id}`);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const history = useHistory();

  return (
    <Box>
      <BreadcrumbComponent />
      <VStack p={4} background={'white'} gap={3}>
        <HStack justify='space-between' width={'100%'} mb={6}>
          <HStack gap={1}>
            <FaFilter size={'36px'} color='var(--color-primary)' />
            <Heading as='h1' size='xl' color='var(--color-primary)'>
              Funnels
            </Heading>
          </HStack>
          <HStack gap={1}>
            <Button
              colorScheme='blue'
              bg='var(--color-primary)'
              onClick={onCreateOpen}
              isDisabled={isLoadingFunnelList}
            >
              New Funnel
            </Button>
            <InfoDialogButton
              onClose={() => setIsShowHelp(false)}
              isOpen={isShowHelp}
              title={
                <HStack gap={1}>
                  <InfoIcon />
                  <Text>What is a funnel?</Text>
                </HStack>
              }
              content={
                'A funnel is a structured path that guides individuals from initial engagement to a desired outcome, such as joining, participating, or advocating for a community. In community management, funnels help convert casual members into engaged and active participants. By clearly mapping stages like awareness, interest, engagement, and loyalty, a funnel enables community managers to identify where members might need support or encouragement to progress to the next level.'
              }
              button={
                <IconButton
                  aria-label='help'
                  icon={<FaQuestionCircle />}
                  onClick={() => setIsShowHelp(true)}
                  variant={'outline'}
                  color={'var(--color-primary)'}
                />
              }
            />
          </HStack>
        </HStack>
        <SearchInput
          initialSearchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          placeholder='Search in name and description'
          isLoading={isLoadingFunnelList}
        />
        {isLoadingFunnelList ? (
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
                          onClick={() => handleClickFunnelName(funnel)}
                        >
                          {funnel.name}
                        </Text>
                        <Box>{shortenText(funnel.description, 30)}</Box>
                      </VStack>
                    </Td>
                    <Td>
                      <UnorderedList>
                        {funnel.steps?.map((step, index) => (
                          <ListItem key={index}>
                            {shortenText(step.name, 20)}
                          </ListItem>
                        ))}
                      </UnorderedList>
                    </Td>
                    <Td width='250px'>
                      <IconButton
                        icon={<FaEdit />}
                        onClick={() => handleView(funnel)}
                        aria-label=''
                        size='sm'
                        mr={2}
                      />
                      <IconButton
                        size='sm'
                        icon={<FaFunnelDollar />}
                        onClick={() => handleClickFunnelName(funnel)}
                        aria-label={''}
                        mr={2}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Flex
              justifyContent='space-between'
              alignItems='center'
              mt={4}
              width={'100%'}
            >
              <Box display={['none', 'none', 'none', 'block']}>
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{' '}
                {totalCount} funnels
              </Box>
              <HStack>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
      </VStack>

      <CreateFunnelForm
        isOpen={isCreateOpen && !isLoading}
        onClose={onCreateClose}
        onSave={handleCreateFunnel}
      />
      {isLoading && (
        <Box
          width={'100%'}
          height={'100vh'}
          position={'absolute'}
          top={0}
          left={0}
          zIndex={1000}
        >
          <LoadingScreen />
        </Box>
      )}
    </Box>
  );
};

export default FunnelPageWrapper;

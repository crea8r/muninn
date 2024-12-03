import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import dayjs from 'dayjs';
import { FiRefreshCcw } from 'react-icons/fi';

const SettingsPage: React.FC = () => {
  const { globalData, refreshFunnels, refreshObjectTypes, refreshTags } =
    useGlobalContext();
  dayjs.extend(require('dayjs/plugin/relativeTime'));
  const noLoading = { objectTypes: false, funnels: false, tags: false };
  const [loading, setLoading] = React.useState(noLoading);
  const settingsSections = [
    {
      name: 'Object Types',
      path: '/settings/data-types',
      lastUpdated: globalData?.objectTypeData?.lastUpdated,
      reloadButton: (
        <IconButton
          isDisabled={loading.objectTypes}
          icon={
            loading.objectTypes ? <Spinner size={'sm'} /> : <FiRefreshCcw />
          }
          aria-label='Reload'
          onClick={async () => {
            setLoading({ ...loading, objectTypes: true });
            await refreshObjectTypes();
            setLoading({ ...loading, objectTypes: false });
          }}
        />
      ),
    },
    {
      name: 'Funnels',
      path: '/settings/funnels',
      lastUpdated: globalData?.funnelData?.lastUpdated,
      reloadButton: (
        <IconButton
          icon={loading.funnels ? <Spinner size={'sm'} /> : <FiRefreshCcw />}
          aria-label='Reload'
          onClick={async () => {
            setLoading({ ...loading, funnels: true });
            await refreshFunnels();
            setLoading({ ...loading, funnels: false });
          }}
        />
      ),
    },
    {
      name: 'Tags',
      path: '/settings/tags',
      lastUpdated: globalData?.tagData?.lastUpdated,
      reloadButton: (
        <IconButton
          icon={loading.tags ? <Spinner size={'sm'} /> : <FiRefreshCcw />}
          aria-label='Reload'
          onClick={async () => {
            setLoading({ ...loading, tags: true });
            await refreshTags();
            setLoading({ ...loading, tags: false });
          }}
        />
      ),
    },
    { name: 'Templates', path: '/settings/templates' },
    { name: 'Automations', path: '/settings/automations' },
  ];

  return (
    <Box>
      <Heading as='h1' size='xl' color='var(--color-primary)' mb={6}>
        Settings
      </Heading>
      <VStack spacing={4} align='stretch'>
        {settingsSections.map((section, index) => (
          <Box key={index} p={4} bg='white' borderRadius='md' boxShadow='sm'>
            <HStack justify='space-between'>
              <VStack align='stretch'>
                <Text fontWeight='bold'>{section.name}</Text>
                <Text>
                  {section.lastUpdated
                    ? `Last synced: ${dayjs(section.lastUpdated).fromNow()}`
                    : ''}
                </Text>
              </VStack>
              <HStack>
                {section.reloadButton}
                <Button
                  as={RouterLink}
                  to={section.path}
                  colorScheme='blue'
                  size='sm'
                >
                  Manage
                </Button>
              </HStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default SettingsPage;

import React from 'react';
import { Box, VStack, Heading, Text, Button, HStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const settingsSections = [
    { name: 'Object Types', path: '/settings/object-types' },
    { name: 'Funnels', path: '/settings/funnels' },
    { name: 'Templates', path: '/settings/templates' },
    { name: 'Tags', path: '/settings/tags' },
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
              <Text fontWeight='bold'>{section.name}</Text>
              <Button
                as={RouterLink}
                to={section.path}
                colorScheme='blue'
                size='sm'
              >
                Manage
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default SettingsPage;

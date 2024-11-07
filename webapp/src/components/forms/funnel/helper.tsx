import { ArrowForwardIcon, InfoIcon, StarIcon } from '@chakra-ui/icons';
import { HStack, VStack, Text } from '@chakra-ui/react';

interface RenderStepHeaderProps {
  type: 'defition' | 'example' | 'action';
}
export const RenderStepHeader = ({ type }: RenderStepHeaderProps) => {
  switch (type) {
    case 'defition':
      return (
        <VStack align={'left'}>
          <HStack>
            <InfoIcon />
            <Text>
              Step Definition: Explain current status of the object in the step.
            </Text>
          </HStack>

          <Text color='gray.500' fontSize='sm' fontWeight={'light'}>
            A personal has been to an event, a contact has been connected, a
            project has been created, etc.
          </Text>
        </VStack>
      );
    case 'example':
      return (
        <VStack align={'left'}>
          <HStack>
            <StarIcon />
            <Text>Step Example: What is the example of this step?</Text>
          </HStack>

          <Text color='gray.500' fontSize='sm' fontWeight={'light'}>
            A person name, a project name, etc.
          </Text>
        </VStack>
      );
    case 'action':
      return (
        <VStack align={'left'}>
          <HStack>
            <ArrowForwardIcon />
            <Text>
              Step Action: What action <mark>YOU</mark> are going to take to
              move this object to the next step?
            </Text>
          </HStack>

          <Text color='gray.500' fontSize='sm' fontWeight={'light'}>
            Send an email, make a call, send a message, invite to a meeting,
            etc.
          </Text>
        </VStack>
      );
    default:
      return <h2>Unknown Term</h2>;
  }
};

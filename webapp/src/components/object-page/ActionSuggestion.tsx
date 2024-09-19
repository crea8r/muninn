import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, Button, Flex, useToast } from '@chakra-ui/react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

// Mock action suggestions
const mockActions = [
  'Schedule a follow-up call with the client',
  'Send a personalized email with product benefits',
  'Create a custom proposal based on client needs',
  'Offer a demo of the premium features',
  'Share relevant case studies via email',
  'Invite the client to an upcoming webinar',
  'Conduct a needs assessment survey',
  'Provide a limited-time discount offer',
  'Set up a product training session',
  'Send a handwritten thank-you note',
  'Share industry-specific use cases',
  'Offer a free trial extension',
  'Schedule a face-to-face meeting',
  'Send a comparison chart with competitors',
  'Provide customer testimonials',
  'Offer a complementary consultation',
  'Send a personalized video message',
  'Invite to an exclusive customer event',
  'Provide a ROI calculation tool',
  'Share recent company news or achievements',
  'Offer a bundle deal with related products',
  'Send a relevant whitepaper or e-book',
  'Provide a personalized product tour',
  'Set up a meeting with a technical expert',
  'Send a customer success story video',
  'Offer an early access to new features',
  'Provide a customized implementation plan',
  'Send a quarterly business review invitation',
  'Offer a loyalty program enrollment',
  'Share a product roadmap preview',
];

interface ActionSuggestionProps {
  objectId: string;
  onActionTaken: (action: string) => void;
}

const ActionSuggestion: React.FC<ActionSuggestionProps> = ({
  objectId,
  onActionTaken,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const toast = useToast();

  useEffect(() => {
    // Randomly select 3 unique actions
    const randomActions = [...mockActions]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setSuggestions(randomActions);
  }, [objectId]);

  const handleFeedback = (action: string, isPositive: boolean) => {
    // TODO: Send feedback to the backend
    console.log(
      `Feedback for action "${action}": ${isPositive ? 'positive' : 'negative'}`
    );
    const newSuggestions = suggestions.filter((s) => s !== action);
    const newAction =
      mockActions[Math.floor(Math.random() * mockActions.length)];
    setSuggestions([...newSuggestions, newAction]);
    toast({
      title: 'Feedback received',
      description: `Thank you for your ${
        isPositive ? 'positive' : 'negative'
      } feedback.`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleActionClick = (action: string) => {
    onActionTaken(action);
    // Remove the taken action from suggestions
    setSuggestions(suggestions.filter((s) => s !== action));
  };

  return (
    <Box borderWidth={1} borderRadius='md' p={4}>
      <Text fontSize='xl' fontWeight='bold' mb={4}>
        AI Suggested Actions
      </Text>
      <VStack spacing={4} align='stretch'>
        {suggestions.map((action, index) => (
          <Box key={index} borderWidth={1} borderRadius='md' p={3}>
            <Text mb={2}>{action}</Text>
            <Flex justifyContent='space-between'>
              {/* <Button
                size='sm'
                colorScheme='blue'
                onClick={() => handleActionClick(action)}
              >
                Take Action
              </Button> */}
              <Flex>
                <Button
                  size='sm'
                  leftIcon={<FaThumbsUp />}
                  mr={2}
                  onClick={() => handleFeedback(action, true)}
                  colorScheme='blue'
                >
                  Like
                </Button>
                <Button
                  size='sm'
                  leftIcon={<FaThumbsDown />}
                  onClick={() => handleFeedback(action, false)}
                  colorScheme='red'
                >
                  Dislike
                </Button>
              </Flex>
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ActionSuggestion;

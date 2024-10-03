import React, { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import FunnelStep from './FunnelStep';
import { FunnelViewType } from 'src/api/funnel';
import { FaPlus, FaSave } from 'react-icons/fa';
import CreateListDialog from 'src/components/CreateListDialog';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';

type ObjectsByFunnelProps = {
  funnelId: string;
  getFunnelView: any;
};

const ObjectsByFunnel: React.FC<ObjectsByFunnelProps> = ({
  funnelId,
  getFunnelView,
}: ObjectsByFunnelProps) => {
  const [funnelViewData, setFunnelViewData] = useState<FunnelViewType>();
  const {
    isOpen: isListOpen,
    onClose: onListClose,
    onOpen: onListOpen,
  } = useDisclosure();

  useEffect(() => {
    const initFunnelViewData = async () => {
      try {
        setFunnelViewData(await getFunnelView(funnelId));
      } catch (e) {
        console.error(e);
      }
    };
    initFunnelViewData();
  }, [funnelId]);
  const funnel = funnelViewData?.funnel || {};
  const steps = funnelViewData?.steps || [];
  let total = 0;
  steps.forEach((s: any) => {
    total += s.objects?.length || 0;
  });
  let orderedSteps = steps.sort((a, b) => a.step.order - b.step.order);
  return (
    <Box overflowX='auto'>
      <HStack>
        <Text fontSize={'large'} fontWeight={'bold'}>
          {funnel.name} ({total})
        </Text>
        <Button
          leftIcon={<FaSave />}
          size='sm'
          title='Save as a list'
          onClick={onListOpen}
        >
          Save As List
        </Button>
      </HStack>

      <HStack spacing={2} mt={2}>
        {orderedSteps.map((orderedStep, k) => (
          <HStack key={k}>
            <Popover>
              <PopoverTrigger>
                <Badge
                  colorScheme={k === orderedStep.length - 1 ? 'green' : 'gray'}
                  _hover={{ cursor: 'pointer', background: 'yellow.100' }}
                >
                  {orderedStep.step.name}
                </Badge>
              </PopoverTrigger>
              <PopoverContent>
                <Box p={2}>
                  {orderedStep.step.definition && (
                    <Box>
                      <Text fontWeight={'bold'}>Definition:</Text>
                      <MarkdownDisplay content={orderedStep.step.definition} />
                    </Box>
                  )}
                  {orderedStep.step.example && (
                    <Box>
                      <Text fontWeight={'bold'}>Example:</Text>
                      <MarkdownDisplay content={orderedStep.step.example} />
                    </Box>
                  )}
                  {orderedStep.step.action && (
                    <Box>
                      <Text fontWeight={'bold'}>Action:</Text>
                      <MarkdownDisplay content={orderedStep.step.action} />
                    </Box>
                  )}
                </Box>
              </PopoverContent>
            </Popover>
            {k < orderedSteps.length - 1 && <Text>→</Text>}
          </HStack>
        ))}
      </HStack>

      {funnel.description && (
        <Alert my={2}>
          <MarkdownDisplay content={funnel.description} />
        </Alert>
      )}
      <HStack spacing={4} alignItems='flex-start' overflow={'scroll'} pl={2}>
        {steps.map((stepInfo) => (
          <FunnelStep
            key={stepInfo.step.id}
            step={stepInfo.step}
            objects={stepInfo.objects || []}
            onObjectMove={() => {}}
          />
        ))}
      </HStack>
      <CreateListDialog
        isOpen={isListOpen}
        onClose={onListClose}
        filterSetting={{
          funnelId: funnelId,
        }}
        onListCreated={() => {}}
      />
    </Box>
  );
};

export default ObjectsByFunnel;

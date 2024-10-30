import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Modal,
  ModalHeader,
  ModalBody,
  useDisclosure,
  ModalOverlay,
  ModalContent,
} from '@chakra-ui/react';
import { Fact, StepAndFunnel, Object } from 'src/types/';
import dayjs from 'dayjs';
import FactItem from 'src/components/FactItem';
import { randomId } from 'src/utils';
import { FactForm } from 'src/components/forms';
import { FactToCreate, FactToUpdate } from 'src/api/fact';

interface ActivityFeedProps {
  facts: Fact[];
  stepsAndFunnels: StepAndFunnel[];
  object: Object;
  onSave: (toSubmitFact: FactToUpdate | FactToCreate) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  facts,
  stepsAndFunnels,
  object,
  onSave,
}) => {
  const {
    isOpen: isFactFormOpen,
    onOpen: openFactForm,
    onClose: closeFactForm,
  } = useDisclosure();
  const [editingFact, setEditingFact] = React.useState<Fact | undefined>(
    undefined
  );
  const groupItemsByDate = (items: Fact[]) => {
    const grouped: { [date: number]: Fact[] } = {};
    items.forEach((item) => {
      const date = dayjs(item.happenedAt).startOf('day').unix();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };
  const factHistoryItems = facts.map((fact) => {
    return fact;
  });
  const stepHistoryItems = stepsAndFunnels.map((stepAndFunnel) => {
    return {
      id: randomId(4),
      text: `In *${stepAndFunnel.funnelName}* moved to step *${stepAndFunnel.stepName}*`,
      location: '',
      happenedAt: stepAndFunnel.createdAt,
      creatorId: '',
      createdAt: '',
      relatedObjects: [],
    };
  });
  let groupedFacts = groupItemsByDate([
    ...factHistoryItems,
    ...stepHistoryItems,
  ]);
  const allDates = window.Object.keys(groupedFacts).sort((a, b) => {
    return parseInt(b) - parseInt(a);
  });
  const handlleFactItemClick = (fact: Fact) => {
    const { id } = fact;
    if (id.length > 4) {
      setEditingFact(fact);
      openFactForm();
    }
  };

  return (
    <Box>
      <VStack align='stretch' spacing={6}>
        {allDates.map((date) => {
          const dateItems = groupedFacts[parseInt(date)];
          return (
            <Box key={date}>
              <Heading size='sm' mb={2}>
                {dayjs(parseInt(date) * 1000).format('MMMM D, YYYY')}
              </Heading>
              <VStack align='stretch' spacing={4}>
                {dateItems
                  .sort((a: Fact, b: Fact) =>
                    dayjs(a.happenedAt).isBefore(dayjs(b.happenedAt)) ? 1 : -1
                  )
                  .map((item, i) => (
                    <FactItem
                      key={i}
                      fact={item}
                      handleClick={() => handlleFactItemClick(item)}
                    />
                  ))}
              </VStack>
            </Box>
          );
        })}
      </VStack>
      <Modal isOpen={isFactFormOpen} onClose={closeFactForm}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Fact</ModalHeader>
          <ModalBody>
            <FactForm
              onSave={async (fact: FactToCreate | FactToUpdate) => {
                await onSave(fact);
                closeFactForm();
              }}
              fact={editingFact}
              requireObject={object}
              mode='preview'
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ActivityFeed;

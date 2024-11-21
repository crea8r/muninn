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
  useToast,
  SkeletonText,
} from '@chakra-ui/react';
import { Fact } from 'src/types/';
import dayjs from 'dayjs';
import FactItem from 'src/components/FactItem';
import { randomId } from 'src/utils';
import { FactForm } from 'src/components/forms';
import {
  createFact,
  FactToCreate,
  FactToUpdate,
  updateFact,
} from 'src/api/fact';
import { useObjectDetail } from '../contexts/ObjectDetailContext';
import { FaPlus } from 'react-icons/fa';

interface ActivityFeedProps {}

export const ActivityFeed: React.FC<ActivityFeedProps> = () => {
  const {
    isOpen: isFactFormOpen,
    onOpen: openFactForm,
    onClose: closeFactForm,
  } = useDisclosure();
  const { object, facts, refresh } = useObjectDetail();
  const [editingFact, setEditingFact] = React.useState<Fact | undefined>(
    undefined
  );
  const toast = useToast();
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
  const stepHistoryItems = (object?.stepsAndFunnels || []).map(
    (stepAndFunnel) => {
      return {
        id: randomId(4),
        text: `In *${stepAndFunnel.funnelName}* moved to step *${stepAndFunnel.stepName}*`,
        location: '',
        happenedAt: stepAndFunnel.createdAt,
        creatorId: '',
        createdAt: '',
        relatedObjects: [],
      };
    }
  );
  let groupedFacts = groupItemsByDate([
    ...factHistoryItems,
    ...stepHistoryItems,
  ]);
  const allDates = window.Object.keys(groupedFacts).sort((a, b) => {
    return parseInt(b) - parseInt(a);
  });
  // create object with each date as key and no of facts as value, later display ActivityHeatMap
  // const factCount = allDates.reduce((acc, date) => {
  //   acc[date] = groupedFacts[parseInt(date)].length;
  //   return acc;
  // }, {});

  const handleFactItemClick = (fact: Fact) => {
    const { id } = fact;
    if (id.length > 4) {
      setEditingFact(fact);
      openFactForm();
    }
  };
  const handleSave = async (toSubmitFact: FactToCreate | FactToUpdate) => {
    toast({
      title: 'Saving...',
      status: 'info',
      duration: 1000,
      isClosable: true,
    });
    try {
      if ('id' in toSubmitFact) {
        await updateFact(toSubmitFact);
      } else {
        await createFact(toSubmitFact);
      }
      toast({
        title: 'Saved',
        status: 'success',
        duration: 1000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: 'Error',
        status: 'error',
        description: 'There was an error saving the fact.',
        duration: 1000,
        isClosable: true,
      });
    }
    await refresh();
  };

  return (
    <>
      <VStack align='stretch' spacing={6} width={'100%'}>
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
                  .map((item, i) =>
                    editingFact && editingFact.id === item.id ? (
                      <>
                        <SkeletonText key={i} noOfLines={4} spacing='4' />
                      </>
                    ) : (
                      <FactItem
                        key={i}
                        fact={item}
                        handleClick={() => handleFactItemClick(item)}
                        textLimit={300}
                      />
                    )
                  )}
              </VStack>
            </Box>
          );
        })}
      </VStack>
      <Modal
        isOpen={isFactFormOpen}
        onClose={() => {
          closeFactForm();
          setEditingFact(undefined);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Fact</ModalHeader>
          <ModalBody>
            <FactForm
              onSave={async (fact: FactToCreate | FactToUpdate) => {
                closeFactForm();
                await handleSave(fact);
                setEditingFact(undefined);
              }}
              fact={editingFact}
              requireObject={object}
              mode='preview'
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export const CreateActivityButton = () => {
  const { object, refresh } = useObjectDetail();
  const {
    isOpen: isOpenNewActivityDialog,
    onOpen: onOpenNewActivityDialog,
    onClose: onCloseNewActivityDialog,
  } = useDisclosure();
  const [isDirty, setDirty] = React.useState(false);
  const toast = useToast();
  const handleAddFact = async (fact: FactToCreate) => {
    toast({
      title: 'Adding...',
      status: 'info',
      duration: 1000,
      isClosable: true,
    });
    setDirty(false);
    onCloseNewActivityDialog();
    await createFact(fact);
    refresh();
  };
  return (
    <>
      <FaPlus onClick={onOpenNewActivityDialog} />
      <Modal
        isOpen={isOpenNewActivityDialog}
        onClose={() => {
          if (isDirty) {
            const cfm = window.confirm(
              'Are you sure you want to abandon all changes?'
            );
            if (!cfm) return;
          }
          onCloseNewActivityDialog();
          setDirty(false);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Activity</ModalHeader>
          <ModalBody>
            {object && (
              <FactForm onSave={handleAddFact} requireObject={object} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

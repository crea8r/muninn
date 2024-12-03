// src/features/automation/components/AutomationForm.tsx
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  useToast,
  HStack,
  Text,
  Box,
  Spacer,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { AutomatedAction, CreateAutomationDTO } from 'src/types/Automation';
import automationApi from '../service/automation';
import { FilterConfigForm } from './filter/FilterConfigForm';
import { ActionConfigForm } from './action/ActionConfigForm';
import { FaRobot } from 'react-icons/fa';
import { FiCloudLightning, FiFilter } from 'react-icons/fi';
import { useGlobalContext } from 'src/contexts/GlobalContext';

interface AutomationFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<AutomatedAction> | null;
  onSuccess: () => void;
}

export const AutomationForm: React.FC<AutomationFormProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const { globalData } = useGlobalContext();
  const [step, setStep] = useState(1);
  const defaultValues =
    initialData && initialData.id
      ? initialData
      : {
          name: initialData?.name || '',
          description: initialData?.description || '',
          filterConfig: initialData?.filterConfig
            ? structuredClone(initialData.filterConfig || {})
            : {
                search: '',
                tagIds: [],
                typeIds: [],
                typeValueCriteria: {},
                funnelStepFilter: null,
              },
          actionConfig: initialData?.actionConfig
            ? structuredClone(initialData.actionConfig || {})
            : {
                tagIds: [],
                funnelId: '',
              },
          isActive: true,
        };
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formState: { errors, isSubmitting },
  } = useForm<CreateAutomationDTO>({
    defaultValues,
  });
  const toast = useToast();

  useEffect(() => {
    setValue('filterConfig', initialData.filterConfig);
  }, [initialData, setValue]);

  const onSubmit = async (data: CreateAutomationDTO) => {
    try {
      if (initialData && initialData.id) {
        await automationApi.updateAutomation(initialData.id, data);
      } else {
        await automationApi.createAutomation(data);
      }
      toast({
        title: `Automation ${initialData ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
      });
      onSuccess();
      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error saving automation',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // convert the filterConfig into text to describe the filter
  const filterConfigText = (filterConfig: any) => {
    if (!filterConfig) return '';
    const { search, tagIds, typeIds, typeValueCriteria, funnelStepFilter } =
      filterConfig;
    // use tag.name and type.name to display the tag and type names
    const tagsName = tagIds?.map((tagId: string) => {
      const tag = globalData?.tagData?.tags.find((t) => t.id === tagId);
      if (tag) {
        return tag.name;
      }
      return '';
    });
    const typesName = typeIds?.map((typeId: string) => {
      const type = globalData?.objectTypeData?.objectTypes.find(
        (t) => t.id === typeId
      );
      if (type) {
        return type.name;
      }
      return '';
    });
    const funnelName = globalData?.funnelData?.funnels.find(
      (funnel) => funnel.id === funnelStepFilter?.funnelId
    )?.name;
    const tagText = tagIds?.length ? `Tag(s): ${tagsName?.join(', ')}` : '';
    const typeText = typeIds?.length ? `Type: ${typesName?.join(', ')}` : '';
    const searchQuery = search ? `Search: ${search}` : '';
    const typeValueText = typeValueCriteria
      ? `Type Value: ${JSON.stringify(typeValueCriteria)}`
      : '';
    const funnelText = funnelStepFilter ? `Funnel: ${funnelName}` : '';
    return [tagText, typeText, searchQuery, typeValueText, funnelText]
      .filter((text) => text)
      .join(', ');
  };

  const actionConfigText = (actionConfig: any) => {
    if (!actionConfig) return '';
    const { tagId, funnelId } = actionConfig;
    const tag = globalData?.tagData?.tags.find((t) => t.id === tagId);
    const funnel = globalData?.funnelData?.funnels.find(
      (f) => f.id === funnelId
    );
    const tagText = tag ? `Tag(s): ${tag.name}` : '';
    const funnelText = funnel ? `Funnel: ${funnel.name}` : '';
    return [tagText, funnelText].filter((text) => text).join(', ');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      size='xl'
    >
      <ModalOverlay />
      <ModalContent maxW='800px'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <HStack>
              <FaRobot />
              <Text>
                {initialData && initialData.id
                  ? 'Edit Automation'
                  : 'Create New Automation'}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={6}>
              {step === 2 && (
                /* Basic Information */
                <VStack spacing={4} width='100%'>
                  <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input {...register('name', { required: true })} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea {...register('description')} height={'150px'} />
                  </FormControl>

                  <FormControl display='flex' alignItems='center'>
                    <FormLabel mb='0'>Active</FormLabel>
                    <Switch {...register('isActive')} />
                  </FormControl>
                </VStack>
              )}

              {step === 1 && (
                /* Filter Configuration */
                <VStack spacing={4} width={'100%'}>
                  <FormControl>
                    <FormLabel color={'var(--color-primary)'}>
                      <HStack>
                        <FiFilter />
                        <Text>Filter Configuration</Text>
                      </HStack>
                    </FormLabel>
                    <FilterConfigForm
                      value={watch('filterConfig')}
                      onChange={(config) => setValue('filterConfig', config)}
                    />
                  </FormControl>

                  {/* Action Configuration */}
                  <FormControl>
                    <FormLabel color={'var(--color-primary)'}>
                      <HStack>
                        <FiCloudLightning />
                        <Text>
                          Choose a tag or a funnel to assign object to
                        </Text>
                      </HStack>
                    </FormLabel>
                    <ActionConfigForm
                      excludeTagIds={watch('filterConfig.tagIds')}
                      excludeFunnelId={watch(
                        'filterConfig.funnelStepFilter.funnelId'
                      )}
                      value={watch('actionConfig')}
                      onChange={(config) => setValue('actionConfig', config)}
                      isLoading={isSubmitting}
                    />
                  </FormControl>
                </VStack>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              onClick={() => {
                if (step === 1) {
                  setValue(
                    'description',
                    '--- With condition ---\n' +
                      filterConfigText(watch('filterConfig')) +
                      '\n--- Apply ---\n' +
                      actionConfigText(watch('actionConfig'))
                  );
                }
                setStep(step === 1 ? 2 : 1);
              }}
            >
              {step === 1 ? 'Next' : 'Back'}
            </Button>
            <Spacer />
            <Box>
              {step === 2 && (
                <Button
                  colorScheme='blue'
                  type='submit'
                  isLoading={isSubmitting}
                >
                  {initialData && initialData.id ? 'Update' : 'Create'}
                </Button>
              )}
              <Button variant='ghost' mr={3} onClick={onClose}>
                Cancel
              </Button>
            </Box>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

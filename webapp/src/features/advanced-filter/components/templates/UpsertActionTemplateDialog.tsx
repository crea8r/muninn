import { useState } from 'react';
import { TemplateAction } from '../../types/template';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  VStack,
  Text,
  HStack,
  Select,
} from '@chakra-ui/react';
import MarkdownEditor from 'src/components/mardown/MardownEditor';
import { createList } from 'src/api/list';
import { useHistory } from 'react-router-dom';
import TagInput from 'src/components/TagInput';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { FiCloudLightning } from 'react-icons/fi';

interface UpsertActionTemplateDialogProps {
  templateAction: TemplateAction;
  onClose: () => void;
  isOpen: boolean;
}
const UpsertActionTemplateDialog = ({
  templateAction,
  onClose,
  isOpen,
}: UpsertActionTemplateDialogProps) => {
  const id = templateAction.id;
  const { globalData } = useGlobalContext();
  const [action, setAction] = useState(structuredClone(templateAction.action));
  const [name, setName] = useState(templateAction.name || '');
  const [description, setDescription] = useState(
    templateAction.description || ''
  );
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const handleSave = async () => {
    if (!name || !description || !templateAction.config) {
      toast({
        title: 'Error',
        description: 'Name, description and setting are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      if (!id) {
        setIsLoading(true);
        const saved = await createList({
          name,
          description,
          filterSetting: templateAction.config,
        });
        toast({
          title: 'Success',
          description: 'Template saved',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        history.push(`/views/${saved.creatorListId}`);
      } else {
        // update
        console.log('do not support for now');
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={'lg'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{id ? 'Edit' : 'Create'} Action</ModalHeader>
        <ModalCloseButton onClick={handleClose} />
        <ModalBody>
          <Text fontWeight={'light'} mb={4}>
            Action will run every 10 minutes, finding all objects with your
            defined filter and add them with accordingly tags & funnel.
          </Text>
          <VStack spacing={2}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <MarkdownEditor
                initialValue={description}
                onChange={setDescription}
                filters={[]}
                isDisabled={isLoading}
                height={'100px'}
              />
            </FormControl>
            <HStack width={'100%'}>
              <FiCloudLightning />
              <Text fontWeight={'bold'}>Action</Text>
            </HStack>
            <Text fontWeight={'light'} width={'100%'}>
              Add objects with these tags and funnel
            </Text>

            <FormControl>
              <FormLabel>Tags</FormLabel>
              <TagInput
                tags={action.tagIds || []}
                onChange={(params) => {
                  setAction({
                    tagIds: [...params],
                  });
                }}
                availableTags={globalData?.tagData?.tags || []}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Funnel</FormLabel>
              <Select
                value={action?.funnelId}
                onChange={(e: any) => {
                  setAction({
                    ...action,
                    funnelId: e.target.value,
                  });
                }}
              >
                <option value={undefined}>Select funnel</option>
                {globalData?.funnelData?.funnels.map((funnel) => (
                  <option key={funnel.id} value={funnel.id}>
                    {funnel.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme='blue'
            onClick={handleSave}
            isLoading={isLoading}
            isDisabled={
              name === '' ||
              description === '' ||
              (!action.funnelId && action.tagIds.length === 0)
            }
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export { UpsertActionTemplateDialog };

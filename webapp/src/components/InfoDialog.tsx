import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactElement | string;
  content: React.ReactElement | string;
  button: React.ReactElement;
}
const InfoDialogButton: React.FC<InfoDialogProps> = ({
  isOpen,
  onClose,
  title = 'Info',
  content,
  button,
}: InfoDialogProps) => {
  return !isOpen ? (
    button
  ) : (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />

      <ModalContent p={4}>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>{content}</ModalBody>
      </ModalContent>
    </Modal>
  );
};
export { InfoDialogButton };

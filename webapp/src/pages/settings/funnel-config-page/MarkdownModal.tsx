import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';

interface MarkdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const MarkdownModal: React.FC<MarkdownModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ReactMarkdown>{content}</ReactMarkdown>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MarkdownModal;

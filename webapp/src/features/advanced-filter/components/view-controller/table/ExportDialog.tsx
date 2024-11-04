import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from '@chakra-ui/react';
import dayjs from 'dayjs';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filename: string) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const defaultFileName = `export_${dayjs(new Date(), 'yyyy-MM-dd_HH-mm')}`;
  const [fileName, setFileName] = useState(defaultFileName);

  const handleExport = () => {
    onExport(fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
    onClose();
    setFileName(defaultFileName); // Reset for next time
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Export to CSV</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>File name</FormLabel>
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder='Enter file name'
                autoFocus
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant='ghost' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme='blue' onClick={handleExport}>
            Export
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

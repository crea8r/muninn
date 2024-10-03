import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  HStack,
  Spacer,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import authService from 'src/services/authService';
import { updateUserPassword, updateUserProfile } from 'src/api/orgMember';
import { useHistory } from 'react-router-dom';

const AccountPage: React.FC = () => {
  const toast = useToast();
  const userDetails = authService.getDetails();
  const history = useHistory();
  const [email, setEmail] = useState(userDetails?.profile?.email || '');
  const [fullname, setFullname] = useState(
    userDetails?.profile?.fullname || ''
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  if (!userDetails) {
    history.push('/login');
    return <></>;
  }
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    onOpen();
  };
  const handleReset = (e: any) => {
    setEmail(userDetails?.profile.email || '');
    setFullname(userDetails?.profile.fullname || '');
    setNewPassword('');
    setConfirmPassword('');
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.name) {
      case 'newPassword':
        setNewPassword(e.target.value);
        break;
      case 'confirmPassword':
        setConfirmPassword(e.target.value);
        break;
      case 'email':
        setEmail(e.target.value);
        break;
      case 'fullname':
        setFullname(e.target.value);
        break;
    }
  };
  const editUser = async () => {
    onClose();
    if (newPassword !== '' && newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      if (
        userDetails?.profile.email !== email ||
        userDetails?.profile.fullname !== fullname
      ) {
        setIsLoading(true);
        await updateUserProfile(userDetails.creatorId, {
          email,
          fullname,
          avatar: '',
        });
      }
      if (newPassword !== '' && newPassword === confirmPassword) {
        setIsLoading(true);
        await updateUserPassword(userDetails.creatorId, newPassword);
      }
      toast({
        title: 'Account updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      authService.logout();
      history.push('/login');
    } catch (e) {
      toast({
        title: 'Error updating account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Box>
        <BreadcrumbComponent />
        <Heading as='h1' size='xl' mb={6}>
          Account Settings
        </Heading>
        <VStack spacing={4} align='stretch' maxWidth='500px'>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              type='text'
              value={userDetails?.name}
              isReadOnly
              backgroundColor={'gray.200'}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input name='email' value={email} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Fullname</FormLabel>
            <Input
              name='fullname'
              value={fullname}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>New Password</FormLabel>
            <Input
              type='newPassword'
              name='newPassword'
              value={newPassword}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Confirm New Password</FormLabel>
            <Input
              type='confirmPassword'
              name='confirmPassword'
              value={confirmPassword}
              onChange={handleInputChange}
            />
          </FormControl>
          <HStack>
            <Button
              alignSelf='flex-end'
              type='reset'
              colorScheme='gray'
              onClick={handleReset}
            >
              Reset
            </Button>
            <Spacer />
            <Button
              colorScheme='blue'
              alignSelf='flex-start'
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </HStack>
        </VStack>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm</ModalHeader>
          <ModalBody>
            Are you sure you want to update info? You will be logged out
            afterward.
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='red' onClick={editUser}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AccountPage;

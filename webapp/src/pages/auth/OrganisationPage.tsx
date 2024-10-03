import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  InputGroup,
  useDisclosure,
  InputRightAddon,
  InputLeftElement,
  HStack,
  Spacer,
  useToast,
  Divider,
} from '@chakra-ui/react';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import { addNewOrgMember, listOrgMembers, updateUserPassword } from 'src/api';
import authService from 'src/services/authService';
import { OrgMember } from 'src/types/Org';
import { ChevronDownIcon, CopyIcon } from '@chakra-ui/icons';
import { normalise, generateRandomPassword } from 'src/utils';

const OrganisationPage: React.FC = () => {
  const [forceUpdate, setForceUpdate] = useState(0);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [currentEditingUserId, setCurrentEditingUserId] = useState('');
  const details = authService.getDetails();
  const handleLoadPage = async () => {
    const members = await listOrgMembers();
    setMembers(members);
  };
  const handleClickChangePassword = (userId: string) => {
    setCurrentEditingUserId(userId);
    onOpenChangePasswordDialog();
  };
  const handleAddNewOrgMember = async ({
    username,
    password,
    profile,
  }: {
    username: string;
    password: string;
    profile: any;
  }) => {
    await addNewOrgMember({ username, password, role: 'member', profile });
    setForceUpdate(forceUpdate + 1);
  };
  // const handleUpdateUserRoleAndStatus = () => {};
  const handleUpdateUserPassword = async (password: string) => {
    await updateUserPassword(currentEditingUserId, password);
    setForceUpdate(forceUpdate + 1);
  };
  const {
    isOpen: isOpenAddDialog,
    onOpen: onOpenAddDialog,
    onClose: onCloseAddDialog,
  } = useDisclosure();
  const {
    isOpen: isOpenChangePasswordDialog,
    onOpen: onOpenChangePasswordDialog,
    onClose: onCloseChangePasswordDialog,
  } = useDisclosure();
  useEffect(() => {
    handleLoadPage();
  }, [forceUpdate]);

  return (
    <Box>
      <BreadcrumbComponent />
      <VStack spacing={6} align='stretch'>
        <Box>
          <Heading as='h2' size='lg' mb={4}>
            Organisation Details
          </Heading>
          <VStack spacing={4} align='stretch' maxWidth='500px'>
            <FormControl>
              <FormLabel>Organisation Name</FormLabel>
              <Input type='text' value={details?.orgName} isReadOnly />
            </FormControl>
            {/* <Button colorScheme='blue' alignSelf='flex-start'>
              Update Organisation
            </Button> */}
          </VStack>
        </Box>
        <Box>
          <Heading as='h2' size='lg' mb={4}>
            Members
          </Heading>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {members.map((member) => (
                <Tr key={member.id}>
                  <Td>{member.profile?.fullname}</Td>
                  <Td>{member.profile?.email}</Td>
                  <Td>
                    <Badge>{member.role}</Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={Button}
                        colorScheme='gray'
                        leftIcon={<ChevronDownIcon />}
                      >
                        Actions
                      </MenuButton>
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            handleClickChangePassword(member.id);
                          }}
                        >
                          Change Password
                        </MenuItem>
                        <MenuItem isDisabled={true}>Active / Deactive</MenuItem>
                        <MenuItem isDisabled={true}>Update Role</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Button mt={4} colorScheme='blue' onClick={onOpenAddDialog}>
            Add Member
          </Button>
        </Box>
      </VStack>
      <AddMemberDialog
        isOpen={isOpenAddDialog}
        onClose={onCloseAddDialog}
        submit={handleAddNewOrgMember}
      />
      <ChangePasswordDialog
        userName={
          members.find((m) => m.id === currentEditingUserId)?.username || ''
        }
        isOpen={isOpenChangePasswordDialog}
        onClose={onCloseChangePasswordDialog}
        submit={handleUpdateUserPassword}
      />
    </Box>
  );
};

type AddMemberDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  submit: (props: { username: string; password: string; profile: any }) => void;
};

const AddMemberDialog = ({ isOpen, onClose, submit }: AddMemberDialogProps) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState(generateRandomPassword());
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleGeneratePassword = () => {
    setPassword(generateRandomPassword());
  };
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
  };
  const toast = useToast();
  const handleSubmit = async () => {
    const profile = {
      fullname,
      email,
      avatar: '',
    };
    try {
      await submit({ username: userName, password, profile });
      toast({
        title: 'New member added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: 'Failed to add new member',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };
  const handleReset = () => {
    setUserName('');
    setPassword(generateRandomPassword());
    setFullname('');
    setEmail('');
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        handleReset();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Member</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input
                type='text'
                placeholder='Must be unique'
                value={userName}
                onChange={(e: any) => setUserName(normalise(e.target.value))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <InputLeftElement
                  cursor={'pointer'}
                  _hover={{ bg: 'gray.200' }}
                >
                  <CopyIcon onClick={handleCopyPassword} />
                </InputLeftElement>
                <Input type='text' value={password} isDisabled={true} />
                <InputRightAddon
                  cursor={'pointer'}
                  _hover={{ bg: 'gray.200' }}
                  onClick={handleGeneratePassword}
                >
                  Generate
                </InputRightAddon>
              </InputGroup>
            </FormControl>
            <Divider />
            <FormControl>
              <FormLabel>Fullname</FormLabel>
              <Input
                type='text'
                value={fullname}
                onChange={(e: any) => setFullname(e.target.value || '')}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type='text'
                value={email}
                onChange={(e: any) => setEmail(e.target.value || '')}
              />
            </FormControl>
            <HStack width={'100%'} mb={2}>
              <Button
                colorScheme='gray'
                onClick={() => {
                  onClose();
                  handleReset();
                }}
              >
                Close
              </Button>
              <Spacer />
              <Button
                colorScheme='blue'
                onClick={handleSubmit}
                isLoading={isLoading}
              >
                Submit
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

type ChangePasswordDialogProps = {
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  submit: (password: string) => void;
};

const ChangePasswordDialog = ({
  userName,
  isOpen,
  onClose,
  submit,
}: ChangePasswordDialogProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const handleReset = () => {
    setNewPassword('');
    setConfirmPassword('');
  };
  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      await submit(newPassword);
      toast({
        title: 'Password changed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      handleReset();
      onClose();
    } catch (e) {
      toast({
        title: 'Failed to change password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        handleReset();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change Password</ModalHeader>
        <ModalBody>
          <VStack mb={4}>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input
                type='text'
                value={userName}
                isReadOnly
                isDisabled={true}
              />
            </FormControl>
            <FormControl>
              <FormLabel>New Password</FormLabel>
              <Input
                type='newPassword'
                value={newPassword}
                onChange={(e: any) => setNewPassword(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type='confirmPassword'
                value={confirmPassword}
                onChange={(e: any) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
          </VStack>

          <HStack>
            <Button type='reset' colorScheme='gray' onClick={handleReset}>
              Reset
            </Button>
            <Spacer />
            <Button
              colorScheme='blue'
              onClick={() => {
                handleSubmit();
                onClose();
              }}
              isLoading={isLoading}
            >
              Submit
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default OrganisationPage;

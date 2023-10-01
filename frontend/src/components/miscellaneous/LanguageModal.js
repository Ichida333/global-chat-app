import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Box,
  FormControl, 
  useToast,
  FormLabel
} from "@chakra-ui/react";
import { useState } from "react";
import { Select } from '@chakra-ui/react'
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";
import { useHistory } from "react-router-dom";


const LanguageModal = ({ children }) => {
  const history = useHistory();
  const { selectedChat, setChats, user, chats,setSelectedChat} = ChatState();
  const [language, setLanguage] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const handleSubmit = async () => {
    if (!language || !selectedChat) {
      toast({
        title: "Please choose the language",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/chat/language`,
        {
          chatId: selectedChat._id,
          language: language,
        },
        config
      );
      setChats([data]);
      setSelectedChat(data);
      onClose();
      
      console.log(selectedChat)
      console.log(data)
 
      toast({
        title: "Chenged the language!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

    } catch (error) {
      toast({
        title: "Failed to change!",
        description: error.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    
       <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="25px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Change the room language
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
          <FormControl id="language" isRequired>
   
  
        <Select placeholder='Choose the Language'
        onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="ja">Japanese</option>
        
      </Select>
      </FormControl>
            <Box w="100%" display="flex" flexWrap="wrap">
              {/* {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  // handleFunction={() => handleDelete(u)}
                />
              ))} */}
            </Box>
           
          </ModalBody>
          <ModalFooter>
            <Button 
             onClick={handleSubmit} colorScheme="blue"
            >
              Change
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LanguageModal;

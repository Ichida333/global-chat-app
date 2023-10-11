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

} from "@chakra-ui/react";
import { useState } from "react";
import { Select } from '@chakra-ui/react'
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";



const LanguageModal = ({ children, fetchAgain, setFetchAgain}) => {

  const { selectedChat, user,setSelectedChat} = ChatState();
  const [language, setLanguage] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      console.log(selectedChat)
      console.log(data) 
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);

  
      onClose();
      
      
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
        // description: error.response.data,
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

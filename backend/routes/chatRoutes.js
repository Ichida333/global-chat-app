const express = require("express");
const {
  accessChat,
  fetchChats,

  changeChatLanguage,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);


router.route("/language").post(protect, changeChatLanguage);

module.exports = router;

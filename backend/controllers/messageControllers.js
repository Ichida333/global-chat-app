const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//---------------言語翻訳APIの設定-------------

require('dotenv').config();
const apiurl = 'https://mt-auto-minhon-mlt.ucri.jgn-x.jp'; 
const key = process.env.key; 
const secret = process.env.secret; 
const name = process.env.name;

axios = require("axios");

async function post(url, param) {
  var params = new URLSearchParams();
  if (param) {
      for (let key in param) {
          params.append(key, param[key]);
      }
  }
  const res = await axios.post(url, params);
  return res;
};

async function get_access_token() {
  const param = {
      grant_type: 'client_credentials',
      client_id: key, 
      client_secret: secret, 
      urlAccessToken: apiurl + '/oauth2/token.php' 
  }
  const result = await post(apiurl + '/oauth2/token.php', param);
  return result.data.access_token;
};

async function trans_api(text, mode) {
  const token = await get_access_token();
  const params = {
      access_token: token,
      key: key,
      api_name: "mt",
      api_param: mode,
      name: name, 
      type: 'json', 
      text: text,
  }
  const result = await post(apiurl + '/api/', params);
  return result.data.resultset.result.text
}

//---------------言語翻訳APIの設定-------------

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
 
  const { chatId,} = req.body;
  let { content } = req.body;
  let userLanguage = req.body.language;
  let chatLanguage = req.body.chatId.language;


if(userLanguage !== chatLanguage){
  const translate = async (text) => {
    const result = await trans_api(text, `generalNT_${userLanguage}_${chatLanguage}`);
    return result
    }
    content = await translate(content)
  }
  

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };

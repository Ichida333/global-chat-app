const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//--------------------------------
require('dotenv').config();//ユーザー情報保存用
const apiurl = 'https://mt-auto-minhon-mlt.ucri.jgn-x.jp'; // 基底URL (https://xxx.jpまでを入力)
const key = process.env.key; // API key
const secret = process.env.secret; // API secret
const name = process.env.name; // ログインID

axios = require("axios");//http通信用
//--------------------------------

//--------------------------------
//通信する部分
async function post(url, param) {
  var params = new URLSearchParams();// パラメータ入れるよう
  if (param) {
      for (let key in param) {
          params.append(key, param[key]);
      }
  }
  const res = await axios.post(url, params);
  return res;
};

//アクセストークンを取得する部分
async function get_access_token() {
  const param = {
      grant_type: 'client_credentials',
      client_id: key, // API Key
      client_secret: secret, // API secret
      urlAccessToken: apiurl + '/oauth2/token.php' // アクセストークン取得URI
  }
  const result = await post(apiurl + '/oauth2/token.php', param);
  return result.data.access_token;
};

//翻訳文と翻訳モードを受け取ったら翻訳結果を返してくれるやつ
//引数:mode 元サイトではAPI値と書かれている部分
//- generalNT_ja_en
//- generalNT_en_ja
//-
async function trans_api(text, mode) {
  const token = await get_access_token();
  const params = {
      access_token: token,
      key: key,
      api_name: "mt",
      api_param: mode,
      name: name, // ログインID
      type: 'json', // レスポンスタイプ
      text: text,
  }
  const result = await post(apiurl + '/api/', params);
  return result.data.resultset.result.text
}


//--------------------------------

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
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

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
 

 





  const { chatId,} = req.body;
  let { content } = req.body;

  console.log(req.body)
 
 

  let userLanguage = req.body.language
  console.log(userLanguage)
  

  // console.log(req.body.chatId.users[0].country.toLowerCase()[3]+req.body.chatId.users[0].country.toLowerCase()[4])
  // console.log(req.body.chatId.users[1].country.toLowerCase()[3]+req.body.chatId.users[1].country.toLowerCase()[4])

if(userLanguage !== "en"){
  const translate = async (text) => {
    const result = await trans_api(text, `generalNT_${userLanguage}_en`);
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

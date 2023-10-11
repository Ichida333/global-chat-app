const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Joi = require("joi");
const generateToken = require("../config/generateToken");

const validate = (data) => {
	const schema = Joi.object({
		name: Joi.string().required().max(16).label("name"),
		email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(8).required().label("Password"),
    country: Joi.string().required().label("country"),
    language: Joi.string().required().label("language"),
    pic: Joi.string().label("language"),
    
	});
	return schema.validate(data);
};


const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});


const registerUser = asyncHandler(async (req, res) => {
  const { error } = validate(req.body);
  if (error)
			return res.status(400).send({ message: error.details[0].message });
  const { name, email, password, pic, language, country } = req.body;

  if (!name || !email || !password || !language|| !country) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
    language,
    country
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      country: user.country,
      language: user,language,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});


const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      country: user.country,
      language: user.language,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

module.exports = { allUsers, registerUser, authUser };

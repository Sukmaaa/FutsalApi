// import model
const { User, Profile } = require("../../models");
// import module
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// import some shortcut
const {
  responseSuccess,
  handleError,
  handleNotFound,
  handleValidation,
} = require("./handleShortcut");

exports.register = async (req, res) => {
  try {
    const { body } = req;
    const scema = Joi.object({
      fullName: Joi.string().min(2).required(),
      email: Joi.string().email().min(10).required(),
      password: Joi.string().min(8).required(),
    });
    handleValidation(scema, body, res);
    const checkUser = await User.findOne({
      where: { email: body.email },
    });

    if (checkUser) {
      return handleNotFound(res, "Email already exsited", "failed");
    }
    const { fullName, email, password } = body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });
    await Profile.create({
      userId: user.id,
      photo: "default",
      isAdmin: false,
    });

    const privateKey = process.env.JWT_PRIVATE_KEY;
    const token = jwt.sign({ id: user.id }, privateKey);

    res.send({
      status: responseSuccess,
      message: "You succesfully registered",
      data: {
        fullName: user.fullName,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const { body } = req;
    const scema = Joi.object({
      email: Joi.string().email().min(10).required(),
      password: Joi.string().min(8).required(),
    });
    handleValidation(scema, body, res);
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      handleNotFound(res, "invalid login", "Login Fail");
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      handleNotFound(res, "invalid login", "Login Fail");
    }

    const privateKey = process.env.JWT_PRIVATE_KEY;
    const token = jwt.sign({ id: user.id }, privateKey);
    res.send({
      status: responseSuccess,
      message: "Login Success",
      data: {
        fullName: user.fullName,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

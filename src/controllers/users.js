// import model
const { User, Profile } = require("../../models");
// import some shortcut
const {
  responseSuccess,
  handleError,
  handleNotFound,
} = require("./handleShortcut");

// @desc Fetch All Users
// @route GET api/v1/users
// @access Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });
    if (users.length === 0) {
      return handleNotFound(res, "Users empty");
    }
    res.send({
      status: responseSuccess,
      message: "successfully get users",
      data: {
        users,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// @desc Delete User
// @route DELETE api/v1/user/:id
// @access Admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const getUserById = await User.findOne({
      where: { id },
    });
    if (!getUserById) {
      return handleNotFound(res, `User with id : ${id} not found`);
    }
    await User.destroy({
      where: { id },
    });
    res.send({
      status: responseSuccess,
      message: `User with id : ${id} deleted`,
      data: {
        id,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// @desc Get User Profile
// @route GET api/v1/user/my-profile
// @access User
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findOne({
      where: { id },
    });
    const profile = await Profile.findOne({ where: { userId: id } });
    if (!profile) {
      return res.send({
        status: responseSuccess,
        message: "not found but we will send default data",
        data: {
          profile: {
            email: user.dataValues.email,
            fullName: user.dataValues.fullName,
            isAdmin: false,
            photo: null,
          },
        },
      });
    }
    const { isAdmin, photo } = profile;
    res.send({
      status: responseSuccess,
      message: "successfully get profile data",
      data: {
        isAdmin,
        photo,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

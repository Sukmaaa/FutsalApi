// import modul
const Joi = require("joi");
// import model
const {
  Transaction,
  User,
  Product,
  TransactionProduct,
  Profile,
} = require("../../models");
// import some shortcut
const {
  responseSuccess,
  handleError,
  handleNotFound,
  handleValidation,
} = require("./handleShortcut");

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId"],
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: Product,
          as: "products",
          attributes: {
            exclude: ["createdAt", "updatedAt", "stock"],
          },
          through: {
            attributes: [["orderQuantity", "value"]],
            as: "orderQuantity",
          },
        },
      ],
    });
    if (transactions.length === 0) {
      return handleNotFound(res, "Transaction is Empty");
    }
    res.send({
      status: responseSuccess,
      message: "successfully get transactions",
      data: {
        transactions,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getDetailTransaction = async (req, res) => {
  try {
    const { transactionId: id } = req.params;
    const transaction = await Transaction.findOne({
      where: { id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId"],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: Product,
          as: "products",
          attributes: {
            exclude: ["createdAt", "updatedAt", "stock"],
          },
          through: {
            attributes: [["orderQuantity", "value"]],
            as: "orderQuantity",
          },
        },
      ],
    });
    if (!transaction) {
      await handleNotFound(res, `transactions with id ${id} is not found`);
    }
    const { id: userId } = req.user;

    if (+userId === +transaction.user.id) {
      return res.send({
        status: responseSuccess,
        message: "successfully get detail transaction",
        data: { transaction },
      });
    }
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile || profile.isAdmin === false) {
      return res.status(401).send({
        status: "Response fail",
        error: {
          message: "User Access Denied",
        },
      });
    }
    res.send({
      status: responseSuccess,
      message: "successfully get detail transaction",
      data: { transaction },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.addTransactions = async (req, res) => {
  try {
    const { body } = req;
    body.attachment = req.file.path;
    const scema = Joi.object({
      name: Joi.string().min(2).required(),
      email: Joi.string().email().min(10).required(),
      phone: Joi.number().required(),
      postCode: Joi.number().required(),
      address: Joi.string().min(5).required(),
      products: Joi.required(),
      attachment: Joi.required(),
    });
    handleValidation(scema, body, res);
    const { name, email, phone, address, attachment, products, postCode } =
      body;
    const productsData = JSON.parse(products);
    const { id: userId } = req.user;
    console.log("Test data req user",req.user);
    const transaction = await Transaction.create({
      name,
      email,
      phone,
      postCode,
      address,
      attachment,
      status: "Waiting Approve",
      userId,
    });
    await Promise.all(
      productsData.map(async (product) => {
        const { id, orderQuantity } = product;
        await TransactionProduct.create({
          transactionId: transaction.id,
          productId: id,
          orderQuantity: orderQuantity,
        });
      })
    );
    const transactionAfterAdd = await Transaction.findOne({
      where: { id: transaction.id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId"],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: Product,
          as: "products",
          attributes: {
            exclude: ["createdAt", "updatedAt", "stock"],
          },
          through: {
            attributes: [["orderQuantity", "value"]],
            as: "orderQuantity",
          },
        },
      ],
    });
    res.send({
      status: responseSuccess,
      message: "successfully add transaction",
      data: { transaction: transactionAfterAdd },
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.editTransaction = async (req, res) => {
  try {
    const { transactionId: id } = req.params;
    const { body } = req;
    const scema = Joi.object({
      status: Joi.string().min(4).required(),
    });
    handleValidation(scema, body, res);
    const transaction = await Transaction.findOne({ where: { id } });
    if (!transaction) {
      return handleNotFound(res, `transaction with id ${id} is not found`);
    }
    await Transaction.update(body, { where: { id } });
    const transactionAfter = await Transaction.findOne({
      where: { id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId"],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: Product,
          as: "products",
          attributes: {
            exclude: ["createdAt", "updatedAt", "stock"],
          },
          through: {
            attributes: [["orderQuantity", "value"]],
            as: "orderQuantity",
          },
        },
      ],
    });

    res.send({
      status: responseSuccess,
      message: "successfully update transaction",
      data: { transaction: transactionAfter },
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { transactionId: id } = req.params;
    const transaction = await Transaction.findOne({ where: { id } });
    if (!transaction) {
      return handleNotFound(res, `transaction with id ${id} is not found`);
    }
    await Transaction.destroy({ where: { id } });
    res.send({
      status: responseSuccess,
      message: `transaction with id ${id} successfully deleted`,
      data: {
        id,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getMyTransaction = async (req, res) => {
  try {
    const { id } = req.user;
    const transactions = await Transaction.findAll({
      where: { userId: id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId"],
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: Product,
          as: "products",
          attributes: {
            exclude: ["createdAt", "updatedAt", "stock"],
          },
          through: {
            attributes: [["orderQuantity", "value"]],
            as: "orderQuantity",
          },
        },
      ],
    });
    if (transactions.length === 0) {
      return handleNotFound(res, "transactions is empty");
    }

    res.send({
      status: responseSuccess,
      message: "successfully get detail transaction",
      data: { transactions },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

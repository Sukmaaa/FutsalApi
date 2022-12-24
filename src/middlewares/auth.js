const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  let header, token;

  if (
    !(header = req.header("Authorization")) ||
    !(token = header.replace("Bearer ", ""))
  ) {
    return res.status(401).send({
      status: "Response fail",
      error: {
        message: "Access Denied",
      },
    });
  }

  try {
    const privateKey = process.env.JWT_PRIVATE_KEY;
    const verified = jwt.verify(token, privateKey);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(401).send({
      status: "Response fail",
      error: {
        message: "Invalid Token",
      },
    });
  }
};

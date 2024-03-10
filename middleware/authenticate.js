const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const Authenticate = async (req, res, next) => {
  let token;
  try {
    token = req.body.jwtoken;

    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    const rootUser = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });

    if (!rootUser) {
      throw new Error("User not Found!");
    }

    req.token = token;
    req.userID = rootUser._id;
    next();
  } catch (err) {
    res.status(401).send("Unauthorized: No token provided " + token);
    console.log(err);
  }
};

module.exports = Authenticate;

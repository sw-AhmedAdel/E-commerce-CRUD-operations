const appError = require("../services/class.err.middleware");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { findUser } = require("../models/user.models");

async function auth(req, res, next) {
  let token;
  /* i can use the code below if i send the token with the responde and pur it on the request using postman
   but, using cookie parser is better
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    //this is string so split the string to save it in array
    token = req.headers.authorization.split(" ")[1];
  }
*/
  if (req.signedCookies.token) {
    token = req.signedCookies.token;
  }
  if (!token) {
    return next(new appError("Please signup or login in to get access", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_JWT);
  const user = await findUser({ _id: decoded._id });
  if (!user) {
    return next(new appError("User is not longer exits", 401));
  }

  const changedPassword = user.changedPasswordAfter(decoded.iat);
  if (changedPassword) {
    return next(
      new appError("you changed ur password, please login to get new token")
    );
  }

  req.user = user;
  next();
}

const restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError("You dont have premession to do that action!", 403)
      );
    }
    next();
  };
};

module.exports = {
  auth,
  restrictedTo,
};

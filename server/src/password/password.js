const { findUser } = require("../models/user.models");
const appError = require("../services/class.err.middleware");
const Email = require("../services/email");
const crypto = require("crypto");
const sendCookieToRespond = require("../auth/cookies");

async function httpForgotPassword(req, res, next) {
  if (!req.body.email) {
    return next(new appError("Please provide ur email", 401));
  }
  const user = await findUser({
    email: req.body.email,
  });
  if (!user) {
    return next(new appError("User is not exits", 401));
  }
  const resetToken = await user.createPasswordResetToken();
  //prepare the link what will have the token and send it to the user
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordreset();
    return res.status(200).json({
      status: "success",
      message: "token send to email",
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetTokenExpiresIn = undefined);
    await user.save({ validateBeforeSave: false });
    return next(new appError("there was an error please try again", 500));
  }
}

async function httpReserPassword(req, res, next) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await findUser({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new appError("Invalid token or expired, please try again", 401)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;
  await user.save();

  sendCookieToRespond(user, res);
  return res.status(200).json({
    status: "success reset password",
  });
}

async function httpUpdateCurrentPassword(req, res, next) {
  const user = req.user;

  if (!req.body.currentpassword) {
    return next(new appError("please provide the current password", 400));
  }

  const isMatch = await user.comparePassword(
    req.body.currentpassword,
    user.password
  );
  if (!isMatch) {
    return next(new appError("Your current password is wrong", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  sendCookieToRespond(user, res);

  return res.status(200).json({
    status: "password has been changed",
  });
}

module.exports = {
  httpForgotPassword,
  httpReserPassword,
  httpUpdateCurrentPassword,
};

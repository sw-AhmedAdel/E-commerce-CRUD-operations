const express = require("express");
const userRoute = express.Router();
const { catchAsync } = require("../../services/services.functions");

const {
  httpSignUpNewUser,
  httpGetALLUsers,
  httpUpdateMe,
  httpDeleteOneMe,
  httpLoginUser,
  httpLogout,
  uploadImageMiddleware,
  resizeUserImage,
  httpGetUserProfilePage,
} = require("./user.controller");

const {
  httpForgotPassword,
  httpReserPassword,
  httpUpdateCurrentPassword,
} = require("../../password/password");

const { auth, restrictedTo } = require("../../auth/auth");
const { cashingUsers } = require("../../services/cashing.functions");

// NORe :: I could have used restrictedTo() to handling roles and permissions in the system like
// userRoute.get("/", catchAsync(auth), restrictedTo('admin')  , catchAsync(httpGetALLUsers));

userRoute.post("/signup", catchAsync(httpSignUpNewUser));
userRoute.post("/login", catchAsync(httpLoginUser));
userRoute.post("/forgotpassword", catchAsync(httpForgotPassword));
userRoute.patch("/resetpassword/:token", catchAsync(httpReserPassword));

userRoute.use(catchAsync(auth));
userRoute.get("/", catchAsync(cashingUsers), catchAsync(httpGetALLUsers));
userRoute.get("/logout", httpLogout);
userRoute.patch(
  "/updateme",
  uploadImageMiddleware,
  catchAsync(resizeUserImage),
  catchAsync(httpUpdateMe)
);
userRoute.delete("/", catchAsync(httpDeleteOneMe));
userRoute.patch(
  "/updatepassword",
  catchAsync(auth),
  catchAsync(httpUpdateCurrentPassword)
);
userRoute.get("/my/profile", catchAsync(httpGetUserProfilePage));

module.exports = userRoute;

const appError = require("../../services/class.err.middleware");
const {
  createUser,
  findByCredentials,
  getALLUsers,
  UpdateMe,
  DeleteMe,
} = require("../../models/user.models");

const { filterObject } = require("../../services/services.functions");
const Email = require("../../services/email");
const sendCookieToRespond = require("../../auth/cookies");

// ************************** USE REDIS FOR CAHING USERS******************
const client = require("../../redis");

// ************************** UPLOAD PHOTO *******************************
const multer = require("multer");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new appError("Not an image! please upload only images", 400), false);
  }
};

const resizeUserImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize({ width: 500, height: 500 })
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/images/users/${req.file.filename}`);

  next();
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadImageMiddleware = upload.single("photo");

// *************************CRUD OPERATIONS******************************
async function httpGetALLUsers(req, res) {
  const users = await getALLUsers();
  client.setEx(req.key_value, 3600, JSON.stringify(users));
  return res.status(200).json({
    status: "success",
    resutls: users.length,
    users: users,
  });
}
async function httpSignUpNewUser(req, res, next) {
  const user = req.body;
  const newUser = await createUser(user);

  // this link below is supposed to direct the user to his profile page
  const url = `${req.protocol}://${req.get("host")}/v1/users/my/profile`;
  await new Email(user, url).sendWelcome();

  sendCookieToRespond(newUser, res);
  return res.status(201).json({
    user: newUser,
  });
}

async function httpLoginUser(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new appError("please provide email and password", 400));
  }
  const user = await findByCredentials(email, password);
  if (!user) {
    return next(new appError("unable to login ", 400));
  }

  sendCookieToRespond(user, res);
  return res.status(201).json({
    user,
  });
}

function httpLogout(req, res) {
  res.cookie("token", "Logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  if (process.env.NODE_ENV === "development") {
    return res.status(200).json({
      status: "success",
      messae: "You loged out",
    });
  } else {
    return res.status(200).json();
  }
}

async function httpDeleteOneMe(req, res, next) {
  const url = `${req.protocol}://${req.get("host")}/v1/users/signup`;
  await new Email(req.user, url).sendGoodBy();

  const id = req.user._id;
  await DeleteMe(id);
  return res.status(200).json({
    data: "deleted the account",
  });
}

async function httpUpdateMe(req, res, next) {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new appError("Can not update password and pass confirm"));
  }

  const filter = filterObject(req.body, "name", "email");
  if (req.file) {
    filter.photo = req.file.filename;
  }
  const user = await UpdateMe(req.user._id, filter);
  return res.status(200).json({
    status: "success",
    user,
  });
}

async function httpGetUserProfilePage(req, res) {
  const user = req.user;
  if (!user) {
    return next(new appError("something went wrong", 400));
  }
  return res.status(200).json({
    status: "success",
    data: user,
  });
}
//
module.exports = {
  httpGetALLUsers,
  httpDeleteOneMe,
  httpUpdateMe,
  httpSignUpNewUser,
  httpLoginUser,
  httpLoginUser,
  httpLogout,
  uploadImageMiddleware,
  resizeUserImage,
  httpGetUserProfilePage,
};

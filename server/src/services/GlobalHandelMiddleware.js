const appError = require("../services/class.err.middleware");

function MulterImageCoverError(err) {
  const message = "Please provide only 1 image cover";
  return new appError(message, 400);
}

function MulterImagesError(err) {
  const message = "Please provide only 3 images";
  return new appError(message, 400);
}

function JsonWebTokenError() {
  const message = "Please signup or login, your token is invalid";
  return new appError(message, 401);
}

const TokenExpiredError = () =>
  new appError("your token is expired, please login again", 401);

function MongoInvalidID(err) {
  const message = `Invalid ${err.path}, with ID value is:${err.value}`;
  return new appError(message, 400);
}

function dublicateUniqueValue(err) {
  const message = `this value: ${Object.values(err.keyValue)} is already exits`;
  return new appError(message, 400);
}

function mongoErrors(err) {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Errors: ${errors.join(". ")}`;
  return new appError(message, 400);
}

function sendErrorToDev(err, res) {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

function sendErrorToProd(err, res) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log("ERROR", err);
    return res.status(500).json({
      status: "fail",
      message: "Something wrong happend, please try again",
    });
  }
}

function GlobalHandelMiddleware(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    // Send me the all error if we are on development
    sendErrorToDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // send a readable error to the user if we are on production
    let error = Object.assign(err);

    if (error.name === "CastError") {
      error = MongoInvalidID(error);
    }

    if (error.code === 11000) {
      error = dublicateUniqueValue(error);
    }

    if (error.name === "ValidationError") {
      error = mongoErrors(error);
    }

    if (error.name === "JsonWebTokenError") {
      error = JsonWebTokenError();
    }
    if (error.name === "TokenExpiredError") {
      error = TokenExpiredError();
    }

    if (error.field === "images") {
      error = MulterImagesError(error);
    }

    if (error.field === "imageCover") {
      error = MulterImageCoverError(error);
    }

    sendErrorToProd(error, res);
  }
}

module.exports = GlobalHandelMiddleware;

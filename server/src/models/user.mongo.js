const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provice ur name"],
    },
    photo: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "please provice ur email"],
      unique: true,
      validate: [validator.isEmail, "please provice valid email"],
    },
    password: {
      type: String,
      required: [true, "please provide ur password"],
      minlength: [8, "Password must be above 8"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "please provide ur password Confirm"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Password must be the same",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpiresIn: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  user.password = await bcrypt.hash(user.password, 12);
  user.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password") || user.isNew) return next();

  user.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.generateAuthTokens = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.SECRET_JWT, {
    expiresIn: process.env.EXPIRES_IN,
  });

  return token;
};

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    return false;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return false;
  }

  return user;
};

userSchema.methods.changedPasswordAfter = function (jwtTime) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return jwtTime < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = async function () {
  const user = this;
  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  return resetToken;
};

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;

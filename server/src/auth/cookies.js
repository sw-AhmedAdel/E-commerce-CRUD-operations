function sendCookieToRespond(user, res) {
  const token = user.generateAuthTokens();
  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    signed: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  res.cookie("token", token, cookieOptions);
}

module.exports = sendCookieToRespond;

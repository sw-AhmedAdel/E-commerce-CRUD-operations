const express = require("express");
const app = express();
const api = require("./routes/api");
const helmet = require("helmet");
const GlobalHandelMiddleware = require("./services/GlobalHandelMiddleware");
const appError = require("./services/class.err.middleware");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

// NOTE :-> To increase the performance here i used pm2 which is gonna create NODE CLUSERT, just use in on PRODUCTION
// To start it just use ->  pm2 start src/server.js -i max : to use the max of cluster that mt machine can create

app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: "Too many request",
});
app.use(express.json());
app.use(cookieParser(process.env.SECRET_JWT));
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: ["price", "name", "company", "ratingsAverage", "category"],
  })
);

app.use("/v1", limiter);
app.use("/v1", api);
app.all("*", (req, res, next) => {
  next(new appError("Can not find this site", 404));
});
app.use(GlobalHandelMiddleware);

module.exports = app;

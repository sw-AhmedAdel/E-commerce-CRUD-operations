const express = require("express");
const api = express.Router();
const userRoute = require("./users/users.router");
const productRoute = require("./products/product.router");

api.use("/users", userRoute);
api.use("/products", productRoute);
module.exports = api;

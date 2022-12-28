const express = require("express");
const productRoute = express.Router();
const {
  httpCreateNewProduct,
  httpGetSingleProduct,
  httpGetAllProducts,
  httpUpdateProduct,
  httpDeleteOneProduct,
  httpGetProductStats,
  uploadImageCiverMiddleware,
  resizeProductImage,
} = require("./product.controller");

// *********************** USING REDIS FOR CASHING PRODUCTS *********************
const { cashingProducts } = require("../../services/cashing.functions");
// *********************** ******************************************************

const { catchAsync } = require("../../services/services.functions");
const { auth } = require("../../auth/auth");

productRoute.use(catchAsync(auth));

productRoute.get(
  "/",
  catchAsync(cashingProducts),
  catchAsync(httpGetAllProducts)
);
productRoute.get(
  "/single/product/:productId",
  catchAsync(httpGetSingleProduct)
);
productRoute.post("/", catchAsync(httpCreateNewProduct));
productRoute.patch(
  "/update/:productId",
  uploadImageCiverMiddleware,
  catchAsync(resizeProductImage),
  catchAsync(httpUpdateProduct)
);
productRoute.delete("/:productId", catchAsync(httpDeleteOneProduct));

productRoute.get("/stats", httpGetProductStats);
module.exports = productRoute;

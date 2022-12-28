const {
  CreateNewProduct,
  GetAllProducts,
  FindProduct,
  UpdateProduct,
  GetProductStats,
} = require("../../models/product.models");

const appError = require("../../services/class.err.middleware");
const filter = require("../../services/class.filter");

// *********************** UPLOAD PRODUCTS IMAGES ********************************
const multer = require("multer");
const sharp = require("sharp");

//here store the image in the desk not memory
/*const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/products");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `product-${req.user._id}-${Date.now()}.${ext}`);
  },
});
*/

// save the image in the memory as a buffer so i can use sharp to resize it
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new appError("Not an image! please upload only images", 400), false);
  }
};

const resizeProductImage = async (req, res, next) => {
  if (!req.files.images || !req.files.imageCover) {
    return next();
  }

  // 1) cover image
  req.body.imageCover = `product-${req.params.productId}-${Date.now()}.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize({ width: 2000, height: 1333 })
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/images/products/${req.body.imageCover}`);

  // 2) images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-${req.params.productId}-${Date.now()}-${
        i + 1
      }.jpeg`;
      await sharp(file.buffer)
        .resize({ width: 2000, height: 1333 })
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadImageCiverMiddleware = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// *********************** CRUD OPERATIONS ********************************

async function httpGetAllProducts(req, res, next) {
  const feature = new filter(req.query);
  const { limit, skip } = feature.pagination();
  const products = await GetAllProducts(
    feature.filter(),
    feature.sort("-createdAt"),
    feature.fields(),
    skip,
    limit
  );
  client.SETEX(req.key_value, 3600, JSON.stringify(products));
  return res.status(200).json({
    status: "success",
    results: products.length,
    data: products,
  });
}

async function httpCreateNewProduct(req, res, next) {
  req.body.user = req.user._id;
  const newProduct = await CreateNewProduct(req.body);

  return res.status(201).json({
    status: "success",
    data: newProduct,
  });
}

async function httpUpdateProduct(req, res, next) {
  let priceDicsount;
  const { productId } = req.params;
  const editProduct = req.body;
  if (req.file) {
    editProduct.filename = req.file.filename;
  }
  if (editProduct["priceDicsount"]) {
    priceDicsount = editProduct["priceDicsount"];
    delete editProduct["priceDicsount"];
  }
  let product = await FindProduct({ _id: productId });
  if (!product) {
    return next(new appError("This product is not exits", 400));
  }

  if (Object.keys(editProduct).length) {
    product = await UpdateProduct(editProduct, productId);
  }

  if (priceDicsount) {
    product.priceDicsount = priceDicsount;
    await product.save();
  }

  return res.status(200).json({
    status: "success",
    product,
  });
}

async function httpGetSingleProduct(req, res, next) {
  const { productId } = req.params;
  const Product = await FindProduct({ _id: productId });
  if (!Product) {
    return next(new appError("this product is not exits", 400));
  }
  return res.status(200).json({
    status: "success",
    Product,
  });
}

async function httpDeleteOneProduct(req, res, next) {
  const { productId } = req.params;
  const product = await FindProduct({ _id: productId });
  if (!product) {
    return next(new appError("this product is not exits", 400));
  }
  await product.remove();
  return res.status(200).json({
    status: "success",
  });
}

async function httpGetProductStats(req, res) {
  const products = await GetProductStats();
  return res.status(200).json({
    status: "success",
    products,
  });
}

module.exports = {
  httpCreateNewProduct,
  httpGetSingleProduct,
  httpGetAllProducts,
  httpUpdateProduct,
  httpDeleteOneProduct,
  httpGetProductStats,
  uploadImageCiverMiddleware,
  resizeProductImage,
};

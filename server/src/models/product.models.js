const Product = require("./product.mongo");

async function FindProduct(filter) {
  return await Product.findOne(filter).populate({
    path: "user",
    select: "name",
  });
}

async function CreateNewProduct(product) {
  const newProduct = new Product(product);
  await newProduct.save();
  return newProduct;
}

async function UpdateProduct(editProduct, id) {
  const product = await Product.findByIdAndUpdate(id, editProduct, {
    new: true,
    runValidators: true,
  });
  return product;
}

async function GetAllProducts(filter, sort, fields, skip, limit) {
  return await Product.find(filter)
    .skip(skip)
    .limit(limit)
    .select(fields)
    .sort(sort);
}

async function GetProductStats() {
  const products = await Product.aggregate([
    {
      $group: {
        _id: "$company",
        numberOfProducts: { $sum: 1 },
        products: { $push: "$name" },
      },
    },
    {
      $addFields: {
        company: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numberOfProducts: -1,
      },
    },
  ]);
  return products;
}

module.exports = {
  CreateNewProduct,
  GetAllProducts,
  FindProduct,
  UpdateProduct,
  GetProductStats,
  GetProductStats,
};

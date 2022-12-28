const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [
        true,
        "Please provide the ID of the user who created this product",
      ],
    },
    name: {
      unique: true,
      type: String,
      required: [true, "Product name must be provided"],
      trim: true,
      maxlength: ["50", "Name can not be more than 50 Letters"],
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, "Product price must be provided "],
      validate: {
        validator: function (val) {
          return val > 0;
        },
        message: "Price can not be less than 0",
      },
    },
    priceDicsount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: `Discount ({VALUE}) value, can not be bigger than the price`,
      },
    },
    description: {
      type: String,
      required: [true, "Product must have a description"],
      minlength: ["5", "Description can not be less than 5 Letters"],
      maxlength: ["1000", "Description can not be more than 1000 Letters"],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "Product must have a image cover"],
    },
    images: {
      type: [String],
    },
    category: {
      type: String,
      required: [true, "Product must have a category"],
      lowercase: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    company: {
      type: String,
      required: [true, "Product must have a company name"],
      lowercase: true,
      trim: true,
    },
    colors: {
      type: [String],
      required: true,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: [true, "Please provide the number of the product"],
      validate: {
        validator: function (val) {
          return val > 0;
        },
        message: "Inventory can not be less than 0",
      },
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above 1"],
      max: [5, "Rating must be bellow or equal 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 4.7
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },

    ratingQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ company: 1 });
productSchema.index({ category: 1 });
productSchema.index({ ratingsAverage: 1, price: 1, name: 1 });
productSchema.index({ price: 1, name: 1, category: 1 });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;

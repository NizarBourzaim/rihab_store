const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  stock: {
    type: Number,
    default: null, // null = unlimited/not tracked; a number enables preorder-on-depletion
  },
  preorderDate: {
    type: Date,
    default: null,
  },
  sizes: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Product", productSchema);
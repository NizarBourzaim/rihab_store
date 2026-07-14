const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Empty string from a form input means "clear it / unlimited" rather than "leave unset".
function parseStock(value) {
  if (value === undefined) return undefined;
  return value === "" || value === null ? null : Number(value);
}

function parseDate(value) {
  if (value === undefined) return undefined;
  return value === "" || value === null ? null : new Date(value);
}

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, price, image, description, stock, preorderDate } = req.body;

    const product = await Product.create({
      name,
      price,
      image,
      description,
      stock: parseStock(stock) ?? null,
      preorderDate: parseDate(preorderDate) ?? null,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, price, image, description, stock, preorderDate } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.image = image ?? product.image;
    product.description = description ?? product.description;

    const parsedStock = parseStock(stock);
    if (parsedStock !== undefined) product.stock = parsedStock;

    const parsedPreorderDate = parseDate(preorderDate);
    if (parsedPreorderDate !== undefined) product.preorderDate = parsedPreorderDate;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
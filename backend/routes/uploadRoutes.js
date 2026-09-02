const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Setup (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary
// @access  Private/Admin
router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    { name: "images", maxCount: 30 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
  try {
    const files = [
      ...(req.files?.images || []),
      ...(req.files?.image || []),
    ];

    if (!files.length) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = await Promise.all(files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = "data:" + file.mimetype + ";base64," + b64;
      return cloudinary.uploader.upload(dataURI, {
        folder: "rihab_store/products",
        resource_type: "auto",
      });
    }));

    res.json({
      urls: results.map((result) => result.secure_url),
      public_ids: results.map((result) => result.public_id),
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ message: "Upload failed: " + error.message });
  }
  }
);

module.exports = router;

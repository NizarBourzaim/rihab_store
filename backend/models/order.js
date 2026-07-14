const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerAddress: {
      type: String,
      default: "",
    },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        qty: Number,
        image: String,
        isPreorder: {
          type: Boolean,
          default: false,
        },
        preorderDate: Date,
        // How much of this item's qty actually came out of tracked stock (vs. was
        // already backordered / from an untracked product) — what restoring gives back.
        stockDeducted: {
          type: Number,
          default: 0,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    paymentProofUrl: {
      type: String,
      default: "",
    },
    hasPreorderItems: {
      type: Boolean,
      default: false,
    },
    stockRestored: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const { appendOrderToExcel } = require("../utils/orderExcel");
const { appendOrderToGoogleSheets, updateOrderStatusInGoogleSheets } = require("../utils/googleSheets");
const { protect, adminOnly } = require("../middleware/authMiddleware");

function generateOrderNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `RNFZ-${datePart}-${randomPart}`;
}

router.post("/whatsapp", async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, items, total } = req.body;

    if (!customerName || !customerPhone || !items || !items.length) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customerName,
      customerPhone,
      customerAddress,
      items,
      total,
      status: "pending",
    });

    appendOrderToExcel(order);
    appendOrderToGoogleSheets(order);

    const businessPhone = "+212699613920"; // replace with your WhatsApp number

    const messageLines = [
  `New Order`,
  `Order Number: ${order.orderNumber}`,
  `Customer: ${order.customerName}`,
  `Phone: ${order.customerPhone}`,
  `Address: ${order.customerAddress || "Not provided"}`,
  "",
  ...order.items.map(
    (item, index) =>
      `${index + 1}. ${item.name}
      Qty: ${item.qty}
      Price: ${item.price} MAD`
     ),
      "",
   `Total: ${order.total} MAD`,
    ];

    const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(
      messageLines.join("\n\n")
    )}`;

    res.status(201).json({
      message: "Order created successfully",
      orderId: order._id,
      orderNumber: order.orderNumber,
      whatsappUrl,
      downloadUrl: `/api/orders/${order._id}/download`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/download", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const content = `
Rinifaza Store Order Receipt
============================

Order Number: ${order.orderNumber}
Customer Name: ${order.customerName}
Customer Phone: ${order.customerPhone}
Customer Address: ${order.customerAddress || "Not provided"}

Items:
${order.items
  .map(
    (item, index) =>
      `${index + 1}. ${item.name} | qty: ${item.qty} | price: ${item.price} MAD |
      }`
  )
  .join("\n")}

Total: ${order.total} MAD
Status: ${order.status}
Created At: ${order.createdAt}
`.trim();

    res.setHeader("Content-Disposition", `attachment; filename=${order.orderNumber}.txt`);
    res.setHeader("Content-Type", "text/plain");
    res.send(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (Admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (Admin only)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Fire Google Sheets update (done asynchronously)
    updateOrderStatusInGoogleSheets(order.orderNumber, status);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an order (Admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk delete orders (Admin only)
router.post("/bulk-delete", protect, adminOnly, async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: "No order IDs provided" });
    }

    await Order.deleteMany({ _id: { $in: orderIds } });
    res.json({ message: "Selected orders deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
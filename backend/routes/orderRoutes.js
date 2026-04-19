const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const { appendOrderToExcel } = require("../utils/orderExcel");
const { appendOrderToGoogleSheets, updateOrderStatusInGoogleSheets } = require("../utils/googleSheets");
const { protect, adminOnly, staffOnly } = require("../middleware/authMiddleware");

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

const PDFDocument = require("pdfkit");

router.get("/:id/download", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for PDF
    res.setHeader("Content-Disposition", `attachment; filename=${order.orderNumber}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Header / Brand Logo
    const logoPath = path.join(__dirname, "..", "assets", "logo.png");
    const logoWidth = 150;
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, (doc.page.width - logoWidth) / 2, 40, { width: logoWidth });
      doc.moveDown(5); 
    } else {
      doc.fillColor("#BF953F")
         .fontSize(24)
         .text("RINIFAZA STORE", 50, 45, { align: "center" });
      doc.moveDown();
    }

    doc.fillColor("#BF953F") // GOLD
       .fontSize(10)
       .font("Helvetica-Bold")
       .text("luxurious - islamic - fashion", 50, 105, { align: "center" });

    doc.font("Helvetica")
       .fillColor("#444444")
       .text("Morocco", 50, 120, { align: "center" })
       .moveDown();

    // Receipt Title
    doc.fillColor("#BF953F")
       .fontSize(22)
       .font("Helvetica-Bold")
       .text("ORDER RECEIPT", 50, 150, { align: "center" })
       .moveDown();

    // Order Info & Customer Info Grid
    const infoY = 170;
    doc.fontSize(10).font("Helvetica-Bold").text("ORDER DETAILS", 50, infoY);
    doc.font("Helvetica").text(`Order Number: ${order.orderNumber}`, 50, infoY + 20);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, infoY + 35);

    doc.font("Helvetica-Bold").text("BILL TO:", 350, infoY);
    doc.font("Helvetica").text(`Name: ${order.customerName}`, 350, infoY + 20);
    doc.text(`Number: ${order.customerPhone}`, 350, infoY + 35);
    doc.text(`Address: ${order.customerAddress || "No address provided"}`, 350, infoY + 50, { width: 200 });

    // Table Header
    const tableTop = 260;
    doc.fillColor("#BF953F").rect(50, tableTop, 500, 20).fill();
    
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(10);
    doc.text("Product Name", 60, tableTop + 6);
    doc.text("Qty", 300, tableTop + 6, { width: 50, align: "center" });
    doc.text("Price", 350, tableTop + 6, { width: 100, align: "right" });
    doc.text("Total", 450, tableTop + 6, { width: 90, align: "right" });

    // Table Rows
    let currentY = tableTop + 25;
    doc.fillColor("#444444").font("Helvetica").fontSize(10);

    order.items.forEach((item) => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      doc.text(item.name, 60, currentY);
      doc.text(item.qty.toString(), 300, currentY, { width: 50, align: "center" });
      doc.text(`${item.price} MAD`, 350, currentY, { width: 100, align: "right" });
      doc.text(`${item.price * item.qty} MAD`, 450, currentY, { width: 90, align: "right" });
      
      currentY += 20;
      // Draw a light line
      doc.strokeColor("#eeeeee").lineWidth(0.5).moveTo(50, currentY - 2).lineTo(550, currentY - 2).stroke();
      currentY += 5;
    });

    // Summary Section
    currentY += 20;
    doc.strokeColor("#BF953F").lineWidth(1).moveTo(350, currentY).lineTo(550, currentY).stroke();
    
    currentY += 10;
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(14);
    doc.text("GRAND TOTAL:", 350, currentY);
    doc.fillColor("#BF953F").text(`${order.total} MAD`, 450, currentY, { width: 90, align: "right" });

    // Footer Message
    doc.fillColor("#aaaaaa").fontSize(10).font("Helvetica-Oblique")
       .text("Thank you for shopping with Rinifaza Store!", 50, 730, { align: "center", width: 500 });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (Staff access)
router.get("/", protect, staffOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (Staff access)
router.put("/:id/status", protect, staffOnly, async (req, res) => {
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
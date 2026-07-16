const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const rateLimit = require("express-rate-limit");
const Order = require("../models/order");
const Product = require("../models/product");
const fs = require("fs");
const path = require("path");
const { appendOrderToExcel } = require("../utils/orderExcel");
const { appendOrderToGoogleSheets, updateOrderStatusInGoogleSheets } = require("../utils/googleSheets");
const { protect, adminOnly, staffOnly } = require("../middleware/authMiddleware");
const { sendEmail } = require("../utils/sendEmail");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const proofUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

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

    // Decrement tracked stock per item; anything already at/below 0 becomes a preorder.
    // stockDeducted is the actual amount taken out of real stock (may be less than qty
    // if stock ran out mid-order) — it's what a later restore-stock call gives back.
    const processedItems = [];
    for (const item of items) {
      let isPreorder = false;
      let preorderDate = null;
      let stockDeducted = 0;

      const product = item.productId
        ? await Product.findById(item.productId).catch(() => null)
        : null;

      if (product && product.stock !== null && product.stock !== undefined) {
        const stockBefore = product.stock;
        isPreorder = stockBefore <= 0;
        const newStock = Math.max(stockBefore - Number(item.qty || 0), 0);
        stockDeducted = stockBefore - newStock;
        product.stock = newStock;
        await product.save();
        if (isPreorder) preorderDate = product.preorderDate;
      }

      processedItems.push({ ...item, isPreorder, preorderDate, stockDeducted });
    }

    const hasPreorderItems = processedItems.some((item) => item.isPreorder);
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customerName,
      customerPhone,
      customerAddress,
      items: processedItems,
      total,
      status: "pending",
      hasPreorderItems,
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
      hasPreorderItems: order.hasPreorderItems,
      preorderItems: order.items
        .filter((item) => item.isPreorder)
        .map((item) => ({ name: item.name, preorderDate: item.preorderDate })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/orders/:id/payment-proof
// @desc    Upload a proof-of-payment image/PDF for an order
router.post(
  "/:id/payment-proof",
  proofUploadLimiter,
  proofUpload.single("proof"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "rihab_store/payment_proofs",
        resource_type: "auto",
      });

      order.paymentProofUrl = result.secure_url;
      await order.save();

      res.json({ paymentProofUrl: order.paymentProofUrl });

      // Notify the store owner — fire after responding so a slow/failed email
      // never delays or breaks the customer's checkout.
      notifyOwnerOfProof(order).catch((err) =>
        console.error("Failed to send owner notification email:", err.message)
      );
    } catch (error) {
      res.status(500).json({ message: "Upload failed: " + error.message });
    }
  }
);

const NOTIFY_RECIPIENTS = [
  process.env.EMAIL_USER,
  "mehdibenmhand4@gmail.com",
  "rihab.bourzaim211@gmail.com",
].join(", ");

function notifyOwnerOfProof(order) {
  const itemsList = order.items
    .map((item) => `${item.name} (x${item.qty}) — ${item.price * item.qty} MAD`)
    .join("<br>");

  const isPdf = /\.pdf($|\?)/i.test(order.paymentProofUrl);
  const proofHtml = isPdf
    ? `<a href="${order.paymentProofUrl}" style="color: #D4AF37; font-weight: bold;">View PDF Receipt</a>`
    : `<img src="${order.paymentProofUrl}" alt="Payment proof" style="max-width: 100%; border-radius: 8px; border: 1px solid #eee;" />`;

  return sendEmail({
    to: NOTIFY_RECIPIENTS,
    subject: `New order awaiting review — #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #D4AF37; text-align: center;">New Payment Proof Submitted</h2>
        <p>A customer just completed checkout and uploaded proof of payment. Please review it in the admin panel.</p>
        <p>
          <strong>Order Number:</strong> ${order.orderNumber}<br>
          <strong>Customer:</strong> ${order.customerName}<br>
          <strong>Phone:</strong> ${order.customerPhone}<br>
          <strong>Address:</strong> ${order.customerAddress || "Not provided"}<br>
          <strong>Total:</strong> ${order.total} MAD
        </p>
        <p><strong>Items:</strong><br>${itemsList}</p>
        <div style="text-align: center; margin: 25px 0;">
          ${proofHtml}
        </div>
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/admin" style="background-color: #D4AF37; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Open Admin Panel</a>
        </div>
      </div>
    `,
  });
}

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
    const logoX = 50;
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, logoX, 40, { width: logoWidth });
    } else {
      doc.fillColor("#BF953F")
         .fontSize(24)
         .text("RINIFAZA STORE", logoX, 45, { align: "left" });
    }

    const taglineY = 88;
    const spacing = 12;

    doc.fillColor("#000000") // BLACK
       .fontSize(10)
       .font("Helvetica-Bold")
       .text("luxurious - islamic - fashion", logoX, taglineY, { width: logoWidth, align: "center" });

    doc.font("Helvetica")
       .fillColor("#444444")
       .text("Morocco", logoX, taglineY + spacing, { width: logoWidth, align: "center" })
       .moveDown(2);

    // Receipt Title
    doc.fillColor("#000000") // BLACK
       .fontSize(22)
       .font("Helvetica-Bold")
       .text("ORDER RECEIPT", 50, 140, { align: "center" })
       .moveDown();

    // Order Info & Customer Info Grid
    const infoY = 180;
    doc.fillColor("#000000").fontSize(10).font("Helvetica-Bold").text("ORDER DETAILS", 50, infoY);
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

    // Delivery Notice
    currentY += 40;
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10)
       .text("Delivery: your order will be delivered within 48h to 72h of the drop.", 50, currentY, { align: "center", width: 500 });

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

// @route   POST /api/orders/:id/restore-stock
// @desc    Give back the stock this order deducted (e.g. after a fake payment proof
//          is caught) — adds each item's stockDeducted back onto its product.
router.post("/:id/restore-stock", protect, staffOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.stockRestored) {
      return res.status(400).json({ message: "Stock has already been restored for this order" });
    }

    for (const item of order.items) {
      if (!item.productId || !item.stockDeducted) continue;

      const product = await Product.findById(item.productId).catch(() => null);
      if (product && product.stock !== null && product.stock !== undefined) {
        product.stock += item.stockDeducted;
        await product.save();
      }
    }

    order.stockRestored = true;
    const updatedOrder = await order.save();

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
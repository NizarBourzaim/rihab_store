const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

connectDB();

const app = express();

// CSP is for HTML-serving apps, not much use on a JSON API, and it's easy to
// accidentally break clients with it — skip it, keep the rest of helmet's headers.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
}));
app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
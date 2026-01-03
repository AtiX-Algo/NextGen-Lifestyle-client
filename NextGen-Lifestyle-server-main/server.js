// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");

const { startNotificationRetryLoop } = require("./jobs/notificationRetryJob");
startNotificationRetryLoop();
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Static files
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ----- MongoDB connection -----
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is connected to Frontend!' });
});

// Feature 02 - Products
app.use('/api/products', productRoutes);

// Feature 07 - Orders & Inventory
app.use('/api/orders', orderRoutes);

app.use("/api/notifications", require("./routes/notificationRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

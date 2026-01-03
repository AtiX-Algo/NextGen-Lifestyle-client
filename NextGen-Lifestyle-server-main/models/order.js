// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true }, // snapshot of price at order time
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    color: { type: String }
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String },
    email: { type: String },
    channel: {
      type: String,
      enum: ['web', 'mobile', 'store', 'other'],
      default: 'web'
    },
    status: {
      type: String,
      enum: [
        'Pending',     // just created
        'Processing',
        'Packed',
        'Shipped',
        'Delivered',
        'Returned',
        'Cancelled'
      ],
      default: 'Pending',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true
    },
    paymentMethod: { type: String }, // e.g. "Card", "COD"
    items: [orderItemSchema],
    shippingAddress: addressSchema,
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    invoiceNumber: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);

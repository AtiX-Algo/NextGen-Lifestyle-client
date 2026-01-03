// models/product.js
const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema(
  {
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    category: { type: String, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },

    images: [{ type: String }],
    image: { type: String },
    imageUrl: { type: String },

    variants: [VariantSchema],

    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },

    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

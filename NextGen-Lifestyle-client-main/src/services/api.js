// src/services/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
});

// ---------- PRODUCTS ----------
export const fetchProducts = (params = {}) =>
  api.get("/products", { params }).then((res) => res.data);

export const fetchProductDetail = (id) =>
  api.get(`/products/${id}`).then((res) => res.data);

export const fetchProductFilterMeta = () =>
  api.get("/products/filters/meta").then((res) => res.data);

// ✅ Admin: manual inventory update
export const updateInventory = (productId, payload) =>
  api.put(`/products/${productId}/inventory`, payload).then((res) => res.data);

// ✅ Admin: update product or variant stock
export const updateStock = (productId, { variantId, stock }) =>
  api.patch(`/products/${productId}/stock`, { variantId, stock })
    .then((res) => res.data);

// ---------- ORDERS ----------
export const fetchOrders = (params = {}) =>
  api.get("/orders", { params }).then((res) => res.data);

export const updateOrder = (id, payload) =>
  api.patch(`/orders/${id}`, payload).then((res) => res.data);

export const createOrder = (payload) =>
  api.post("/orders", payload).then((res) => res.data);

export const deleteOrder = (id) =>
  api.delete(`/orders/${id}`).then((res) => res.data);

// ---------- INVENTORY API (for AdminInventoryPage) ----------
export const inventoryAPI = {
  // Get all products with inventory
  getProducts: () => fetchProducts(),
  
  // Update product or variant stock
  updateStock,
};
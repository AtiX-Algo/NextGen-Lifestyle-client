// routes/orderRoutes.js
const express = require("express");
const Order = require("../models/order");
const Product = require("../models/product");


// ✅ Feature 10: Notifications
// Make sure this file exists:
// NextGen-Lifestyle-server-main/services/notifications/notificationService.js
let notifyUser = null;
try {
  ({ notifyUser } = require("../services/notifications/notificationService"));
} catch (e) {
  console.log(
    "⚠️ notificationService not found. Feature 10 notifications will be skipped."
  );
}

const router = express.Router();

/* ---------- Helper: find variant for an item ---------- */
function findVariant(product, item) {
  return product.variants.find(
    (v) =>
      (item.size ? v.size === item.size : !v.size || v.size === null) &&
      (item.color ? v.color === item.color : !v.color || v.color === null)
  );
}

/* ---------- Helper: calculate totals ---------- */
function calculateTotalsFromItems(items) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxRate = 0.15; // 15% example VAT
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const discount = 0;
  const total = subtotal + tax - discount;

  return { subtotal, tax, discount, total };
}

/* ---------- STOCK / INVENTORY HELPERS ---------- */

// Reserve stock when an order is created (payment pending)
async function reserveStockForOrderItems(items) {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error("Product not found for reservation");
    }

    const variant = findVariant(product, item);
    if (!variant) {
      throw new Error(
        `Variant not found for product ${product.name} (size=${item.size || "-"}, color=${item.color || "-"})`
      );
    }

    const reserved = variant.reserved || 0;
    const available = (variant.stock || 0) - reserved;

    if (available < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name} (${item.size || "-"}, ${item.color || "-"})`
      );
    }

    variant.reserved = reserved + item.quantity;
    product.markModified("variants");
    await product.save();
  }
}

// Release reserved stock (payment failed / cancelled, or item changed)
async function releaseReservedStockForItems(orderItems) {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const variant = findVariant(product, item);
    if (!variant) continue;

    const reserved = variant.reserved || 0;
    variant.reserved = Math.max(0, reserved - item.quantity);
    product.markModified("variants");
    await product.save();
  }
}

// Deduct stock when payment succeeds (convert reserved → real deduction)
async function deductStockForItems(orderItems) {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const variant = findVariant(product, item);
    if (!variant) continue;

    const reserved = variant.reserved || 0;
    const stock = variant.stock || 0;

    // assume these were reserved earlier
    variant.reserved = Math.max(0, reserved - item.quantity);
    variant.stock = Math.max(0, stock - item.quantity);

    product.markModified("variants");
    await product.save();
  }
}

// Decide what to do with inventory when paymentStatus changes
async function applyInventoryForPaymentChange(order, newPaymentStatus) {
  const oldStatus = order.paymentStatus;
  if (oldStatus === newPaymentStatus) return;

  // From pending → paid OR failed/cancelled
  if (oldStatus === "pending") {
    if (newPaymentStatus === "paid") {
      await deductStockForItems(order.items);
    } else if (
      newPaymentStatus === "failed" ||
      newPaymentStatus === "cancelled"
    ) {
      await releaseReservedStockForItems(order.items);
    }
  }

  // If someone changes from paid → cancelled, do NOT add stock back (business rule)
}

/* ---------- Feature 10 helpers ---------- */

function mapOrderStatusToEvent(status) {
  const s = String(status || "").toLowerCase();
  if (s === "shipped") return "SHIPMENT";
  if (s === "out for delivery" || s === "out_for_delivery")
    return "OUT_FOR_DELIVERY";
  if (s === "delivered") return "DELIVERED";
  return null;
}

// Safe send: never break order flow if notifications fail
async function safeNotify({ userId, eventType, data }) {
  if (!notifyUser) return;
  if (!userId) return; // if no userId, we skip (keep your old system safe)

  try {
    await notifyUser({ userId, eventType, data });
  } catch (e) {
    console.log("⚠️ Notification failed but order flow continues:", e.message);
  }
}

/* ---------- ROUTES ---------- */

/**
 * POST /api/orders
 * Create order:
 *  - validates stock
 *  - reserves stock (Feature 7: "On purchase, stock is reserved")
 *  - ✅ Feature 10: sends ORDER_CONFIRMED notification
 */
router.post("/", async (req, res) => {
  try {
    const {
      userId, // ✅ optional userId (recommended for Feature 10 preferences)
      customerName,
      email,
      channel,
      paymentMethod,
      items,
      shippingAddress,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must have at least one item" });
    }

    const orderItems = [];
    const itemsForReservation = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({
          message: "Each item must include productId and quantity",
        });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(400)
          .json({ message: `Product not found: ${item.productId}` });
      }

      const variant = findVariant(product, item);
      if (!variant) {
        return res.status(400).json({
          message: `Variant not found for ${product.name} (size=${item.size || "-"}, color=${item.color || "-"})`,
        });
      }

      const reserved = variant.reserved || 0;
      const available = (variant.stock || 0) - reserved;

      if (available < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name} (${item.size || "-"}, ${item.color || "-"})`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });

      itemsForReservation.push({
        productId: product._id,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      });
    }

    // Reserve stock
    await reserveStockForOrderItems(itemsForReservation);

    // Totals
    const totals = calculateTotalsFromItems(orderItems);

    const order = await Order.create({
      userId,
      customerName,
      email,
      channel,
      paymentMethod,
      status: "Pending",
      paymentStatus: "pending",
      items: orderItems,
      shippingAddress,
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      currency: "USD",
      invoiceNumber: `INV-${Date.now()}`,
    });

    // ✅ Feature 10: ORDER CONFIRMED notification
    await safeNotify({
      userId: order.userId || userId,
      eventType: "ORDER_CONFIRMED",
      data: { orderId: order._id.toString(), total: order.total },
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order", err);
    res.status(400).json({
      message: "Failed to create order",
      error: err.message,
    });
  }
});

/**
 * GET /api/orders
 * List orders for admin with filters.
 */
router.get("/", async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      channel,
      from,
      to,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (channel) filter.channel = channel;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 20;
    const skip = (pageNumber - 1) * limitNumber;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
    });
  } catch (err) {
    console.error("Error fetching orders", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

/**
 * GET /api/orders/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Error fetching order detail", err);
    res.status(500).json({ message: "Failed to load order" });
  }
});

/**
 * PATCH /api/orders/:id
 * - update status
 * - update paymentStatus (triggers inventory changes)
 * - optional: update items while paymentStatus is 'pending'
 * - ✅ Feature 10: sends SHIPMENT / OUT_FOR_DELIVERY / DELIVERED notifications on status change
 */
router.patch("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const { status, paymentStatus, shippingAddress, items } = req.body;

    const originalPaymentStatus = order.paymentStatus;
    const originalStatus = order.status;

    // Optional: update items (only when payment is still pending)
    if (Array.isArray(items) && items.length) {
      if (originalPaymentStatus !== "pending") {
        return res
          .status(400)
          .json({ message: "Can only edit items while payment is pending" });
      }

      // Release previous reserved items
      await releaseReservedStockForItems(order.items);

      const newOrderItems = [];
      const itemsForReservation = [];

      for (const item of items) {
        if (!item.productId || !item.quantity) {
          return res.status(400).json({
            message: "Each item must include productId and quantity",
          });
        }

        const product = await Product.findById(item.productId);
        if (!product) {
          return res
            .status(400)
            .json({ message: `Product not found: ${item.productId}` });
        }

        const variant = findVariant(product, item);
        if (!variant) {
          return res.status(400).json({
            message: `Variant not found for ${product.name} (size=${item.size || "-"}, color=${item.color || "-"})`,
          });
        }

        const reserved = variant.reserved || 0;
        const available = (variant.stock || 0) - reserved;

        if (available < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name} (${item.size || "-"}, ${item.color || "-"})`,
          });
        }

        newOrderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        });

        itemsForReservation.push({
          productId: product._id,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        });
      }

      await reserveStockForOrderItems(itemsForReservation);

      const totals = calculateTotalsFromItems(newOrderItems);
      order.items = newOrderItems;
      order.subtotal = totals.subtotal;
      order.tax = totals.tax;
      order.discount = totals.discount;
      order.total = totals.total;
    }

    // Status update (prevent cancelling shipped/delivered)
    if (status) {
      if (
        status === "Cancelled" &&
        (order.status === "Shipped" || order.status === "Delivered")
      ) {
        return res.status(400).json({
          message:
            "Cannot cancel an order that has already been shipped/delivered",
        });
      }
      order.status = status;
    }

    // Payment status update → apply inventory rules
    if (paymentStatus && paymentStatus !== originalPaymentStatus) {
      await applyInventoryForPaymentChange(order, paymentStatus);
      order.paymentStatus = paymentStatus;
    }

    // Address update
    if (shippingAddress) {
      order.shippingAddress = {
        ...(order.shippingAddress || {}),
        ...shippingAddress,
      };
    }

    await order.save();

    // ✅ Feature 10: status-based notifications (only if status actually changed)
    if (status && status !== originalStatus) {
      const eventType = mapOrderStatusToEvent(status);
      if (eventType) {
        await safeNotify({
          userId: order.userId,
          eventType,
          data: { orderId: order._id.toString(), total: order.total },
        });
      }
    }

    res.json(order);
  } catch (err) {
    console.error("Error updating order", err);
    res.status(400).json({
      message: "Failed to update order",
      error: err.message,
    });
  }
});

module.exports = router;

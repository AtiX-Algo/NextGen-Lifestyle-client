const mongoose = require("mongoose");

const NotificationLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    eventType: {
      type: String,
      enum: [
        "ORDER_CONFIRMED",
        "SHIPMENT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "OTP",
        "PASSWORD_RESET",
        "SYSTEM",
      ],
      required: true,
    },

    channel: { type: String, enum: ["sms", "email"], required: true },

    to: { type: String, required: true },
    message: { type: String, required: true },

    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },

    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: "" },
    nextRetryAt: { type: Date, default: null },
  },
  { timestamps: true }
);

NotificationLogSchema.index({ status: 1, nextRetryAt: 1 });

module.exports =
  mongoose.models.NotificationLog || mongoose.model("NotificationLog", NotificationLogSchema);

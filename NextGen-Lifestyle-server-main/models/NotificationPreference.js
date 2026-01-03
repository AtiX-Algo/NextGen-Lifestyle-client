const mongoose = require("mongoose");

const NotificationPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    // Consent
    smsOptIn: { type: Boolean, default: false },
    emailOptIn: { type: Boolean, default: true },

    // Contact
    phoneNumber: { type: String, default: "" }, // must be +880...
    email: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.NotificationPreference ||
  mongoose.model("NotificationPreference", NotificationPreferenceSchema);

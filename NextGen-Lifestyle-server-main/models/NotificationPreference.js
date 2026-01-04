const mongoose = require("mongoose");

const NotificationPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },

    // Preference versioning
    isActive: { type: Boolean, default: true, index: true },

    // Consent
    smsOptIn: { type: Boolean, default: false },
    emailOptIn: { type: Boolean, default: true },

    // Contact
    phoneNumber: { type: String, default: "" }, // must be +880...
    email: { type: String, default: "" },
  },
  { timestamps: true }
);

NotificationPreferenceSchema.index({ userId: 1, isActive: 1 });

module.exports =
  mongoose.models.NotificationPreference ||
  mongoose.model("NotificationPreference", NotificationPreferenceSchema);

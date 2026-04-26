const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastKnownPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastKnownStatus: {
      type: String,
      default: 'Available',
    },
    lastNotifiedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

priceAlertSchema.index({ propertyId: 1, userEmail: 1 }, { unique: true });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);

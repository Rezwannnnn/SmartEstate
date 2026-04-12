const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    // Adding both naming conventions to support all features
    requesterName: {
      type: String,
      required: true,
      trim: true,
    },
    requesterEmail: {
      type: String,
      required: true,
      trim: true,
    },
    buyer: {
      name: { type: String },
      email: { type: String },
      phone: { type: String }
    },
    seller: {
      name: { type: String },
      email: { type: String }
    },
    offerAmount: {
      type: Number,
      required: false,
      min: 0,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "Requested", "Accepted", "Rejected", "Completed", "Cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);

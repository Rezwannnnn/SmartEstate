const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
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
    offerAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Requested", "Accepted", "Rejected", "Completed", "Cancelled"],
      default: "Requested",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
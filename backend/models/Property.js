const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    propertyType: {
      type: String,
      enum: ["Sale", "Rent"],
      default: "Sale",
    },
    bedrooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    size: {
      type: Number,
      default: 0,
      min: 0,
    },
    owner: {
      name: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Available", "Under Offer", "Sold", "Rented"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
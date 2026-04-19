const mongoose = require("mongoose");
const User = require("./User");

const notified_propertySchema = new mongoose.Schema(
  {
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    location: { 
        type: String,
        trim: true,
    },

    type: {
      type: String,
    },

    bedrooms: {
      type: Number,
      min: 0,
    },

    min_price: {
      type: Number,
      min: 0,
    },

    max_price:{
        type: Number,
    }

  },
  { timestamps: true },
);

module.exports = mongoose.model("not_property", notified_propertySchema);

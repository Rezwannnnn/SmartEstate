const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Request = require("../models/Request");
const Property = require("../models/Property");

const allowedTransitions = {
  Requested: ["Accepted", "Rejected", "Cancelled"],
  Accepted: ["Completed", "Cancelled"],
  Rejected: [],
  Completed: [],
  Cancelled: [],
};

router.post("/", async (req, res) => {
  try {
    const { propertyId, requesterName, requesterEmail, offerAmount, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.status === "Sold" || property.status === "Rented") {
      return res.status(400).json({ message: "This property is no longer available" });
    }

    const newRequest = new Request({
      propertyId,
      requesterName,
      requesterEmail,
      offerAmount,
      message,
    });

    await newRequest.save();

    const populatedRequest = await Request.findById(newRequest._id).populate("propertyId");
    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("propertyId")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await Request.findById(req.params.id).populate("propertyId");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await Request.findById(req.params.id).populate("propertyId");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (!allowedTransitions[request.status].includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${request.status} to ${status}`,
      });
    }

    request.status = status;
    await request.save();

    if (status === "Accepted") {
      request.propertyId.status = "Under Offer";
      await request.propertyId.save();
    }

    if (status === "Completed") {
      request.propertyId.status =
        request.propertyId.propertyType === "Sale" ? "Sold" : "Rented";
      await request.propertyId.save();
    }

    if (status === "Rejected" || status === "Cancelled") {
      if (request.propertyId.status === "Under Offer") {
        request.propertyId.status = "Available";
        await request.propertyId.save();
      }
    }

    const updatedRequest = await Request.findById(req.params.id).populate("propertyId");
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const deletedRequest = await Request.findByIdAndDelete(req.params.id);

    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
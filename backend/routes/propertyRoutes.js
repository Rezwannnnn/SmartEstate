const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const Property = require("../models/propertyModel");
const PriceAlert = require('../models/priceAlertModel');
const { property_input, getFilterProperty } = require('../controllers/propertyController');
const { getPropertyById: getPropByIdReq } = require('../controllers/requestController');
const { notifySubscribersOnPropertyChange } = require('../services/propertyAlertService');
const {
  isFinalPropertyStatus,
  cancelPendingRequestsForProperty,
} = require('../services/requestLifecycleService');

// My endpoints
router.post('/filter', getFilterProperty);
router.post('/input', property_input); 

// Develop endpoints
router.get("/", async (req, res) => {
  try {
    const { listing } = req.query;
    const filter = {};

    if (listing === "rent") {
      filter.propertyType = "Rent";
    } else if (listing === "sale") {
      filter.propertyType = "Sale";
    }

    const properties = await Property.find(filter).sort({ createdAt: -1 });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

      return getPropByIdReq(req, res);
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/alerts/subscribe', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required for alert subscription' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const existing = await PriceAlert.findOne({
      propertyId: property._id,
      userEmail: email,
    });

    if (existing) {
      if (existing.active) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to alerts for this property.',
        });
      }

      existing.active = true;
      existing.lastKnownPrice = property.price;
      existing.lastKnownStatus = property.status;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: 'Price alerts re-enabled for this property.',
      });
    }

    await PriceAlert.create({
      propertyId: property._id,
      userEmail: email,
      active: true,
      lastKnownPrice: property.price,
      lastKnownStatus: property.status,
    });

    return res.status(201).json({
      success: true,
      message: 'Subscribed successfully. You will get email alerts for price/status changes.',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/:id/alerts/unsubscribe', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required for alert unsubscription' });
    }

    const existing = await PriceAlert.findOne({
      propertyId: req.params.id,
      userEmail: email,
    });

    if (!existing || !existing.active) {
      return res.status(200).json({
        success: true,
        message: 'You are already unsubscribed from this property alert.',
      });
    }

    existing.active = false;
    await existing.save();

    return res.status(200).json({
      success: true,
      message: 'Unsubscribed successfully. You will no longer receive alerts for this property.',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    const existingProperty = await Property.findById(req.params.id);

    if (!existingProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    const previousState = {
      _id: existingProperty._id,
      title: existingProperty.title,
      price: existingProperty.price,
      status: existingProperty.status,
    };

    existingProperty.set(req.body);
    const updatedProperty = await existingProperty.save();

    await notifySubscribersOnPropertyChange(previousState, updatedProperty);

    const wasFinal = isFinalPropertyStatus(previousState.status);
    const isNowFinal = isFinalPropertyStatus(updatedProperty.status);
    if (!wasFinal && isNowFinal) {
      await cancelPendingRequestsForProperty(updatedProperty._id);
    }


    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    const deletedProperty = await Property.findByIdAndDelete(req.params.id);

    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

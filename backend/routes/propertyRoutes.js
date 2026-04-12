<<<<<<< HEAD
const express = require('express');
const router = express.Router();

const { property_input, getFilterProperty } = require('../controllers/propertyController');
const { getPropertyById } = require('../controllers/requestController');

router.post('/', property_input);
router.post('/filter', getFilterProperty);
router.get('/:id', getPropertyById);

module.exports = router;
=======
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Property = require("../models/Property");

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
      return res.status(400).json({ message: "Invalid property ID" });
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

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
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
>>>>>>> origin/develop

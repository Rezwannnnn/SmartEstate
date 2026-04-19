const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ User: req.params.userId }).populate('propertyId').sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

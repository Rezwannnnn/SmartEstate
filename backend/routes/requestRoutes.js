const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const Request = require("../models/requestModel");
const Property = require("../models/propertyModel");
const { sendRequestStatusEmail } = require('../services/emailService');
const { notifySubscribersOnPropertyChange } = require('../services/propertyAlertService');
const { generateAgreementPdf } = require('../services/agreementPdfService');
const {
  isFinalPropertyStatus,
  canReceiveNewRequests,
  cancelPendingRequestsForProperty,
} = require('../services/requestLifecycleService');
const {
  sendBuyRequest,
  getSellerRequests,
  acceptRequest: acceptController,
  rejectRequest: rejectController
} = require('../controllers/requestController');


const allowedTransitions = {
  Requested: ["Accepted", "Rejected", "Cancelled"],
  Accepted: ["Completed", "Cancelled"],
  Rejected: [],
  Completed: [],
  Cancelled: [],
  pending: ["accepted", "rejected"],
  accepted: [],
  rejected: []
};


router.post('/buy', sendBuyRequest);
router.get('/seller/:sellerEmail', getSellerRequests);
router.put('/:requestId/accept', acceptController);
router.put('/:requestId/reject', rejectController);


router.post("/", async (req, res) => {
  try {
    const { propertyId, requesterName, requesterEmail, offerAmount, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (!canReceiveNewRequests(property.status)) {
      return res.status(400).json({ message: "This property is currently unavailable for new proposals" });
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
    const requests = await Request.find().populate("propertyId").sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid request ID" });
    const request = await Request.findById(req.params.id).populate("propertyId");
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/agreement", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await Request.findById(req.params.id).populate("propertyId");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const normalizedStatus = String(request.status || '').toLowerCase();
    if (normalizedStatus !== 'completed') {
      return res.status(400).json({ message: 'Agreement can be downloaded only after deal completion' });
    }

    const property = request.propertyId;
    if (!property) {
      return res.status(400).json({ message: "Property information unavailable for this request" });
    }

    const locationLabel =
      property.location?.formattedAddress ||
      property.location?.address ||
      [property.location?.area, property.location?.city].filter(Boolean).join(', ') ||
      'N/A';

    const agreementPayload = {
      agreementId: `SE-${String(request._id).slice(-8).toUpperCase()}`,
      completedDate: request.updatedAt,
      property: {
        title: property.title || 'Property',
        type: property.propertyType || 'N/A',
        location: locationLabel,
        status: property.status || 'N/A',
        listedPrice: property.price,
      },
      buyer: {
        name: request.buyer?.name || request.requesterName || 'N/A',
        email: request.buyer?.email || request.requesterEmail || 'N/A',
        phone: request.buyer?.phone || 'N/A',
      },
      seller: {
        name: request.seller?.name || property.owner?.name || 'N/A',
        email: request.seller?.email || property.owner?.email || 'N/A',
        phone: property.owner?.phone || 'N/A',
      },
      deal: {
        offerAmount: request.offerAmount || property.price || 0,
        finalStatus: property.status || 'N/A',
        message: request.message || 'No additional notes provided.',
      },
    };

    const pdfBuffer = await generateAgreementPdf(agreementPayload);
    const fileName = `agreement-${request._id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate agreement PDF", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid request ID" });

    const request = await Request.findById(req.params.id).populate("propertyId");
    if (!request) return res.status(404).json({ message: "Request not found" });

    const currentStatus = request.status || 'pending';
    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({ message: `Invalid status transition from ${currentStatus} to ${status}` });
    }

    request.status = status;
    await request.save();

    if (status === "Accepted" || status === "accepted") {
      const previousState = {
        _id: request.propertyId._id,
        title: request.propertyId.title,
        price: request.propertyId.price,
        status: request.propertyId.status,
      };
      request.propertyId.status = "Under Offer";
      await request.propertyId.save();
      await notifySubscribersOnPropertyChange(previousState, request.propertyId);
    }

    if (status === "Completed") {
      const previousState = {
        _id: request.propertyId._id,
        title: request.propertyId.title,
        price: request.propertyId.price,
        status: request.propertyId.status,
      };
      request.propertyId.status = request.propertyId.propertyType === "Sale" ? "Sold" : "Rented";
      await request.propertyId.save();
      await notifySubscribersOnPropertyChange(previousState, request.propertyId);
      await cancelPendingRequestsForProperty(request.propertyId._id);
    }

    if (status === "Rejected" || status === "rejected" || status === "Cancelled") {
      if (request.propertyId.status === "Under Offer") {
        const previousState = {
          _id: request.propertyId._id,
          title: request.propertyId.title,
          price: request.propertyId.price,
          status: request.propertyId.status,
        };
        request.propertyId.status = "Available";
        await request.propertyId.save();
        await notifySubscribersOnPropertyChange(previousState, request.propertyId);
      }
    }

    if (status === "Accepted" || status === "accepted" || status === "Rejected" || status === "rejected") {

      // Send decision update mail only on accept/reject.
      
      await sendRequestStatusEmail({
        to: request.requesterEmail || request.buyer?.email,
        requesterName: request.requesterName || request.buyer?.name,
        status,
        propertyTitle: request.propertyId?.title,
      });
    }

    const updatedRequest = await Request.findById(req.params.id).populate("propertyId");
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid request ID" });
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);
    if (!deletedRequest) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

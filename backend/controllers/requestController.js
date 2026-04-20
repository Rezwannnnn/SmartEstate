const Request = require('../models/requestModel');
const Property = require('../models/propertyModel');
const { sendRequestStatusEmail } = require('../services/emailService');
const { canReceiveNewRequests } = require('../services/requestLifecycleService');

exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
        res.status(200).json({ success: true, property });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendBuyRequest = async (req, res) => {
    try {
        const { propertyId, buyerName, buyerEmail, buyerPhone, message } = req.body;

        if (!propertyId || !buyerName || !buyerEmail) {
            return res.status(400).json({ success: false, message: 'Please provide all necessary details' });
        }

        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

        if (!canReceiveNewRequests(property.status)) {
            return res.status(400).json({ success: false, message: 'This property is currently unavailable for new proposals' });
        }

        const request = await Request.create({
            property: propertyId,
            buyer: { name: buyerName, email: buyerEmail, phone: buyerPhone },
            seller: { name: property.sellerName, email: property.sellerEmail },
            message
        });

        return res.status(200).json({ success: true, message: 'Buy request sent successfully', request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSellerRequests = async (req, res) => {
    try {
        const requests = await Request.find({ 'seller.email': req.params.sellerEmail })
            .populate('property', 'title location price image type bedrooms')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: requests.length, requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.requestId).populate('property');
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, message: `Request already ${request.status}` });

        request.status = 'accepted';
        await request.save();

        if (request.property) {
            const prop = request.property;
            prop.status = prop.type.toLowerCase() === 'rent' ? 'rented' : 'sold';
            await prop.save();
        }

        // Notify buyer after seller accepts.
        await sendRequestStatusEmail({
            to: request.requesterEmail || request.buyer?.email,
            requesterName: request.requesterName || request.buyer?.name,
            status: 'accepted',
            propertyTitle: request.property?.title,
        });

        return res.status(200).json({ success: true, message: 'Request accepted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.requestId);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, message: `Request already ${request.status}` });

        request.status = 'rejected';
        await request.save();

        // Notify buyer after seller rejects.
        await sendRequestStatusEmail({
            to: request.requesterEmail || request.buyer?.email,
            requesterName: request.requesterName || request.buyer?.name,
            status: 'rejected',
        });

        return res.status(200).json({ success: true, message: 'Request rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

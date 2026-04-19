const Request = require('../models/Request');
const Property = require('../models/Property');
const notproperty = require('../models/notify_property');
const Notification = require('../models/Notification');
const { sendRequestStatusEmail, sendPropertySoldEmail } = require('../services/emailService');

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

        const request = await Request.create({
            propertyId: propertyId,
            requesterName: buyerName,
            requesterEmail: buyerEmail,
            buyer: { name: buyerName, email: buyerEmail, phone: buyerPhone },
            seller: { 
                name: property.owner?.name || property.sellerName || 'Seller', 
                email: property.owner?.email || property.sellerEmail || 'seller@example.com' 
            },
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
            .populate('propertyId', 'title location price images type bedrooms')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: requests.length, requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.requestId).populate('propertyId');
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, message: `Request already ${request.status}` });

        request.status = 'accepted';
        await request.save();

        if (request.propertyId) {
            const prop = request.propertyId;
            prop.status = prop.propertyType?.toLowerCase() === 'rent' ? 'Rented' : 'Sold';
            await prop.save();

            // Notify users whose filters match this property
            try {
                const propLocationStr = typeof prop.location === 'object' && prop.location !== null 
                    ? (prop.location.formattedAddress || prop.location.address || prop.location.city || "") 
                    : (prop.location || "");

                const query = {
                    $and: [
                        { $or: [{ location: { $exists: false } }, { location: null }, { location: "" }, { location: propLocationStr }] },
                        { $or: [{ type: { $exists: false } }, { type: null }, { type: "" }, { type: 'all' }, { type: { $in: [prop.propertyType, prop.type, String(prop.propertyType).toLowerCase()] } }] },
                        { $or: [{ bedrooms: { $exists: false } }, { bedrooms: null }, { bedrooms: prop.bedrooms }] },
                        { $or: [{ min_price: { $exists: false } }, { min_price: null }, { min_price: { $lte: prop.price } }] },
                        { $or: [{ max_price: { $exists: false } }, { max_price: null }, { max_price: { $gte: prop.price } }] }
                    ]
                };
                const matchedFilters = await notproperty.find(query).populate('User', 'name email');
                for (const filter of matchedFilters) {
                    // Do not email the person who's actually buying/renting it
                    if (filter.User?.email && filter.User.email !== request.requesterEmail) {
                        await sendPropertySoldEmail({
                            to: filter.User.email,
                            userName: filter.User.name,
                            propertyTitle: prop.title,
                            status: prop.status,
                        });

                        // Create in-app Notification
                        await Notification.create({
                             User: filter.User._id,
                             message: `A property tracking your saved filters (${prop.title}) has been marked as ${prop.status}.`,
                             propertyId: prop._id
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to notify followers:", err);
            }
        }

        // Notify buyer after seller accepts.
        await sendRequestStatusEmail({
            to: request.requesterEmail || request.buyer?.email,
            requesterName: request.requesterName || request.buyer?.name,
            status: 'accepted',
            propertyTitle: request.propertyId?.title,
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

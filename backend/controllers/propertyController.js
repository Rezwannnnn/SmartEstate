const Property = require('../models/Property');
const notproperty = require('../models/notify_property');
const { sendNewPropertyEmail } = require('../services/emailService');

exports.notify_property= async (req, res) => {
    try {
        const { location,type,bedrooms,min_price, max_price, User} = req.body;

        const notify_property = await notproperty.create({
            User,
            location,
            type,
            bedrooms,
            min_price,
            max_price
        });

        return res.status(200).json({ success: true, message: 'Will notify when needed' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.property_input = async (req, res) => {
    try {
        const { title, price, location, type, bedrooms, image, sellerName, sellerEmail } = req.body;

        if (!title || !price || !location || !type || !image || !sellerName || !sellerEmail) {
            return res.status(400).json({ success: false, message: 'Please provide all necessary details' });
        }

        const query = {};

        if (location) query.location = location;
        if (type) query.type = type;
        if (bedrooms) query.bedrooms = bedrooms;
        if (price) {
            query.min_price = { $lte: price };
            query.max_price = { $gte: price };
        }

        const note = await notproperty.find(query).populate("User", "name email");

        const property = await Property.create({
            title,
            description: "No description provided",
            price,
            location: {
                address: location,
                area: 'Unknown',
                city: 'Unknown',
                postCode: 'Unknown',
                coordinates: { lat: 0, lng: 0 },
                formattedAddress: location
            },
            type,
            bedrooms,
            images: [image],
            owner: {
                name: sellerName,
                email: sellerEmail
            }
        });

        for (const i of note) {
            console.log("Send email to:", i.User?.email)
            if (i.User?.email) {
                await sendNewPropertyEmail({ 
                   to: i.User.email, 
                   userName: i.User.name, 
                   propertyTitle: title 
                });
            }
        }

        return res.status(200).json({ success: true, message: 'Property added successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFilterProperty = async (req, res) => {
    try {
        const { min_price, max_price, location, type, bedrooms } = req.body;

        const query = {};

        if (min_price !== undefined || max_price !== undefined) {
            query.price = {};
            if (min_price !== undefined) query.price.$gte = Number(min_price);
            if (max_price !== undefined) query.price.$lte = Number(max_price);
        }

        if (location) query.location = location;
        if (type) query.type = type;
        if (bedrooms !== undefined) query.bedrooms = Number(bedrooms);

        console.log('Query being sent to MongoDB:', query); // helpful for debugging

        const properties = await Property.find(query);

        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'No properties found matching your criteria' });
        }

        res.status(200).json({ success: true, count: properties.length, properties });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const mongoose = require('mongoose');
const Property = require('./models/Properties');
require('dotenv').config();

const seedProperties = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartestate");
        console.log("Connected!");

        const mockProps = [
            {
                title: "Luxury Modern Villa", price: 6500000, min_price: 6000000, max_price: 7000000,
                location: "Gulshan", type: "Buy", bedrooms: 4,
                image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
                sellerName: "Test Seller", sellerEmail: "test@example.com"
            },
            {
                title: "Cozy 2BHK Apartment", price: 45000, min_price: 40000, max_price: 50000,
                location: "Banani", type: "Rent", bedrooms: 2,
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
                sellerName: "Test Seller", sellerEmail: "test@example.com"
            },
            {
                title: "Central Urban Condo", price: 1200000, min_price: 1000000, max_price: 1500000,
                location: "Dhanmondi", type: "Buy", bedrooms: 3,
                image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
                sellerName: "Other Seller", sellerEmail: "other@example.com"
            }
        ];

        await Property.deleteMany({}); // clear old
        await Property.insertMany(mockProps);
        console.log("Successfully seeded 3 properties!");
        process.exit(0);
    } catch (err) {
        console.error("Failed to seed:", err);
        process.exit(1);
    }
};

seedProperties();

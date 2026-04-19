require('dotenv').config();
const { sendNewPropertyEmail } = require('./services/emailService');

(async () => {
    console.log("Testing email logic loaded with .env...");
    const success = await sendNewPropertyEmail({
        to: "testytest@example.com", 
        userName: "Test User",
        propertyTitle: "Luxury Testing Penthouse"
    });
    
    if (success) {
        console.log("EMAIL_SEND_SUCCESS");
    } else {
        console.log("EMAIL_SEND_FAILURE");
    }
    process.exit();
})();

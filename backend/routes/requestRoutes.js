const express = require('express');
const router = express.Router();

const {
    sendBuyRequest,
    getSellerRequests,
    acceptRequest,
    rejectRequest
} = require('../controllers/requestController');

router.post('/buy', sendBuyRequest);
router.get('/seller/:sellerEmail', getSellerRequests);
router.put('/:requestId/accept', acceptRequest);
router.put('/:requestId/reject', rejectRequest);

module.exports = router;

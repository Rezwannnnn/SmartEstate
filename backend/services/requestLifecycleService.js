const Request = require('../models/requestModel');

const CANCELABLE_STATUSES = ['pending', 'Requested'];

const isFinalPropertyStatus = (status) => {
  const normalized = String(status || '').toLowerCase();
  return normalized === 'sold' || normalized === 'rented';
};

const canReceiveNewRequests = (status) => {
  const normalized = String(status || '').toLowerCase();

  return normalized !== 'sold';
};

const cancelPendingRequestsForProperty = async (propertyId) => {
  if (!propertyId) {
    return { modifiedCount: 0 };
  }

  const result = await Request.updateMany(
    {
      propertyId,
      status: { $in: CANCELABLE_STATUSES },
    },
    {
      $set: {
        status: 'Cancelled',
      },
    },
  );

  return { modifiedCount: result.modifiedCount || 0 };
};

module.exports = {
  isFinalPropertyStatus,
  canReceiveNewRequests,
  cancelPendingRequestsForProperty,
};

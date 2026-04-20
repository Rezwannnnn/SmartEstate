const PriceAlert = require('../models/priceAlertModel');
const { sendPropertyAlertEmail } = require('./emailService');

const toSnapshot = (propertyLike) => ({
  _id: propertyLike?._id,
  title: propertyLike?.title || 'Property',
  price: Number(propertyLike?.price || 0),
  status: propertyLike?.status || 'Available',
});

const notifySubscribersOnPropertyChange = async (previousProperty, updatedProperty) => {
  const previous = toSnapshot(previousProperty);
  const updated = toSnapshot(updatedProperty);

  const priceChanged = previous.price !== updated.price;
  const statusChangedToFinal =
    previous.status !== updated.status &&
    (updated.status === 'Sold' || updated.status === 'Rented');

  if (!priceChanged && !statusChangedToFinal) {
    return { sent: 0, matched: 0 };
  }

  const subscriptions = await PriceAlert.find({
    propertyId: updated._id,
    active: true,
  });

  if (subscriptions.length === 0) {
    return { sent: 0, matched: 0 };
  }

  let sent = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      const mailSent = await sendPropertyAlertEmail({
        to: subscription.userEmail,
        propertyTitle: updated.title,
        oldPrice: previous.price,
        newPrice: updated.price,
        oldStatus: previous.status,
        newStatus: updated.status,
      });

      if (mailSent) {
        sent += 1;
        subscription.lastKnownPrice = updated.price;
        subscription.lastKnownStatus = updated.status;
        subscription.lastNotifiedAt = new Date();
        await subscription.save();
      }
    }),
  );

  return { sent, matched: subscriptions.length };
};

module.exports = {
  notifySubscribersOnPropertyChange,
};

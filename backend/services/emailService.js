const nodemailer = require('nodemailer');

const getTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    // Mail setup is missing, so we skip sending for now.
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendRequestStatusEmail = async ({
  to,
  requesterName,
  status,
  propertyTitle,
}) => {
  if (!to || !status) {
    return false;
  }

  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  const normalizedStatus = String(status).toLowerCase();
  // Send mail only when seller accepts or rejects.
  if (normalizedStatus !== 'accepted' && normalizedStatus !== 'rejected') {
    return false;
  }

  const actionText = normalizedStatus === 'accepted' ? 'accepted' : 'rejected';
  const subject = `SmartEstate Update: Your request was ${actionText}`;
  const safeName = requesterName || 'User';
  const safeTitle = propertyTitle || 'the selected property';

  const text = [
    `Hello ${safeName},`,
    '',
    `Your buy/rent request for ${safeTitle} has been ${actionText}.`,
    '',
    'Please sign in to SmartEstate for more details.',
    '',
    'Thank you,',
    'SmartEstate Team',
  ].join('\n');

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    // Even if mail fails, app should keep working.
    console.error('Email notification failed:', error.message);
    return false;
  }
};

const sendPropertyAlertEmail = async ({
  to,
  propertyTitle,
  oldPrice,
  newPrice,
  oldStatus,
  newStatus,
}) => {
  if (!to) {
    return false;
  }

  const priceChanged = Number(oldPrice) !== Number(newPrice);
  const statusChangedToFinal =
    String(oldStatus || '') !== String(newStatus || '') &&
    (newStatus === 'Sold' || newStatus === 'Rented');

  if (!priceChanged && !statusChangedToFinal) {
    return false;
  }

  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  const updates = [];
  if (priceChanged) {
    updates.push(`Price changed from $${Number(oldPrice || 0).toLocaleString()} to $${Number(newPrice || 0).toLocaleString()}.`);
  }
  if (statusChangedToFinal) {
    updates.push(`Property status changed from ${oldStatus || 'Unknown'} to ${newStatus}.`);
  }

  const safeTitle = propertyTitle || 'your subscribed property';
  const subject = `SmartEstate Alert: Update on ${safeTitle}`;
  const text = [
    'Hello,',
    '',
    `There is an update for ${safeTitle}:`,
    ...updates,
    '',
    'Please sign in to SmartEstate for details.',
    '',
    'Thank you,',
    'SmartEstate Team',
  ].join('\n');

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error('Property alert email failed:', error.message);
    return false;
  }
};

module.exports = {
  sendRequestStatusEmail,
  sendPropertyAlertEmail,
};
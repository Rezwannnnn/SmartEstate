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
const sendNewPropertyEmail = async ({ to, userName, propertyTitle }) => {
  if (!to || !propertyTitle) return false;
  const transporter = getTransporter();
  if (!transporter) return false;

  const subject = `SmartEstate: New Property Match - ${propertyTitle}`;
  const text = `Hello ${userName || 'User'},\n\nA new property matching your saved filters has just been listed: ${propertyTitle}.\n\nPlease sign in to SmartEstate for more details.\n\nThank you,\nSmartEstate Team`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error('Email notification failed:', error.message);
    return false;
  }
};

const sendPropertySoldEmail = async ({ to, userName, propertyTitle, status }) => {
  if (!to || !propertyTitle) return false;
  const transporter = getTransporter();
  if (!transporter) return false;

  const subject = `SmartEstate Update: ${propertyTitle} is now ${status}`;
  const text = `Hello ${userName || 'User'},\n\nA property tracking your saved filters (${propertyTitle}) has just been marked as ${status}. It is no longer available.\n\nPlease check back for more properties.\n\nThank you,\nSmartEstate Team`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error('Email notification failed:', error.message);
    return false;
  }
};

module.exports = {
  sendRequestStatusEmail,
  sendNewPropertyEmail,
  sendPropertySoldEmail,
};
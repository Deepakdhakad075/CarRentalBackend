// notification service 
exports.sendPushNotification = async (token, title, body) => {
  // Implementation for push notifications
  console.log(`Sending push notification to ${token}: ${title} - ${body}`);
};

exports.sendSMS = async (phone, message) => {
  // Implementation for SMS service
  console.log(`Sending SMS to ${phone}: ${message}`);
};
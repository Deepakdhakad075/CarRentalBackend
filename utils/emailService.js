// email service 
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  await transporter.sendMail(mailOptions);
};

exports.sendWelcomeEmail = async (user) => {
  const message = `Welcome to Car Rental, ${user.name}! Thank you for registering.`;
  
  await this.sendEmail({
    email: user.email,
    subject: 'Welcome to Car Rental',
    message
  });
};
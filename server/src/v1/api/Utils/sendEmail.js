import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

import { success,
    created,
    notFound,
    badRequest,
    unauthorized,
    forbidden,
    serverValidation,
    unknownError,
    validation,
    alreadyExist,
    sendResponse,
    invalid,
    onError} from "../../../../src/v1/api/formatters/globalResponse.js"


// Nodemailer Connection
const transporter = nodemailer.createTransport({
    // host: 'smtpout.secureserver.net',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.CLIENT_EMAIL,
      pass: process.env.CLIENT_EMAIL_PASSWORD,
    },
  });

// Debug email configuration
console.log('Email configuration loaded:', {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  user: process.env.CLIENT_EMAIL ? 'Set' : 'Not set',
  pass: process.env.CLIENT_EMAIL_PASSWORD ? 'Set' : 'Not set',
  hasEmail: !!process.env.CLIENT_EMAIL,
  hasPassword: !!process.env.CLIENT_EMAIL_PASSWORD
});


  export const sendEmail = async (options) => {
    try {
      console.log('sendEmail called with options:', {
        to: options.to,
        subject: options.subject,
        hasHtml: !!options.html,
        htmlLength: options.html?.length || 0
      });

      const mailOptions = {
        from: process.env.CLIENT_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      console.log('Mail options prepared:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully: %s', info.messageId);
      console.log('Email response:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      });
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      console.error('Email error details:', {
        message: error.message,
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
        response: error.response
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }
  };

  // Test email function for debugging
  export const testEmailService = async () => {
    try {
      console.log('Testing email service...');
      const testResult = await transporter.verify();
      console.log('Email service test result:', testResult);
      return testResult;
    } catch (error) {
      console.error('Email service test failed:', error);
      throw error;
    }
  };

  export const sendAuctionInviteEmail = async (auction , userEmail) => {
    try {
      const emailOptions = {
        "From": `"NY Elizabeth" <${process.env.CLIENT_EMAIL}>`,
        "To": userEmail,  // Assuming inviteeEmail is provided in the auction object
        "Subject": `You're Invited: ${auction.auctionProduct.title} Auction`,
        "HtmlBody": `
          <h1>You're Invited to an Auction!</h1>
          <p><strong>Title:</strong> ${auction.auctionProduct.title}</p>
          <p><strong>Start Date:</strong> ${new Date(auction.startDate).toLocaleString()}</p>
          <p>We are excited to have you join our auction event. Stay tuned for more details.</p>
          <p>Best regards, <br> The  Team</p>
        `,
        "ReplyTo": process.env.CLIENT_EMAIL_REPLY,
        "MessageStream": "outbound",
        "Attachments": auction.attachments || []  // Optional attachments if needed
      };
  
      const info = await client.sendEmail(emailOptions);
      console.log('Auction invite email sent: %s', info.MessageID);
      return info;
    } catch (error) {
      console.error('Error sending auction invite email:', error);
      throw new Error('Failed to send auction invite email');
    }
  };
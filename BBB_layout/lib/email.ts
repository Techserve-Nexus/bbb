import nodemailer from "nodemailer"

// Email configuration for serverless environment
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Important for serverless
  pool: false, // Disable connection pooling
  maxConnections: 1,
  maxMessages: 1,
}

// Create transporter with timeout handling
export const createTransporter = () => {
  try {
    return nodemailer.createTransport(SMTP_CONFIG)
  } catch (error) {
    console.error("Failed to create email transporter:", error)
    throw new Error("Email service configuration error")
  }
}

// Send email with timeout and error handling (serverless-friendly)
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) => {
  const transporter = createTransporter()

  const mailOptions = {
    from: {
      name: process.env.SMTP_FROM_NAME || "Chess Event 2025",
      address: process.env.SMTP_FROM || process.env.SMTP_USER || "",
    },
    to,
    subject,
    html,
    text: text || "",
  }

  try {
    // Set timeout for serverless (max 10 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email send timeout")), 10000)
    )

    const sendPromise = transporter.sendMail(mailOptions)

    const info = await Promise.race([sendPromise, timeoutPromise])

    console.log("Email sent successfully:", { to, subject, messageId: (info as any).messageId })
    
    // Close connection (important for serverless)
    transporter.close()
    
    return { success: true, messageId: (info as any).messageId }
  } catch (error) {
    console.error("Email send error:", error)
    transporter.close()
    throw error
  }
}

// Registration confirmation email template
export const getRegistrationEmailTemplate = ({
  name,
  registrationId,
  ticketType,
  email,
  contactNo,
  chapterName,
}: {
  name: string
  registrationId: string
  ticketType: string
  email: string
  contactNo: string
  chapterName: string
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .ticket-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .ticket-id {
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
      text-align: center;
      margin: 10px 0;
    }
    .details {
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    .detail-value {
      color: #333;
    }
    .note {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Registration Successful!</h1>
      <p style="margin: 10px 0 0;">Chess Event 2025</p>
    </div>
    
    <div class="content">
      <p>Dear <strong>${name}</strong>,</p>
      
      <p>Thank you for registering for Chess Event 2025! Your registration has been received successfully.</p>
      
      <div class="ticket-box">
        <p style="margin: 0; text-align: center; color: #666;">Your Registration ID</p>
        <div class="ticket-id">${registrationId}</div>
        <p style="margin: 0; text-align: center; font-size: 12px; color: #999;">Please save this ID for future reference</p>
      </div>
      
      <div class="details">
        <h3>Registration Details:</h3>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Contact:</span>
          <span class="detail-value">${contactNo}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Chapter:</span>
          <span class="detail-value">${chapterName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ticket Type:</span>
          <span class="detail-value"><strong>${ticketType}</strong></span>
        </div>
      </div>
      
      <div class="note">
        <strong>⏳ Payment Pending</strong>
        <p style="margin: 10px 0 0;">Your payment is currently under review. You will receive another email once your payment is verified and your ticket is confirmed.</p>
      </div>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br><strong>Chess Event 2025 Team</strong></p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>&copy; 2025 Chess Event. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Payment verification email template
export const getPaymentVerifiedEmailTemplate = ({
  name,
  registrationId,
  ticketType,
}: {
  name: string
  registrationId: string
  ticketType: string
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Verified</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .success-box {
      background: #d4edda;
      border-left: 4px solid #28a745;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      text-align: center;
    }
    .ticket-id {
      font-size: 24px;
      font-weight: bold;
      color: #28a745;
      margin: 10px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Verified!</h1>
      <p style="margin: 10px 0 0;">Your registration is confirmed</p>
    </div>
    
    <div class="content">
      <p>Dear <strong>${name}</strong>,</p>
      
      <p>Great news! Your payment has been verified successfully. Your registration for Chess Event 2025 is now <strong>confirmed</strong>!</p>
      
      <div class="success-box">
        <p style="margin: 0; color: #155724;">✓ Payment Verified</p>
        <div class="ticket-id">${registrationId}</div>
        <p style="margin: 0; font-size: 18px; color: #155724;"><strong>${ticketType} Ticket</strong></p>
      </div>
      
      <p>Your ticket will be sent to you in a separate email shortly. Please keep your Registration ID handy for entry at the event.</p>
      
      <p>We look forward to seeing you at the event!</p>
      
      <p>Best regards,<br><strong>Chess Event 2025 Team</strong></p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>&copy; 2025 Chess Event. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Ticket email template
export const getTicketEmailTemplate = ({
  name,
  registrationId,
  ticketType,
  qrCodeUrl,
}: {
  name: string
  registrationId: string
  ticketType: string
  qrCodeUrl?: string
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Event Ticket</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #FF6A00, #FF8C42);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .ticket {
      margin: 30px;
      border: 2px solid #FF6A00;
      border-radius: 12px;
      overflow: hidden;
    }
    .ticket-header {
      background: #FF6A00;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .ticket-body {
      padding: 30px;
      text-align: center;
    }
    .qr-code {
      width: 200px;
      height: 200px;
      margin: 20px auto;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-code img {
      max-width: 180px;
      max-height: 180px;
    }
    .ticket-id {
      font-size: 20px;
      font-weight: bold;
      color: #FF6A00;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎟️ Your Event Ticket</h1>
      <p style="margin: 10px 0 0;">Chess Event 2025</p>
    </div>
    
    <div style="padding: 40px 30px;">
      <p>Dear <strong>${name}</strong>,</p>
      
      <p>Here is your ticket for Chess Event 2025! Please present this at the venue for entry.</p>
      
      <div class="ticket">
        <div class="ticket-header">
          <h2 style="margin: 0;">${ticketType} Ticket</h2>
          <p style="margin: 5px 0 0;">Admit One</p>
        </div>
        <div class="ticket-body">
          <div class="qr-code">
            ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR Code" />` : `<p style="color: #999;">QR Code</p>`}
          </div>
          <div class="ticket-id">${registrationId}</div>
          <p style="color: #666; font-size: 14px;">Scan this QR code at the venue</p>
        </div>
      </div>
      
      <p><strong>Important:</strong></p>
      <ul style="color: #666;">
        <li>Please carry a printed copy or show this email on your phone</li>
        <li>Arrive at least 30 minutes before the event</li>
        <li>Keep your Registration ID handy</li>
      </ul>
      
      <p>We look forward to seeing you at the event!</p>
      
      <p>Best regards,<br><strong>Chess Event 2025 Team</strong></p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>&copy; 2025 Chess Event. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `
}

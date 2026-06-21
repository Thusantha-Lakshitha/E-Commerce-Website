import nodemailer from 'nodemailer';

const sendEmail = async ({ email, subject, text, html }) => {
  try {
    let transporter;

    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      // Use user-provided SMTP credentials
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Create a test account using ethereal.email if no credentials are provided
      console.log('No SMTP configurations found. Creating mock Ethereal mail account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || '"LuxZone Shop" <noreply@luxzoneshop.com>',
      to: email,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    
    // Log Ethereal preview link if using test account
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Ethereal Email Preview URL: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    // Return mock success object so caller flows don't crash
    return { error: error.message };
  }
};

export default sendEmail;

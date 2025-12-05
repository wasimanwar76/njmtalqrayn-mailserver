require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
// app.set("trust proxy", true);
app.use(express.json());

/* ============================
   ✅ IP RESTRICTION MIDDLEWARE
============================ */
// const allowedIPs = process.env.ALLOWED_IPS.split(",");

// app.use((req, res, next) => {
//   const clientIP =
//     req.headers["x-forwarded-for"]?.split(",")[0] ||
//     req.socket.remoteAddress;

//   if (!allowedIPs.includes(clientIP)) {
//     return res.status(403).json({
//       success: false,
//       message: "Access Denied: Unauthorized IP Address",
//       ip: clientIP
//     });
//   }

//   next();
// });

/* ============================
   ✅ HOSTINGER EMAIL CONFIG
============================ */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ============================
   ✅ POST API WITH RECEIVER AS ARGUMENT
============================ */
app.post("/contact", async (req, res) => {
  const { 
    name, 
    phone, 
    service, 
    location, 
    message, 
    receiverEmail   // ✅ NOW RECEIVED FROM API
  } = req.body;

  /* ✅ Validation */
  if (!name || !phone || !service || !location || !message || !receiverEmail) {
    return res.status(400).json({
      success: false,
      message: "All fields including receiverEmail are required"
    });
  }

  /* ✅ Email Format Validation */
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(receiverEmail)) {
    return res.status(400).json({
      success: false,
      message: "Invalid receiver email format"
    });
  }

  const mailOptions = {
    from: `"Website Enquiry" <${process.env.EMAIL_USER}>`,
    to: receiverEmail, // ✅ Dynamic Receiver
    subject: "New Website Contact Request",
    html: `
      <h3>New Contact Enquiry</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Message:</strong> ${message}</p>
      <hr/>
      <small>This email was sent from your website API</small>
    `
  };

  try {
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully to the receiver email"
    });

  } catch (error) {
    console.error("Email Error:", error);

    return res.status(500).json({
      success: false,
      message: "Email sending failed. Please try again later."
    });
  }
});

/* ============================
   ✅ SERVER START
============================ */
app.listen(process.env.PORT, () => {
  console.log(`✅ API running on port ${process.env.PORT}`);
});

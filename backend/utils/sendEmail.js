const nodemailer = require('nodemailer');

// --- ADD THIS LINE ---
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
// --- END ADD ---

// Create the transporter once and export it for reuse
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Your Google App Password
  },
});

const sendOrderConfirmationEmail = async (user, order, pdfBuffer) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });



  // Calculate estimated delivery
  const minEstDate = new Date(order.createdAt);
  minEstDate.setDate(minEstDate.getDate() + 5);
  const maxEstDate = new Date(order.createdAt);
  maxEstDate.setDate(maxEstDate.getDate() + 7);
  const deliveryEstimate = `${minEstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${maxEstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const mailOptions = {
    from: `"Timeless Tribe" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Order Confirmed! Your Timeless Tribe Order #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
          .container { max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; }
          .header img { max-width: 150px; }
          .content h1 { font-size: 22px; color: #c62828; }
          .order-summary { margin: 20px 0; }
          .order-item { display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee; }
          .order-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; }
          .item-details { flex-grow: 1; }
          .item-details p { margin: 0; font-size: 14px; line-height: 1.5; }
          .item-details .name { font-weight: bold; }
          .item-details .meta { color: #777; font-size: 12px; }
          .shipping-info { background-color: #fff; padding: 15px; border: 1px solid #eee; border-radius: 4px; margin-top: 20px; }
          .totals { text-align: right; margin-top: 20px; }
          .totals p { margin: 5px 0; font-size: 14px; }
          .totals .grand-total { font-size: 18px; font-weight: bold; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          .button { display: inline-block; padding: 12px 25px; background-color: #c62828; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="/assets/images/logo.png" alt="Timeless Tribe Co.">
          </div>
          <div class="content">
            <h1>Thank you for your order, ${user.name.split(' ')[0]}!</h1>
            <p>We've received your order and are getting it ready. You can view your order details by clicking the button below.</p>
            <div class="order-summary">
              ${order.orderItems.map(item => `
                <div class="order-item">
                  <img src="${item.image}" alt="${item.name}">
                  <div class="item-details">
                    <p class="name">${item.name}</p>
                    <p class="meta">${item.variantName} / ${item.size} / Qty: ${item.quantity}</p>
                    <p class="price">Rs. ${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="shipping-info">
              <strong>Estimated Delivery:</strong> ${deliveryEstimate}<br>
              <strong>Shipping to:</strong> ${order.shippingAddress.fullName}, ${order.shippingAddress.street}, ${order.shippingAddress.city}
            </div>
            <div class="totals">
              <p>Subtotal: <strong>Rs. ${order.itemsPrice.toLocaleString()}</strong></p>
              ${order.couponDiscount > 0 ? `<p>Coupon Discount: <strong>- Rs. ${order.couponDiscount.toLocaleString()}</strong></p>` : ''}
              <p>Shipping: <strong>${order.shippingPrice > 0 ? `Rs. ${order.shippingPrice.toLocaleString()}` : 'Free'}</strong></p>
              <p class="grand-total">Total: <strong>Rs. ${order.totalPrice.toLocaleString()}</strong></p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${FRONTEND_URL}/order/${order._id}" class="button">View My Order</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Timeless Tribe. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `TimelessTribe_Invoice_${order._id.toString().slice(-8).toUpperCase()}.pdf`,
        content: pdfBuffer, // The PDF data generated by Puppeteer
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    const result = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation sent to ${user.email}. Message ID: ${result.messageId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send order confirmation to ${user.email}:`, error);
    return { success: false, error };
  }
};

const sendContactFormToAdmin = async ({ name, email, subject, message }) => {
  const mailOptions = {
    from: `"Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Sends the email to you
    subject: `New Contact Message: ${subject}`,
    replyTo: email, // Allows you to directly reply to the user from your inbox
    html: `
      <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333;">New Message from Timeless Tribe Contact Form</h2>
          <p>You have received a new message from your website's contact form. See details below.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="margin-bottom: 10px;"><strong>From:</strong> ${name}</p>
          <p style="margin-bottom: 10px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin-bottom: 10px;"><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #f9f9f9; border-left: 4px solid #c62828; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      </div>
    `,
  };

  await emailTransporter.sendMail(mailOptions);
  console.log(`[Contact Form] Sent message from ${email} to admin.`);
};

// --- NEW: Function to send an auto-reply to the user ---
const sendContactConfirmationToUser = async ({ name, email }) => {
    const mailOptions = {
        from: `"Timeless Tribe" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "We've Received Your Message!",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
              <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px;">
                  <img src="/assets/images/logo.png" alt="Timeless Tribe Co." style="max-width: 150px;">
              </div>
              <div style="padding: 20px 0;">
                  <h1 style="font-size: 22px; color: #c62828;">Thank you for reaching out, ${name.split(' ')[0]}!</h1>
                  <p>We have successfully received your message and appreciate you contacting us. Our team will review your inquiry and get back to you as soon as possible, typically within 1-2 business days.</p>
                  <p>If your matter is urgent, please feel free to call us at the number listed on our website.</p>
                  <p>Sincerely,<br>The Timeless Tribe Team</p>
              </div>
              <div style="background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; font-size: 12px;">&copy; ${new Date().getFullYear()} Timeless Tribe. All rights reserved.</p>
              </div>
          </div>
        `,
    };
    await emailTransporter.sendMail(mailOptions);
    console.log(`[Contact Form] Sent auto-reply confirmation to ${email}.`);
};

module.exports = {
  emailTransporter,
  sendOrderConfirmationEmail,
  sendContactFormToAdmin,      
  sendContactConfirmationToUser, 
};


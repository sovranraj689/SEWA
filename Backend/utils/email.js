import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BRAND = `
  <div style="font-family:'Georgia',serif;color:#2C0F00;">
    <div style="background:#2C0F00;padding:24px;text-align:center;">
      <h1 style="color:#C9943A;margin:0;font-size:28px;letter-spacing:2px;">SwatiArts</h1>
      <p style="color:rgba(201,148,58,0.6);margin:4px 0 0;font-size:11px;letter-spacing:4px;text-transform:uppercase;">Royal Embroidery</p>
    </div>
`;
const FOOTER = `
    <div style="background:#f5e6c8;padding:16px;text-align:center;font-size:12px;color:rgba(44,15,0,0.5);margin-top:24px;">
      © SwatiArts · Meerut, Uttar Pradesh · info@swatiarts.com
    </div>
  </div>
`;

export const sendOrderConfirmation = async (order) => {
  const html = `${BRAND}
    <div style="padding:32px;">
      <h2 style="color:#C9943A;">Order Received! 🎉</h2>
      <p style="font-size:17px;line-height:1.7;">Dear <strong>${order.name}</strong>,</p>
      <p style="font-size:17px;line-height:1.7;">Thank you for choosing SwatiArts. We've received your custom order and will review it within <strong>24 hours</strong>.</p>
      <div style="background:#f9f0dc;border-left:4px solid #C9943A;padding:20px;margin:24px 0;">
        <p style="margin:0 0 8px;"><strong>Cloth:</strong> ${order.clothType}</p>
        <p style="margin:0 0 8px;"><strong>Work Area:</strong> ${order.workArea?.join(", ")}</p>
        <p style="margin:0 0 8px;"><strong>Budget:</strong> ${order.budget}</p>
        <p style="margin:0;"><strong>Timeline:</strong> ${order.timeline || "Flexible"}</p>
      </div>
      <p style="font-size:17px;line-height:1.7;">We'll contact you at <strong>${order.phone}</strong> to discuss your design in detail.</p>
    </div>
  ${FOOTER}`;

  await transporter.sendMail({
    from: `"SwatiArts" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: "✦ Your SwatiArts Custom Order is Confirmed",
    html,
  });
};

export const sendOrderStatusUpdate = async (order) => {
  const statusMessages = {
    approved: "Great news! Your order has been approved and our artisans are ready to begin.",
    in_progress: "Your embroidery work has started! Our skilled artisans are crafting your design.",
    completed: "Your order is complete and ready! We'll arrange delivery shortly.",
    cancelled: "Unfortunately your order has been cancelled. Please contact us for more information.",
  };

  const html = `${BRAND}
    <div style="padding:32px;">
      <h2 style="color:#C9943A;">Order Update</h2>
      <p style="font-size:17px;line-height:1.7;">Dear <strong>${order.name}</strong>,</p>
      <p style="font-size:17px;line-height:1.7;">${statusMessages[order.status] || "Your order status has been updated."}</p>
      <div style="background:#f9f0dc;border-left:4px solid #C9943A;padding:20px;margin:24px 0;">
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> #${order._id}</p>
        <p style="margin:0 0 8px;"><strong>Status:</strong> ${order.status.replace("_", " ").toUpperCase()}</p>
        ${order.estimatedDelivery ? `<p style="margin:0;"><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString("en-IN")}</p>` : ""}
        ${order.adminNotes ? `<p style="margin:8px 0 0;"><strong>Note:</strong> ${order.adminNotes}</p>` : ""}
      </div>
    </div>
  ${FOOTER}`;

  await transporter.sendMail({
    from: `"SwatiArts" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `✦ SwatiArts Order Update — ${order.status.replace("_", " ").toUpperCase()}`,
    html,
  });
};

export const sendWelcomeEmail = async (user) => {
  const html = `${BRAND}
    <div style="padding:32px;">
      <h2 style="color:#C9943A;">Welcome to SwatiArts! 🪡</h2>
      <p style="font-size:17px;line-height:1.7;">Dear <strong>${user.name}</strong>,</p>
      <p style="font-size:17px;line-height:1.7;">Welcome to SwatiArts — where every thread tells a story. Your account has been created successfully.</p>
      <p style="font-size:17px;line-height:1.7;">You can now place custom orders, track your orders, and explore our design gallery.</p>
      <div style="text-align:center;margin-top:32px;">
        <a href="${process.env.CLIENT_URL}/custom-order" style="background:#C9943A;color:#2C0F00;padding:14px 36px;text-decoration:none;font-weight:700;letter-spacing:2px;font-size:13px;text-transform:uppercase;">
          Place Your First Order
        </a>
      </div>
    </div>
  ${FOOTER}`;

  await transporter.sendMail({
    from: `"SwatiArts" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "✦ Welcome to SwatiArts — Royal Embroidery",
    html,
  });
};
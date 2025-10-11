import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPurchaseEmail = async (to, products, total, purchaserName, ticketCode) => {
  const productList = products
    .map(
      p => `
      <li>
        <strong>${p.title}</strong> - Precio unitario: $${p.price} - Cantidad: ${p.quantity} - Subtotal: $${p.price * p.quantity}
      </li>`
    )
    .join("");

  const mailOptions = {
    from: `Melere <${process.env.EMAIL_USER}>`,
    to,
    subject: `Confirmación de compra - Ticket ${ticketCode}`,
    html: `
      <h2>¡Gracias por tu compra, ${purchaserName}!</h2>
      <p><strong>Código de ticket:</strong> ${ticketCode}</p>
      <p>Estos son los productos que adquiriste:</p>
      <ul>${productList}</ul>
      <p><strong>Total:</strong> $${total}</p>
      <p><em>Fecha:</em> ${new Date().toLocaleString()}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado con MessageId:", info.messageId);
  } catch (err) {
    console.error("Error enviando email de ticket:", err);
  }
};

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `Melere <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email genérico enviado con MessageId:", info.messageId);
  } catch (err) {
    console.error("Error enviando email genérico:", err);
  }
};
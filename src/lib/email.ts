import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: { name: string; price: number; quantity: number }[];
    subtotal: number;
    shippingCharge: number;
    total: number;
    shippingAddress: string;
    paymentMethod: string;
    courierService: string;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
    const itemsHtml = data.items
        .map(
            (item) =>
                `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
        )
        .join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .order-id { background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f3f4f6; padding: 12px 8px; text-align: left; }
        .total { font-size: 18px; font-weight: bold; color: #ec4899; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0;">XCosmetic</h1>
        <p style="margin: 10px 0 0;">Order Confirmation</p>
      </div>
      <div class="content">
        <p>Hi ${data.customerName},</p>
        <p>Thank you for your order! We're preparing it for shipment.</p>
        
        <div class="order-id">
          <strong>Order ID:</strong> ${data.orderId}
        </div>

        <h3>Order Details</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table style="margin-top: 20px;">
          <tr>
            <td style="padding: 4px 0;">Subtotal</td>
            <td style="text-align: right;">₹${data.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">Shipping (${data.courierService.toUpperCase()})</td>
            <td style="text-align: right;">₹${data.shippingCharge.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-top: 2px solid #ec4899;" class="total">Total</td>
            <td style="padding: 8px 0; border-top: 2px solid #ec4899; text-align: right;" class="total">₹${data.total.toFixed(2)}</td>
          </tr>
        </table>

        <h3>Shipping Address</h3>
        <p style="background: #f9fafb; padding: 15px; border-radius: 8px;">
          ${data.shippingAddress}
        </p>

        <p style="margin-top: 20px;">
          <strong>Payment Method:</strong> ${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
        </p>

        <p style="margin-top: 30px;">
          If you have any questions, reply to this email or contact us on WhatsApp.
        </p>
      </div>
      <div class="footer">
        <p>© 2024 XCosmetic. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

    try {
        await resend.emails.send({
            from: 'XCosmetic <onboarding@resend.dev>',
            to: data.customerEmail,
            subject: `Order Confirmed - ${data.orderId}`,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
}
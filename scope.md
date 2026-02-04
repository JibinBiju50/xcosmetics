# Project Scope: [Xcosmetic] E-Commerce Store

**Primary Goal:** Build a fast, secure, and professional cosmetic store for a new brand with zero monthly platform fees. The important part is to attract audience by highlighting offers and beautiful UI.

---

### 1. Technology Stack

- **Framework:** Next.js 15 (App Router) for ultra-fast loading and SEO.
- **Database:** Supabase (PostgreSQL) for secure storage of orders and products.
- **Payments:** **Cashfree Payments** (UPI Intent, Cards, Netbanking) + **Cash on Delivery (COD)**.
- **Email:** Resend API for automated professional order receipts.
- **Hosting:** Vercel (Global CDN for 99.9% uptime).

---

### 2. Pages

1. **Home / Digital Storefront:**
    - Header with logo, links and cart.
    - Showcase 3 given images in the hero section with transition. Add an interesting headline with shop products button in the first image.
    - Display about best deals by showcasing 4 products with most offer.
    - Display about combo price and its offers with catchy headline and images.
    - Display about the new sub brand bluu with its main feature and image.
    - Display images of customer feedback.
    - Floating WhatsApp Inquiry Button.
    - Simple Footer with contact options (social media, email)
2. **All Products Page:**
    - Showcase all the products with offer price, actual price,  add to cart and buy now button.
    - Provide category-wise filters and search option.
3. **Product Detail Page:**
    - High-quality product image and pricing.
    - Description, benefits & usage instructions (based on giving content).
    - Add to cart and buy now button.
    - Section to provide rating and review by giving customer name.
4. **Checkout Page:**
    - **Shipping Info:** Name, Phone, and Address fields.
    - **Payment Method Toggle:** **Online (Cashfree)** or **Cash on Delivery (COD)**.
    - **Courier Toggle:** If payment method is online, then DTDC (60rs additional) and postal(no charge). If payment is COD, then 100rs additional shipping charge will be added.
5. **Order Confirmation Page:**
    - Order Confirmation Message with order details + Unique Order ID.
    - Next Steps: *"Check your email for the receipt. Order will be dispatched within 3-4 days."*
6. **Admin (client) Dashboard (Private):**
    - Secure login for the brand owner (admin).
    - Order Management: View order details (order ID, products, quantity, customer details), payment status, payment method, selected courier service and order status(not yet shipped, shipped and delivered).
    - **Status Update:** One-click update from "Pending" to "Dispatched via DTDC/Postal."

---

### 3. Automated Communication Workflow

- **Instant Confirmation:** As soon as an order is placed, an automated email is sent to the customer (Receipt) and the admin (New Order Alert).
- **Payment Verification:** Using Cashfree Webhooks, the site automatically marks orders as "PAID" in the database, even if the user closes the browser during the transaction. Also marks “Failed” When the user closes the browser without making transaction.

---

### 4. Explicit Exclusions (What is NOT included)

To keep the project budget at ₹10,000-15,000, the following are out of scope:

- **User Accounts:** Customers shop as guests only (no passwords/profiles).
- **Inventory Management:** The admin must manually update if a product is "Out of Stock."
- **Live Tracking Portal:** Tracking is handled by the selected courier services. Customers cannot track order details through this website
- **Logo/Content Creation:** Client must provide high-quality images and text.
- Manual delivery update: After the product has been dispatched, the admin must manually update the order status in his dashboard since the delivery is handled by external delivery partner. Initially the order status of all orders will be “not yet shipped”.
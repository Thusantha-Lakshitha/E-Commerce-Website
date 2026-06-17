# MERNShop - Premium MERN E-Commerce Web Application

A full-stack, secure, production-ready E-Commerce Web Application built with the MERN Stack (MongoDB, Express.js, React.js, Node.js), styled using premium Tailwind CSS configurations, and containing Stripe payment gateways, Cloudinary image uploading integrations, Nodemailer notification automation, and dynamic Chart.js dashboards.

---

## 🚀 Key Features

*   **Premium Glassmorphic UI**: Outfit/Inter typography, animated gradients, responsive mobile/desktop layouts.
*   **JWT Session Authentication**: Fully hashed user passwords using `bcryptjs` and stateless JWT route protection.
*   **Stripe Sandbox Payment**: Fully integrated Stripe checkout element, supporting actual processing or local sandbox simulations.
*   **Cloudinary Image Uploads**: Product creation/edit dashboards featuring direct multipart file uploading onto Cloudinary.
*   **Dynamic Analytics**: Chart.js lines representing monthly revenues, top-selling items lists, and low stock warnings.
*   **Starred Reviews**: Submit star ratings alongside commentary logs recalculating averages instantly.
*   **Wishlists**: Add, save, or remove favorites with instant add-to-cart helpers.
*   **Security Protections**: Rate limiters, Helmet HTTP headers, CORS configurations, and MongoDB injection sanitizers.

---

## 📂 Project Structure

```text
online-shoping/
├── package.json               # Root workspace commands
├── server/                    # Node.js + Express Backend
│   ├── config/                # Database & Cloudinary setup
│   ├── controllers/           # Auth, User, Product, Order logic
│   ├── middleware/            # Protect route & errors
│   ├── models/                # User, Product, Order Schemas
│   ├── routes/                # API endpoints mappings
│   ├── utils/                 # Nodemailer mail engines
│   ├── .env                   # Local variables configuration
│   └── server.js              # Express entry point
└── client/                    # React + Vite Frontend
    ├── src/
    │   ├── components/        # Navbar, CheckoutForm, ProductCard
    │   ├── context/           # Auth, Cart, Product State
    │   ├── pages/             # Home, Cart, Catalog, Admin panels
    │   ├── utils/             # Custom Axios client
    │   └── main.jsx           # App bootstrapping
    ├── tailwind.config.js     # Glassmorphism themes
    └── index.html             # Application markup entry
```

---

## ⚙️ Quick Start Setup

### Step 1: Clone and Install Dependencies
Install all packages for both the Client and Server:
```bash
npm run install-all
```

### Step 2: Configure Environment Variables
Create a `.env` file inside the `server/` directory (matching `server/.env.example` template):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/online-shopping
JWT_SECRET=secretkey1234

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
*(Note: If no Stripe or Cloudinary keys are provided, the system automatically runs mock processors to ensure local execution doesn't crash).*

### Step 3: Run the Services

**Start Backend Server:**
```bash
npm run server
```
**Start Frontend Dev Server:**
```bash
npm run client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 💳 Payment Testing (Stripe)
When testing checkouts, you can input Stripe's standard testing card:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g. `12/29`)
- **CVC**: Any 3 digits (e.g. `123`)
- **Postal Code**: Any digits (e.g. `98101`)

---

## 🛡️ Admin Account Initialization
To access the Admin panel, sign up a standard account from the registration page, then change their role to `'admin'` directly in your MongoDB database:
```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```
Once logged in, an "Admin Dashboard" option will appear in your profile drop-down menu.

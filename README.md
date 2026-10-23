# Namma Santhe — Hyperlocal Digital Marketplace

> **Connecting Local Neighborhood Producers, Artisans & Small Businesses with Conscious Urban Consumers.**

---

## 🌟 Overview

**Namma Santhe** (ನಮ್ಮ ಸಂತೆ) is a modern, full-stack, hyperlocal e-commerce marketplace. It provides direct digital storefronts for local farmers, organic provision merchants, and traditional artisans, enabling them to compete effectively with large centralized e-commerce platforms.

Unlike static mockups, **Namma Santhe** is a fully functional web application featuring:
- **Express + TypeScript Backend** with RESTful endpoints, JWT authentication, and role-based authorization.
- **Robust Persistence Layer** with MongoDB support and an automatic self-healing JSON database (`server/data/db.json`).
- **Real Inventory Safeguards** that decrement stock on checkout and automatically restore inventory upon order cancellations and approved returns.
- **Dynamic Analytics with Recharts** showing real-time GMV, revenue curves, top products, return rates, and commission calculations.
- **3 Dedicated Role Portals**: Customer, Seller (Vendor Hub), and Administrator.
- **Authentic Kannada & English Localization** with toggleable native mobile device frame simulation.

---

## 👥 The Three User Roles & Portals

### 1. 🛍️ Customer Portal
- **Hyperlocal Discovery:** Filter by locality (Malleshwaram, Devanahalli, Indiranagar, Jayanagar, etc.), distance, rating, and availability.
- **Smart Product Comparison:** Side-by-side comparison table of 2 to 4 products showing prices, discount percentages, stock, seller verification status, specs, delivery lead time, and return window.
- **Cart & Test Checkout:** Real inventory validation, delivery address, time slot selection, and instant demo payment processing (`TXN-DEMO-*`).
- **Live Delivery Journey Tracking:** Visual timeline of fulfillment milestones (`Order Confirmed` ➔ `Packing at Local Store` ➔ `Out for Local Delivery` ➔ `Delivered`) with an interactive **"Demo: Advance Fulfillment Step"** simulation button.
- **Cancellations & Returns:** Cancel eligible unfulfilled orders (restoring stock) or submit photo-evidenced return/refund requests within the seller's configured policy window.
- **Review & Ratings:** Submit verified purchase feedback for local sellers.

### 2. 🌾 Seller Portal (Vendor Hub)
- **Storefront Dashboard:** Open/Closed toggle, serviceable radius (km), operational hours, and contact details.
- **Catalog & Inventory Control:** Add products with rich specifications, manage stock counts, view low-stock badges, and prevent overselling.
- **Fulfillment Pipeline:** Accept or decline incoming customer orders; progress order status through `confirmed` ➔ `processing` ➔ `packed` ➔ `shipped` ➔ `delivered`.
- **Return & Refund Center:** Review customer return requests with uploaded evidence photos, policy window checks, decision notes (Approve / Reject), and automatic restock options.
- **Dynamic Analytics (Recharts):** Total sales revenue, weekly earnings trendline, order counts, product performance rankings, return rate %, and low-stock alerts.

### 3. 🛡️ Administrator Command Center
- **Marketplace Governance:** Real-time Gross Merchandise Value (GMV), 5% platform commission calculation, total completed orders, and registered user counters.
- **Seller Verification:** Approve, reject, or suspend seller storefronts and verify local trade licenses.
- **Listing Moderation:** Flag fraudulent or suspicious listings; view and inspect marketplace products.
- **Dispute Resolution Center:** Arbitrate customer-seller disputes, view evidence, and enforce administrative refunds.
- **Promotional Banners:** Manage banner campaigns, active dates, promo codes, and click actions.

---

## 🔑 Demo Accounts & Credentials

Namma Santhe includes a 1-click **"Role Switcher"** directly in the top header and navigation toolbar, as well as pre-seeded accounts:

| Role | Name | Email | Password | Store / Access |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Priya Sharma | `customer@nammasanthe.com` | `pass123` | Malleshwaram Buyer |
| **Seller (Farmer)** | Ravi Kumar Gowda | `ravi@organicfarms.com` | `pass123` | Ravi Organic Farms (`v1`) |
| **Seller (Merchant)** | Lakshmi Narayana | `lakshmi@stores.com` | `pass123` | Lakshmi Stores & Mill (`v2`) |
| **Seller (Artisan)** | Mahesh Channapatna | `artisan@channapatna.com` | `pass123` | Channapatna Craft Collective (`v3`) |
| **Seller (Pending)** | Suresh Spices | `suresh@spices.com` | `pass123` | Awaiting Admin Approval (`v5`) |
| **Administrator** | Santhe Controller | `admin@nammasanthe.com` | `admin123` | Full Marketplace Management |

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS / Vanilla CSS design tokens.
- **Data Visualization:** Recharts (Interactive AreaCharts, BarCharts, PieCharts).
- **Icons:** Lucide React.
- **Backend:** Node.js, Express 5, TypeScript (`tsx`).
- **Security:** JWT (`jsonwebtoken`) with `Bearer` token header, `bcryptjs` password hashing, role-based route middleware.
- **Data Persistence:** Modular `dbStore` engine supporting MongoDB (via Mongoose) and local persistent storage (`server/data/db.json`).

---

## 🚀 Quickstart & Installation

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Application
Run both backend API (Port 5000) and frontend client (Port 5173) concurrently:
```bash
npm run dev
# or
npm start
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend Express API
npm run server

# Terminal 2: Frontend Vite Client
npm run client
```

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 Endpoints & API Reference

| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/health` | `GET` | Public | System status and timestamp |
| `/api/auth/login` | `POST` | Public | Authenticates user and returns JWT token |
| `/api/auth/register` | `POST` | Public | Registers a new customer or seller |
| `/api/auth/me` | `GET` | Authenticated | Fetches authenticated user profile |
| `/api/shops` | `GET` | Public | Hyperlocal shop directory with locality filtering |
| `/api/products` | `GET` | Public | Search, category, locality & price filter products |
| `/api/orders` | `POST` | Customer | Atomically verifies stock, reserves inventory, creates order |
| `/api/orders` | `GET` | Authenticated | Role-filtered order history |
| `/api/orders/:id/status` | `PUT` | Seller/Admin | Advances order fulfillment step |
| `/api/orders/:id/cancel` | `POST` | Customer/Seller | Cancels order and restores decremented stock |
| `/api/returns` | `POST` | Customer | Submits return with policy check and photo evidence |
| `/api/returns/:id/decision` | `PUT` | Seller/Admin | Approves or rejects return claim with audit notes |
| `/api/seller/analytics` | `GET` | Seller | Calculated revenue, order volume, return rate %, charts |
| `/api/admin/stats` | `GET` | Admin | Total GMV, platform take, seller count, disputes |
| `/api/admin/shops/:id/verify` | `POST` | Admin | Verifies or suspends seller digital storefronts |
| `/api/admin/disputes/:id/resolve`| `POST` | Admin | Enforces customer refund and resolves dispute |

---

## 🧪 Testing Acceptance Workflows

1. **Product Discovery & Comparison:**
   - On the Home page, click on any locality in the selector (e.g. *Malleshwaram*).
   - Click the **"+ Compare"** button on *Heirloom Natty Tomatoes* and *Organic Sona Masuri Rice*.
   - Tap the **"Compare"** badge in the header to view the side-by-side comparison table highlighting best-priced deals.

2. **Customer Checkout & Stock Reservation:**
   - Add items to Cart and click **"Proceed to Checkout"**.
   - Review delivery slot and choose **UPI (Instant Demo)**.
   - Click **"Confirm & Place Order"**. Note the order ID and verify stock decrement in the inventory.

3. **Seller Order Fulfillment & Live Tracking:**
   - Switch to the **Seller** role (Ravi Organic Farms) via the top header pill.
   - View the new order under the **Orders** tab. Click **"Pack Order"** and then **"Dispatch"**.
   - Switch back to **Customer** role and open **Orders / Tracking** to view the live timeline update.
   - Use the **"Demo: Advance Step"** button to simulate delivery.

4. **Returns & Policy Validation:**
   - On a delivered order, click **"Request Return / Refund"**.
   - Select reason ("Damaged or bruised in transit") and submit.
   - Switch to **Seller** role, open the **Returns** tab, review the photo evidence, and click **"Approve Return & Refund"**.

5. **Seller Analytics & Admin Governance:**
   - Open Seller **Analytics** tab to inspect Recharts sales revenue charts and return rates.
   - Switch to **Admin** role to inspect platform GMV, approve pending seller *Suresh Spices*, and resolve open customer disputes.

---

## 🔒 Security & Reliability Measures
- Server-side authorization check on every private route (`authenticate`, `requireRole`).
- Customer data isolation preventing customers from accessing other customers' orders.
- Stock validation prevents negative quantities and double-booking.
- Input validation on prices, return windows, and dispute resolutions.
- Safe local and persistent JSON fallback if external database connection is unavailable.

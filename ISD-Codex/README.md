# Small Business Inventory & Sales Dashboard

A full-stack web application that helps small business owners manage inventory, record sales, monitor customer activity, and visualize performance insights in real time.

## Project Structure

```
ISD-Codex/
├── server/   # Express + SQLite backend API
└── client/   # React + Vite frontend
```

## Tech Stack

- **Backend:** Node.js, Express 5, SQLite (better-sqlite3), Zod, JWT auth, PDFKit (exports)
- **Frontend:** React 19, TypeScript, Vite, React Router, TanStack Query, Recharts

## Features

### Inventory Management
- CRUD products with pricing, supplier, and reorder levels
- Automatic stock deduction when sales are logged
- Low-stock alerts surfaced on the dashboard and inventory page

### Sales Tracking
- Log sales with date, quantity, and optional customer name
- Automatic revenue/profit calculations and aggregated summaries (daily/weekly/monthly)
- Export sales data as CSV or PDF

### Dashboard & Analytics
- Revenue and profit trends (line charts)
- Top-performing products (bar chart)
- Real-time KPIs and best seller of the week
- Low-stock alerts snapshot

### Customer Management
- Maintain lightweight customer records with purchase history
- Auto-create customers when logging named sales

### User Roles & Access Control
- **Admin:** manage products, sales, reports, and staff
- **Staff:** log sales, manage inventory/customers
- **Viewer/Accountant:** read-only access to reports and customer insights

## Getting Started

### 1. Backend Setup (`server/`)
1. Navigate into the backend folder and install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Copy the example environment file and adjust as needed:
   ```bash
   cp .env.example .env
   ```
   Key variables:
   - `PORT`: default `5000`
   - `JWT_SECRET`: set to a strong secret
   - `DEFAULT_ADMIN_*`: seeded admin credentials
   - `LOW_STOCK_THRESHOLD`: global alert threshold
3. Seed initial data (creates admin user and demo products/sales if empty):
   ```bash
   npm run seed
   ```
4. Start the API:
   ```bash
   npm run dev   # nodemon (auto-restart)
   # or
   npm start     # plain node
   ```
5. The API listens on `http://localhost:5000` by default. Health check endpoint: `GET /api/health`.

### 2. Frontend Setup (`client/`)
1. Install dependencies:
   ```bash
   cd ../client
   npm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env
   # VITE_API_URL should match the backend base URL
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the app at the URL shown in the terminal (typically `http://localhost:5173`).

### Default Credentials
The seeding step provisions an admin account:
- Email: `admin@smallbiz.local`
- Password: `Password123!`

Create additional users from **Team → Add Team Member** (admin only).

## API Overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Roles |
| --- | --- | --- | --- |
| POST | `/auth/login` | Authenticate and receive JWT | Public |
| GET | `/auth/users` | List users | Admin |
| POST | `/auth/users` | Create user | Admin |
| GET | `/products` | List products | Admin, Staff, Viewer |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |
| GET | `/products/low-stock` | Low-stock products | Admin, Staff, Viewer |
| GET | `/sales` | List sales (filterable) | Admin, Staff, Viewer |
| POST | `/sales` | Log a sale (updates inventory) | Admin, Staff |
| GET | `/sales/summary` | Aggregated sales summary | Admin, Staff, Viewer |
| GET | `/sales/export?format=csv|pdf` | Export sales | Admin, Staff, Viewer |
| GET | `/reports/dashboard` | Dashboard analytics bundle | Admin, Staff, Viewer |
| GET | `/reports/period?period=daily|weekly|monthly` | Period report | Admin, Staff, Viewer |
| GET | `/reports/inventory` | Inventory snapshot | Admin, Staff, Viewer |
| GET | `/customers` | List customers | Admin, Staff, Viewer |
| POST | `/customers` | Create customer | Admin, Staff |
| GET | `/customers/:id` | Customer detail + history | Admin, Staff, Viewer |
| DELETE | `/customers/:id` | Remove customer | Admin |

All protected endpoints require the `Authorization: Bearer <token>` header.

## Development Notes

- Database: SQLite (`server/database.sqlite`) auto-created on first run. Safe to delete for a clean slate.
- Seed script only inserts demo data when tables are empty, so you can retain your own data after initial setup.
- Frontend uses TanStack Query for caching + revalidation; API state stays fresh when mutating.
- PDF exports use simple tabular summaries suitable for quick sharing.

## Suggested Next Steps
- Deploy backend (Render, Railway, etc.) and configure persistent SQLite/PostgreSQL storage
- Add SKU barcode scanning or bulk import/export for products
- Integrate email alerts for low stock thresholds
- Hook up authentication to an SSO provider if needed

Enjoy running your small business dashboard!

# Small Business Inventory & Sales Dashboard

A full-stack web application designed to help small business owners manage inventory, track sales, and view analytics in real-time.

## Features

### Core Functionality

- **Inventory Management**
  - CRUD operations for products (name, category, SKU, cost price, sale price, stock quantity, supplier)
  - Auto-update stock when sales are logged
  - Low-stock alerts and notifications
  - Category-based organization

- **Sales Tracking**
  - Log sales with product, quantity, date, and optional customer
  - Daily/weekly/monthly sales reports
  - Automatic revenue and profit calculations
  - Export sales data to CSV or PDF
  - Date range filtering

- **Dashboard & Analytics**
  - Real-time charts showing sales trends
  - Top-selling products visualization
  - Profit margin analytics
  - Best-selling product insights
  - Daily, weekly, and monthly summaries

- **Customer Management**
  - Customer profiles with contact information
  - Purchase history tracking
  - Customer statistics (total purchases, total spent, last purchase date)

- **User Roles & Permissions**
  - **Admin**: Full access (manage products, sales, reports, users)
  - **Staff**: Can log sales and manage inventory
  - **Viewer**: Read-only access to reports and data

## Tech Stack

### Backend
- **Express.js**: RESTful API server
- **SQLite**: Database (better-sqlite3)
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **helmet**: Security middleware
- **morgan**: HTTP request logging

### Frontend
- **React 18**: UI framework
- **React Router**: Client-side routing
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **Recharts**: Data visualization
- **Lucide React**: Icons
- **date-fns**: Date manipulation
- **jsPDF**: PDF generation

## Project Structure

```
ISD-Claude/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js      # SQLite database configuration
│   │   ├── models/
│   │   │   ├── User.js          # User model
│   │   │   ├── Product.js       # Product model
│   │   │   ├── Sale.js          # Sale model
│   │   │   └── Customer.js      # Customer model
│   │   ├── routes/
│   │   │   ├── auth.js          # Authentication routes
│   │   │   ├── products.js      # Product routes
│   │   │   ├── sales.js         # Sales routes
│   │   │   ├── customers.js     # Customer routes
│   │   │   └── users.js         # User management routes
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT authentication middleware
│   │   └── index.js             # Server entry point
│   ├── data/                    # SQLite database storage
│   ├── package.json
│   └── .env.example
│
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx       # Main layout with sidebar
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Dashboard.jsx    # Analytics dashboard
│   │   │   ├── Products.jsx     # Product management
│   │   │   ├── Sales.jsx        # Sales tracking
│   │   │   ├── Customers.jsx    # Customer management
│   │   │   └── Users.jsx        # User management (admin only)
│   │   ├── services/
│   │   │   └── api.js           # API client
│   │   ├── App.jsx              # Root component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json            # Root package.json for convenience scripts
├── .gitignore
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Step 1: Clone or Navigate to the Project

```bash
cd ISD-Claude
```

### Step 2: Install All Dependencies

```bash
npm run install:all
```

This will install dependencies for the root, server, and client.

### Step 3: Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cd server
cp .env.example .env
```

Edit the `.env` file:

```env
PORT=5000
JWT_SECRET=your_secure_jwt_secret_change_this_in_production
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a strong random string in production.

### Step 4: Start the Application

From the root directory:

```bash
npm run dev
```

This starts both the backend and frontend concurrently:
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

Alternatively, you can run them separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## Default Login Credentials

On first run, a default admin account is automatically created:

- **Username**: `admin`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change this password immediately after first login!

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin/staff)
- `PUT /api/products/:id` - Update product (admin/staff)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/products/categories` - Get all categories

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create sale (admin/staff)
- `DELETE /api/sales/:id` - Delete sale (admin)
- `GET /api/sales/date-range` - Get sales by date range
- `GET /api/sales/revenue` - Get revenue by period
- `GET /api/sales/top-products` - Get top products
- `GET /api/sales/dashboard-stats` - Get dashboard statistics

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer (admin/staff)
- `PUT /api/customers/:id` - Update customer (admin/staff)
- `DELETE /api/customers/:id` - Delete customer (admin)
- `GET /api/customers/:id/history` - Get customer purchase history

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

## User Roles & Permissions

### Admin
- Full system access
- Manage products, sales, customers, and users
- View all reports and analytics
- Delete sales and restore stock
- Create and manage other users

### Staff
- Manage products (create, update)
- Log sales
- Manage customers
- View reports and analytics
- Cannot delete products or manage users

### Viewer
- Read-only access
- View all products, sales, and reports
- Cannot create, update, or delete anything
- Perfect for accountants or managers who only need to view data

## Key Features Explained

### Automatic Stock Management
When a sale is logged, the product stock is automatically decremented. If a sale is deleted (admin only), the stock is restored.

### Low Stock Alerts
Products with stock at or below their low stock threshold are highlighted throughout the app with warning badges.

### Revenue & Profit Tracking
The system automatically calculates profit based on the difference between sale price and cost price, multiplied by quantity.

### Export Functionality
Sales data can be exported to:
- **CSV**: For spreadsheet analysis
- **PDF**: Professional reports with totals

### Real-time Dashboard
The dashboard displays:
- Today's revenue and profit
- Weekly and monthly summaries
- Revenue trends (daily/weekly/monthly views)
- Top-selling products bar chart
- Low stock alerts
- Best-selling product insight

## Database Schema

### Users Table
- id, username, email, password (hashed), role, created_at, updated_at

### Products Table
- id, name, category, sku, cost_price, sale_price, stock_quantity, supplier, low_stock_threshold, created_at, updated_at

### Customers Table
- id, name, email, phone, address, created_at, updated_at

### Sales Table
- id, product_id, customer_id, quantity, unit_price, total_amount, profit, sale_date, created_by, notes

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes with role-based access control
- Helmet.js for security headers
- Input validation with express-validator
- SQL injection prevention (parameterized queries)

## Development

### Backend Development
```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd client
npm run dev  # Uses Vite HMR
```

### Building for Production

```bash
# Build frontend
cd client
npm run build

# The built files will be in client/dist/
# Serve these with your preferred static file server
```

For production, you should:
1. Set `NODE_ENV=production` in server/.env
2. Use a strong JWT_SECRET
3. Set up a reverse proxy (nginx/Apache)
4. Consider using PM2 for process management
5. Use PostgreSQL or MySQL instead of SQLite for better concurrency

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is in use, change them:
- Backend: Edit `server/.env` → `PORT=5001`
- Frontend: Edit `client/vite.config.js` → `server.port: 3001`

### Database Issues
Delete the database file and restart:
```bash
rm server/data/inventory.db
npm run server
```

### CORS Errors
Make sure both frontend and backend are running. The Vite proxy handles API requests.

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your business or learning purposes.

## Architecture Overview

### Backend Architecture
- **RESTful API** design following best practices
- **MVC pattern** with models and controllers (routes)
- **SQLite** for simplicity and portability
- **JWT tokens** with 24-hour expiration
- **Middleware** for authentication and authorization
- **Transaction support** for stock updates during sales

### Frontend Architecture
- **React Context API** for global state (authentication)
- **Protected routes** based on user roles
- **Axios interceptors** for automatic token injection and error handling
- **Component-based architecture** for reusability
- **Responsive design** with mobile support
- **Real-time updates** after CRUD operations

## Future Enhancements

Potential features to add:
- Email notifications for low stock
- Invoice generation
- Multi-location inventory
- Barcode scanning
- Product image uploads
- Advanced reporting (profit by category, sales by staff member)
- Discount management
- Purchase order tracking
- Dashboard customization
- Mobile app using React Native

---

Built with ❤️ for small business owners

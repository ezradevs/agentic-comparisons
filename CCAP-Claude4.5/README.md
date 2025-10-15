# Chess Club Administrator Portal

A comprehensive, professional-grade chess tournament management system with a full-featured backend and modern React frontend.

## Features

### Tournament Management
- **Multiple Tournament Systems**:
  - Swiss System with advanced pairing algorithms
  - Round Robin
  - Single & Double Elimination
- **Automated Pairing Generation** with color balance and opponent history tracking
- **Real-time Standings** with Buchholz and Sonneborn-Berger tiebreaks
- **Result Entry** with validation
- **Tournament Status Tracking** (Upcoming, Ongoing, Completed)

### Player Management
- Complete player database with ratings
- FIDE ID support
- Player history and statistics
- Active/Inactive status management

### Professional Features
- JWT-based authentication
- RESTful API architecture
- SQLite database with proper indexing
- Modern, responsive UI using Next.js and Tailwind CSS
- shadcn/ui component library for polished interface

## Technology Stack

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe development
- **SQLite** (better-sqlite3) - Embedded database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

#### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

#### Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

### Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Change these credentials in production!**

---

Built with ♟️ for chess clubs worldwide

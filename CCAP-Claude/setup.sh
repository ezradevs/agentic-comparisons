#!/bin/bash

echo "🎯 Chess Club Portal - Quick Setup Script"
echo "=========================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo ""

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm found: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Push database schema
echo "🗄️  Setting up database..."
npx prisma db push --accept-data-loss

if [ $? -ne 0 ]; then
    echo "❌ Failed to setup database"
    exit 1
fi

echo "✅ Database schema created"
echo ""

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Failed to seed database (you can do this manually later)"
else
    echo "✅ Database seeded successfully"
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📝 Default login credentials:"
echo "   Email:    admin@chessclub.com"
echo "   Password: admin123"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see README.md"
echo ""

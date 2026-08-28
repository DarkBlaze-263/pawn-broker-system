#!/bin/bash

# Frontend Deployment Script
# This script builds and deploys the frontend to Vercel

echo "🚀 Starting Frontend Deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found"
    echo "Please create .env.production with your production environment variables"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run tests
echo "🧪 Running tests..."
npm test -- --watchAll=false

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed - build directory not found"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"

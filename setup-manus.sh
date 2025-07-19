#!/bin/bash

echo "🚀 Setting up Manus Clone with manus.im-like features..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Build the project
echo "🔨 Building the project..."
npm run build

echo "✅ Setup complete! Your project now has manus.im-like features:"
echo ""
echo "🎯 Features added:"
echo "  • Monaco Editor for code editing"
echo "  • File Explorer for managing files"
echo "  • Terminal for command execution"
echo "  • Code Preview with HTML rendering"
echo "  • Resizable panels"
echo "  • Tabbed interface (Chat, Code, Terminal, Files)"
echo ""
echo "🚀 To start development:"
echo "  npm run dev"
echo ""
echo "🌐 To deploy:"
echo "  The render.yaml is configured with SPA routing"
echo "  Deploy to Render.com for automatic deployment"
echo ""
echo "💡 Usage:"
echo "  • Use the Chat tab for AI conversations"
echo "  • Use the Code tab for editing and previewing code"
echo "  • Use the Terminal tab for command execution"
echo "  • Use the Files tab for file management"
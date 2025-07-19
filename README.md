# Manus Clone - AI Agent Platform

A modern AI agent platform built with React, Node.js, and OpenAI API, designed to look and function like manus.im.

## Features

- 🤖 **AI Chat Interface** - Interact with advanced AI models
- 📋 **Task Management** - Create and track tasks with AI assistance
- 📄 **Document Generation** - Generate reports and documents automatically
- 🎨 **Content Creation** - Create images, presentations, and multimedia content
- 📊 **Data Analysis** - Analyze data and generate insights with AI
- 🌐 **Research & Web** - Conduct research and gather information from the web
- 🔐 **User Authentication** - Secure user registration and login
- 💬 **Real-time Chat** - WebSocket-powered real-time messaging
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode support

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Radix UI Components
- React Router DOM
- Socket.io Client
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- OpenAI API
- JWT Authentication
- bcryptjs

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- OpenAI API key

## Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd manus-clone
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/manus-clone
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_API_BASE=https://api.openai.com/v1
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=Manus Clone
VITE_APP_VERSION=1.0.0
```

### 4. Start the development servers

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment

### Render Deployment

This project includes a `render.yaml` file for easy deployment to Render.

1. **Fork/Clone** this repository to your GitHub account
2. **Connect** your repository to Render
3. **Set Environment Variables** in Render dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `JWT_SECRET` - A secure random string
4. **Deploy** using the render.yaml configuration

### Manual Deployment

#### Backend Deployment
```bash
cd backend
npm install
npm start
```

#### Frontend Deployment
```bash
cd frontend
npm install
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/:id` - Get specific conversation
- `POST /api/chat/conversations/:id/messages` - Send message
- `PUT /api/chat/conversations/:id` - Update conversation
- `DELETE /api/chat/conversations/:id` - Delete conversation

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Environment Variables

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRE` | JWT expiration time | No (default: 7d) |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `OPENAI_API_BASE` | OpenAI API base URL | No (default: https://api.openai.com/v1) |
| `CORS_ORIGIN` | Allowed CORS origin | No |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_SOCKET_URL` | WebSocket server URL | Yes |
| `VITE_APP_NAME` | Application name | No |
| `VITE_APP_VERSION` | Application version | No |

## Troubleshooting

### AI API Errors
- Ensure `OPENAI_API_KEY` is set correctly
- Check OpenAI API quota and billing
- Verify the API key has the necessary permissions

### Database Connection Issues
- Verify MongoDB is running
- Check `MONGODB_URI` format
- Ensure network connectivity

### CORS Errors
- Update `CORS_ORIGIN` in backend environment
- Check frontend API URL configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import Layout from './components/Layout/Layout';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/chat" replace />;
};

import ChatPage from './pages/Chat/EnhancedChatPage';
import TasksPage from './pages/Tasks/TasksPage';
import AIAgentPage from './pages/AIAgent/AIAgentPage';

const FilesPage = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold mb-4">Files</h1>
    <p className="text-muted-foreground">File management interface coming soon...</p>
  </div>
);

const ProfilePage = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold mb-4">Profile</h1>
    <p className="text-muted-foreground">Profile settings coming soon...</p>
  </div>
);

const SettingsPage = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold mb-4">Settings</h1>
    <p className="text-muted-foreground">Application settings coming soon...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route 
              path="login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="chat" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="tasks" 
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="ai-agent" 
              element={
                <ProtectedRoute>
                  <AIAgentPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="files" 
              element={
                <ProtectedRoute>
                  <FilesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


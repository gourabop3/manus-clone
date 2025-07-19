import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../hooks/useAuth.jsx';
import { 
  User, 
  Settings, 
  LogOut, 
  Menu,
  MessageSquare,
  CheckSquare,
  FileText,
  Sparkles
} from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">M</span>
          </div>
          <span className="font-bold text-xl">Manus</span>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/chat" 
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </Link>
            <Link 
              to="/tasks" 
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <CheckSquare className="h-4 w-4" />
              <span>Tasks</span>
            </Link>
            <Link 
              to="/files" 
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <FileText className="h-4 w-4" />
              <span>Files</span>
            </Link>
            <Link 
              to="/ai-agent" 
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Agent</span>
            </Link>
          </nav>
        )}

        {/* User Menu / Auth Buttons */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.username} />
                      <AvatarFallback>
                        {getInitials(user?.firstName, user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 space-y-2">
            <Link 
              to="/chat" 
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </Link>
            <Link 
              to="/tasks" 
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CheckSquare className="h-4 w-4" />
              <span>Tasks</span>
            </Link>
            <Link 
              to="/files" 
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FileText className="h-4 w-4" />
              <span>Files</span>
            </Link>
            <Link 
              to="/ai-agent" 
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Agent</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;


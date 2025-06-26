
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Briefcase, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Plus,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: Briefcase },
    { path: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { path: "/messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CollabHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant={isActive(path) ? "default" : "ghost"}
                  className={`notion-button ${isActive(path) ? "notion-button-primary" : ""}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Create Project Button */}
                <Link to="/post-project">
                  <Button className="notion-button-primary hidden sm:flex">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </Link>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="notion-button relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="notion-button p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 notion-card">
                    <DropdownMenuLabel className="pb-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-projects" className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        My Projects
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="ghost" className="notion-button">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="notion-button-primary">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden notion-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link key={path} to={path} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActive(path) ? "default" : "ghost"}
                    className={`w-full justify-start notion-button ${
                      isActive(path) ? "notion-button-primary" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {label}
                  </Button>
                </Link>
              ))}
              {user && (
                <Link to="/post-project" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start notion-button-primary mt-4">
                    <Plus className="h-4 w-4 mr-3" />
                    New Project
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

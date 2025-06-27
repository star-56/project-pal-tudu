import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  Briefcase,
  LogOut,
  Menu,
  Settings,
  User,
  X
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
    { path: "/", label: "Home" },
    { path: "/marketplace", label: "Features" },
    { path: "/dashboard", label: "About" },
    { path: "/messages", label: "Contact" },
  ];

  return (
    <>
      {/* Spacer */}
      <div className="h-24" />
      
      {/* Island Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/50 backdrop-blur-2xl rounded-full px-8 py-4 shadow-2xl border border-white/10">
          <div className="flex items-center space-x-8">
            
            {/* Navigation Items */}
            {navItems.map(({ path, label }) => (
              <Link key={path} to={path}>
                <span className={`
                  text-sm font-medium transition-colors duration-200 cursor-pointer
                  ${isActive(path) 
                    ? "text-white" 
                    : "text-gray-400 hover:text-gray-200"
                  }
                `}>
                  {label}
                </span>
              </Link>
            ))}

            {/* Right Side - Sign Up Button */}
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="relative text-gray-400 hover:text-white p-2 hover:bg-transparent"
                >
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center bg-blue-500 border-0 text-white">
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-1 hover:bg-transparent">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-xl"
                  >
                    <DropdownMenuLabel className="text-white">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm">{user.user_metadata?.full_name || "User"}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-white/10">
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-white/10">
                      <Link to="/my-projects" className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        My Projects
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Link to="/post-project">
                  <Button className="bg-white hover:bg-gray-100 text-black rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 hover:scale-105">
                    New Project →
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-white hover:bg-gray-100 text-black rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 hover:scale-105">
                  Sign up →
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-400 hover:text-white p-2 hover:bg-transparent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3">
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-white/10">
              <div className="flex flex-col space-y-3">
                {navItems.map(({ path, label }) => (
                  <Link key={path} to={path} onClick={() => setMobileMenuOpen(false)}>
                    <span className={`
                      text-sm font-medium transition-colors duration-200 cursor-pointer block py-2
                      ${isActive(path) ? "text-white" : "text-gray-400 hover:text-gray-200"}
                    `}>
                      {label}
                    </span>
                  </Link>
                ))}
                {user && (
                  <Link to="/post-project" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-white hover:bg-gray-100 text-black rounded-full py-2 text-sm font-medium mt-2">
                      New Project →
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
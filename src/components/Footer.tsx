
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Heart,
  ArrowRight,
  Briefcase,
  Users,
  MessageSquare,
  ShoppingBag
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CollabHub
              </span>
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Connecting students and professionals worldwide to collaborate on amazing projects and build the future together.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600 rounded-xl">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600 rounded-xl">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-purple-50 hover:text-purple-600 rounded-xl">
                <Github className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-pink-50 hover:text-pink-600 rounded-xl">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Find Projects
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <Users className="h-4 w-4 mr-2" />
                  Community
                </Link>
              </li>
              <li>
                <Link to="/messages" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-gray-600 hover:text-blue-600 transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Stay Updated</h3>
            <p className="text-gray-600 mb-4">
              Get the latest updates on new features and opportunities.
            </p>
            <div className="space-y-3">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-l-xl rounded-r-none border-r-0 focus:z-10"
                />
                <Button className="rounded-l-none rounded-r-xl bg-blue-600 hover:bg-blue-700">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
              <p className="flex items-center">
                Made with <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" /> for students worldwide
              </p>
              <div className="flex space-x-6">
                <Link to="/privacy" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="hover:text-blue-600 transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              © 2024 CollabHub. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

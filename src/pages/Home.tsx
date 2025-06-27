import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Briefcase, MessageSquare, Star, ShoppingBag, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Footer from "@/components/Footer";
import GlassMorphicNavbar from "@/components/GlassMorphicNavbar";

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   // Define navigation items for CollabHub
  const navItems = [
    { label: 'Projects', href: '/' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Community', href: '/dashboard' },
    { label: 'Contact', href: '/messages' },
  ];

  return (
    <div className="notion-page-bg min-h-screen">
      {/* Island Navbar */}
     <GlassMorphicNavbar navItems={navItems} showSignUp={true}/>

      <div className="notion-container pt-24">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Connect. Collaborate. Create.
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            The ultimate platform for students and professionals to find projects, 
            collaborate on ideas, and build amazing things together.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="notion-button-primary h-14 px-8 text-lg">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="lg" className="notion-button h-14 px-8 text-lg">
                Browse Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="notion-card group">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Find Projects</CardTitle>
              <CardDescription className="text-lg">
                Discover exciting projects that match your skills and interests
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="notion-card group">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Collaborate</CardTitle>
              <CardDescription className="text-lg">
                Work with talented individuals from around the world
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="notion-card group">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Connect</CardTitle>
              <CardDescription className="text-lg">
                Build lasting professional relationships and networks
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="notion-card mb-16">
          <CardContent className="p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
                <div className="text-muted-foreground">Active Projects</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">5000+</div>
                <div className="text-muted-foreground">Students</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-muted-foreground">Universities</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">98%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              "Web Development", "Mobile Apps", "AI/ML", "Data Science", 
              "Design", "Research", "IoT", "Blockchain", "Gaming", "Robotics"
            ].map((category) => (
              <Badge key={category} variant="secondary" className="notion-badge text-lg px-6 py-3">
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">What Students Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="notion-card">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg mb-4">
                  "This platform helped me find an amazing team for my capstone project. 
                  We built something incredible together!"
                </p>
                <div className="text-sm text-muted-foreground">
                  - Sarah Chen, Computer Science Student
                </div>
              </CardContent>
            </Card>

            <Card className="notion-card">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg mb-4">
                  "The collaboration tools are fantastic. We completed our project 
                  ahead of schedule and learned so much!"
                </p>
                <div className="text-sm text-muted-foreground">
                  - Michael Rodriguez, Engineering Student
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="notion-card text-center mb-16">
          <CardContent className="p-12">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students and professionals who are already building 
              the future together.
            </p>
            <Link to="/auth">
              <Button size="lg" className="notion-button-primary h-14 px-12 text-lg">
                Join Now - It's Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Home;

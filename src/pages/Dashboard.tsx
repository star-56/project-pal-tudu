
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['user-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`created_by.eq.${user.id},collaborators.cs.{${user.id}}`);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['user-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('applications')
        .select('*, projects(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const activeProjects = projects?.filter(p => p.status === 'active') || [];
  const completedProjects = projects?.filter(p => p.status === 'completed') || [];
  const pendingApplications = applications?.filter(a => a.status === 'pending') || [];

  return (
    <div className="notion-page-bg min-h-screen">
      <div className="notion-container">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>
          <Link to="/post-project">
            <Button className="notion-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8 animate-slide-in">
          <Card className="notion-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-3xl font-bold text-blue-600">{activeProjects.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="notion-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedProjects.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="notion-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingApplications.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="notion-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-3xl font-bold text-purple-600">{projects?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="animate-scale-in">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {projectsLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="notion-card">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {projects?.map((project) => (
                  <Card key={project.id} className="notion-card group">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </CardTitle>
                        <Badge 
                          variant={project.status === 'active' ? 'default' : 'secondary'}
                          className="notion-badge"
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-base line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(project.created_at).toLocaleDateString()}
                          </div>
                          <Button variant="outline" size="sm" className="notion-button">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {applicationsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="notion-card">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {applications?.map((application) => (
                  <Card key={application.id} className="notion-card">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">
                            {application.projects?.title}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            application.status === 'approved' ? 'default' :
                            application.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                          className="notion-badge"
                        >
                          {application.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="notion-card">
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">New message received</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Project milestone completed</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Application status updated</p>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

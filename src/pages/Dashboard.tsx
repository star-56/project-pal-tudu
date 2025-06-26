
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

// Define interfaces that match the actual database schema
interface Project {
  id: string;
  title: string;
  description: string;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  client_id: string | null;
  freelancer_id: string | null;
  category: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  skills_required: string[] | null;
}

interface Application {
  id: string;
  user_id: string;
  freelancer_id: string | null;
  project_id: string | null;
  status: string | null;
  created_at: string | null;
  proposal: string;
  bid_amount: number;
  estimated_duration: string | null;
  projects: Project | null;
}

const Dashboard = () => {
  const { user } = useAuth();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['user-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id);
      
      if (error) throw error;
      return data as Project[];
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
        .eq('freelancer_id', user.id);
      
      if (error) throw error;
      return data as Application[];
    },
    enabled: !!user?.id,
  });

  const activeProjects = projects?.filter(p => p.status === 'active') || [];
  const completedProjects = projects?.filter(p => p.status === 'completed') || [];
  const pendingApplications = applications?.filter(a => a.status === 'pending') || [];

  return (
    <div className="min-h-screen bg-[#fefefe]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-lg text-gray-600">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>
          <Link to="/post-project">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg px-4 py-2 font-medium transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Projects</p>
                  <p className="text-2xl font-bold text-blue-600">{activeProjects.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedProjects.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Applications</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingApplications.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Projects</p>
                  <p className="text-2xl font-bold text-purple-600">{projects?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <Tabs defaultValue="projects" className="p-6">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-50 rounded-xl p-1 border-0">
              <TabsTrigger value="projects" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">My Projects</TabsTrigger>
              <TabsTrigger value="applications" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Applications</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              {projectsLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="bg-gray-50 border-0 rounded-xl">
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
                    <Card key={project.id} className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 group">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors font-semibold">
                            {project.title}
                          </CardTitle>
                          <Badge 
                            variant={project.status === 'active' ? 'default' : 'secondary'}
                            className="rounded-full px-3 py-1 text-xs font-medium"
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-500">Progress</span>
                              <span className="text-gray-700 font-medium">75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                            </div>
                            <Button variant="outline" size="sm" className="rounded-lg border-gray-200 hover:bg-gray-50">
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
                    <Card key={i} className="bg-gray-50 border-0 rounded-xl">
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
                    <Card key={application.id} className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg mb-2">
                              {application.projects?.title || 'Project'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Applied on {application.created_at ? new Date(application.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              application.status === 'approved' ? 'default' :
                              application.status === 'rejected' ? 'destructive' : 'secondary'
                            }
                            className="rounded-full px-3 py-1 text-xs font-medium"
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
              <Card className="bg-white border border-gray-200 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">New message received</p>
                      <p className="text-sm text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Project milestone completed</p>
                      <p className="text-sm text-gray-600">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Application status updated</p>
                      <p className="text-sm text-gray-600">3 days ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

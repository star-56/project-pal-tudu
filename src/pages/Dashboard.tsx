/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, DollarSign, Eye, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  status: string;
  created_at: string;
  applications: { id: string }[];
}

interface Application {
  id: string;
  bid_amount: number;
  status: string;
  created_at: string;
  projects: {
    id: string;
    title: string;
    client_id: string;
    profiles: {
      full_name: string;
    };
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyProjects();
      fetchMyApplications();
    }
  }, [user]);

  const fetchMyProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          applications(id)
        `)
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load your projects.",
        variant: "destructive",
      });
    }
  };

  const fetchMyApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          projects!inner(
            id,
            title,
            client_id,
            profiles:client_id(
              full_name
            )
          )
        `)
        .eq('freelancer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyApplications(
        (data || []).map((application: any) => ({
          ...application,
          projects: {
            ...application.projects,
            profiles: application.projects?.profiles && typeof application.projects.profiles === 'object' && 'full_name' in application.projects.profiles
              ? application.projects.profiles
              : { full_name: 'Unknown' }
          }
        }))
      );
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatBudget = (min: number, max: number) => {
    if (min && max) {
      return `$${min} - $${max}`;
    }
    return 'Budget negotiable';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'assigned': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      case 'accepted': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your projects and applications</p>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">My Projects ({myProjects.length})</TabsTrigger>
            <TabsTrigger value="applications">My Applications ({myApplications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Projects I Posted</h2>
                <Button onClick={() => navigate('/post-project')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Post New Project
                </Button>
              </div>

              {myProjects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-4">Start by posting your first project</p>
                    <Button onClick={() => navigate('/post-project')}>
                      Post Your First Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                          <Badge variant={getStatusColor(project.status) as any}>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          {formatBudget(project.budget_min, project.budget_max)}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                          {project.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {project.applications?.length || 0} applications
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(project.created_at)}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => navigate(`/project/${project.id}`)}
                          className="w-full"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">My Applications</h2>

              {myApplications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-4">Browse projects and submit your first application</p>
                    <Button onClick={() => navigate('/')}>
                      Browse Projects
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((application) => (
                    <Card key={application.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {application.projects.title}
                            </h3>
                            <p className="text-gray-600">
                              Client: {application.projects.profiles?.full_name || 'Unknown'}
                            </p>
                          </div>
                          <Badge variant={getStatusColor(application.status) as any}>
                            {application.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span>Bid: ${application.bid_amount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Applied: {formatDate(application.created_at)}</span>
                          </div>
                          <div>
                            <Button 
                              onClick={() => navigate(`/project/${application.projects.id}`)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Project
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

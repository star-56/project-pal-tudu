"use client";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, MapPin, User, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  skills_required: string[];
  deadline: string;
  category: string;
  status: string;
  created_at: string;
  client_id: string;
  profiles: {
    full_name: string;
    location: string;
  };
}

interface Application {
  id: string;
  proposal: string;
  bid_amount: number;
  estimated_duration: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    bio: string;
    skills: string[];
    hourly_rate: number;
  };
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  const [applicationData, setApplicationData] = useState({
    proposal: '',
    bid_amount: '',
    estimated_duration: '',
  });

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchApplications();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:client_id (
            full_name,
            location
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles:freelancer_id (
            full_name,
            avatar_url,
            bio,
            skills,
            hourly_rate
          )
        `)
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !project) return;

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          project_id: project.id,
          freelancer_id: user.id,
          proposal: applicationData.proposal,
          bid_amount: parseFloat(applicationData.bid_amount),
          estimated_duration: applicationData.estimated_duration,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your application has been submitted.",
      });
      
      setShowApplicationForm(false);
      setApplicationData({ proposal: '', bid_amount: '', estimated_duration: '' });
      fetchApplications();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
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

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">Project not found</div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === project.client_id;
  const hasApplied = applications.some(app => app.profiles && user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Project Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatBudget(project.budget_min, project.budget_max)}
                  </div>
                  {project.profiles?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {project.profiles.location}
                    </div>
                  )}
                  {project.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(project.deadline)}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
                  </div>
                  
                  {project.skills_required && project.skills_required.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.skills_required.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Posted by {project.profiles?.full_name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applications Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Applications ({applications.length})</CardTitle>
              </CardHeader>
              
              <CardContent>
                {applications.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No applications yet.</p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{application.profiles?.full_name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>${application.bid_amount}</span>
                              {application.estimated_duration && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {application.estimated_duration}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant={application.status === 'accepted' ? 'default' : 'secondary'}>
                            {application.status}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{application.proposal}</p>
                        
                        {application.profiles?.skills && application.profiles.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {application.profiles.skills.slice(0, 5).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {!isOwner && user && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this Project</CardTitle>
                </CardHeader>
                
                <CardContent>
                  {!showApplicationForm ? (
                    <Button 
                      onClick={() => setShowApplicationForm(true)}
                      className="w-full"
                      disabled={hasApplied}
                    >
                      {hasApplied ? 'Already Applied' : 'Submit Proposal'}
                    </Button>
                  ) : (
                    <form onSubmit={submitApplication} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Your Proposal</label>
                        <Textarea
                          required
                          value={applicationData.proposal}
                          onChange={(e) => setApplicationData({ ...applicationData, proposal: e.target.value })}
                          placeholder="Describe how you'll complete this project..."
                          rows={4}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Your Bid ($)</label>
                        <Input
                          type="number"
                          required
                          value={applicationData.bid_amount}
                          onChange={(e) => setApplicationData({ ...applicationData, bid_amount: e.target.value })}
                          placeholder="Enter your bid amount"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Estimated Duration</label>
                        <Input
                          value={applicationData.estimated_duration}
                          onChange={(e) => setApplicationData({ ...applicationData, estimated_duration: e.target.value })}
                          placeholder="e.g., 2 weeks, 1 month"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Submit</Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowApplicationForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Project Info</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span>{project.category || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge>{project.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications:</span>
                  <span>{applications.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

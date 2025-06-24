
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Clock, DollarSign, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

interface Application {
  id: string;
  proposal: string;
  bid_amount: number;
  estimated_duration: string;
  status: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
    bio: string;
    skills: string[];
    hourly_rate: number;
    location: string;
  };
}

interface ApplicationCardProps {
  application: Application;
  projectId: string;
  isOwner: boolean;
  onApplicationUpdate: () => void;
}

const ApplicationCard = ({ application, projectId, isOwner, onApplicationUpdate }: ApplicationCardProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      // Update application status
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', application.id);

      if (appError) throw appError;

      // Update project status and assign freelancer
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          status: 'assigned',
          freelancer_id: application.profiles.id
        })
        .eq('id', projectId);

      if (projectError) throw projectError;

      // Reject all other applications for this project
      const { error: rejectError } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('project_id', projectId)
        .neq('id', application.id);

      if (rejectError) throw rejectError;

      toast({
        title: "Success!",
        description: "Application approved and project assigned.",
      });

      onApplicationUpdate();
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', application.id);

      if (error) throw error;

      toast({
        title: "Application rejected",
        description: "The application has been rejected.",
      });

      onApplicationUpdate();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={application.profiles.avatar_url} />
              <AvatarFallback>
                {application.profiles.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{application.profiles.full_name}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${application.bid_amount}
                </div>
                {application.estimated_duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {application.estimated_duration}
                  </div>
                )}
                <span>Applied on {formatDate(application.created_at)}</span>
              </div>
            </div>
          </div>
          <Badge variant={getStatusColor(application.status) as any}>
            {application.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Proposal</h4>
            <p className="text-gray-700">{application.proposal}</p>
          </div>

          <div className="flex items-center justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Freelancer Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={application.profiles.avatar_url} />
                      <AvatarFallback>
                        {application.profiles.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{application.profiles.full_name}</h3>
                      <p className="text-gray-600">{application.profiles.location}</p>
                      {application.profiles.hourly_rate && (
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-4 w-4" />
                          ${application.profiles.hourly_rate}/hour
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {application.profiles.bio && (
                    <div>
                      <h4 className="font-semibold mb-2">About</h4>
                      <p className="text-gray-700">{application.profiles.bio}</p>
                    </div>
                  )}

                  {application.profiles.skills && application.profiles.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.profiles.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {isOwner && application.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}

            {application.status === 'accepted' && (
              <Button
                onClick={() => window.location.href = '/messages'}
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;

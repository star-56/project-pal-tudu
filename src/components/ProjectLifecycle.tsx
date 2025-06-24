
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertCircle, Star, MessageCircle } from 'lucide-react';

interface ProjectLifecycleProps {
  project: {
    id: string;
    status: string;
    client_id: string;
    freelancer_id: string;
  };
  currentUserId: string;
  onStatusUpdate: () => void;
}

const PROJECT_STAGES = [
  { key: 'open', label: 'Open', description: 'Project is accepting applications' },
  { key: 'assigned', label: 'Assigned', description: 'Freelancer has been selected' },
  { key: 'in_progress', label: 'In Progress', description: 'Work is being done' },
  { key: 'review', label: 'Under Review', description: 'Client is reviewing the work' },
  { key: 'revision', label: 'Needs Revision', description: 'Client requested changes' },
  { key: 'completed', label: 'Completed', description: 'Project successfully finished' },
];

const ProjectLifecycle = ({ project, currentUserId, onStatusUpdate }: ProjectLifecycleProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  const isClient = currentUserId === project.client_id;
  const isFreelancer = currentUserId === project.freelancer_id;
  const currentStageIndex = PROJECT_STAGES.findIndex(stage => stage.key === project.status);
  const progress = ((currentStageIndex + 1) / PROJECT_STAGES.length) * 100;

  const updateProjectStatus = async (newStatus: string, note?: string) => {
    setIsLoading(true);
    try {
      const updateData: any = { status: newStatus };
      if (note) updateData.review_note = note;

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Project status updated to ${PROJECT_STAGES.find(s => s.key === newStatus)?.label}.`,
      });

      onStatusUpdate();
      setReviewNote('');
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Error",
        description: "Failed to update project status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWork = () => updateProjectStatus('in_progress');
  const handleSubmitWork = () => updateProjectStatus('review');
  const handleApproveWork = () => updateProjectStatus('completed');
  const handleRequestRevision = () => updateProjectStatus('revision', reviewNote);
  const handleResubmitWork = () => updateProjectStatus('review');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'secondary';
      case 'assigned': return 'default';
      case 'in_progress': return 'default';
      case 'review': return 'secondary';
      case 'revision': return 'destructive';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getStageIcon = (stageKey: string, index: number) => {
    if (index < currentStageIndex) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (index === currentStageIndex) return <Clock className="h-5 w-5 text-blue-500" />;
    if (stageKey === 'revision') return <AlertCircle className="h-5 w-5 text-orange-500" />;
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
  };

  const canPerformAction = () => {
    const status = project.status;
    
    if (isFreelancer) {
      return status === 'assigned' || status === 'revision';
    }
    
    if (isClient) {
      return status === 'review';
    }
    
    return false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Lifecycle</span>
          <Badge variant={getStatusColor(project.status) as any}>
            {PROJECT_STAGES.find(s => s.key === project.status)?.label}
          </Badge>
        </CardTitle>
        <Progress value={progress} className="mt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stage Timeline */}
        <div className="space-y-4">
          {PROJECT_STAGES.map((stage, index) => (
            <div key={stage.key} className="flex items-center gap-3">
              {getStageIcon(stage.key, index)}
              <div className="flex-1">
                <div className="font-medium">{stage.label}</div>
                <div className="text-sm text-gray-600">{stage.description}</div>
              </div>
              {index === currentStageIndex && (
                <Badge variant="outline">Current</Badge>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {canPerformAction() && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold">Available Actions</h4>
            
            {/* Freelancer Actions */}
            {isFreelancer && project.status === 'assigned' && (
              <Button 
                onClick={handleStartWork} 
                disabled={isLoading}
                className="w-full"
              >
                Start Working
              </Button>
            )}

            {isFreelancer && project.status === 'in_progress' && (
              <Button 
                onClick={handleSubmitWork} 
                disabled={isLoading}
                className="w-full"
              >
                Submit Work for Review
              </Button>
            )}

            {isFreelancer && project.status === 'revision' && (
              <Button 
                onClick={handleResubmitWork} 
                disabled={isLoading}
                className="w-full"
              >
                Resubmit Updated Work
              </Button>
            )}

            {/* Client Actions */}
            {isClient && project.status === 'review' && (
              <div className="space-y-2">
                <Button 
                  onClick={handleApproveWork} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Approve & Complete Project
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      disabled={isLoading}
                      className="w-full"
                    >
                      Request Revisions
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Revisions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          What changes would you like to see?
                        </label>
                        <Textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Please describe the changes needed..."
                          rows={4}
                        />
                      </div>
                      <Button 
                        onClick={() => handleRequestRevision()}
                        disabled={!reviewNote.trim() || isLoading}
                        className="w-full"
                      >
                        Send Revision Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}

        {/* Communication Link */}
        {(project.status === 'assigned' || project.status === 'in_progress' || project.status === 'review' || project.status === 'revision') && (
          <div className="pt-4 border-t">
            <Button
              onClick={() => window.location.href = '/messages'}
              variant="outline"
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Go to Messages
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectLifecycle;

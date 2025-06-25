
"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  status: string;
  client_id: string;
  freelancer_id: string;
  client_profile: {
    full_name: string;
  } | null;
  freelancer_profile: {
    full_name: string;
  } | null;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: {
    full_name: string;
  };
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedProject]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, 
          title, 
          status, 
          client_id, 
          freelancer_id,
          client_profile:profiles!projects_client_id_fkey (
            full_name
          ),
          freelancer_profile:profiles!projects_freelancer_id_fkey (
            full_name
          )
        `)
        .or(`client_id.eq.${user?.id},freelancer_id.eq.${user?.id}`)
        .not('freelancer_id', 'is', null)
        .in('status', ['assigned', 'in_progress', 'review', 'revision', 'completed']);

      if (error) throw error;
      
      console.log('Fetched projects:', data);
      setProjects(data || []);
      
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedProject) return;

    try {
      console.log('Fetching messages for project:', selectedProject.id);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (
            full_name
          )
        `)
        .eq('project_id', selectedProject.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('Fetched messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
    }
  };

  const subscribeToMessages = () => {
    if (!selectedProject) return;

    console.log('Subscribing to messages for project:', selectedProject.id);
    
    const channel = supabase
      .channel(`messages-${selectedProject.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${selectedProject.id}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from messages');
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProject || !newMessage.trim()) return;

    try {
      console.log('Sending message:', {
        project_id: selectedProject.id,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      const { error } = await supabase
        .from('messages')
        .insert({
          project_id: selectedProject.id,
          sender_id: user.id,
          content: newMessage.trim(),
        });

      if (error) throw error;
      
      console.log('Message sent successfully');
      setNewMessage('');
      // Refresh messages immediately
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getProjectPartner = (project: Project) => {
    if (user?.id === project.client_id) {
      return project.freelancer_profile?.full_name || 'Freelancer';
    } else {
      return project.client_profile?.full_name || 'Client';
    }
  };

  const getProjectRole = (project: Project) => {
    return user?.id === project.client_id ? 'Client' : 'Freelancer';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'default';
      case 'in_progress': return 'default';
      case 'review': return 'secondary';
      case 'revision': return 'destructive';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading messages...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Project List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {projects.length === 0 ? (
                <div className="p-4 text-center">
                  <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600 text-sm">No active projects with messaging available</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`w-full text-left p-3 hover:bg-gray-50 border-b transition-colors ${
                        selectedProject?.id === project.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="font-medium truncate mb-1">{project.title}</div>
                      <div className="text-sm text-gray-600 flex items-center justify-between mb-1">
                        <span>With {getProjectPartner(project)}</span>
                        <Badge variant={getStatusColor(project.status) as any} className="text-xs">
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Role: {getProjectRole(project)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedProject ? selectedProject.title : 'Select a project'}</span>
                {selectedProject && (
                  <Badge variant={getStatusColor(selectedProject.status) as any}>
                    {selectedProject.status.replace('_', ' ')}
                  </Badge>
                )}
              </CardTitle>
              {selectedProject && (
                <p className="text-sm text-gray-600">
                  Chatting with {getProjectPartner(selectedProject)}
                </p>
              )}
            </CardHeader>
            
            {selectedProject ? (
              <>
                <CardContent className="flex-1 overflow-y-auto max-h-96">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-600">No messages yet. Start the conversation!</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <div className="text-sm font-medium mb-1">
                              {message.profiles?.full_name || 'Unknown User'}
                            </div>
                            <div className="break-words">{message.content}</div>
                            <div className="text-xs mt-1 opacity-70">
                              {formatTime(message.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </CardContent>
                
                <div className="p-4 border-t">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={!selectedProject}
                    />
                    <Button type="submit" disabled={!newMessage.trim() || !selectedProject}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a project to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;

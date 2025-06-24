
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: '',
    hourly_rate: '',
    is_student: false,
    student_id: '',
    institution: '',
    graduation_year: '',
    major: '',
  });
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile({
          username: data.username || '',
          full_name: data.full_name || '',
          bio: data.bio || '',
          location: data.location || '',
          hourly_rate: data.hourly_rate ? data.hourly_rate.toString() : '',
          is_student: data.is_student || false,
          student_id: data.student_id || '',
          institution: data.institution || '',
          graduation_year: data.graduation_year ? data.graduation_year.toString() : '',
          major: data.major || '',
        });
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          full_name: profile.full_name,
          bio: profile.bio,
          location: profile.location,
          hourly_rate: profile.hourly_rate ? parseFloat(profile.hourly_rate) : null,
          skills: skills,
          is_student: profile.is_student,
          student_id: profile.student_id || null,
          institution: profile.institution || null,
          graduation_year: profile.graduation_year ? parseInt(profile.graduation_year) : null,
          major: profile.major || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Profile</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <Input
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself and your experience"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="e.g., New York, NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hourly Rate ($)</label>
                  <Input
                    type="number"
                    value={profile.hourly_rate}
                    onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
                    placeholder="Your hourly rate"
                  />
                </div>
              </div>

              {/* Student Information Section */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="is_student"
                    checked={profile.is_student}
                    onCheckedChange={(checked) => setProfile({ ...profile, is_student: !!checked })}
                  />
                  <label htmlFor="is_student" className="text-sm font-medium">
                    I am a student
                  </label>
                </div>

                {profile.is_student && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Student ID</label>
                      <Input
                        value={profile.student_id}
                        onChange={(e) => setProfile({ ...profile, student_id: e.target.value })}
                        placeholder="Your student ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Institution</label>
                      <Input
                        value={profile.institution}
                        onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                        placeholder="Your school/university"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Graduation Year</label>
                      <Input
                        type="number"
                        value={profile.graduation_year}
                        onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })}
                        placeholder="Expected graduation year"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Major/Field of Study</label>
                      <Input
                        value={profile.major}
                        onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                        placeholder="Your major or field of study"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skills</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Enter a skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

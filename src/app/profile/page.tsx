'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signOut, fetchUserProfile, setUserProfile } from '@/store/slices/authSlice';
import { supabase } from '@/store/api/apiSlice';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, userProfile, isLoading } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    surname: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user && !userProfile) {
      dispatch(fetchUserProfile(user.id));
    }
    
    if (userProfile) {
      setEditFormData({
        name: userProfile.name || '',
        surname: userProfile.surname || '',
      });
    }
  }, [user, userProfile, dispatch]);

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, reset form
      setEditFormData({
        name: userProfile?.name || '',
        surname: userProfile?.surname || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!user || !userProfile) return;

    setSaveLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profile')
        .update({
          name: editFormData.name,
          surname: editFormData.surname,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      dispatch(setUserProfile(data));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!user) {
    router.push('/auth/login');
    return null;
  }
  // Placeholder user data - will be replaced with real data from userProfile
  const mockUserStats = {
    memberSince: 'January 2024',
    toursCompleted: 12,
    hoursListened: 45,
    badgesEarned: 8,
    level: 'Explorer',
  };

  const recentActivity = [
    {
      id: '1',
      type: 'completed',
      title: 'Vatican Museums Tour',
      date: '2 days ago',
      icon: '🏛️',
    },
    {
      id: '2',
      type: 'started',
      title: 'Trastevere Food Tour',
      date: '1 week ago',
      icon: '🍷',
    },
    {
      id: '3',
      type: 'favorited',
      title: 'Colosseum Underground',
      date: '2 weeks ago',
      icon: '❤️',
    },
  ];

  const achievements = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first tour',
      icon: '👶',
      earned: true,
    },
    {
      id: '2',
      title: 'Art Lover',
      description: 'Visit 5 art museums',
      icon: '🎨',
      earned: true,
    },
    {
      id: '3',
      title: 'Explorer',
      description: 'Complete 10 tours',
      icon: '🗺️',
      earned: true,
    },
    {
      id: '4',
      title: 'Marathon Walker',
      description: 'Walk 50km in tours',
      icon: '🏃',
      earned: false,
    },
  ];

  return (
    <MainLayout title="Profile" showBackButton={false}>
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-center mb-4">Edit Profile</h2>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="name"
                  label="First Name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({...prev, name: e.target.value}))}
                  disabled={saveLoading}
                />
                <Input
                  name="surname"
                  label="Last Name"
                  value={editFormData.surname}
                  onChange={(e) => setEditFormData(prev => ({...prev, surname: e.target.value}))}
                  disabled={saveLoading}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleSaveProfile}
                  loading={saveLoading}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleEditToggle}
                  disabled={saveLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Avatar size="xl" className="mx-auto mb-4">
                <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  {userProfile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </Avatar>
              
              <h1 className="text-xl font-bold text-foreground mb-1">
                {userProfile ? `${userProfile.name} ${userProfile.surname}` : user?.email}
              </h1>
              <p className="text-sm text-muted mb-4">{user?.email}</p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="primary">{mockUserStats.level}</Badge>
                <span className="text-sm text-muted">Member since {mockUserStats.memberSince}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-lg font-bold text-primary">{mockUserStats.toursCompleted}</div>
                  <div className="text-xs text-muted">Tours</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">{mockUserStats.hoursListened}h</div>
                  <div className="text-xs text-muted">Listened</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">{mockUserStats.badgesEarned}</div>
                  <div className="text-xs text-muted">Badges</div>
                </div>
              </div>

              <Button variant="outline" onClick={handleEditToggle} className="mb-2">
                Edit Profile
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-16 flex-col gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm">Tour History</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">Downloads</span>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center">
                  <span className="text-sm">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.type === 'completed' && 'Completed'}
                    {activity.type === 'started' && 'Started'}
                    {activity.type === 'favorited' && 'Favorited'}
                  </p>
                  <p className="text-sm text-muted truncate">{activity.title}</p>
                </div>
                <span className="text-xs text-muted">{activity.date}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Achievements</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {achievements.slice(0, 4).map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border text-center ${
                  achievement.earned
                    ? 'border-primary bg-primary/5'
                    : 'border-surface bg-surface'
                }`}
              >
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <h4 className={`text-sm font-medium mb-1 ${
                  achievement.earned ? 'text-foreground' : 'text-muted'
                }`}>
                  {achievement.title}
                </h4>
                <p className={`text-xs ${
                  achievement.earned ? 'text-muted' : 'text-muted'
                }`}>
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Settings and Actions */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-foreground">Settings</span>
            </div>
            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <hr className="border-border" />
          
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            loading={isLoading}
            className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
}
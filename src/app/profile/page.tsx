'use client';

import React from 'react';
import { MainLayout } from '@/components/layouts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { Avatar } from '@/components/ui';

export default function ProfilePage() {
  // Placeholder user data
  const user = {
    name: 'Marco Rossi',
    email: 'marco.rossi@example.com',
    avatar: '',
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
        <Card className="p-6 text-center">
          <Avatar size="xl" className="mx-auto mb-4">
            <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
          </Avatar>
          
          <h1 className="text-xl font-bold text-foreground mb-1">{user.name}</h1>
          <p className="text-sm text-muted mb-4">{user.email}</p>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="primary">{user.level}</Badge>
            <span className="text-sm text-muted">Member since {user.memberSince}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{user.toursCompleted}</div>
              <div className="text-xs text-muted">Tours</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">{user.hoursListened}h</div>
              <div className="text-xs text-muted">Listened</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">{user.badgesEarned}</div>
              <div className="text-xs text-muted">Badges</div>
            </div>
          </div>
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

        {/* Settings Link */}
        <Card className="p-4">
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
        </Card>
      </div>
    </MainLayout>
  );
}
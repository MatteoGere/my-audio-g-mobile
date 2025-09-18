'use client';

import React from 'react';
import { MainLayout } from '@/components/layouts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Switch } from '@/components/ui';

export default function SettingsPage() {
  const [settings, setSettings] = React.useState({
    notifications: {
      pushNotifications: true,
      emailUpdates: false,
      tourReminders: true,
      downloadComplete: true,
    },
    audio: {
      autoPlay: true,
      backgroundPlayback: true,
      downloadQuality: 'high',
      skipSilence: false,
    },
    privacy: {
      locationTracking: true,
      dataSharing: false,
      analytics: true,
    },
    appearance: {
      theme: 'system',
      language: 'en',
    },
  });

  const updateSetting = (category: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const settingSections = [
    {
      title: 'Notifications',
      items: [
        {
          key: 'pushNotifications',
          label: 'Push Notifications',
          description: 'Receive notifications about tours and updates',
          type: 'toggle',
          value: settings.notifications.pushNotifications,
        },
        {
          key: 'emailUpdates',
          label: 'Email Updates',
          description: 'Get news and featured tours via email',
          type: 'toggle',
          value: settings.notifications.emailUpdates,
        },
        {
          key: 'tourReminders',
          label: 'Tour Reminders',
          description: 'Remind me to continue unfinished tours',
          type: 'toggle',
          value: settings.notifications.tourReminders,
        },
        {
          key: 'downloadComplete',
          label: 'Download Complete',
          description: 'Notify when tours finish downloading',
          type: 'toggle',
          value: settings.notifications.downloadComplete,
        },
      ],
    },
    {
      title: 'Audio & Playback',
      items: [
        {
          key: 'autoPlay',
          label: 'Auto Play',
          description: 'Automatically start next track',
          type: 'toggle',
          value: settings.audio.autoPlay,
        },
        {
          key: 'backgroundPlayback',
          label: 'Background Playback',
          description: 'Continue playing when app is minimized',
          type: 'toggle',
          value: settings.audio.backgroundPlayback,
        },
        {
          key: 'downloadQuality',
          label: 'Download Quality',
          description: 'Audio quality for offline downloads',
          type: 'select',
          value: settings.audio.downloadQuality,
          options: [
            { value: 'standard', label: 'Standard (128 kbps)' },
            { value: 'high', label: 'High (256 kbps)' },
            { value: 'lossless', label: 'Lossless (FLAC)' },
          ],
        },
        {
          key: 'skipSilence',
          label: 'Skip Silence',
          description: 'Automatically skip silent parts',
          type: 'toggle',
          value: settings.audio.skipSilence,
        },
      ],
    },
    {
      title: 'Privacy & Location',
      items: [
        {
          key: 'locationTracking',
          label: 'Location Tracking',
          description: 'Enable GPS for location-based features',
          type: 'toggle',
          value: settings.privacy.locationTracking,
        },
        {
          key: 'dataSharing',
          label: 'Share Usage Data',
          description: 'Help improve the app with anonymous data',
          type: 'toggle',
          value: settings.privacy.dataSharing,
        },
        {
          key: 'analytics',
          label: 'Analytics',
          description: 'Allow analytics for app improvements',
          type: 'toggle',
          value: settings.privacy.analytics,
        },
      ],
    },
    {
      title: 'Appearance & Language',
      items: [
        {
          key: 'theme',
          label: 'Theme',
          description: 'Choose your preferred color scheme',
          type: 'select',
          value: settings.appearance.theme,
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ],
        },
        {
          key: 'language',
          label: 'Language',
          description: 'Select your preferred language',
          type: 'select',
          value: settings.appearance.language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'it', label: 'Italiano' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
          ],
        },
      ],
    },
  ];

  return (
    <MainLayout title="Settings" showBackButton>
      <div className="p-4 space-y-6">
        {settingSections.map((section) => (
          <Card key={section.title} className="p-4">
            <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground">{item.label}</h4>
                    <p className="text-xs text-muted">{item.description}</p>
                  </div>
                  
                  {item.type === 'toggle' && (
                    <Switch
                      checked={item.value as boolean}
                      onChange={(e) => {
                        const category = settingSections.find(s => s.items.includes(item))?.title.toLowerCase().split(' ')[0];
                        if (category) {
                          updateSetting(category as keyof typeof settings, item.key, e.target.checked);
                        }
                      }}
                    />
                  )}
                  
                  {item.type === 'select' && (
                    <select
                      value={item.value as string}
                      onChange={(e) => {
                        const category = settingSections.find(s => s.items.includes(item))?.title.toLowerCase().split(' ')[0];
                        if (category) {
                          updateSetting(category as keyof typeof settings, item.key, e.target.value);
                        }
                      }}
                      className="text-sm border border-surface rounded-md px-3 py-1 bg-background text-foreground min-w-[120px]"
                    >
                      {item.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Account Actions */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">Account</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Manage Account
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share App
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help & Support
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Privacy Policy
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-error">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </Button>
          </div>
        </Card>

        {/* App Info */}
        <Card className="p-4 text-center">
          <p className="text-sm text-muted mb-1">MyAudioG</p>
          <p className="text-xs text-muted">Version 1.0.0 (Build 1)</p>
        </Card>
      </div>
    </MainLayout>
  );
}
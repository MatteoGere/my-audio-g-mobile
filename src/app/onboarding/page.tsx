'use client';

import React from 'react';
import { AuthLayout } from '@/components/layouts';
import Button from '@/components/ui/Button';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    // Navigate to home - will implement with proper navigation later
    console.log('Skip onboarding');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <div className="w-32 h-32 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to MyAudioG</h2>
            <p className="text-base text-muted leading-relaxed">
              Discover amazing destinations through immersive audio guides with interactive maps and offline support.
            </p>
          </div>
        );
      case 2:
        return (
          <div className="text-center">
            <div className="w-32 h-32 bg-secondary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-16 h-16 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Interactive Maps</h2>
            <p className="text-base text-muted leading-relaxed">
              Navigate with GPS-enabled maps, discover points of interest, and track your journey in real-time.
            </p>
          </div>
        );
      case 3:
        return (
          <div className="text-center">
            <div className="w-32 h-32 bg-accent/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-16 h-16 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Offline Access</h2>
            <p className="text-base text-muted leading-relaxed">
              Download your favorite tours and enjoy them offline. Perfect for areas with limited connectivity.
            </p>
          </div>
        );
      case 4:
        return (
          <div className="text-center">
            <div className="w-32 h-32 bg-success/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-16 h-16 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Explore!</h2>
            <p className="text-base text-muted leading-relaxed">
              You&apos;re all set! Start discovering amazing audio tours and create unforgettable experiences.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AuthLayout
      showProgress
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="flex-1 flex flex-col justify-center">
        {renderStepContent()}
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full"
        >
          {currentStep === totalSteps ? 'Get Started' : 'Continue'}
        </Button>
        
        {currentStep < totalSteps && (
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full"
          >
            Skip
          </Button>
        )}
      </div>
    </AuthLayout>
  );
}
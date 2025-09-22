import { Card, Button, Progress } from '@/components/ui';

interface AudioPlayerPageProps {
  params: {
    id: string;
  };
}

export default function AudioPlayerPage({ params }: AudioPlayerPageProps) {
  const { id } = params;

  // Mock data for the audio player page
  const currentTrack = {
    id: 'track-1',
    name: 'City Hall Introduction',
    description:
      'Learn about the founding of our city and the architectural significance of the City Hall building.',
    duration: 420, // 7 minutes
    currentTime: 125, // 2:05
  };

  const itinerary = {
    id,
    name: 'Historic Downtown Walking Tour',
    currentTrackIndex: 0,
    totalTracks: 5,
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTrack.currentTime / currentTrack.duration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sea-50 dark:from-stone-900 dark:to-stone-800">
      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Track Image/Visual */}
        <Card className="overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-primary-200 to-sea-200 dark:from-primary-800 dark:to-sea-800 flex items-center justify-center">
            <span className="text-6xl">🏛️</span>
          </div>
        </Card>

        {/* Track Info */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {currentTrack.name}
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">{itinerary.name}</p>
          <p className="text-stone-500 dark:text-stone-500 text-xs">
            Track {itinerary.currentTrackIndex + 1} of {itinerary.totalTracks}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" variant="primary" />
          <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>{formatTime(currentTrack.currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-6">
          <Button variant="ghost" size="lg" className="p-3">
            <span className="text-2xl">⏮️</span>
          </Button>

          <Button variant="primary" size="lg" className="w-16 h-16 rounded-full p-0">
            <span className="text-3xl">⏸️</span>
          </Button>

          <Button variant="ghost" size="lg" className="p-3">
            <span className="text-2xl">⏭️</span>
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm">
            <span className="text-lg">🔀</span>
          </Button>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <span className="text-lg">⏪</span>
            </Button>

            <div className="bg-stone-100 dark:bg-stone-800 rounded-lg px-3 py-1">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">1.0x</span>
            </div>

            <Button variant="ghost" size="sm">
              <span className="text-lg">⏩</span>
            </Button>
          </div>

          <Button variant="ghost" size="sm">
            <span className="text-lg">🔁</span>
          </Button>
        </div>

        {/* Track Description */}
        <Card className="p-4">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
            About this track
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            {currentTrack.description}
          </p>
        </Card>

        {/* Queue/Playlist */}
        <Card className="p-4">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Up Next</h3>
          <div className="space-y-3">
            {[
              { name: 'Historic Main Street', duration: '10:00' },
              { name: 'The Old Market Square', duration: '8:00' },
              { name: 'Cathedral and Churches', duration: '12:00' },
            ].map((track, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">
                    {track.name}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{track.duration}</p>
                </div>
                <Button variant="ghost" size="sm">
                  ▶
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Additional Controls */}
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            📱 Share
          </Button>
          <Button variant="outline" className="flex-1">
            💤 Sleep Timer
          </Button>
          <Button variant="outline" className="flex-1">
            📍 Show on Map
          </Button>
        </div>
      </div>
    </div>
  );
}

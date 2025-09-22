import { Card, Button, Badge } from '@/components/ui';

interface ItineraryDetailPageProps {
  params: {
    id: string;
  };
}

export default function ItineraryDetailPage({ params }: ItineraryDetailPageProps) {
  const { id } = params;

  // In real implementation, you would fetch the itinerary data here
  // For now, we'll use mock data
  const itinerary = {
    id,
    name: 'Historic Downtown Walking Tour',
    description: 'Explore the rich history of our downtown area with expert narration and fascinating stories from the past. This comprehensive tour covers major landmarks, hidden gems, and architectural marvels.',
    totalDuration: 2700, // 45 minutes in seconds
    imageUrl: null,
    company: {
      name: 'City Heritage Tours',
      id: 'company-1'
    },
    tracks: [
      {
        id: 'track-1',
        name: 'City Hall Introduction',
        description: 'Learn about the founding of our city',
        duration: 420, // 7 minutes
        order: 1
      },
      {
        id: 'track-2',
        name: 'Historic Main Street',
        description: 'Walk through the heart of the old town',
        duration: 600, // 10 minutes
        order: 2
      },
      {
        id: 'track-3',
        name: 'The Old Market Square',
        description: 'Discover the bustling marketplace of yesteryear',
        duration: 480, // 8 minutes
        order: 3
      },
      {
        id: 'track-4',
        name: 'Cathedral and Churches',
        description: 'Explore the spiritual heart of the community',
        duration: 720, // 12 minutes
        order: 4
      },
      {
        id: 'track-5',
        name: 'Riverside Walk',
        description: 'End your journey at the peaceful riverside',
        duration: 480, // 8 minutes
        order: 5
      }
    ]
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-primary-100 to-sea-100 dark:from-primary-900 dark:to-sea-900 flex items-center justify-center">
          <span className="text-primary-600 dark:text-primary-400 text-4xl">🏛️</span>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                {itinerary.name}
              </h1>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                by {itinerary.company.name}
              </p>
            </div>
            <Button variant="ghost" size="sm">
              ♡
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 mb-4">
            <Badge variant="outline">{formatDuration(itinerary.totalDuration)}</Badge>
            <Badge variant="outline">{itinerary.tracks.length} stops</Badge>
            <Badge variant="secondary">Walking Tour</Badge>
          </div>

          <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed mb-4">
            {itinerary.description}
          </p>

          <div className="flex space-x-3">
            <Button variant="primary" className="flex-1">
              ▶ Start Tour
            </Button>
            <Button variant="outline">
              📍 View Map
            </Button>
          </div>
        </div>
      </Card>

      {/* Audio Tracks */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
          Audio Tracks ({itinerary.tracks.length})
        </h2>
        <div className="space-y-3">
          {itinerary.tracks.map((track, index) => (
            <Card key={track.id} className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold">
                    {track.order}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-stone-900 dark:text-stone-100 mb-1">
                    {track.name}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">
                    {track.description}
                  </p>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {formatDuration(track.duration)}
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  ▶
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive Map Preview */}
      <Card className="p-6">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">
          Tour Route
        </h3>
        <div className="h-32 bg-sea-50 dark:bg-sea-900 rounded-lg flex items-center justify-center border-dashed border-2 border-sea-200 dark:border-sea-700">
          <div className="text-center">
            <span className="text-sea-600 dark:text-sea-400 text-2xl block mb-2">🗺️</span>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Interactive map with {itinerary.tracks.length} stops
            </p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4">
          View Full Map
        </Button>
      </Card>

      {/* Company Info */}
      <Card className="p-4">
        <h3 className="font-medium text-stone-900 dark:text-stone-100 mb-2">
          About {itinerary.company.name}
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
          Professional tour guides creating immersive audio experiences for travelers and locals alike.
        </p>
        <Button variant="ghost" size="sm">
          View All Tours by {itinerary.company.name}
        </Button>
      </Card>
    </div>
  );
}
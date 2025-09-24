import { Card, Button } from '@/components/ui';

export default function MapPage() {
  return (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <Card className="h-96 flex items-center justify-center bg-sea-50 dark:bg-sea-900 border-dashed">
        <div className="text-center">
          <div className="w-16 h-16 bg-sea-200 dark:bg-sea-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-sea-600 dark:text-sea-400 text-2xl">🗺️</span>
          </div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">Interactive Map</h3>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Map integration will be implemented with Leaflet
          </p>
        </div>
      </Card>

      {/* Location Controls */}
      <div className="flex space-x-2">
        <Button variant="primary" className="flex-1">
          Find My Location
        </Button>
        <Button variant="outline" className="flex-1">
          Search Area
        </Button>
      </div>

      {/* Nearby Tours */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
          Nearby Tours
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-stone-900 dark:text-stone-100">
                    Park Nature Walk
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    0.3 km away • 25 minutes
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

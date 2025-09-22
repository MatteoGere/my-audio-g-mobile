import { Card, Input, Button } from '@/components/ui';

export default function SearchPage() {
  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="sticky top-0 bg-sand-50 dark:bg-stone-900 z-10 pb-4">
        <Input
          type="search"
          placeholder="Search audio tours..."
          className="w-full"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          All Categories
        </Button>
        <Button variant="ghost" size="sm">
          Museums
        </Button>
        <Button variant="ghost" size="sm">
          Historic Sites
        </Button>
        <Button variant="ghost" size="sm">
          Walking Tours
        </Button>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Search Results
          </h2>
          <span className="text-sm text-stone-600 dark:text-stone-400">
            24 tours found
          </span>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <Card key={item} className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
                    IMG
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                    Historic Downtown Walking Tour
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mb-2 line-clamp-2">
                    Explore the rich history of our downtown area with expert narration and fascinating stories.
                  </p>
                  <div className="flex items-center text-xs text-stone-500 dark:text-stone-400 space-x-4">
                    <span>45 minutes</span>
                    <span>8 stops</span>
                    <span>2.5 km</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Load More */}
      <div className="text-center pt-4">
        <Button variant="outline">
          Load More Results
        </Button>
      </div>
    </div>
  );
}
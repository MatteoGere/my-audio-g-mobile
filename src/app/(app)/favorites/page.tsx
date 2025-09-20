export default function FavoritesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-stone-200 dark:border-gray-700 px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Favorites
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-stone-100 dark:bg-gray-800 p-1 rounded-xl">
            <button className="flex-1 py-2 px-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium text-sm shadow-sm">
              Tours
            </button>
            <button className="flex-1 py-2 px-4 rounded-lg text-stone-600 dark:text-gray-400 font-medium text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
              Tracks
            </button>
          </div>

          {/* Favorite Tours */}
          <section>
            <div className="space-y-4">
              {/* Check if user has favorites */}
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-stone-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-8 w-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No favorites yet
                </h3>
                <p className="text-stone-600 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  Start exploring audio tours and save your favorites here for easy access later.
                </p>
                <button className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Tours
                </button>
              </div>

              {/* Example of favorite items when they exist */}
              {/* 
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-4"
                >
                  <div className="flex space-x-3">
                    <div className="h-16 w-16 bg-stone-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            Favorite Tour {i}
                          </h3>
                          <p className="text-sm text-stone-600 dark:text-gray-400 mb-2">
                            Your saved audio tour for later listening...
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-gray-500">
                            <span>45 min</span>
                            <span>•</span>
                            <span>Historical</span>
                            <span>•</span>
                            <span>Downloaded</span>
                          </div>
                        </div>
                        <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              */}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
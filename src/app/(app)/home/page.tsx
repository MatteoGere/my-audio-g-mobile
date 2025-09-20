export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-stone-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              MyAudioG
            </h1>
            <p className="text-sm text-stone-600 dark:text-gray-400">
              Discover amazing audio tours
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="search"
              placeholder="Search audio tours..."
              className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-stone-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Featured Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Featured Tours
            </h2>
            <div className="grid gap-4">
              {/* Placeholder cards */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-4"
                >
                  <div className="flex space-x-3">
                    <div className="h-16 w-16 bg-stone-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        Audio Tour {i}
                      </h3>
                      <p className="text-sm text-stone-600 dark:text-gray-400 mb-2">
                        Discover the beauty of this amazing location...
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-gray-500">
                        <span>45 min</span>
                        <span>•</span>
                        <span>Historical</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Nearby Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nearby Tours
            </h2>
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-stone-200 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                <svg className="h-6 w-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-stone-600 dark:text-gray-400 text-sm">
                Enable location to discover tours near you
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
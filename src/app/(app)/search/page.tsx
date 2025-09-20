export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-stone-200 dark:border-gray-700 px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Search
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <input
              type="search"
              placeholder="Search for tours, locations, categories..."
              className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-stone-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Historical', 'Nature', 'Cultural', 'Architecture', 'Museums'].map((tag) => (
              <button
                key={tag}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tag === 'All'
                    ? 'bg-primary text-white'
                    : 'bg-stone-100 dark:bg-gray-800 text-stone-700 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Recent Searches */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Searches
            </h2>
            <div className="space-y-3">
              {['Rome Colosseum', 'Florence Cathedral', 'Venice Canals'].map((search) => (
                <button
                  key={search}
                  className="flex items-center w-full p-3 text-left bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl hover:bg-stone-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="h-5 w-5 text-stone-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-900 dark:text-white">{search}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Popular Tours */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Popular Tours
            </h2>
            <div className="grid gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-4"
                >
                  <div className="flex space-x-3">
                    <div className="h-16 w-16 bg-stone-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        Popular Tour {i}
                      </h3>
                      <p className="text-sm text-stone-600 dark:text-gray-400 mb-2">
                        Highly rated audio tour with amazing insights...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-gray-500">
                          <span>30 min</span>
                          <span>•</span>
                          <span>4.8★</span>
                        </div>
                        <span className="text-sm font-medium text-primary">Free</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-stone-200 dark:border-gray-700 px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h1>
      </header>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="space-y-6">
          {/* User Profile Section */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="h-20 w-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Guest User
              </h2>
              <p className="text-stone-600 dark:text-gray-400 text-sm mb-4">
                Sign in to save your preferences and favorites
              </p>
              <button className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors">
                Sign In
              </button>
            </div>
          </section>

          {/* Quick Stats */}
          <section>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                <div className="text-xs text-stone-600 dark:text-gray-400">Tours Completed</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                <div className="text-xs text-stone-600 dark:text-gray-400">Favorites</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                <div className="text-xs text-stone-600 dark:text-gray-400">Hours Listened</div>
              </div>
            </div>
          </section>

          {/* Settings Menu */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
            <div className="space-y-2">
              {[
                { icon: '🌐', label: 'Language', value: 'Italian', href: '/settings/language' },
                { icon: '🎧', label: 'Audio Quality', value: 'High', href: '/settings/audio' },
                {
                  icon: '📍',
                  label: 'Location Services',
                  value: 'Enabled',
                  href: '/settings/location',
                },
                {
                  icon: '💾',
                  label: 'Offline Downloads',
                  value: '2.3 GB',
                  href: '/settings/downloads',
                },
                {
                  icon: '🔔',
                  label: 'Notifications',
                  value: 'On',
                  href: '/settings/notifications',
                },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl hover:bg-stone-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-stone-600 dark:text-gray-400">{item.value}</span>
                    <svg
                      className="h-5 w-5 text-stone-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Support & Legal */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Support & Legal
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Help & Support', href: '/support' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'About MyAudioG', href: '/about' },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl hover:bg-stone-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                  <svg
                    className="h-5 w-5 text-stone-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </section>

          {/* App Version */}
          <div className="text-center pt-4">
            <p className="text-xs text-stone-500 dark:text-gray-500">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

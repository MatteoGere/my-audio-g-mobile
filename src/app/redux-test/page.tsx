'use client';

import React from 'react';
import { useAppSelector, useAppDispatch, userPreferencesActions } from '@/lib/redux';

export default function ReduxTest() {
  const language = useAppSelector((state) => state.userPreferences.language);
  const theme = useAppSelector((state) => state.userPreferences.theme);
  const dispatch = useAppDispatch();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Redux Configuration Test</h1>
      <div className="space-y-4">
        <div>
          <p>Current Language: {language}</p>
          <button
            className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => dispatch(userPreferencesActions.setLanguage('en'))}
          >
            Set English
          </button>
          <button
            className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => dispatch(userPreferencesActions.setLanguage('it'))}
          >
            Set Italian
          </button>
        </div>
        <div>
          <p>Current Theme: {theme}</p>
          <button
            className="ml-2 px-3 py-1 bg-gray-500 text-white rounded"
            onClick={() => dispatch(userPreferencesActions.setTheme('dark'))}
          >
            Dark Theme
          </button>
          <button
            className="ml-2 px-3 py-1 bg-yellow-500 text-white rounded"
            onClick={() => dispatch(userPreferencesActions.setTheme('light'))}
          >
            Light Theme
          </button>
        </div>
      </div>
    </div>
  );
}

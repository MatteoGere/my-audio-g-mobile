'use client';

import React from 'react';
import { useAppSelector, useAppDispatch, userPreferencesActions } from '@/lib/redux';
import { useI18n } from '@/i18n/I18nProvider';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';

export default function ReduxTest() {
  const language = useAppSelector((state) => state.userPreferences.language);
  const theme = useAppSelector((state) => state.userPreferences.theme);
  const dispatch = useAppDispatch();
  const { t } = useI18n();

  // For debugging: show the current theme class on document.documentElement
  const [themeClass, setThemeClass] = React.useState('');
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      setThemeClass(document.documentElement.className);
    }
  }, [theme]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card variant="elevated" padding="lg" className="max-w-md w-full">
        <CardHeader>
          <h1 className="text-2xl font-bold mb-4">{t('reduxTest.title')}</h1>
        </CardHeader>
        <CardBody className="space-y-6">
          <div>
            <p className="mb-2">
              {t('reduxTest.currentLanguage')}: <span className="font-mono">{language}</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => dispatch(userPreferencesActions.setLanguage('en'))}
              >
                {t('reduxTest.setEnglish')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => dispatch(userPreferencesActions.setLanguage('it'))}
              >
                {t('reduxTest.setItalian')}
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-2">
              {t('reduxTest.currentTheme')}: <span className="font-mono">{theme}</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => dispatch(userPreferencesActions.setTheme('dark'))}
              >
                {t('reduxTest.darkTheme')}
              </Button>
              <Button
                variant="accent"
                onClick={() => dispatch(userPreferencesActions.setTheme('light'))}
              >
                {t('reduxTest.lightTheme')}
              </Button>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {t('reduxTest.themeClass')}: <span className="font-mono">{themeClass}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

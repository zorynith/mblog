import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useFetcher } from '@remix-run/react';

const ThemeSwitcher = () => {
  const fetcher = useFetcher();

  useEffect(() => {
    const root = window.document.documentElement;
    if (fetcher.data?.theme) {
      root.classList.remove('light', 'dark');
      root.classList.add(fetcher.data.theme);
    }
  }, [fetcher.data?.theme]);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    fetcher.submit(
      { theme: newTheme },
      { method: 'post', action: '/api/change-theme' }
    );
  };

  return (
    <Button onClick={toggleTheme} variant="outline" size="icon">
      {fetcher.data?.theme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">切换主题</span>
    </Button>
  );
};

export default ThemeSwitcher;

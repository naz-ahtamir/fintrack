'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative w-10 h-10 rounded-lg flex items-center justify-center',
        'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800',
        'transition-all duration-200',
        'border border-zinc-200 dark:border-zinc-800'
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'dark' ? (
        <Moon className="w-5 h-5 text-zinc-400" />
      ) : (
        <Sun className="w-5 h-5 text-zinc-700" />
      )}
    </button>
  );
}

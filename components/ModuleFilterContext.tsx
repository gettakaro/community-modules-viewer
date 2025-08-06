'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ModuleFilters {
  category: string;
  author: string;
  supportedGame: string;
}

interface ModuleFilterContextType {
  filters: ModuleFilters;
  setFilters: (filters: Partial<ModuleFilters>) => void;
  clearFilters: () => void;
}

const defaultFilters: ModuleFilters = {
  category: 'all',
  author: 'all',
  supportedGame: 'all',
};

const ModuleFilterContext = createContext<ModuleFilterContextType | undefined>(
  undefined,
);

export function ModuleFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize from localStorage if available
  const [filters, setFiltersState] = useState<ModuleFilters>(() => {
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('module-filters');
      if (savedFilters) {
        try {
          const parsed = JSON.parse(savedFilters);
          return { ...defaultFilters, ...parsed };
        } catch {
          // Ignore invalid JSON
        }
      }
    }
    return defaultFilters;
  });

  // Save to localStorage when filters change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('module-filters', JSON.stringify(filters));
    }
  }, [filters]);

  const setFilters = (newFilters: Partial<ModuleFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFiltersState(defaultFilters);
  };

  return (
    <ModuleFilterContext.Provider value={{ filters, setFilters, clearFilters }}>
      {children}
    </ModuleFilterContext.Provider>
  );
}

export function useModuleFilter() {
  const context = useContext(ModuleFilterContext);
  if (!context) {
    throw new Error(
      'useModuleFilter must be used within a ModuleFilterProvider',
    );
  }
  return context;
}

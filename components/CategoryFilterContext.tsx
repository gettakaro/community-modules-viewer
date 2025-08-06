'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CategoryFilterContextType {
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
}

const CategoryFilterContext = createContext<
  CategoryFilterContextType | undefined
>(undefined);

export function CategoryFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize with default value
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFilter = localStorage.getItem('module-category-filter');
      if (savedFilter) {
        setCategoryFilter(savedFilter);
      }
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage when filter changes (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('module-category-filter', categoryFilter);
    }
  }, [categoryFilter, isHydrated]);

  return (
    <CategoryFilterContext.Provider
      value={{ categoryFilter, setCategoryFilter }}
    >
      {children}
    </CategoryFilterContext.Provider>
  );
}

export function useCategoryFilter() {
  const context = useContext(CategoryFilterContext);
  if (!context) {
    throw new Error(
      'useCategoryFilter must be used within a CategoryFilterProvider',
    );
  }
  return context;
}

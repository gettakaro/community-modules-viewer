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
  // Initialize from localStorage if available
  const [categoryFilter, setCategoryFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedFilter = localStorage.getItem('module-category-filter');
      return savedFilter || 'all';
    }
    return 'all';
  });

  // Save to localStorage when filter changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('module-category-filter', categoryFilter);
    }
  }, [categoryFilter]);

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

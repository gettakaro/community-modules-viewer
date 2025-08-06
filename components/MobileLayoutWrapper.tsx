'use client';

import React, { useState } from 'react';
import { ModuleSidebar, MobileMenuButton } from '@/components/ModuleSidebar';
import { ModuleWithMeta } from '@/lib/types';
import {
  CategoryFilterProvider,
  useCategoryFilter,
} from './CategoryFilterContext';

export interface MobileLayoutWrapperProps {
  modules: ModuleWithMeta[];
  selectedModule?: string;
  children: React.ReactNode;
}

function MobileLayoutWrapperInner({
  modules,
  selectedModule,
  children,
}: MobileLayoutWrapperProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { categoryFilter, setCategoryFilter } = useCategoryFilter();

  return (
    <div className="min-h-screen bg-takaro-background overflow-x-hidden">
      {/* Mobile Menu Button */}
      <MobileMenuButton
        isOpen={isMobileOpen}
        onToggle={() => setIsMobileOpen(!isMobileOpen)}
      />

      {/* Sidebar */}
      <ModuleSidebar
        modules={modules}
        selectedModule={selectedModule}
        isMobileOpen={isMobileOpen}
        onMobileToggle={setIsMobileOpen}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
      />

      {/* Main Content Area */}
      <div className="main-content-with-sidebar">{children}</div>
    </div>
  );
}

export function MobileLayoutWrapper(props: MobileLayoutWrapperProps) {
  return (
    <CategoryFilterProvider>
      <MobileLayoutWrapperInner {...props} />
    </CategoryFilterProvider>
  );
}

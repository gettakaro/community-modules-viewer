'use client';

import { useState } from 'react';
import { ModuleSidebar, MobileMenuButton } from '@/components/ModuleSidebar';
import { ModuleWithMeta } from '@/lib/types';

export interface MobileLayoutWrapperProps {
  modules: ModuleWithMeta[];
  selectedModule?: string;
  children: React.ReactNode;
}

export function MobileLayoutWrapper({
  modules,
  selectedModule,
  children,
}: MobileLayoutWrapperProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-takaro-background">
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
      />

      {/* Main Content Area */}
      <div className="main-content-with-sidebar">{children}</div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiArrowRight, FiSearch, FiPackage, FiChevronDown, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import { ModuleData } from "../../../utils/modules";

interface ModuleSidebarProps {
  allModules: ModuleData[];
  currentModuleName: string;
}

// Custom hook for safely working with localStorage in Next.js
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // Initialize on client-side only
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log("Error reading localStorage:", error);
    }
  }, [key]);
  
  // Return a wrapped version of useState's setter function
  const setValue = (value: T) => {
    try {
      // Save state
      setStoredValue(value);
      // Save to localStorage if on client
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.log("Error saving to localStorage:", error);
    }
  };
  
  return [storedValue, setValue];
}

export default function ModuleSidebar({
  allModules,
  currentModuleName,
}: ModuleSidebarProps) {
  // Client-side only indicator
  const [mounted, setMounted] = useState(false);
  
  // State for module search
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredModules, setFilteredModules] = useState<{
    builtin: ModuleData[];
    community: ModuleData[];
  }>({
    builtin: [],
    community: []
  });
  
  // State for sidebar collapse with safe localStorage
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>("moduleSidebarCollapsed", false);
  
  // State for section collapse
  const [isBuiltinSectionCollapsed, setIsBuiltinSectionCollapsed] = useLocalStorage<boolean>("builtinSectionCollapsed", false);
  const [isCommunityModulesSectionCollapsed, setIsCommunityModulesSectionCollapsed] = useLocalStorage<boolean>("communitySectionCollapsed", false);

  // Set mounted to true after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter and categorize modules
  useEffect(() => {
    const filtered = allModules.filter(
      (module) =>
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (module.description &&
          module.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Separate built-in and community modules
    const builtinModules = filtered.filter(module => module.isBuiltin);
    const communityModules = filtered.filter(module => !module.isBuiltin);
    
    setFilteredModules({
      builtin: builtinModules,
      community: communityModules
    });
  }, [searchQuery, allModules]);

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Toggle section collapse
  const toggleBuiltinSection = () => {
    setIsBuiltinSectionCollapsed(!isBuiltinSectionCollapsed);
  };

  const toggleCommunityModulesSection = () => {
    setIsCommunityModulesSectionCollapsed(!isCommunityModulesSectionCollapsed);
  };

  // Render module list item
  const renderModuleItem = (module: ModuleData) => (
    <Link
      key={module.name}
      href={`/module/${module.name}`}
      className={`flex items-center px-3 py-2 rounded-md text-sm ${
        module.name === currentModuleName
          ? "bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary font-medium"
          : "text-text dark:text-dark-text hover:bg-background-alt dark:hover:bg-dark-background-alt"
      }`}
    >
      <FiPackage className="mr-2 h-4 w-4" />
      <span className="truncate">{module.name}</span>
    </Link>
  );

  // Render module icon-only item (for collapsed sidebar)
  const renderModuleIconItem = (module: ModuleData) => (
    <Link
      key={module.name}
      href={`/module/${module.name}`}
      title={module.name}
      className={`flex items-center justify-center p-2 rounded-md ${
        module.name === currentModuleName
          ? "bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary"
          : "text-text dark:text-dark-text hover:bg-background-alt dark:hover:bg-dark-background-alt"
      }`}
    >
      <FiPackage className="h-5 w-5" />
    </Link>
  );

  // Return a placeholder during server-side rendering to prevent hydration issues
  if (!mounted) {
    return (
      <div
        className="w-64 min-w-64 flex-shrink-0 bg-placeholder dark:bg-dark-placeholder h-screen sticky top-0 overflow-y-auto border-r border-background-alt/20 dark:border-dark-background-alt/20 p-4"
      ></div>
    );
  }

  return (
    <div
      className={`${
        isCollapsed ? "w-16 min-w-16" : "w-64 min-w-64"
      } flex-shrink-0 bg-placeholder dark:bg-dark-placeholder h-screen sticky top-0 overflow-y-auto border-r border-background-alt/20 dark:border-dark-background-alt/20 p-4 transition-all duration-300`}
    >
      <button
        onClick={toggleSidebar}
        className="inline-flex items-center justify-center text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary mb-6 group w-full"
      >
        {isCollapsed ? (
          <FiArrowRight className="h-5 w-5 group-hover:transform group-hover:translate-x-1 transition-transform" />
        ) : (
          <>
            <FiArrowLeft className="mr-2 h-5 w-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Collapse Sidebar</span>
          </>
        )}
      </button>

      {/* Search Bar - Only show when expanded */}
      {!isCollapsed && (
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-4 w-4 text-text-alt dark:text-dark-text-alt" />
          </div>
          <input
            type="text"
            placeholder="Search modules..."
            className="pl-10 pr-4 py-2 w-full bg-background-alt dark:bg-dark-background-alt border-none rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Module List - Expanded view */}
      {!isCollapsed ? (
        <div className="space-y-4">
          {/* Built-in Modules Section */}
          <div>
            <button
              onClick={toggleBuiltinSection}
              className="w-full flex items-center justify-between font-medium text-text-alt dark:text-dark-text-alt text-sm uppercase tracking-wider mb-2"
            >
              <span>Built-in ({filteredModules.builtin.length})</span>
              {isBuiltinSectionCollapsed ? (
                <FiChevronRight className="h-4 w-4" />
              ) : (
                <FiChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {!isBuiltinSectionCollapsed && (
              <div className="space-y-1 mb-2">
                {filteredModules.builtin.map(renderModuleItem)}
                {filteredModules.builtin.length === 0 && (
                  <div className="px-3 py-2 text-sm text-text-alt dark:text-dark-text-alt">
                    No built-in modules found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Community Modules Section */}
          <div>
            <button
              onClick={toggleCommunityModulesSection}
              className="w-full flex items-center justify-between font-medium text-text-alt dark:text-dark-text-alt text-sm uppercase tracking-wider mb-2"
            >
              <span>Community ({filteredModules.community.length})</span>
              {isCommunityModulesSectionCollapsed ? (
                <FiChevronRight className="h-4 w-4" />
              ) : (
                <FiChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {!isCommunityModulesSectionCollapsed && (
              <div className="space-y-1">
                {filteredModules.community.map(renderModuleItem)}
                {filteredModules.community.length === 0 && (
                  <div className="px-3 py-2 text-sm text-text-alt dark:text-dark-text-alt">
                    No community modules found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Icons-only view when collapsed */
        <div className="flex flex-col items-center space-y-3">
          {/* Built-in Modules (icons only) */}
          <div className="w-full flex flex-col items-center">
            <div className="w-full border-b border-background-alt/20 dark:border-dark-background-alt/20 mb-2 pb-1 flex justify-center">
              <span className="text-xs text-text-alt dark:text-dark-text-alt uppercase">Built-in</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              {filteredModules.builtin.map(renderModuleIconItem)}
            </div>
          </div>
          
          {/* Community Modules (icons only) */}
          <div className="w-full flex flex-col items-center">
            <div className="w-full border-b border-background-alt/20 dark:border-dark-background-alt/20 mb-2 pb-1 flex justify-center">
              <span className="text-xs text-text-alt dark:text-dark-text-alt uppercase">Community</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              {filteredModules.community.map(renderModuleIconItem)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
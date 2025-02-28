'use client';

import { useState, useEffect } from 'react';
import { getModules } from '../utils/modules';
import Link from 'next/link';
import { FiSearch, FiTag, FiCommand, FiHelpCircle, FiArrowRight, FiBox, FiZap, FiMessageSquare, FiClock, FiCopy, FiCheck } from 'react-icons/fi';

export default function Page() {
  const [modules, setModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [copyStatus, setCopyStatus] = useState({}); // Track copy status for each module
  
  useEffect(() => {
    async function loadModules() {
      try {
        const modulesData = await getModules();
        setModules(modulesData);
      } catch (error) {
        console.error("Failed to load modules:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadModules();
  }, []);
  
  // Filter modules based on search term
  const filteredModules = modules.filter(module => 
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Function to get module type icon - prioritizes display based on what the module contains most of
  const getModuleTypeIcon = (module) => {
    // Count component types
    const hookCount = module.hooks?.length || 0;
    const commandCount = module.commands?.length || 0;
    const cronJobCount = module.cronJobs?.length || 0;
    
    // Determine which to display based on what the module has most of
    if (hookCount >= commandCount && hookCount >= cronJobCount && hookCount > 0) {
      return <FiMessageSquare className="w-4 h-4" />;
    } else if (commandCount >= hookCount && commandCount >= cronJobCount && commandCount > 0) {
      return <FiCommand className="w-4 h-4" />;
    } else if (cronJobCount > 0) {
      return <FiClock className="w-4 h-4" />;
    }
    
    // Default icon if no components or equal counts
    return <FiBox className="w-4 h-4" />;
  };
  
  // Function to get feature count badge
  const getFeatureBadge = (count, type) => {
    if (!count || count === 0) return null;
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-background-alt dark:bg-dark-background-alt text-text-alt dark:text-dark-text-alt">
        {count} {type}{count !== 1 ? 's' : ''}
      </span>
    );
  };

  // Function to copy module JSON to clipboard
  const copyModuleJson = (module, e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    const moduleJson = JSON.stringify(module, null, 2);
    navigator.clipboard.writeText(moduleJson).then(() => {
      // Set success status for this specific module
      setCopyStatus({ ...copyStatus, [module.name]: true });
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setCopyStatus({ ...copyStatus, [module.name]: false });
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy module JSON:', err);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 bg-background dark:bg-dark-background">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary dark:text-dark-primary mb-4 md:mb-0">
          Community Modules
        </h1>
        
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="w-4 h-4 text-text-alt dark:text-dark-text-alt" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-alt dark:bg-dark-background-alt border border-background-alt dark:border-dark-background-alt focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary dark:bg-dark-primary text-background dark:text-dark-background' : 'bg-background-alt dark:bg-dark-background-alt'}`}
              aria-label="Grid View"
            >
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary dark:bg-dark-primary text-background dark:text-dark-background' : 'bg-background-alt dark:bg-dark-background-alt'}`}
              aria-label="List View"
            >
              <div className="flex flex-col space-y-1">
                <div className="w-6 h-1 bg-current rounded-sm"></div>
                <div className="w-6 h-1 bg-current rounded-sm"></div>
                <div className="w-6 h-1 bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {filteredModules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FiHelpCircle className="w-16 h-16 text-text-alt dark:text-dark-text-alt mb-4" />
          <h2 className="text-xl font-semibold mb-2">No modules found</h2>
          <p className="text-text-alt dark:text-dark-text-alt mb-4">
            We couldn't find any modules matching your search.
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-primary dark:text-dark-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <Link 
              href={`/module/${module.name}`}
              key={module.name}
              className="group"
            >
              <div className="h-full bg-placeholder dark:bg-dark-placeholder rounded-lg p-6 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border border-background-alt/20 dark:border-dark-background-alt/20 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary">
                      {getModuleTypeIcon(module)}
                    </div>
                    <h2 className="text-lg font-bold text-text dark:text-dark-text truncate">
                      {module.name}
                    </h2>
                  </div>
                </div>
                
                <p className="text-sm text-text-alt dark:text-dark-text-alt mb-4 line-clamp-2 flex-grow">
                  {module.description || "No description available"}
                </p>
                
                {module.versions && module.versions.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {module.versions.map((version, index) => (
                        <div key={index} className="inline-flex items-center gap-1">
                          <FiTag className="w-3 h-3 text-primary dark:text-dark-primary" />
                          <span className="text-xs text-text-alt dark:text-dark-text-alt">
                            {version.tag || "untagged"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-background-alt/10 dark:border-dark-background-alt/10">
                  {getFeatureBadge(module.hooks?.length, "hook")}
                  {getFeatureBadge(module.commands?.length, "command")}
                  {getFeatureBadge(module.cronJobs?.length, "cron job")}
                  {getFeatureBadge(module.functions?.length, "function")}
                </div>
                
                <div className="flex justify-between items-center mt-4 text-xs">
                  <span className="text-primary dark:text-dark-primary font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
                    View details <FiArrowRight className="w-3 h-3" />
                  </span>
                  
                  <button 
                    onClick={(e) => copyModuleJson(module, e)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-background-alt dark:bg-dark-background-alt hover:bg-primary/10 dark:hover:bg-dark-primary/10 transition-colors duration-200"
                    title="Copy module JSON"
                    aria-label="Copy module JSON"
                  >
                    {copyStatus[module.name] ? (
                      <>
                        <FiCheck className="w-3 h-3 text-green-500" />
                        <span className="text-xs">Copied</span>
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-3 h-3 text-primary dark:text-dark-primary" />
                        <span className="text-xs">Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // List View
        <div className="flex flex-col gap-3">
          {filteredModules.map((module) => (
            <Link 
              href={`/module/${module.name}`}
              key={module.name}
              className="group"
            >
              <div className="bg-placeholder dark:bg-dark-placeholder rounded-lg p-4 shadow hover:shadow-md transition-all duration-200 border border-background-alt/20 dark:border-dark-background-alt/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary">
                      {getModuleTypeIcon(module)}
                    </div>
                    
                    <div>
                      <h2 className="text-base font-bold text-text dark:text-dark-text">
                        {module.name}
                      </h2>
                      <p className="text-sm text-text-alt dark:text-dark-text-alt line-clamp-1">
                        {module.description || "No description available"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                      {module.versions && module.versions.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FiTag className="w-3 h-3 text-primary dark:text-dark-primary" />
                          <span className="text-xs text-text-alt dark:text-dark-text-alt">
                            {module.versions.map(v => v.tag).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {module.hooks?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-text-alt dark:text-dark-text-alt">
                          <FiMessageSquare className="w-3 h-3" /> {module.hooks.length}
                        </span>
                      )}
                      {module.commands?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-text-alt dark:text-dark-text-alt">
                          <FiCommand className="w-3 h-3" /> {module.commands.length}
                        </span>
                      )}
                      {module.cronJobs?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-text-alt dark:text-dark-text-alt">
                          <FiClock className="w-3 h-3" /> {module.cronJobs.length}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={(e) => copyModuleJson(module, e)}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-background-alt dark:bg-dark-background-alt hover:bg-primary/10 dark:hover:bg-dark-primary/10 transition-colors duration-200"
                      title="Copy module JSON"
                      aria-label="Copy module JSON"
                    >
                      {copyStatus[module.name] ? (
                        <>
                          <FiCheck className="w-3 h-3 text-green-500" />
                          <span className="text-xs">Copied</span>
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-3 h-3 text-primary dark:text-dark-primary" />
                          <span className="text-xs">Copy JSON</span>
                        </>
                      )}
                    </button>
                    
                    <FiArrowRight className="w-4 h-4 text-primary dark:text-dark-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center text-text-alt dark:text-dark-text-alt">
        Showing {filteredModules.length} of {modules.length} modules
      </div>
    </main>
  );
}
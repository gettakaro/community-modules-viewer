'use client';

import { useState, useEffect } from 'react';
import { FiTag, FiCommand, FiMessageSquare, FiClock, FiCode, FiChevronDown, FiChevronRight, FiLock, FiArrowLeft, FiSearch, FiPackage, FiCopy, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModuleData } from '../../../utils/modules';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css'; // You can choose a different theme

// Initialize Prism
if (typeof window !== 'undefined') {
  Prism.manual = true;
}

export function ModuleDetails({ moduleData, allModules }: { moduleData: ModuleData, allModules: ModuleData[] }) {
  const router = useRouter();
  // State for the currently selected version
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  
  // State for module search
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredModules, setFilteredModules] = useState(allModules);
  
  // State for copy confirmation
  const [copied, setCopied] = useState(false);
  
  // Update filtered modules when search query changes
  useEffect(() => {
    const filtered = allModules.filter(module => 
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (module.description && module.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredModules(filtered);
  }, [searchQuery, allModules]);
  
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    config: true,
    hooks: true,
    commands: true,
    cronJobs: true,
    functions: true,
    permissions: true
  });

  // Function to toggle a section's expanded state
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get the currently selected version
  const selectedVersion = moduleData.versions[selectedVersionIndex];
  
  // Parse config schema if it exists
  let configSchema = null;
  if (selectedVersion.configSchema) {
    try {
      configSchema = JSON.parse(selectedVersion.configSchema);
    } catch (e) {
      console.error("Failed to parse config schema:", e);
    }
  }

  // Function to copy module data as JSON
  const copyModuleAsJson = () => {
    const moduleJson = JSON.stringify(
      {
        name: moduleData.name,
        description: moduleData.description,
        version: selectedVersion
      }, 
      null, 
      2
    );
    
    navigator.clipboard.writeText(moduleJson)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Helper function to render code blocks with syntax highlighting
  const renderCode = (code: string) => {
    // Use useEffect to apply syntax highlighting after component mount
    // but we can pre-highlight here for server rendering
    const highlightedCode = typeof window !== 'undefined' 
      ? Prism.highlight(code, Prism.languages.javascript, 'javascript')
      : code;
      
    return (
      <div className="relative group">
        <pre className="bg-background-alt dark:bg-dark-background-alt p-4 rounded-md overflow-x-auto text-sm">
          <code 
            className="language-javascript" 
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
        <button 
          className="absolute top-2 right-2 bg-background dark:bg-dark-background hover:bg-background-alt dark:hover:bg-dark-background-alt p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => navigator.clipboard.writeText(code)}
          aria-label="Copy code"
        >
          <span className="text-xs">Copy</span>
        </button>
      </div>
    );
  };

  return (
    <div className="flex w-full bg-background dark:bg-dark-background">
      {/* Sidebar with Module List */}
      <div className="w-64 min-w-64 flex-shrink-0 bg-placeholder dark:bg-dark-placeholder h-screen sticky top-0 overflow-y-auto border-r border-background-alt/20 dark:border-dark-background-alt/20 p-4">
        <Link href="/" className="inline-flex items-center text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary mb-6 group">
          <FiArrowLeft className="mr-2 h-5 w-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        
        {/* Search Bar */}
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
        
        {/* Module List */}
        <h3 className="font-medium text-text-alt dark:text-dark-text-alt text-sm uppercase tracking-wider mb-3">
          Modules ({filteredModules.length})
        </h3>
        <div className="space-y-1">
          {filteredModules.map((module) => (
            <Link
              key={module.name}
              href={`/module/${module.name}`}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                module.name === moduleData.name
                  ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary font-medium'
                  : 'text-text dark:text-dark-text hover:bg-background-alt dark:hover:bg-dark-background-alt'
              }`}
            >
              <FiPackage className="mr-2 h-4 w-4" />
              <span className="truncate">{module.name}</span>
            </Link>
          ))}
          {filteredModules.length === 0 && (
            <div className="px-3 py-2 text-sm text-text-alt dark:text-dark-text-alt">
              No modules found
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 container px-4 py-8  w-10/12">
        {/* Module Title, Version Selector, and Copy JSON Button */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-text dark:text-dark-text">{moduleData.name}</h1>
            
            {/* Copy JSON Button - Prominent placement */}
            <button
              onClick={copyModuleAsJson}
              className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90 text-white rounded-md transition-colors"
              aria-label="Copy module data as JSON"
            >
              {copied ? (
                <>
                  <FiCheck className="mr-2 h-5 w-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="mr-2 h-5 w-5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Version selector */}
            <div className="relative inline-block">
              <select 
                className="bg-placeholder dark:bg-dark-placeholder border border-background-alt/20 dark:border-dark-background-alt/20 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary text-text dark:text-dark-text"
                value={selectedVersionIndex}
                onChange={(e) => setSelectedVersionIndex(Number(e.target.value))}
              >
                {moduleData.versions.map((version, index) => (
                  <option key={index} value={index}>
                    Version: {version.tag || 'untagged'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Module description */}
          <div className="bg-placeholder dark:bg-dark-placeholder rounded-lg p-6 shadow-sm mb-8 border border-background-alt/20 dark:border-dark-background-alt/20">
            <h2 className="text-xl font-semibold mb-3 text-text dark:text-dark-text">Description</h2>
            <p className="text-text dark:text-dark-text">
              {selectedVersion.description || moduleData.description || "No description available"}
            </p>
          </div>
        </div>

        {/* Config Schema Section */}
        {configSchema && configSchema.properties && (
          <div className="bg-placeholder dark:bg-dark-placeholder rounded-lg p-6 shadow-sm mb-8 border border-background-alt/20 dark:border-dark-background-alt/20">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('config')}
            >
              <div className="flex items-center">
                <FiCode className="mr-2 h-5 w-5 text-primary dark:text-dark-primary" />
                <h2 className="text-xl font-semibold text-text dark:text-dark-text">Configuration Options</h2>
              </div>
              {expandedSections.config ? 
                <FiChevronDown className="h-5 w-5 text-text-alt dark:text-dark-text-alt" /> : 
                <FiChevronRight className="h-5 w-5 text-text-alt dark:text-dark-text-alt" />
              }
            </button>
            
            {expandedSections.config && (
              <div className="mt-4 space-y-6">
                {Object.entries(configSchema.properties).map(([key, prop]: [string, any]) => (
                  <div key={key} className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-4 last:border-0">
                    <div className="font-bold text-lg mb-1 text-text dark:text-dark-text">{prop.title || key}</div>
                    {prop.description && (
                      <p className="text-text-alt dark:text-dark-text-alt mb-2">{prop.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-background-alt dark:bg-dark-background-alt px-2 py-1 rounded text-sm text-text-alt dark:text-dark-text-alt">
                        Type: {prop.type}
                      </span>
                      {prop.default !== undefined && (
                        <span className="bg-background-alt dark:bg-dark-background-alt px-2 py-1 rounded text-sm text-text-alt dark:text-dark-text-alt">
                          Default: {JSON.stringify(prop.default)}
                        </span>
                      )}
                    </div>
                    {prop.enum && (
                      <div className="mt-2">
                        <div className="font-medium text-sm text-text-alt dark:text-dark-text-alt mb-1">Allowed values:</div>
                        <div className="flex flex-wrap gap-2">
                          {prop.enum.map((value: any) => (
                            <span
                              key={value}
                              className="bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary px-2 py-1 rounded text-sm"
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Commands Section */}
        {selectedVersion.commands && selectedVersion.commands.length > 0 && (
          <div className="bg-placeholder dark:bg-dark-placeholder rounded-lg p-6 shadow-sm mb-8 border border-background-alt/20 dark:border-dark-background-alt/20">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('commands')}
            >
              <div className="flex items-center">
                <FiCommand className="mr-2 h-5 w-5 text-primary dark:text-dark-primary" />
                <h2 className="text-xl font-semibold text-text dark:text-dark-text">Commands ({selectedVersion.commands.length})</h2>
              </div>
              {expandedSections.commands ? 
                <FiChevronDown className="h-5 w-5 text-text-alt dark:text-dark-text-alt" /> : 
                <FiChevronRight className="h-5 w-5 text-text-alt dark:text-dark-text-alt" />
              }
            </button>
            
            {expandedSections.commands && (
              <div className="mt-4 space-y-6">
                {selectedVersion.commands.map((command, index) => (
                  <div key={index} className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-6 last:border-0">
                    <div className="font-mono text-primary dark:text-dark-primary text-lg mb-1">
                      {command.trigger}
                    </div>
                    <div className="text-xl font-medium mb-2 text-text dark:text-dark-text">{command.name}</div>
                    {command.helpText && (
                      <p className="text-text-alt dark:text-dark-text-alt mb-4">{command.helpText}</p>
                    )}
                    <div className="mt-3">
                      <h4 className="font-medium mb-2 text-text dark:text-dark-text">Implementation:</h4>
                      {renderCode(command.function)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hooks Section */}
        {selectedVersion.hooks && selectedVersion.hooks.length > 0 && (
          <div className="bg-placeholder dark:bg-dark-placeholder rounded-lg p-6 shadow-sm mb-8 border border-background-alt/20 dark:border-dark-background-alt/20">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('hooks')}
            >
              <div className="flex items-center">
                <FiMessageSquare className="mr-2 h-5 w-5 text-primary dark:text-dark-primary" />
                <h2 className="text-xl font-semibold text-text dark:text-dark-text">Hooks ({selectedVersion.hooks.length})</h2>
              </div>
              {expandedSections.hooks ? 
                <FiChevronDown className="h-5 w-5 text-text-alt dark:text-dark-text-alt" /> : 
                <FiChevronRight className="h-5 w-5 text-text-alt dark:text-dark-text-alt" />
              }
            </button>
            
            {expandedSections.hooks && (
              <div className="mt-4 space-y-6">
                {selectedVersion.hooks.map((hook, index) => (
                  <div key={index} className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-6 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-xl font-medium text-text dark:text-dark-text">{hook.name}</div>
                      <span className="bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary px-2 py-0.5 rounded text-sm">
                        {hook.eventType}
                      </span>
                    </div>
                    <div className="mt-3">
                      <h4 className="font-medium mb-2 text-text dark:text-dark-text">Implementation:</h4>
                      {renderCode(hook.function)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cron Jobs Section */}
        {selectedVersion.cronJobs && selectedVersion.cronJobs.length > 0 && (
          <div className="bg-placeholder dark:bg-dark-placeholder rounded-lg p-6 shadow-sm mb-8 border border-background-alt/20 dark:border-dark-background-alt/20">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('cronJobs')}
            >
              <div className="flex items-center">
                <FiClock className="mr-2 h-5 w-5 text-primary dark:text-dark-primary" />
                <h2 className="text-xl font-semibold text-text dark:text-dark-text">Cron Jobs ({selectedVersion.cronJobs.length})</h2>
              </div>
              {expandedSections.cronJobs ? 
                <FiChevronDown className="h-5 w-5 text-text-alt dark:text-dark-text-alt" /> : 
                <FiChevronRight className="h-5 w-5 text-text-alt dark:text-dark-text-alt" />
              }
            </button>
            
            {expandedSections.cronJobs && (
              <div className="mt-4 space-y-6">
                {selectedVersion.cronJobs.map((cronJob, index) => (
                  <div key={index} className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-6 last:border-0">
                    <div className="text-xl font-medium mb-1 text-text dark:text-dark-text">{cronJob.name}</div>
                    <div className="font-mono text-sm bg-background-alt dark:bg-dark-background-alt px-2 py-1 rounded-md inline-block mb-3 text-text-alt dark:text-dark-text-alt">
                      Schedule: {cronJob.schedule}
                    </div>
                    <div className="mt-3">
                      <h4 className="font-medium mb-2 text-text dark:text-dark-text">Implementation:</h4>
                      {renderCode(cronJob.function)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Functions Section */}
        {selectedVersion.functions && selectedVersion.functions.length > 0 && (
          <div className="bg-placeholder dark:bg-dark-placeholder rounded-lg p-6 shadow-sm mb-8 border border-background-alt/20 dark:border-dark-background-alt/20">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('functions')}
            >
              <div className="flex items-center">
                <FiCode className="mr-2 h-5 w-5 text-primary dark:text-dark-primary" />
                <h2 className="text-xl font-semibold text-text dark:text-dark-text">Functions ({selectedVersion.functions.length})</h2>
              </div>
              {expandedSections.functions ? 
                <FiChevronDown className="h-5 w-5 text-text-alt dark:text-dark-text-alt" /> : 
                <FiChevronRight className="h-5 w-5 text-text-alt dark:text-dark-text-alt" />
              }
            </button>
            
            {expandedSections.functions && (
              <div className="mt-4 space-y-6">
                {selectedVersion.functions.map((func, index) => (
                  <div key={index} className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-6 last:border-0">
                    <div className="text-xl font-medium mb-3 text-text dark:text-dark-text">{func.name}</div>
                    <div>
                      <h4 className="font-medium mb-2 text-text dark:text-dark-text">Implementation:</h4>
                      {renderCode(func.function)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Permissions Section */}
        {selectedVersion.permissions && selectedVersion.permissions.length > 0 && (
          <div className="bg-placeholder dark:bg-dark-placeholder rounded-lg p-6 shadow-sm border border-background-alt/20 dark:border-dark-background-alt/20">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('permissions')}
            >
              <div className="flex items-center">
                <FiLock className="mr-2 h-5 w-5 text-primary dark:text-dark-primary" />
                <h2 className="text-xl font-semibold text-text dark:text-dark-text">Permissions ({selectedVersion.permissions.length})</h2>
              </div>
              {expandedSections.permissions ? 
                <FiChevronDown className="h-5 w-5 text-text-alt dark:text-dark-text-alt" /> : 
                <FiChevronRight className="h-5 w-5 text-text-alt dark:text-dark-text-alt" />
              }
            </button>
            
            {expandedSections.permissions && (
              <div className="mt-4 space-y-4">
                {selectedVersion.permissions.map((permission, index) => (
                  <div key={index} className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-4 last:border-0">
                    <div className="text-lg font-medium mb-1 text-text dark:text-dark-text">{permission.name}</div>
                    {permission.description && (
                      <p className="text-text-alt dark:text-dark-text-alt">{permission.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
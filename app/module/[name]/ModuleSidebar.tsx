"use client";

import { useState, useEffect } from "react";
import { FiArrowLeft, FiSearch, FiPackage } from "react-icons/fi";
import Link from "next/link";
import { ModuleData } from "../../../utils/modules";

interface ModuleSidebarProps {
  allModules: ModuleData[];
  currentModuleName: string;
}

export default function ModuleSidebar({ 
  allModules, 
  currentModuleName 
}: ModuleSidebarProps) {
  // State for module search
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredModules, setFilteredModules] = useState(allModules);

  // Update filtered modules when search query changes
  useEffect(() => {
    const filtered = allModules.filter(
      (module) =>
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (module.description &&
          module.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredModules(filtered);
  }, [searchQuery, allModules]);

  return (
    <div className="w-64 min-w-64 flex-shrink-0 bg-placeholder dark:bg-dark-placeholder h-screen sticky top-0 overflow-y-auto border-r border-background-alt/20 dark:border-dark-background-alt/20 p-4">
      <Link
        href="/"
        className="inline-flex items-center text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary mb-6 group"
      >
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
              module.name === currentModuleName
                ? "bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary font-medium"
                : "text-text dark:text-dark-text hover:bg-background-alt dark:hover:bg-dark-background-alt"
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
  );
}
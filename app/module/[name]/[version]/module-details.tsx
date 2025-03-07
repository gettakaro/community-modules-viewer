"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiDownload, FiCheck } from "react-icons/fi";
import { ModuleData } from "../../../../utils/modules";
import ModuleSidebar from "./ModuleSidebar";
import ConfigSection from "./ConfigSection";
import CommandsSection from "./CommandsSection";
import HooksSection from "./HooksSection";
import CronJobsSection from "./CronJobsSection";
import FunctionsSection from "./FunctionsSections";
import PermissionsSection from "./PermissionsSection";
import Markdown from '../../../../utils/markdown';

interface ModuleDetailsProps {
  moduleData: ModuleData;
  allModules: ModuleData[];
  initialVersionIndex?: number;
}

export function ModuleDetails({
  moduleData,
  allModules,
  initialVersionIndex = 0,
}: ModuleDetailsProps) {
  const router = useRouter();
  
  // State for the currently selected version
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(initialVersionIndex);

  // State for copy confirmation
  const [copied, setCopied] = useState(false);

  // Get the currently selected version
  const selectedVersion = moduleData.versions[selectedVersionIndex];
  console.log(selectedVersionIndex)
  // Handle version change
  useEffect(() => {
    console.log('hi')
    // Only navigate if the selected version is different from the current URL
    if (selectedVersion && selectedVersion.tag) {
      const currentUrlPath = window.location.pathname;
      const targetPath = `/module/${moduleData.name}/${selectedVersion.tag}`;
      
      console.log("currentUrlPath", currentUrlPath);
      console.log("targetPath", targetPath);
      // Only push to history if we're actually changing versions
      if (currentUrlPath !== targetPath) {
        router.push(targetPath);
      }
    }
  }, [selectedVersionIndex, moduleData.name, router, selectedVersion]);

  // Parse config schema if it exists
  let configSchema = null;
  if (selectedVersion.configSchema) {
    try {
      configSchema = JSON.parse(selectedVersion.configSchema);
    } catch (e) {
      console.error("Failed to parse config schema:", e);
    }
  }

  // Function to download module data as JSON file
  const downloadModuleAsJson = () => {
    const moduleJson = moduleData.rawData;

    // Create a Blob with the JSON data
    const blob = new Blob([moduleJson], { type: "application/json" });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element for downloading
    const a = document.createElement("a");
    a.href = url;
    a.download = `${moduleData.name}-${selectedVersion.tag || "untagged"}.json`;

    // Append to body, click to trigger download, then clean up
    document.body.appendChild(a);
    a.click();

    // Clean up by removing the anchor and revoking the URL
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Set temporary feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, 0);
  };

  return (
    <div className="flex w-full bg-background dark:bg-dark-background">
      {/* Sidebar with Module List */}
      <ModuleSidebar
        allModules={allModules}
        currentModuleName={moduleData.name}
        currentVersion={selectedVersion.tag}
      />

      {/* Main Content */}
      <div className="flex-grow px-4 py-8 max-w-full overflow-x-auto">
        <div className="container mx-auto">
          {/* Module Title, Version Selector, and Copy JSON Button */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-text dark:text-dark-text">
                {moduleData.name}
              </h1>

              {moduleData.isBuiltin ? (
                <div className="px-4 py-2 bg-primary text-white rounded-md">
                  <span>Built-in module</span>
                </div>
              ) : (
                <button
                  onClick={downloadModuleAsJson}
                  className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90 text-white rounded-md transition-colors"
                  aria-label="Download module data as JSON"
                >
                  {copied ? (
                    <>
                      <FiCheck className="mr-2 h-5 w-5" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <FiDownload className="mr-2 h-5 w-5" />
                      <span>Download JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* Version selector */}
              <div className="relative inline-block">
                <select
                  className="bg-placeholder dark:bg-dark-placeholder border border-background-alt/20 dark:border-dark-background-alt/20 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary text-text dark:text-dark-text"
                  value={selectedVersionIndex}
                  onChange={(e) =>
                    setSelectedVersionIndex(Number(e.target.value))
                  }
                >
                  {moduleData.versions.map((version, index) => (
                    <option key={index} value={index}>
                      Version: {version.tag || "untagged"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rest of the component remains the same */}
            {/* Module description */}
            <div className="bg-placeholder dark:bg-dark-placeholder rounded-lg p-6 shadow-sm mb-8 border border-background-alt/20 dark:border-dark-background-alt/20">
              <h2 className="text-xl font-semibold mb-3 text-text dark:text-dark-text">
                Description
              </h2>
              <Markdown>
                {selectedVersion.description ||
                  moduleData.description ||
                  "No description available"}
              </Markdown>
            </div>
          </div>

          {/* Config Schema Section */}
          {configSchema && configSchema.properties && (
            <ConfigSection configSchema={configSchema} />
          )}

          {/* Commands Section */}
          {selectedVersion.commands && selectedVersion.commands.length > 0 && (
            <CommandsSection commands={selectedVersion.commands} />
          )}

          {/* Hooks Section */}
          {selectedVersion.hooks && selectedVersion.hooks.length > 0 && (
            <HooksSection hooks={selectedVersion.hooks} />
          )}

          {/* Cron Jobs Section */}
          {selectedVersion.cronJobs && selectedVersion.cronJobs.length > 0 && (
            <CronJobsSection cronJobs={selectedVersion.cronJobs} />
          )}

          {/* Functions Section */}
          {selectedVersion.functions && selectedVersion.functions.length > 0 && (
            <FunctionsSection functions={selectedVersion.functions} />
          )}

          {/* Permissions Section */}
          {selectedVersion.permissions &&
            selectedVersion.permissions.length > 0 && (
              <PermissionsSection permissions={selectedVersion.permissions} />
            )}
        </div>
      </div>
    </div>
  );
}

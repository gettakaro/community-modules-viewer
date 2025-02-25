'use client';

import { getModuleByName } from '../../../utils/modules';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import type { ModuleData } from '../../../utils/modules';

export default function ModuleDetailsPage({
  params,
}: {
  params: { name: string };
}) {
  const moduleData = getModuleByName(params.name);
  const [isConfigExpanded, setIsConfigExpanded] = useState(true);

  if (!moduleData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        href="/"
        className="inline-flex items-center text-primary dark:text-dark-primary hover:underline mb-6"
      >
        <span className="mr-2">←</span>
        Back to Modules
      </Link>

      {/* Module Title and Version */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{moduleData.name}</h1>
        <div className="flex items-center gap-3">
          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
            v{moduleData.version}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            by {moduleData.author}
          </span>
          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
            Takaro {moduleData.takaroVersion}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        <p className="text-gray-700 dark:text-gray-300">{moduleData.description}</p>
      </div>

      {/* Commands Section */}
      {moduleData.commands && moduleData.commands.length > 0 && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Available Commands</h2>
          <div className="space-y-4">
            {moduleData.commands.map((command) => (
              <div key={command.trigger} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                <div className="font-mono text-primary dark:text-dark-primary mb-1">
                  {command.trigger}
                </div>
                <div className="text-lg font-medium mb-1">{command.name}</div>
                {command.helpText && (
                  <p className="text-gray-600 dark:text-gray-400">{command.helpText}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Schema */}
      {moduleData.config && Object.keys(moduleData.config).length > 0 && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <button
            className="flex items-center text-xl font-semibold mb-4 w-full text-left"
            onClick={() => setIsConfigExpanded(!isConfigExpanded)}
          >
            <span>Configuration Options</span>
            <span className="ml-2">{isConfigExpanded ? '▼' : '▶'}</span>
          </button>
          
          {isConfigExpanded && (
            <div className="space-y-6">
              {Object.entries(moduleData.config).map(([key, prop]) => (
                <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <div className="font-bold text-lg mb-1">{prop.title || key}</div>
                  {prop.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{prop.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                      Type: {prop.type}
                    </span>
                    {prop.default !== undefined && (
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                        Default: {JSON.stringify(prop.default)}
                      </span>
                    )}
                  </div>
                  {prop.enum && (
                    <div className="mt-2">
                      <div className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">Allowed values:</div>
                      <div className="flex flex-wrap gap-2">
                        {prop.enum.map((value) => (
                          <span
                            key={value}
                            className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded text-sm"
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
    </div>
  );
}
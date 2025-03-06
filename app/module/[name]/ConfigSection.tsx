"use client";

import { FiCode } from "react-icons/fi";
import ExpandableSection from "./ExpandableSection";
import Markdown from '../../../utils/markdown'

interface ConfigSectionProps {
  configSchema: any;
}

export default function ConfigSection({ configSchema }: ConfigSectionProps) {
  return (
    <ExpandableSection title="Configuration Options" icon={FiCode}>
      <div className="space-y-6">
        {Object.entries(configSchema.properties).map(
          ([key, prop]: [string, any]) => (
            <div
              key={key}
              className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-4 last:border-0"
            >
              <div className="font-bold text-lg mb-1 text-text dark:text-dark-text">
                {prop.title || key}
              </div>
              {prop.description && (
                <Markdown>
                  {prop.description}
                </Markdown>
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
                  <div className="font-medium text-sm text-text-alt dark:text-dark-text-alt mb-1">
                    Allowed values:
                  </div>
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
          )
        )}
      </div>
    </ExpandableSection>
  );
}
"use client";
import { FiCommand } from "react-icons/fi";
import ExpandableSection from "./ExpandableSection";
import CollapsibleImplementation from "./CollapsibleImplementation";

interface CommandsProps {
  commands: {
    trigger: string;
    name: string;
    helpText?: string;
    function: string;
  }[];
}

export default function CommandsSection({ commands }: CommandsProps) {
  return (
    <ExpandableSection
      title="Commands"
      icon={FiCommand}
      itemCount={commands.length}
    >
      <div className="space-y-6">
        {commands.map((command, index) => (
          <div
            key={index}
            className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-6 last:border-0"
          >
            <div className="font-mono text-primary dark:text-dark-primary text-lg mb-1">
              {command.trigger}
            </div>
            <div className="text-xl font-medium mb-2 text-text dark:text-dark-text">
              {command.name}
            </div>
            {command.helpText && (
              <p className="text-text-alt dark:text-dark-text-alt mb-4">
                {command.helpText}
              </p>
            )}
            
            <CollapsibleImplementation code={command.function} />
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}
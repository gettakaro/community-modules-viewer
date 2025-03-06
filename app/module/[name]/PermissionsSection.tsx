"use client";
import { FiLock } from "react-icons/fi";
import ExpandableSection from "./ExpandableSection";
import { Permission } from "../../../utils/modules";
import Markdown from "react-markdown";

interface PermissionsProps {
  permissions: Permission[];
}

export default function PermissionsSection({ permissions }: PermissionsProps) {
  return (
    <ExpandableSection
      title="Permissions"
      icon={FiLock}
      itemCount={permissions.length}
    >
      <div className="w-full space-y-4">
        {permissions.map((permission, index) => (
          <div
            key={permission.permission}
            className="w-full border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-4 last:border-0"
          >
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div className="flex-1 min-w-[250px]">
                <div className="text-lg font-medium mb-1 text-text dark:text-dark-text">
                  {permission.friendlyName}
                </div>
                <div className="text-sm text-text-alt/70 dark:text-dark-text-alt/70 font-mono mb-2">
                  {permission.permission}
                </div>
              </div>
              <div className="text-sm self-start mt-1">
                {permission.canHaveCount && 
                  <span className="px-2 py-1 rounded">
                    Can have a count
                  </span>
                }
              </div>
            </div>
            {permission.description && (
              <Markdown>
                {permission.description}
              </Markdown>
            )}
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}
"use client";

import { FiLock } from "react-icons/fi";
import ExpandableSection from "./ExpandableSection";

interface PermissionsProps {
  permissions: {
    name: string;
    description?: string;
  }[];
}

export default function PermissionsSection({ permissions }: PermissionsProps) {
  return (
    <ExpandableSection 
      title="Permissions" 
      icon={FiLock} 
      itemCount={permissions.length}
    >
      <div className="space-y-4">
        {permissions.map((permission, index) => (
          <div
            key={index}
            className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-4 last:border-0"
          >
            <div className="text-lg font-medium mb-1 text-text dark:text-dark-text">
              {permission.name}
            </div>
            {permission.description && (
              <p className="text-text-alt dark:text-dark-text-alt">
                {permission.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}
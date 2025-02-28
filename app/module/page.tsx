'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getModules } from '../../utils/modules';

export default function ModuleRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function redirectToFirstModule() {
      try {
        const modules = await getModules();
        if (modules && modules.length > 0) {
          // Redirect to the first module in the list
          router.push(`/module/${modules[0].name}`);
        } else {
          // Handle case where no modules exist
          console.error('No modules found to redirect to');
        }
      } catch (error) {
        console.error('Failed to load modules for redirect:', error);
      } finally {
        setLoading(false);
      }
    }

    redirectToFirstModule();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-dark-primary"></div>
    </div>
  );
}
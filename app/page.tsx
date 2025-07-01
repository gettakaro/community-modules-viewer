import { loadAllModules } from '@/utils/moduleLoader';
import { ModuleSidebar } from '@/components/ModuleSidebar';

export default async function Home() {
  // Get all modules for the sidebar
  const modules = await loadAllModules();

  return (
    <div className="min-h-screen bg-takaro-background">
      {/* Sidebar */}
      <ModuleSidebar modules={modules} />

      {/* Main Content Area */}
      <div className="main-content-with-sidebar">
        <main className="container mx-auto p-8">
          <div className="card-takaro max-w-2xl">
            <h1 className="text-4xl font-bold text-takaro-text-primary mb-4">
              Community Modules Viewer
            </h1>
            <p className="text-takaro-text-secondary mb-6">
              Browse and explore Takaro modules from the community and built-in
              collections. Use the sidebar to search, filter, and navigate
              between modules.
            </p>

            {modules.length > 0 ? (
              <div className="space-y-4">
                <div className="stats-grid grid grid-cols-2 gap-4">
                  <div className="stat-card bg-takaro-card-hover p-4 rounded-lg">
                    <div className="text-2xl font-bold text-takaro-primary">
                      {modules.length}
                    </div>
                    <div className="text-sm text-takaro-text-muted">
                      Total Modules
                    </div>
                  </div>
                  <div className="stat-card bg-takaro-card-hover p-4 rounded-lg">
                    <div className="text-2xl font-bold text-takaro-secondary">
                      {modules.filter((m) => m.source === 'community').length}
                    </div>
                    <div className="text-sm text-takaro-text-muted">
                      Community
                    </div>
                  </div>
                </div>

                <div className="text-sm text-takaro-text-muted">
                  Select a module from the sidebar to view its details,
                  configuration, commands, and more.
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-takaro-text-muted mb-4">
                  <svg
                    className="w-16 h-16 mx-auto opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-takaro-text-primary mb-2">
                  No modules available
                </h2>
                <p className="text-takaro-text-secondary">
                  No modules could be loaded from the community or built-in
                  sources.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-takaro-border bg-takaro-background ml-80 md:ml-80 transition-all duration-300 max-md:ml-0">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left section - About */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold text-takaro-text-primary mb-2">
              Community Modules Viewer
            </h3>
            <p className="text-xs text-takaro-text-muted max-w-md">
              Browse and explore Takaro modules from the community and built-in
              collections.
            </p>
          </div>

          {/* Center section - Quick Links */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://github.com/gettakaro/community-modules-viewer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-takaro-text-secondary hover:text-takaro-primary transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </a>

            <a
              href="https://github.com/gettakaro/community-modules-viewer/issues/new/choose"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-takaro-text-secondary hover:text-takaro-primary transition-colors flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Report Bug
            </a>

            <a
              href="https://github.com/gettakaro/community-modules-viewer/issues/new/choose"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-takaro-text-secondary hover:text-takaro-primary transition-colors flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Request Feature
            </a>
          </div>

          {/* Right section - Copyright */}
          <div className="text-center md:text-right">
            <p className="text-xs text-takaro-text-muted">
              © {new Date().getFullYear()} Takaro Community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

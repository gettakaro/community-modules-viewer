import Link from 'next/link';

export function TakaroContextBanner() {
  return (
    <section className="mb-6 rounded-lg border border-takaro-border bg-takaro-card p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-takaro-primary">
            Takaro module library
          </p>
          <h1 className="text-2xl font-black text-takaro-text-primary sm:text-3xl">
            Takaro Modules
          </h1>
          <p className="mt-2 text-sm text-takaro-text-secondary sm:text-base">
            Takaro is a game server management platform for running, automating,
            and moderating multiplayer communities. These modules install into
            Takaro to add server automation, Discord workflows, economy systems,
            and moderation tools.
          </p>
        </div>

        <div
          className="flex flex-col gap-2 sm:flex-row lg:flex-shrink-0"
          data-testid="takaro-context-actions"
        >
          <a
            href="https://takaro.io"
            className="btn-takaro-primary inline-flex w-full items-center justify-center text-sm sm:w-auto"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit takaro.io
          </a>
          <Link
            href="/"
            className="btn-takaro-outline inline-flex w-full items-center justify-center text-sm sm:w-auto"
          >
            Back to module library
          </Link>
        </div>
      </div>
    </section>
  );
}

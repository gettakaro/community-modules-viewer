import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock react-markdown to avoid ESM issues
vi.mock('react-markdown', () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock @takaro/apiclient - using a factory function for flexibility
vi.mock('@takaro/apiclient', () => ({
  Client: vi.fn(() => ({
    user: {
      userControllerMe: vi.fn(),
    },
    module: {
      moduleControllerImport: vi.fn(),
    },
    gameserver: {
      gameServerControllerSearch: vi.fn(),
    },
  })),
}));

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    pop: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
  })),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

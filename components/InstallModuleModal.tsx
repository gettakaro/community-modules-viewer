'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getGameServers, getDashboardUrl } from '@/utils/takaroApi';
import type { GameServer } from '@/lib/types';

interface InstallModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  moduleVersion: string;
}

export function InstallModuleModal({
  isOpen,
  onClose,
  moduleId,
  moduleVersion,
}: InstallModuleModalProps) {
  const [gameServers, setGameServers] = useState<GameServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchServers();
    }
  }, [isOpen]);

  async function fetchServers() {
    setLoading(true);
    const result = await getGameServers();
    if (result.success && result.servers) {
      setGameServers(result.servers);
    } else {
      toast.error('Failed to load servers');
    }
    setLoading(false);
  }

  function handleInstallClick() {
    if (!selectedServerId) return;

    const dashboardUrl = getDashboardUrl();
    const installUrl = `${dashboardUrl}/gameserver/${selectedServerId}/modules/${moduleId}/${moduleVersion}/install`;
    window.open(installUrl, '_blank');
    onClose();
  }

  if (!isOpen) return null;

  const selectedServer = gameServers.find((s) => s.id === selectedServerId);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="card-takaro max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2
              id="modal-title"
              className="text-xl font-bold text-takaro-text-primary"
            >
              Module Imported Successfully!
            </h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-square"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center gap-2 text-takaro-text-secondary">
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Loading your servers...</span>
              </div>
            )}

            {!loading && gameServers.length === 0 && (
              <div className="text-takaro-text-secondary">
                <p className="mb-2">
                  No game servers found. Create a server in Takaro first.
                </p>
                <a
                  href={getDashboardUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-takaro-accent hover:underline"
                >
                  Open Takaro Dashboard →
                </a>
              </div>
            )}

            {!loading && gameServers.length > 0 && (
              <>
                <p className="text-takaro-text-secondary">
                  Select a game server to install this module:
                </p>

                <select
                  value={selectedServerId || ''}
                  onChange={(e) => setSelectedServerId(e.target.value)}
                  className="select select-bordered w-full bg-takaro-bg-secondary text-takaro-text-primary border-takaro-border"
                >
                  <option value="">Choose a server...</option>
                  {gameServers.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name} ({server.gameType})
                    </option>
                  ))}
                </select>

                {selectedServerId && (
                  <div className="alert bg-takaro-bg-tertiary border-takaro-border">
                    <svg
                      className="w-5 h-5 text-takaro-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-takaro-text-secondary">
                      This will open Takaro dashboard where you can configure
                      and install the module
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-6">
            {!loading && gameServers.length > 0 && (
              <button
                onClick={handleInstallClick}
                disabled={!selectedServerId}
                className="btn btn-primary flex-1"
              >
                {selectedServer
                  ? `Install on ${selectedServer.name} →`
                  : 'Select a server'}
              </button>
            )}

            <button onClick={onClose} className="btn btn-secondary">
              {gameServers.length === 0 ? 'Close' : 'Install Later'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

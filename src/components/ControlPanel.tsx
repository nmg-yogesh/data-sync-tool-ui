import React from 'react';
import { AlertCircle, Play, RefreshCw } from 'lucide-react';
import { SyncStatus } from '../types';

interface Props {
  syncStatus?: SyncStatus;
  loading: boolean;
  onStartSync: () => void;
  onRefresh: () => void;
}

const ControlPanel: React.FC<Props> = ({ syncStatus, loading, onStartSync, onRefresh }) => {
  const syncing = !!(loading || (syncStatus && syncStatus.sync_running));

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Control Panel</h2>
      </div>
      <div className="p-6">
        <div className="flex gap-4">
          <button
            onClick={onStartSync}
            disabled={syncing || !syncStatus?.connection_ready}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {syncing ? 'Syncing...' : 'Start Sync'}
          </button>

          <button
            onClick={onRefresh}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </button>

          {!syncStatus?.connection_ready && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Configure database connections to enable sync</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

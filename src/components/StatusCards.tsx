import React from 'react';
import { CheckCircle, Clock, Database, RefreshCw, XCircle } from 'lucide-react';
import { ConnectionStatus, SyncStatus } from '../types';

const getSyncStatusIcon = (syncStatus?: SyncStatus) => {
  if (!syncStatus) return <Clock className="w-5 h-5 text-gray-400" />;
  if (syncStatus.sync_running) return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
  if (syncStatus.errors && syncStatus.errors.length > 0) return <XCircle className="w-5 h-5 text-red-500" />;
  return <CheckCircle className="w-5 h-5 text-green-500" />;
};

const getSyncStatusText = (syncStatus?: SyncStatus) => {
  if (!syncStatus) return 'Unknown';
  if (syncStatus.sync_running) return 'Running';
  if (syncStatus.errors && syncStatus.errors.length > 0) return 'Error';
  if (!syncStatus.connection_ready) return 'Not Ready';
  return 'Ready';
};

const getConnectionIcon = (connected?: boolean) =>
  connected ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;

interface Props {
  syncStatus?: SyncStatus;
  connectionStatus?: ConnectionStatus;
}

const StatusCards: React.FC<Props> = ({ syncStatus, connectionStatus }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Sync Status</p>
            <p className="text-2xl font-bold text-gray-900">{getSyncStatusText(syncStatus)}</p>
          </div>
          {getSyncStatusIcon(syncStatus)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Source DB</p>
            <p className="text-lg font-semibold text-gray-900">
              {connectionStatus?.source?.connected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
          {getConnectionIcon(connectionStatus?.source?.connected)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Destination DB</p>
            <p className="text-lg font-semibold text-gray-900">
              {connectionStatus?.destination?.connected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
          {getConnectionIcon(connectionStatus?.destination?.connected)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Records Synced</p>
            <p className="text-2xl font-bold text-gray-900">
              {syncStatus ? syncStatus.total_records_synced.toLocaleString() : '0'}
            </p>
          </div>
          <Database className="w-5 h-5 text-blue-500" />
        </div>
      </div>
    </div>
  );
};

export default StatusCards;

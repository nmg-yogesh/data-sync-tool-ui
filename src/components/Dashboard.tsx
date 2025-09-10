import React from 'react';
import { SyncRule, SyncStatus } from '../types';

const formatDate = (s?: string | null) => (s ? new Date(s).toLocaleString() : 'Never');

interface Props {
  syncStatus?: SyncStatus;
  syncRules: SyncRule[];
}

const Dashboard: React.FC<Props> = ({ syncStatus, syncRules }) => {
  return (
    <div className="space-y-6">
      {/* Sync Info */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Sync Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Sync</p>
              <p className="text-lg text-gray-900">{formatDate(syncStatus?.last_sync)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records Synced</p>
              <p className="text-lg text-gray-900">{syncStatus?.total_records_synced?.toLocaleString() ?? '0'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sync Rules Configured</p>
              <p className="text-lg text-gray-900">{syncRules.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Sync Errors</h2>
        </div>
        <div className="p-6">
          {syncStatus?.errors?.length ? (
            <div className="space-y-2">
              {syncStatus.errors.map((e, i) => (
                <div key={i} className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-800 text-sm">{e}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No errors to display</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { ConnectionStatus, SyncRule, TablesMap } from '../types';

const formatDate = (s?: string | null) => (s ? new Date(s).toLocaleString() : 'Never');

interface Props {
  connectionStatus?: ConnectionStatus;
  sourceTables: TablesMap;
  newRule: SyncRule;
  setNewRule: (r: SyncRule) => void;
  syncRules: SyncRule[];
  onAddRule: () => void;
  onDeleteRule: (tableName: string) => void;
}

const SyncRules: React.FC<Props> = ({
  connectionStatus,
  sourceTables,
  newRule,
  setNewRule,
  syncRules,
  onAddRule,
  onDeleteRule,
}) => {
  const sourceConnected = !!connectionStatus?.source?.connected;

  return (
    <div className="space-y-6">
      {/* Add New Rule */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Sync Rule</h2>
        </div>
        <div className="p-6">
          {!sourceConnected ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">Connect to source database to see available tables</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Table Name</label>
                <select
                  value={newRule.table_name}
                  onChange={(e) => setNewRule({ ...newRule, table_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black text-black-800"
                >
                  <option className="text-black text-black-800" value="">Select Table</option>
                  {Object.keys(sourceTables).map((t) => (
                    <option className="text-black text-black-800" key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Key</label>
                <select
                  value={newRule.primary_key}
                  onChange={(e) => setNewRule({ ...newRule, primary_key: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black text-black-800"
                  disabled={!newRule.table_name}
                >
                  <option value="" className="text-black text-black-800">Select Primary Key</option>
                  {newRule.table_name && sourceTables[newRule.table_name]?.map((col) => (
                    <option key={col.column_name} value={col.column_name} className="text-black text-black-800">{col.column_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sync Type</label>
                <select
                  value={newRule.sync_type}
                  onChange={(e) => setNewRule({ ...newRule, sync_type: e.target.value as 'full' | 'incremental' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black text-black-800"
                >
                  <option value="full" className="text-black text-black-800">Full Sync</option>
                  <option value="incremental"className="text-black text-black-800">Incremental</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={onAddRule}
                  disabled={!newRule.table_name || !newRule.primary_key}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  Add Rule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing Rules */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Current Sync Rules</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primary Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sync</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {syncRules.map((rule) => (
                <tr key={`${rule.table_name}-${rule.primary_key}`}>
                  <td className="px-6 py-4 text-sm text-gray-900">{rule.table_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{rule.primary_key}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rule.sync_type === 'full' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {rule.sync_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(rule.last_sync)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button
                      onClick={() => onDeleteRule(rule.table_name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!syncRules.length && (
            <div className="p-6 text-center text-gray-500">No sync rules configured yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncRules;

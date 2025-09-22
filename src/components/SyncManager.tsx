import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, Plus, Trash2, Database, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import styles from './SyncManager.module.css';
import { MappingManager } from './MappingManager';
import { API_BASE_URL } from '@/api';

interface SyncRule {
  table_name: string;
  primary_key: string;
  sync_type: 'full' | 'incremental';
  last_sync: string | null;
}

interface SyncStatus {
  last_sync: string | null;
  total_records_synced: number;
  sync_running: boolean;
  errors: string[];
  connection_ready: boolean;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  is_primary_key?: boolean;
}



// The API returns tables as: { [tableName]: ColumnInfo[] }
type TablesResponse = Record<string, ColumnInfo[]>;

interface SyncManagerProps {
  isVisible: boolean;
}

export const SyncManager: React.FC<SyncManagerProps> = ({ isVisible }) => {
  const [activeTab, setActiveTab] = useState<'legacy' | 'advanced'>('advanced');
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncRules, setSyncRules] = useState<SyncRule[]>([]);
  const [sourceTables, setSourceTables] = useState<TablesResponse>({});
  const [loading, setLoading] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({
    table_name: '',
    primary_key: '',
    sync_type: 'full' as 'full' | 'incremental'
  });

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/status`);
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  // Fetch sync rules
  const fetchSyncRules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/rules`);
      const data = await response.json();
      setSyncRules(data);
    } catch (error) {
      console.error('Error fetching sync rules:', error);
    }
  };

  // Fetch source tables
  const fetchSourceTables = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables?type=source`);
      const data = await response.json();
      console.log('Source tables data:', data); // Debug log
      setSourceTables(data);
    } catch (error) {
      console.error('Error fetching source tables:', error);
    }
  };

  // Start sync
  const startSync = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sync/start`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        await fetchSyncStatus();
      } else {
        console.error('Sync start error:', data.error);
      }
    } catch (error) {
      console.error('Error starting sync:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add sync rule
  const addSyncRule = async () => {
    if (!newRule.table_name || !newRule.primary_key) return;

    try {
      const response = await fetch(`${API_BASE_URL}/sync/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });

      if (response.ok) {
        await fetchSyncRules();
        setNewRule({ table_name: '', primary_key: '', sync_type: 'full' });
        setShowAddRule(false);
      }
    } catch (error) {
      console.error('Error adding sync rule:', error);
    }
  };

  // Delete sync rule
  const deleteSyncRule = async (tableName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/rules/${tableName}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSyncRules();
      }
    } catch (error) {
      console.error('Error deleting sync rule:', error);
    }
  };

  // Auto-refresh sync status
  useEffect(() => {
    if (isVisible) {
      fetchSyncStatus();
      fetchSyncRules();
      fetchSourceTables();

      const interval = setInterval(() => {
        fetchSyncStatus();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getPrimaryKeyOptions = (tableName: string) => {
    const columns = sourceTables[tableName];
    if (!columns || !Array.isArray(columns)) {
      // Fallback: common primary key names
      return ['id', 'user_id', 'pk', 'primary_key'];
    }

    const primaryKeys = columns
      .filter(col => col.is_primary_key || col.column_name.includes('id'))
      .map(col => col.column_name);

    // If no primary keys found, return all columns as options
    if (primaryKeys.length === 0) {
      return columns.map(col => col.column_name);
    }

    return primaryKeys;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Sync Management</h3>
        <button
          onClick={fetchSyncStatus}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('advanced')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'advanced'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Advanced Mappings
          </button>
          <button
            onClick={() => setActiveTab('legacy')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'legacy'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Legacy Sync Rules
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'advanced' && (
        <MappingManager onMappingExecuted={() => {
          // Refresh sync status when mapping is executed
          fetchSyncStatus();
        }} />
      )}

      {activeTab === 'legacy' && (
        <>
          {/* Sync Status */}
          {syncStatus && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Current Status</h4>
                <div className="flex items-center gap-2">
                  {syncStatus.connection_ready ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-sm font-bold px-2 py-1 rounded-full ${syncStatus.connection_ready
                      ? 'text-green-800 bg-green-100'
                      : 'text-red-800 bg-red-100'
                    }`}>
                    {syncStatus.connection_ready ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{syncStatus.total_records_synced}</div>
                  <div className="text-sm font-semibold text-blue-800">Records Synced</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {syncStatus.sync_running ? 'Running' : 'Idle'}
                  </div>
                  <div className="text-sm font-semibold text-green-800">Status</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {syncStatus.last_sync ? new Date(syncStatus.last_sync).toLocaleTimeString() : 'Never'}
                  </div>
                  <div className="text-sm font-semibold text-purple-800">Last Sync</div>
                </div>
              </div>

              {/* Sync Control */}
              <div className="flex items-center gap-4">
                <button
                  onClick={startSync}
                  disabled={loading || !syncStatus.connection_ready || syncRules.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  {loading ? 'Starting...' : 'Start Sync'}
                </button>

                {syncRules.length === 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      No sync rules configured
                    </span>
                  </div>
                )}
              </div>

              {/* Errors */}
              {syncStatus.errors && syncStatus.errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Sync Errors</span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {syncStatus.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Sync Rules */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Sync Rules</h4>
              <button
                onClick={() => setShowAddRule(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </div>

            {/* Add Rule Form */}
            {showAddRule && (
              <div className={styles.formContainer}>
                <h5 className={styles.formTitle}>Add New Sync Rule</h5>
                <div className={styles.formGrid}>
                  <div className={styles.fieldContainer}>
                    <label className={styles.fieldLabel}>Table Name *</label>
                    <select
                      value={newRule.table_name}
                      onChange={(e) => setNewRule({ ...newRule, table_name: e.target.value, primary_key: '' })}
                      className={styles.enhancedSelect}

                    >
                      <option value="">Select table...</option>
                      {Object.keys(sourceTables).map(tableName => (
                        <option key={tableName} value={tableName}>
                          {tableName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldContainer}>
                    <label className={styles.fieldLabel}>Primary Key *</label>
                    <div className={styles.dualInputContainer}>
                      <select
                        value={newRule.primary_key}
                        onChange={(e) => setNewRule({ ...newRule, primary_key: e.target.value })}
                        className={styles.enhancedSelect}
                        disabled={!newRule.table_name}

                      >
                        <option value="">Select primary key...</option>
                        {getPrimaryKeyOptions(newRule.table_name).map(colName => (
                          <option key={colName} value={colName}>
                            {colName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Or type primary key name manually..."
                        value={newRule.primary_key}
                        onChange={(e) => setNewRule({ ...newRule, primary_key: e.target.value })}
                        className={styles.enhancedInput}
                        disabled={!newRule.table_name}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldContainer}>
                    <label className={styles.fieldLabel}>Sync Type</label>
                    <select
                      value={newRule.sync_type}
                      onChange={(e) => setNewRule({ ...newRule, sync_type: e.target.value as 'full' | 'incremental' })}
                      className={styles.enhancedSelect}

                    >
                      <option value="full">Full Sync</option>
                      <option value="incremental">Incremental</option>
                    </select>
                  </div>
                </div>

                <div className={styles.buttonContainer}>
                  <button
                    onClick={addSyncRule}
                    disabled={!newRule.table_name || !newRule.primary_key}
                    className={styles.primaryButton}
                  >
                    Add Rule
                  </button>
                  <button
                    onClick={() => setShowAddRule(false)}
                    className={styles.secondaryButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Rules List */}
            {syncRules.length > 0 ? (
              <div className="space-y-3">
                {syncRules.map((rule) => (
                  <div key={rule.table_name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Database className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{rule.table_name}</div>
                        <div className="text-sm text-gray-500">
                          Primary Key: {rule.primary_key} • Type: {rule.sync_type}
                          {rule.last_sync && (
                            <span className="ml-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Last: {new Date(rule.last_sync).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSyncRule(rule.table_name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No sync rules configured</p>
                <p className="text-sm">Add a sync rule to start syncing data between your databases</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { withAuth } from '../contexts/AuthContext';
import { AuthHeader } from '../components/AuthHeader';
import StatusCards from '../components/StatusCards';
import ControlPanel from '../components/ControlPanel';
import Tabs from '../components/Tabs';
import ConnectionForm from '../components/ConnectionForm';
import Dashboard from '../components/Dashboard';
import SyncRules from '../components/SyncRules';
import TablesView from '../components/TablesView';
import { BulkTransferManager } from '../components/BulkTransferManager';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Api } from '../api';
import {
  LegacyConnectionConfig,
  ConnectionStatus,
  DBType,
  SyncRule,
  SyncStatus,
  TablesMap,
  TestResult,
  TabType,
} from '../types';

const DatabaseSyncUI: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | undefined>(undefined);
  const [syncRules, setSyncRules] = useState<SyncRule[]>([]);
  const [sourceTables, setSourceTables] = useState<TablesMap>({});
  const [destTables, setDestTables] = useState<TablesMap>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | undefined>(undefined);
  const [newRule, setNewRule] = useState<SyncRule>({ table_name: '', primary_key: '', sync_type: 'full' });
  const [sourceConnection, setSourceConnection] = useState<LegacyConnectionConfig>({
    name: 'Source Database',
    host: 'localhost',
    port: 5432,
    database: '',
    user: '',
    password: '',
  });
  const [destConnection, setDestConnection] = useState<LegacyConnectionConfig>({
    name: 'Destination Database',
    host: 'localhost',
    port: 5432,
    database: '',
    user: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'connections' | 'dashboard' | 'sync-rules' | 'tables' | 'bulk-transfer'>('connections');
  const [testResults, setTestResults] = useState<Record<string, TestResult | undefined>>({});

  // initial + polling
  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      refreshStatusOnly();
      console.log('Polling...');
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // fetch tables on connect
  useEffect(() => {
    (async () => {
      if (connectionStatus?.source?.connected) {
        try {
          const data = await Api.fetchTables('source');
          setSourceTables(data);
        } catch (e) {
          console.error('Error fetching source tables:', e);
        }
      }
      if (connectionStatus?.destination?.connected) {
        try {
          const data = await Api.fetchTables('destination');
          setDestTables(data);
        } catch (e) {
          console.error('Error fetching destination tables:', e);
        }
      }

      // hydrate connection forms from current config
      if (connectionStatus?.source_config) {
        setSourceConnection((prev) => ({
          ...prev,
          name: connectionStatus.source_config?.name || 'Source Database',
          host: connectionStatus.source_config?.host,
          port: connectionStatus.source_config?.port,
          database: connectionStatus.source_config?.database,
          user: connectionStatus.source_config?.user,
        }));
      }
      if (connectionStatus?.dest_config) {
        setDestConnection((prev) => ({
          ...prev,
          name: connectionStatus.dest_config?.name || 'Destination Database',
          host: connectionStatus.dest_config?.host,
          port: connectionStatus.dest_config?.port,
          database: connectionStatus.dest_config?.database,
          user: connectionStatus.dest_config?.user,
        }));
      }
    })();
  }, [connectionStatus]);

  const refreshStatusOnly = async () => {
    try {
      const [conn, sync] = await Promise.all([
        Api.fetchConnectionStatus(),
        Api.fetchSyncStatus(),
      ]);
      setConnectionStatus(conn);
      setSyncStatus(sync);
    } catch (e) {
      console.error('Polling error:', e);
    }
  };

  const refreshAll = async () => {
    try {
      const [conn, sync, rules] = await Promise.all([
        Api.fetchConnectionStatus(),
        Api.fetchSyncStatus(),
        Api.fetchSyncRules(),
      ]);
      setConnectionStatus(conn);
      setSyncStatus(sync);
      setSyncRules(rules);
    } catch (e) {
      console.error('Initial load error:', e);
    }
  };

  const handleTest = async (config: LegacyConnectionConfig, type: DBType) => {
    setLoading(true);
    try {
      const result = await Api.testConnection(config);
      setTestResults((prev) => ({ ...prev, [type]: result }));
      return result;
    } catch (error: unknown) {
      const err: TestResult = { success: false, message: error instanceof Error ? error.message : 'Failed to test connection' };
      setTestResults((prev) => ({ ...prev, [type]: err }));
      return err;
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (config: LegacyConnectionConfig, type: DBType) => {
    setLoading(true);
    try {
      const result = await Api.saveConnection(config, type);
      if (result.success) {
        await refreshStatusOnly();
        alert(`${type} connection saved successfully!`);
      } else {
        alert(`Error saving ${type} connection: ${result.message}`);
      }
    } catch (error: unknown) {
      alert(`Error saving ${type} connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSync = async () => {
    if (!connectionStatus?.source?.connected || !connectionStatus?.destination?.connected) {
      alert('Both source and destination connections must be established before syncing.');
      return;
    }
    setLoading(true);
    try {
      const result = await Api.startSync();
      if (result.message) alert(result.message);
      if (result.error) alert(`Error starting sync: ${result.error}`);
    } catch (error: unknown) {
      alert(`Error starting sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      refreshStatusOnly();
    }
  };

  const handleAddRule = async () => {
    if (!newRule.table_name || !newRule.primary_key) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await Api.addSyncRule(newRule);
      setNewRule({ table_name: '', primary_key: '', sync_type: 'full' });
      const rules = await Api.fetchSyncRules();
      setSyncRules(rules);
      alert('Sync rule added successfully!');
    } catch (e) {
      console.error('Error adding rule:', e);
    }
  };

  const handleDeleteRule = async (tableName: string) => {
    // native confirm prevents accidental delete
    if (!window.confirm(`Are you sure you want to delete the sync rule for ${tableName}?`)) return;
    try {
      await Api.deleteSyncRule(tableName);
      const rules = await Api.fetchSyncRules();
      setSyncRules(rules);
      alert('Sync rule deleted successfully!');
    } catch (e) {
      console.error('Error deleting rule:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced CDC Tool Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-semibold">New: Multi-Source CDC Tool</h2>
                <p className="text-blue-100">Connect to PostgreSQL, MySQL, MSSQL, Google Sheets, Supabase & more!</p>
              </div>
            </div>
            <Link href="/enhanced-cdc" className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors flex items-center gap-2">
              Try Enhanced CDC
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Sync Manager</h1>
              <p className="text-gray-600">Manage CDC synchronization between source and destination databases</p>
            </div>
            <AuthHeader />
          </div>
        </div>

        <StatusCards syncStatus={syncStatus} connectionStatus={connectionStatus} />

        <ControlPanel
          syncStatus={syncStatus}
          loading={loading}
          onStartSync={handleStartSync}
          onRefresh={refreshStatusOnly}
        />

        <Tabs
          active={activeTab}
          setActive={(tab: string) => {
            if (["connections", "dashboard", "sync-rules", "tables", "bulk-transfer"].includes(tab)) {
              setActiveTab(tab as TabType);
            }
          }}
        />
        {activeTab === 'connections' && (
          <div className="space-y-6">
            <ConnectionForm
              title="Source Database Connection"
              type="source"
              loading={loading}
              connection={sourceConnection}
              setConnection={setSourceConnection}
              connectionStatus={connectionStatus}
              testResults={testResults}
              onTest={handleTest}
              onSave={handleSave}
            />
            <ConnectionForm
              title="Destination Database Connection"
              type="destination"
              loading={loading}
              connection={destConnection}
              setConnection={setDestConnection}
              connectionStatus={connectionStatus}
              testResults={testResults}
              onTest={handleTest}
              onSave={handleSave}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard syncStatus={syncStatus} syncRules={syncRules} />
        )}

        {activeTab === 'sync-rules' && (
          <SyncRules
            connectionStatus={connectionStatus}
            sourceTables={sourceTables}
            newRule={newRule}
            setNewRule={setNewRule}
            syncRules={syncRules}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
          />
        )}

        {activeTab === 'tables' && (
          <TablesView
            connectionStatus={connectionStatus}
            sourceTables={sourceTables}
            destTables={destTables}
          />
        )}

        {activeTab === 'bulk-transfer' && (
          <BulkTransferManager />
        )}
      </div>
    </div>
  );
};

export default withAuth(DatabaseSyncUI);

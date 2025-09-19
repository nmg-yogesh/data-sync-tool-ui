import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, withAuth } from '../contexts/AuthContext';
import { AuthHeader } from '../components/AuthHeader';
import { AlertCircle, CheckCircle, Database, ArrowRight, Settings, Play, Pause } from 'lucide-react';
import {
  ConnectionConfig,
  ConnectionStatus,
  DBType,
  TestResult,
  SyncStatus,
  DataSourceType
} from '../types';
import { Api } from '../api';
import EnhancedConnectionForm from '../components/EnhancedConnectionForm';
import DataSourceSelector from '../components/DataSourceSelector';
import { SyncManager } from '../components/SyncManager';

const EnhancedCDCPage: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
  const [sourceConnection, setSourceConnection] = useState<ConnectionConfig | null>(null);
  const [destConnection, setDestConnection] = useState<ConnectionConfig | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult | undefined>>({});
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'source' | 'destination' | 'sync'>('source');
  const [showSourceSelector, setShowSourceSelector] = useState(true);
  const [showDestSelector, setShowDestSelector] = useState(true);

  useEffect(() => {
    fetchConnectionStatus();
    console.log('Connection status:', connectionStatus);
    fetchSyncStatus();
  }, []);

  const fetchConnectionStatus = async () => {
    try {
      const status = await Api.fetchConnectionStatus();
      setConnectionStatus(status);

      // If we have existing connections, hide selectors and show forms
      if (status.source_config) {
        setSourceConnection(status.source_config as ConnectionConfig);
        setShowSourceSelector(false);
      }
      if (status.dest_config) {
        setDestConnection(status.dest_config as ConnectionConfig);
        setShowDestSelector(false);
      }
    } catch (error) {
      console.error('Failed to fetch connection status:', error);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const status = await Api.fetchSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const handleTest = async (config: ConnectionConfig, type: DBType): Promise<TestResult> => {
    setLoading(true);
    try {
      const result = await Api.testConnectionConfig(config);
      setTestResults(prev => ({ ...prev, [type]: result }));
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message ?? 'Connection test failed' : 'Connection test failed'
      };
      setTestResults(prev => ({ ...prev, [type]: errorResult }));
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (config: ConnectionConfig, type: DBType) => {
    setLoading(true);
    try {
      await Api.saveConnectionConfig(config, type);
      await fetchConnectionStatus();

      // Hide selector and show form
      if (type === 'source') {
        setShowSourceSelector(false);
      } else {
        setShowDestSelector(false);
      }
    } catch (error) {
      console.error('Failed to save connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSync = async () => {
    setLoading(true);
    try {
      await Api.startSync();
      await fetchSyncStatus();
    } catch (error) {
      console.error('Failed to start sync:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceTypeSelect = (type: DataSourceType) => {
    const newConfig: ConnectionConfig = {
      type,
      name: `${type} Source Connection`
    };
    setSourceConnection(newConfig);
    setShowSourceSelector(false);
  };

  const handleDestTypeSelect = (type: DataSourceType) => {
    const newConfig: ConnectionConfig = {
      type,
      name: `${type} Destination Connection`
    };
    setDestConnection(newConfig);
    setShowDestSelector(false);
  };

  const resetConnection = (type: DBType) => {
    if (type === 'source') {
      setSourceConnection(null);
      setShowSourceSelector(true);
      setTestResults(prev => ({ ...prev, source: undefined }));
    } else {
      setDestConnection(null);
      setShowDestSelector(true);
      setTestResults(prev => ({ ...prev, destination: undefined }));
    }
  };

  const isReadyForSync = connectionStatus.source?.connected && connectionStatus.destination?.connected;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  <Link href="/" className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors flex items-center gap-2">
                    Multi-Source CDC Tool
                  </Link>

                </h1>
                <p className="text-base text-gray-600 font-medium">Change Data Capture across multiple data sources</p>
              </div>
            </div>

            {/* Sync Status and Auth */}
            <div className="flex items-center gap-6">
              {syncStatus && (
                <div className="flex items-center gap-2">
                  {syncStatus.sync_running ? (
                    <Pause className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Play className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {syncStatus.sync_running ? 'Syncing...' : 'Ready'}
                  </span>
                </div>
              )}

              <button
                onClick={handleStartSync}
                disabled={!isReadyForSync || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Sync
              </button>

              <AuthHeader />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Source */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${connectionStatus.source?.connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                1
              </div>
              <h2 className="text-xl font-bold text-gray-900">Source Database</h2>
              {connectionStatus.source?.connected && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>

            {showSourceSelector ? (
              <DataSourceSelector
                onSelect={handleSourceTypeSelect}
                title="Select Source Type"
                description="Choose your source data system"
              />
            ) : (
              <EnhancedConnectionForm
                title="Source Connection"
                type="source"
                loading={loading}
                connection={sourceConnection}
                setConnection={setSourceConnection}
                connectionStatus={connectionStatus}
                testResults={testResults}
                onTest={handleTest}
                onSave={handleSave}
              />
            )}

            {!showSourceSelector && (
              <button
                onClick={() => resetConnection('source')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Change Source Type
              </button>
            )}
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex items-center justify-center">
            <ArrowRight className="w-8 h-8 text-gray-400" />
          </div>

          {/* Destination */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${connectionStatus.destination?.connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                2
              </div>
              <h2 className="text-xl font-bold text-gray-900">Destination Database</h2>
              {connectionStatus.destination?.connected && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>

            {showDestSelector ? (
              <DataSourceSelector
                onSelect={handleDestTypeSelect}
                title="Select Destination Type"
                description="Choose your destination data system"
              />
            ) : (
              <EnhancedConnectionForm
                title="Destination Connection"
                type="destination"
                loading={loading}
                connection={destConnection}
                setConnection={setDestConnection}
                connectionStatus={connectionStatus}
                testResults={testResults}
                onTest={handleTest}
                onSave={handleSave}
              />
            )}

            {!showDestSelector && (
              <button
                onClick={() => resetConnection('destination')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Change Destination Type
              </button>
            )}
          </div>
        </div>

        {/* Sync Status Panel */}
        {isReadyForSync && syncStatus && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Sync Status</h3>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{syncStatus.total_records_synced}</div>
                <div className="text-sm font-semibold text-blue-800">Records Synced</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {syncStatus.sync_running ? 'Running' : 'Ready'}
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

            {syncStatus.errors && syncStatus.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Sync Errors</span>
                </div>
                <ul className="mt-2 text-sm text-red-700">
                  {syncStatus.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Sync Management */}
        <SyncManager isVisible={Boolean(isReadyForSync)} />
      </div>
    </div>
  );
};

export default withAuth(EnhancedCDCPage);

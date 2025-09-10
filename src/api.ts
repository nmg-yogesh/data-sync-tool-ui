import {
  LegacyConnectionConfig,
  ConnectionConfig,
  ConnectionStatus,
  DBType,
  SyncRule,
  SyncStatus,
  TablesMap,
  TestResult,
  DataSourceType,
  SupportedDataSourcesResponse,
  ConfigurationSchemaResponse
} from './types';

export const API_BASE_URL = 'http://localhost:8080/api';

async function json<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || res.statusText);
  return data;
}

export const Api = {
  // Legacy Connections (for backward compatibility)
  fetchConnectionStatus: () => fetch(`${API_BASE_URL}/connections/status`).then(res => res.json() as Promise<ConnectionStatus>),
  testConnection: (config: LegacyConnectionConfig) =>
    fetch(`${API_BASE_URL}/connections/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }).then(res => res.json() as Promise<TestResult>),

  saveConnection: (config: LegacyConnectionConfig, type: DBType) => {
    const endpoint = type === 'source' ? 'source' : 'destination';
    return fetch(`${API_BASE_URL}/connections/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }).then(res => res.json() as Promise<{ success: boolean; message?: string }>);
  },

  // New Multi-Source Connections
  testConnectionConfig: (config: ConnectionConfig) =>
    fetch(`${API_BASE_URL}/connections/test-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }).then(res => res.json() as Promise<TestResult>),

  saveConnectionConfig: (config: ConnectionConfig, type: DBType) => {
    const endpoint = type === 'source' ? 'source-config' : 'destination-config';
    return fetch(`${API_BASE_URL}/connections/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }).then(res => res.json() as Promise<{ success: boolean; message?: string }>);
  },

  fetchSupportedDataSources: () =>
    fetch(`${API_BASE_URL}/connections/supported-types`).then(res => res.json() as Promise<SupportedDataSourcesResponse>),

  fetchConfigurationSchema: (type: DataSourceType) =>
    fetch(`${API_BASE_URL}/connections/schema/${type}`).then(res => res.json() as Promise<ConfigurationSchemaResponse>),

  fetchTables: (type: DBType) =>
    fetch(`${API_BASE_URL}/tables?type=${type}`).then(res => res.json() as Promise<TablesMap>),

  // Sync
  fetchSyncStatus: () => fetch(`${API_BASE_URL}/sync/status`).then(res => res.json() as Promise<SyncStatus>),

  startSync: () =>
    fetch(`${API_BASE_URL}/sync/start`, { method: 'POST' }).then(res => res.json() as Promise<{ message?: string; error?: string }>),

  // Rules
  fetchSyncRules: () => fetch(`${API_BASE_URL}/sync/rules`).then(res => res.json() as Promise<SyncRule[]>),

  addSyncRule: (rule: SyncRule) =>
    fetch(`${API_BASE_URL}/sync/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    }).then(json),

  deleteSyncRule: (tableName: string) =>
    fetch(`${API_BASE_URL}/sync/rules/${tableName}`, { method: 'DELETE' }).then(res => {
      if (!res.ok) throw new Error('Failed to delete rule');
      return true;
    }),
};

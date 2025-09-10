import React from 'react';
import { AlertCircle, CheckCircle, Save, TestTube, XCircle } from 'lucide-react';
import { LegacyConnectionConfig, ConnectionStatus, DBType, TestResult } from '../types';

interface Props {
  title: string;
  type: DBType;
  loading: boolean;
  connection: LegacyConnectionConfig;
  setConnection: (c: LegacyConnectionConfig) => void;
  connectionStatus?: ConnectionStatus;
  testResults: Record<string, TestResult | undefined>;
  onTest: (config: LegacyConnectionConfig, type: DBType) => Promise<TestResult>;
  onSave: (config: LegacyConnectionConfig, type: DBType) => Promise<void>;
}

const ConnectionForm: React.FC<Props> = ({
  title, type, loading, connection, setConnection,
  connectionStatus, testResults, onTest, onSave,
}) => {
  const status = connectionStatus?.[type];
  const icon = status?.connected ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {connectionStatus && (
            <div className="flex items-center gap-2">
              {icon}
              <span className={`text-sm ${status?.connected ? 'text-green-600' : 'text-red-600'}`}>
                {status?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { label: 'Name', key: 'name', placeholder: 'Database name', type: 'text' },
            { label: 'Host', key: 'host', placeholder: 'localhost', type: 'text' },
            { label: 'Port', key: 'port', placeholder: '5432', type: 'number' },
            { label: 'Database', key: 'database', placeholder: 'database_name', type: 'text' },
            { label: 'Username', key: 'user', placeholder: 'username', type: 'text' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
              <input
                type={f.type}
                value={(connection as any)[f.key] ?? ''}
                onChange={(e) => setConnection({ ...connection, [f.key]: f.type === 'number' ? parseInt(e.target.value || '0', 10) : e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={f.placeholder}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={connection.password ?? ''}
              onChange={(e) => setConnection({ ...connection, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="password"
            />
          </div>
        </div>

        {/* Test Result */}
        {testResults[type] && (
          <div className={`mb-4 p-3 rounded-lg ${testResults[type]?.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              {testResults[type]?.success ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span className={`text-sm ${testResults[type]?.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResults[type]?.message}
              </span>
            </div>
          </div>
        )}

        {/* Connection Error */}
        {status?.error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">{status.error}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onTest(connection, type)}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <TestTube className="w-4 h-4" />
            Test Connection
          </button>
          <button
            onClick={() => onSave(connection, type)}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            <Save className="w-4 h-4" />
            Save Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionForm;

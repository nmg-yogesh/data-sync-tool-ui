import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Cloud, FileText, Globe, Info } from 'lucide-react';
import {
  ConnectionConfig,
  DataSourceType,
  DBType,
  TestResult,
  ConnectionStatus
} from '../types';
import { getDataSourceConfig, getDataSourcesByCategory, createDefaultConfig } from '../utils/dataSourceConfig';

interface Props {
  title: string;
  type: DBType;
  loading: boolean;
  connection: ConnectionConfig | null;
  setConnection: (connection: ConnectionConfig) => void;
  connectionStatus?: ConnectionStatus;
  testResults?: Record<string, TestResult | undefined>;
  onTest: (config: ConnectionConfig, type: DBType) => Promise<TestResult>;
  onSave: (config: ConnectionConfig, type: DBType) => Promise<void>;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'database': return <Database className="w-4 h-4" />;
    case 'cloud': return <Cloud className="w-4 h-4" />;
    case 'file': return <FileText className="w-4 h-4" />;
    case 'api': return <Globe className="w-4 h-4" />;
    default: return <Database className="w-4 h-4" />;
  }
};

const EnhancedConnectionForm: React.FC<Props> = ({
  title,
  type,
  loading,
  connection,
  setConnection,
  connectionStatus,
  testResults,
  onTest,
  onSave
}) => {
  const [selectedType, setSelectedType] = useState<DataSourceType | null>(
    connection?.type || null
  );
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const categories = getDataSourcesByCategory();
  const currentConfig = selectedType ? getDataSourceConfig(selectedType) : null;
  const testResult = testResults?.[type];
  const isConnected = type === 'source' 
    ? connectionStatus?.source?.connected 
    : connectionStatus?.destination?.connected;

  useEffect(() => {
    if (connection) {
      setSelectedType(connection.type);
      setFormData(connection);
    }
  }, [connection]);

  const handleTypeSelect = (type: DataSourceType) => {
    setSelectedType(type);
    const defaultConfig = createDefaultConfig(type);
    setFormData(defaultConfig);
    setConnection(defaultConfig as ConnectionConfig);
  };

  const handleFieldChange = (fieldName: string, value: string | number | boolean) => {
    const updatedData = { ...formData };

    // Handle nested field names (e.g., 'tunnel.enabled')
    if (fieldName.includes('.')) {
      const parts = fieldName.split('.');
      let current: Record<string, unknown> = updatedData;

      // Navigate to the parent object, creating nested objects as needed
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
          current[parts[i]] = {};
        }
        current = current[parts[i]] as Record<string, unknown>;
      }

      // Set the final value
      current[parts[parts.length - 1]] = value;
    } else {
      updatedData[fieldName] = value;
    }

    setFormData(updatedData);
    setConnection(updatedData as ConnectionConfig);
  };

  const handleTest = async () => {
    if (!selectedType || !formData.name) return;
    
    const config: ConnectionConfig = {
      ...formData,
      type: selectedType,
      name: (typeof formData.name === 'string' ? formData.name : '') || `${getDataSourceConfig(selectedType).name} Connection`
    };
    
    await onTest(config, type);
  };

  const handleSave = async () => {
    if (!selectedType || !formData.name) return;
    
    const config: ConnectionConfig = {
      ...formData,
      type: selectedType,
      name: (typeof formData.name === 'string' ? formData.name : '') || `${getDataSourceConfig(selectedType).name} Connection`
    };
    
    await onSave(config, type);
  };

  const getFieldValue = (fieldName: string): string | number | boolean => {
    if (fieldName.includes('.')) {
      const parts = fieldName.split('.');
      let current: unknown = formData;
      for (const part of parts) {
        if (current && typeof current === 'object' && current !== null) {
          current = (current as Record<string, unknown>)[part];
        } else {
          return '';
        }
      }
      return current !== undefined ? (current as string | number | boolean) : '';
    }
    const value = formData[fieldName];
    return value !== undefined ? (value as string | number | boolean) : '';
  };

  const shouldShowField = (field: { dependsOn?: string; dependsOnValue?: string | number | boolean }) => {
    if (!field.dependsOn) return true;

    const dependentValue = getFieldValue(field.dependsOn);
    return Boolean(dependentValue);
  };

  const renderField = (field: { name: string; type: string; label: string; placeholder?: string; required?: boolean; options?: Array<{ value: string; label: string }> }) => {
    const value = getFieldValue(field.name);

    switch (field.type) {
      case 'text':
      case 'password':
        return (
          <input
            type={field.type}
            value={String(value)}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={typeof value === 'number' ? value : ''}
            onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value) || '')}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
            required={field.required}
          />
        );
      
      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">{(field as unknown as { description: string }).description || ''}</span>
          </label>
        );
      
      case 'select':
        return (
          <select
            value={String(value)}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map((option: { value: string; label: string }) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={String(value)}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
            required={field.required}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {isConnected && <CheckCircle className="w-5 h-5 text-green-500" />}
      </div>

      {/* Data Source Type Selection */}
      {!selectedType && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Select Data Source Type</h3>
          
          {Object.entries(categories).map(([category, sources]) => (
            <div key={category} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                {getCategoryIcon(category)}
                <h4 className="text-lg font-semibold text-gray-800 capitalize">{category}</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sources.map((source) => (
                  <button
                    key={source.type}
                    onClick={() => handleTypeSelect(source.type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{source.icon}</span>
                      <span className="font-medium">{source.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{source.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configuration Form */}
      {selectedType && currentConfig && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentConfig.icon}</span>
              <h3 className="text-xl font-bold text-gray-900">{currentConfig.name}</h3>
            </div>
            <button
              onClick={() => setSelectedType(null)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Change Type
            </button>
          </div>

          {/* Connection Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Connection Name *
            </label>
            <input
              type="text"
              value={String(formData.name || '')}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder={`${currentConfig.name} Connection`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          {/* AWS Setup Instructions */}
          {selectedType && selectedType.includes('AWS_RDS') && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">ℹ️</div>
                <div>
                  <h4 className="text-base font-bold text-blue-800 mb-2">AWS RDS Setup Guide</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Find your RDS endpoint in AWS Console → RDS → Databases → Your DB → Connectivity & security</li>
                    <li>• Ensure your RDS security group allows inbound connections on the database port</li>
                    <li>• Make sure your RDS instance is publicly accessible if connecting from outside AWS</li>
                    <li>• Use the master username and password you set when creating the RDS instance</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Fields */}
          {currentConfig.configFields.map((field) => {
            if (!shouldShowField(field)) return null;

            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && '*'}
                </label>
                {renderField(field)}
                {field.description && (
                  <div className="flex items-start gap-1 mt-1">
                    <Info className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500">{field.description}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Test Result */}
          {testResult && (
            <div className={`p-3 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.message}
                </span>
              </div>
              {testResult.metadata && (
                <div className="mt-2 text-xs text-gray-600">
                  {testResult.metadata.version && <div>Version: {testResult.metadata.version}</div>}
                  {testResult.metadata.capabilities && (
                    <div>Capabilities: {testResult.metadata.capabilities.join(', ')}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AWS RDS Troubleshooting Guide */}
          {!testResult?.success && selectedType && selectedType.includes('AWS_RDS') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <div className="text-yellow-600 mt-0.5">⚠️</div>
                <div>
                  <h4 className="text-base font-bold text-yellow-800 mb-2">AWS RDS Connection Troubleshooting</h4>
                  <div className="text-sm text-yellow-700 space-y-2">
                    <div>
                      <strong>Common Issues:</strong>
                      <ul className="mt-1 ml-4 space-y-1">
                        <li>• <strong>Timeout:</strong> Check security groups allow inbound traffic on port {String(formData.port || '5432')}</li>
                        <li>• <strong>Connection Refused:</strong> Ensure RDS instance is running and publicly accessible</li>
                        <li>• <strong>DNS Issues:</strong> Verify the RDS endpoint URL is correct</li>
                        <li>• <strong>Authentication:</strong> Double-check username and password</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Security Group Settings:</strong>
                      <ul className="mt-1 ml-4 space-y-1">
                        <li>• Type: PostgreSQL (or Custom TCP)</li>
                        <li>• Port: {String(formData.port || '5432')}</li>
                        <li>• Source: Your IP address or 0.0.0.0/0 (for testing)</li>
                      </ul>
                    </div>
                    <div>
                      <strong>RDS Instance Settings:</strong>
                      <ul className="mt-1 ml-4 space-y-1">
                        <li>• Publicly accessible: Yes (if connecting from outside AWS)</li>
                        <li>• VPC security groups: Allow inbound connections</li>
                        <li>• Subnet group: Must have public subnets if publicly accessible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Supabase Troubleshooting Guide */}
          {!testResult?.success && selectedType === 'supabase' && (
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <div className="text-purple-600 mt-0.5">🔧</div>
                <div>
                  <h4 className="text-base font-bold text-purple-800 mb-2">Supabase Connection Troubleshooting</h4>
                  <div className="text-sm text-purple-700 space-y-2">
                    <div>
                      <strong>IPv6 Network Issues (ENETUNREACH):</strong>
                      <ul className="mt-1 ml-4 space-y-1">
                        <li>• This is a common issue with Supabase IPv6 addresses</li>
                        <li>• The adapter has been configured to use IPv4 - try connecting again</li>
                        <li>• If the issue persists, check your network&apos;s IPv6 configuration</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Connection Settings:</strong>
                      <ul className="mt-1 ml-4 space-y-1">
                        <li>• Host: Use your Supabase project&apos;s database host (e.g., db.xxx.supabase.co)</li>
                        <li>• Port: 5432 (default PostgreSQL port)</li>
                        <li>• Database: postgres (default) or your custom database name</li>
                        <li>• SSL: Always enabled for Supabase (automatically configured)</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Finding Your Credentials:</strong>
                      <ul className="mt-1 ml-4 space-y-1">
                        <li>• Go to Supabase Dashboard → Settings → Database</li>
                        <li>• Host: Found in &quot;Connection string&quot; section</li>
                        <li>• Password: Use your database password (not API key)</li>
                        <li>• Username: Usually &quot;postgres&quot; unless you created a custom user</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Common Issues:</strong>
                      <ul className="mt-1 ml-4 space-y-1">
                        <li>• <strong>Wrong Password:</strong> Use database password, not API key</li>
                        <li>• <strong>Wrong Host:</strong> Use db.xxx.supabase.co, not xxx.supabase.co</li>
                        <li>• <strong>Network Issues:</strong> Try from a different network or use VPN</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleTest}
              disabled={loading || !formData.name}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={loading || !testResult?.success}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Connection'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedConnectionForm;

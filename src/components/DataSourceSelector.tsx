import React, { useState, useEffect } from 'react';
import { Database, Cloud, FileText, Globe, ChevronRight, Info } from 'lucide-react';
import { DataSourceType, DataSourceTypeInfo } from '../types';
import { getDataSourcesByCategory } from '../utils/dataSourceConfig';

interface Props {
  onSelect: (type: DataSourceType) => void;
  selectedType?: DataSourceType;
  title?: string;
  description?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'database': return <Database className="w-5 h-5" />;
    case 'cloud': return <Cloud className="w-5 h-5" />;
    case 'file': return <FileText className="w-5 h-5" />;
    case 'api': return <Globe className="w-5 h-5" />;
    default: return <Database className="w-5 h-5" />;
  }
};

const getCategoryDescription = (category: string) => {
  switch (category) {
    case 'database': return 'Traditional database systems';
    case 'cloud': return 'Cloud-hosted database services';
    case 'file': return 'File-based data sources';
    case 'api': return 'API-based data sources';
    default: return '';
  }
};

const DataSourceSelector: React.FC<Props> = ({
  onSelect,
  selectedType,
  title = "Select Data Source Type",
  description = "Choose the type of data source you want to connect to"
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const categories = getDataSourcesByCategory();

  // Auto-expand category if a type is already selected
  useEffect(() => {
    if (selectedType) {
      Object.entries(categories).forEach(([category, sources]) => {
        if (sources.some(source => source.type === selectedType)) {
          setExpandedCategory(category);
        }
      });
    }
  }, [selectedType, categories]);

  const handleCategoryToggle = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleSourceSelect = (type: DataSourceType) => {
    onSelect(type);
  };

  const renderCapabilityBadge = (capability: string, supported: boolean) => (
    <span
      key={capability}
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        supported 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {capability}
    </span>
  );

  const getCapabilityList = (source: DataSourceTypeInfo) => {
    const capabilities = [];
    if (source.capabilities.supportsTransactions) capabilities.push('Transactions');
    if (source.capabilities.supportsRealTimeCDC) capabilities.push('Real-time CDC');
    if (source.capabilities.supportsPollingCDC) capabilities.push('Polling CDC');
    if (source.capabilities.supportsSchemaIntrospection) capabilities.push('Schema Detection');
    if (source.capabilities.supportsBulkOperations) capabilities.push('Bulk Operations');
    if (source.capabilities.supportsCustomQueries) capabilities.push('Custom Queries');
    return capabilities;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-gray-600 mt-1">{description}</p>
        )}
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(categories).map(([category, sources]) => (
            <div key={category} className="border border-gray-200 rounded-lg">
              {/* Category Header */}
              <button
                onClick={() => handleCategoryToggle(category)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category)}
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900 capitalize">{category}</h3>
                    <p className="text-sm text-gray-500">{getCategoryDescription(category)}</p>
                  </div>
                </div>
                <ChevronRight 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedCategory === category ? 'rotate-90' : ''
                  }`} 
                />
              </button>

              {/* Category Content */}
              {expandedCategory === category && (
                <div className="border-t border-gray-200 p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {sources.map((source) => (
                      <div
                        key={source.type}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedType === source.type
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                        onClick={() => handleSourceSelect(source.type)}
                      >
                        {/* Source Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{source.icon}</span>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{source.name}</h4>
                              <p className="text-sm text-gray-600">{source.description}</p>
                            </div>
                          </div>
                          {selectedType === source.type && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>

                        {/* Capabilities */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            <Info className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Capabilities</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {getCapabilityList(source).map(capability => 
                              renderCapabilityBadge(capability, true)
                            )}
                          </div>
                        </div>

                        {/* Data Types */}
                        <div className="mt-3 space-y-1">
                          <span className="text-xs font-medium text-gray-500">Supported Data Types</span>
                          <div className="text-xs text-gray-600">
                            {source.capabilities.supportedDataTypes.slice(0, 4).join(', ')}
                            {source.capabilities.supportedDataTypes.length > 4 && '...'}
                          </div>
                        </div>

                        {/* Connection Limits */}
                        {source.capabilities.maxConnections && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              Max Connections: {source.capabilities.maxConnections}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Need help choosing?</p>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>PostgreSQL/MySQL/MSSQL:</strong> Traditional databases with full CDC support</li>
                <li>• <strong>Supabase:</strong> PostgreSQL with real-time features and easy setup</li>
                <li>• <strong>Google Sheets:</strong> Simple spreadsheet data with polling-based sync</li>
                <li>• <strong>AWS RDS:</strong> Managed cloud databases with optional SSH tunneling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceSelector;

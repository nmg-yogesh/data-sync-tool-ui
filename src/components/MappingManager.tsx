import React, { useState, useEffect } from 'react';
import { TableMapping, ColumnMapping, JoinConfig } from '../types';
import { API_BASE_URL } from '@/api';

interface TableInfo {
  table_name: string;
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: boolean;
    is_primary_key?: boolean;
  }>;
}

interface MappingManagerProps {
  onMappingExecuted?: (result: any) => void;
}

export const MappingManager: React.FC<MappingManagerProps> = ({ onMappingExecuted }) => {
  const [mappings, setMappings] = useState<TableMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<TableMapping | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

  // Dynamic mapping form state
  const [sourceTables, setSourceTables] = useState<TableInfo[]>([]);
  const [destinationTables, setDestinationTables] = useState<TableInfo[]>([]);
  const [newMapping, setNewMapping] = useState<Partial<TableMapping>>({
    name: '',
    source_table: '',
    destination_table: '',
    primary_key: 'id',
    sync_type: 'full',
    enabled: true,
    column_mappings: []
  });

  // Advanced mapping with joins state
  const [newAdvancedMapping, setNewAdvancedMapping] = useState<Partial<TableMapping>>({
    name: '',
    source_table: '',
    destination_table: '',
    primary_key: 'id',
    sync_type: 'full',
    enabled: true,
    column_mappings: [],
    joins: []
  });

  useEffect(() => {
    loadMappings();
    loadSourceTables();
    loadDestinationTables();
  }, []);

  const loadSourceTables = async () => {
    try {
      console.log('Loading source tables from:', `${API_BASE_URL}/mappings/source/tables`);
      const response = await fetch(`${API_BASE_URL}/mappings/source/tables`);
      const data = await response.json();
      console.log('Source tables response:', data);
      if (data.success) {
        setSourceTables(data.tables);
        console.log('Source tables loaded:', data.tables.length);
      } else {
        console.error('Source tables failed:', data.message);
        setError(`Failed to load source tables: ${data.message}`);
      }
    } catch (err: any) {
      console.error('Failed to load source tables:', err);
      setError(`Failed to load source tables: ${err.message}`);
    }
  };

  const loadDestinationTables = async () => {
    try {
      console.log('Loading destination tables from:', `${API_BASE_URL}/mappings/destination/tables`);
      const response = await fetch(`${API_BASE_URL}/mappings/destination/tables`);
      const data = await response.json();
      console.log('Destination tables response:', data);
      if (data.success) {
        setDestinationTables(data.tables);
        console.log('Destination tables loaded:', data.tables.length);
      } else {
        console.error('Destination tables failed:', data.message);
        setError(`Failed to load destination tables: ${data.message}`);
      }
    } catch (err: any) {
      console.error('Failed to load destination tables:', err);
      setError(`Failed to load destination tables: ${err.message}`);
    }
  };

  const loadMappings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/mappings`);
      const data = await response.json();
      
      if (data.success) {
        setMappings(data.mappings);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeMapping = async (mappingId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/mappings/${mappingId}/execute`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Mapping executed successfully! Synced ${data.synced_records} records.`);
        if (onMappingExecuted) {
          onMappingExecuted(data);
        }
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeAllMappings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/mappings/execute-all`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Executed ${data.total_mappings} mappings! Synced ${data.synced_records} total records.`);
        if (onMappingExecuted) {
          onMappingExecuted(data);
        }
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDynamicMapping = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!newMapping.name || !newMapping.source_table || !newMapping.destination_table) {
        setError('Name, source table, and destination table are required');
        return;
      }

      if (!newMapping.column_mappings || newMapping.column_mappings.length === 0) {
        setError('At least one column mapping is required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMapping)
      });
      const data = await response.json();

      if (data.success) {
        alert('Mapping created successfully!');
        loadMappings();
        resetNewMapping();
        setShowCreateForm(false);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetNewMapping = () => {
    setNewMapping({
      name: '',
      source_table: '',
      destination_table: '',
      primary_key: 'id',
      sync_type: 'full',
      enabled: true,
      column_mappings: []
    });
  };

  const addColumnMapping = () => {
    const newColumnMapping: ColumnMapping = {
      source_column: '',
      destination_column: '',
      transform: undefined,
      default_value: undefined
    };

    setNewMapping(prev => ({
      ...prev,
      column_mappings: [...(prev.column_mappings || []), newColumnMapping]
    }));
  };

  const updateColumnMapping = (index: number, field: keyof ColumnMapping, value: any) => {
    setNewMapping(prev => ({
      ...prev,
      column_mappings: prev.column_mappings?.map((mapping, i) =>
        i === index ? { ...mapping, [field]: value } : mapping
      ) || []
    }));
  };

  const removeColumnMapping = (index: number) => {
    setNewMapping(prev => ({
      ...prev,
      column_mappings: prev.column_mappings?.filter((_, i) => i !== index) || []
    }));
  };

  const getSourceTableColumns = () => {
    const table = sourceTables.find(t => t.table_name === newMapping.source_table);
    return table?.columns || [];
  };

  const getDestinationTableColumns = () => {
    const table = destinationTables.find(t => t.table_name === newMapping.destination_table);
    return table?.columns || [];
  };

  const getPrimaryKeyOptions = () => {
    const columns = getSourceTableColumns();
    const primaryKeys = columns.filter(col => col.is_primary_key).map(col => col.column_name);
    return primaryKeys.length > 0 ? primaryKeys : ['id'];
  };

  // Advanced mapping functions
  const createAdvancedMapping = async () => {
    try {
      setLoading(true);

      if (!newAdvancedMapping.name || !newAdvancedMapping.source_table || !newAdvancedMapping.destination_table) {
        setError('Name, source table, and destination table are required');
        return;
      }

      if (!newAdvancedMapping.column_mappings || newAdvancedMapping.column_mappings.length === 0) {
        setError('At least one column mapping is required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdvancedMapping)
      });
      const data = await response.json();

      if (data.success) {
        alert('Advanced mapping created successfully!');
        loadMappings();
        resetAdvancedMapping();
        setShowCreateForm(false);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAdvancedMapping = () => {
    setNewAdvancedMapping({
      name: '',
      source_table: '',
      destination_table: '',
      primary_key: 'id',
      sync_type: 'full',
      enabled: true,
      column_mappings: [],
      joins: []
    });
  };

  const addJoin = () => {
    const newJoin = {
      table: '',
      type: 'LEFT' as const,
      on: '',
      source_column: '',
      join_column: '',
      columns: []
    };

    setNewAdvancedMapping(prev => ({
      ...prev,
      joins: [...(prev.joins || []), newJoin]
    }));
  };

  const updateJoin = (index: number, field: string, value: any) => {
    console.log('Updating join:', index, field, value);
    setNewAdvancedMapping(prev => ({
      ...prev,
      joins: prev.joins?.map((join, i) => {
        if (i === index) {
          const updatedJoin = { ...join, [field]: value };

          // Clear join_column when table changes (user needs to reselect appropriate column)
          if (field === 'table') {
            updatedJoin.join_column = '';
            updatedJoin.on = '';
            console.log('Join table changed to:', value, '- cleared join_column and on condition');
          }

          // Handle JOIN type changes - may affect available columns
          if (field === 'type') {
            console.log('Join type changed to:', value, '- available columns may be filtered');
            // Optionally clear join_column if the selected column is no longer valid for this join type
            // For now, we'll keep the selection but the dropdown will show filtered options
          }

          // Auto-generate ON condition when both source_column and join_column are set
          if (field === 'source_column' || field === 'join_column') {
            const sourceCol = field === 'source_column' ? value : join.source_column;
            const joinCol = field === 'join_column' ? value : join.join_column;

            if (sourceCol && joinCol && newAdvancedMapping.source_table && updatedJoin.table) {
              updatedJoin.on = `"${newAdvancedMapping.source_table}"."${sourceCol}" = "${updatedJoin.table}"."${joinCol}"`;
              console.log('Generated ON condition:', updatedJoin.on);
            }
          }

          return updatedJoin;
        }
        return join;
      }) || []
    }));
  };

  const removeJoin = (index: number) => {
    setNewAdvancedMapping(prev => ({
      ...prev,
      joins: prev.joins?.filter((_, i) => i !== index) || []
    }));
  };

  const addJoinColumn = (joinIndex: number) => {
    const newJoinColumn = {
      source_column: '',
      destination_column: '',
      transform: undefined,
      default_value: undefined
    };

    setNewAdvancedMapping(prev => ({
      ...prev,
      joins: prev.joins?.map((join, i) =>
        i === joinIndex ? { ...join, columns: [...join.columns, newJoinColumn] } : join
      ) || []
    }));
  };

  const updateJoinColumn = (joinIndex: number, columnIndex: number, field: string, value: any) => {
    setNewAdvancedMapping(prev => ({
      ...prev,
      joins: prev.joins?.map((join, i) =>
        i === joinIndex ? {
          ...join,
          columns: join.columns.map((col, j) =>
            j === columnIndex ? { ...col, [field]: value } : col
          )
        } : join
      ) || []
    }));
  };

  const removeJoinColumn = (joinIndex: number, columnIndex: number) => {
    setNewAdvancedMapping(prev => ({
      ...prev,
      joins: prev.joins?.map((join, i) =>
        i === joinIndex ? {
          ...join,
          columns: join.columns.filter((_, j) => j !== columnIndex)
        } : join
      ) || []
    }));
  };


  const getDestinationJoinTableColumns = (tableName: string) => {
    const table = destinationTables.find(t => t.table_name === newAdvancedMapping.destination_table);
    return table?.columns || [];
  };

  const getJoinTableColumns = (tableName: string, joinType?: string) => {
    console.log(newAdvancedMapping.source_table);
    console.log('getJoinTableColumns called with tableName:', tableName, 'and joinType:', joinType);

    if (!tableName) {
      console.log('No table name provided, returning empty array');
      return [];
    }
    const sourceJoinTable = sourceTables.find(t => t.table_name === newAdvancedMapping.source_table);
    const destinationJointable = sourceTables.find(t => t.table_name === tableName);
    

    if (sourceJoinTable && destinationJointable) {
    
      // Filter columns based on JOIN type
      const filteredColumns = filterColumnsByJoinType(sourceJoinTable ,destinationJointable, joinType);
      console.log('Filtered columns:', filteredColumns.map(c => c.column_name));
      return filteredColumns;
    } else {
      console.log('Table not found in sourceTables');
      return [];
    }
  };

  const filterColumnsByJoinType = (souceTable: any, destinationTable: any, joinType?: string) => {
    // For now, return all columns regardless of JOIN type
    // The JOIN type is mainly used for SQL generation, not column filtering
    // In the future, you could implement specific filtering logic if needed
    let columns:Array<string> = [];

    console.log('filterColumnsByJoinType called with columns:', columns.map((c) => c.column_name));

    console.log(`Filtering columns for JOIN type: ${joinType}, available columns:`, columns.map(c => c.column_name));

    switch (joinType) {
      case 'INNER':
        // INNER JOIN: Show all columns (required relationship)
        return columns;

      case 'LEFT':
        // LEFT JOIN: Show all columns (optional relationship)
        columns = souceTable.columns;

        return columns;

      case 'RIGHT':
        // RIGHT JOIN: Show all columns (reverse optional relationship)
         columns = destinationTable.columns;
        return columns;

      default:
        // Default: Show all columns
        return columns;
    }
  };

  const updateAdvancedColumnMapping = (index: number, field: string, value: any) => {
    setNewAdvancedMapping(prev => ({
      ...prev,
      column_mappings: prev.column_mappings?.map((mapping, i) =>
        i === index ? { ...mapping, [field]: value } : mapping
      ) || []
    }));
  };

  const addAdvancedColumnMapping = () => {
    const newColumnMapping = {
      source_column: '',
      destination_column: '',
      transform: undefined,
      default_value: undefined
    };

    setNewAdvancedMapping(prev => ({
      ...prev,
      column_mappings: [...(prev.column_mappings || []), newColumnMapping]
    }));
  };

  const removeAdvancedColumnMapping = (index: number) => {
    setNewAdvancedMapping(prev => ({
      ...prev,
      column_mappings: prev.column_mappings?.filter((_, i) => i !== index) || []
    }));
  };

  const getAdvancedSourceTableColumns = () => {
    const table = sourceTables.find(t => t.table_name === newAdvancedMapping.source_table);
    return table?.columns || [];
  };

  const getAdvancedDestinationTableColumns = () => {
    const table = destinationTables.find(t => t.table_name === newAdvancedMapping.destination_table);
    return table?.columns || [];
  };

  const getAdvancedPrimaryKeyOptions = () => {
    const columns = getAdvancedSourceTableColumns();
    const primaryKeys = columns.filter(col => col.is_primary_key).map(col => col.column_name);
    return primaryKeys.length > 0 ? primaryKeys : ['id'];
  };

  const toggleMappingEnabled = async (mappingId: string, enabled: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mappings/${mappingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      const data = await response.json();
      
      if (data.success) {
        loadMappings(); // Reload mappings
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteMapping = async (mappingId: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/mappings/${mappingId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        loadMappings(); // Reload mappings
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading mappings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Advanced Table Mappings</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create New Mapping
          </button>
          <button
            onClick={() => {
              loadSourceTables();
              loadDestinationTables();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Refresh Tables
          </button>
          <button
            onClick={executeAllMappings}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            disabled={mappings.filter(m => m.enabled).length === 0}
          >
            Execute All Enabled
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {showCreateForm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Information</h4>
          <div className="text-xs text-yellow-700">
            <p><strong>Source Tables:</strong> {sourceTables.length} loaded</p>
            <p><strong>Destination Tables:</strong> {destinationTables.length} loaded</p>
            <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
            {sourceTables.length > 0 && (
              <p><strong>Source Table Names:</strong> {sourceTables.map(t => t.table_name).join(', ')}</p>
            )}
            {destinationTables.length > 0 && (
              <p><strong>Destination Table Names:</strong> {destinationTables.map(t => t.table_name).join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Mapping Creation Tabs */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('simple')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'simple'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Simple Mapping
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'advanced'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Advanced Mapping (with JOINs)
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Simple Dynamic Mapping Creation Form */}
      {showCreateForm && activeTab === 'simple' && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create New Mapping</h3>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetNewMapping();
                setError(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mapping Name *
                </label>
                <input
                  type="text"
                  value={newMapping.name || ''}
                  onChange={(e) => setNewMapping(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-black-800"
                  placeholder="e.g., Users to Customer Profiles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sync Type
                </label>
                <select
                  value={newMapping.sync_type || 'full'}
                  onChange={(e) => setNewMapping(prev => ({ ...prev, sync_type: e.target.value as 'full' | 'incremental' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-black-800"
                >
                  <option value="full" className="text-black text-black-800">Full Sync</option>
                  <option value="incremental" className="text-black text-black-800">Incremental Sync</option>
                </select>
              </div>
            </div>

            {/* Table Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Table *
                </label>
                <select
                  value={newMapping.source_table || ''}
                  onChange={(e) => setNewMapping(prev => ({
                    ...prev,
                    source_table: e.target.value,
                    column_mappings: [] // Reset column mappings when table changes
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-black-800"
                >
                  <option value="">Select source table...</option>
                  {sourceTables.map(table => (
                    <option key={table.table_name} value={table.table_name} className="text-black text-black-800">
                      {table.table_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Table *
                </label>
                <select
                  value={newMapping.destination_table || ''}
                  onChange={(e) => setNewMapping(prev => ({
                    ...prev,
                    destination_table: e.target.value,
                    column_mappings: [] // Reset column mappings when table changes
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-black-800"
                >
                  <option value="">Select destination table...</option>
                  {destinationTables.map(table => (
                    <option key={table.table_name} value={table.table_name} className="text-black text-black-800">
                      {table.table_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Key Selection */}
            {newMapping.source_table && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Key *
                </label>
                <select
                  value={newMapping.primary_key || ''}
                  onChange={(e) => setNewMapping(prev => ({ ...prev, primary_key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500   text-black text-black-800"
                >
                  <option value="" className="text-black text-black-800">Select primary key...</option>
                  {getPrimaryKeyOptions().map(key => (
                    <option key={key} value={key} className="text-black text-black-800">
                      {key}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Column Mappings */}
            {newMapping.source_table && newMapping.destination_table && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Column Mappings *
                  </label>
                  <button
                    onClick={addColumnMapping}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Mapping
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(newMapping.column_mappings || []).map((mapping, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <select
                          value={mapping.source_column}
                          onChange={(e) => updateColumnMapping(index, 'source_column', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black text-black-800"
                        >
                          <option value="" className="text-black text-black-800">Source column...</option>
                          {getSourceTableColumns().map(col => (
                            <option key={col.column_name} value={col.column_name} className="text-black text-black-800">
                              {col.column_name} ({col.data_type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <span className="text-gray-500">→</span>

                      <div className="flex-1">
                        <select
                          value={mapping.destination_column}
                          onChange={(e) => updateColumnMapping(index, 'destination_column', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black text-black-800"
                        >
                          <option value="" className="text-black text-black-800">Destination column...</option>
                          {getDestinationTableColumns().map(col => (
                            <option key={col.column_name} value={col.column_name} className="text-black text-black-800">
                              {col.column_name} ({col.data_type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <select
                          value={mapping.transform || ''}
                          onChange={(e) => updateColumnMapping(index, 'transform', e.target.value || undefined)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black text-black-800"
                        >
                          <option value="">No transform</option>
                          <option value="lowercase">Lowercase</option>
                          <option value="uppercase">Uppercase</option>
                          <option value="trim">Trim</option>
                        </select>
                      </div>

                      <button
                        onClick={() => removeColumnMapping(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {(!newMapping.column_mappings || newMapping.column_mappings.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      No column mappings configured. Click "Add Mapping" to start.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetNewMapping();
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={createDynamicMapping}
                disabled={!newMapping.name || !newMapping.source_table || !newMapping.destination_table || !newMapping.column_mappings?.length}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md"
              >
                Create Mapping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Dynamic Mapping Creation Form with JOINs */}
      {showCreateForm && activeTab === 'advanced' && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create Advanced Mapping with JOINs</h3>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetAdvancedMapping();
                setError(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Advanced Mapping Debug Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h5 className="text-xs font-medium text-blue-800 mb-1">Advanced Mapping Debug</h5>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Selected Source Table:</strong> {newAdvancedMapping.source_table || 'None'}</p>
                <p><strong>Selected Destination Table:</strong> {newAdvancedMapping.destination_table || 'None'}</p>
                <p><strong>Available Source Columns:</strong> {getAdvancedSourceTableColumns().length}</p>
                <p><strong>Available Destination Columns:</strong> {getAdvancedDestinationTableColumns().length}</p>
                <p><strong>Column Mappings:</strong> {newAdvancedMapping.column_mappings?.length || 0}</p>
                <p><strong>JOINs:</strong> {newAdvancedMapping.joins?.length || 0}</p>
                {getAdvancedSourceTableColumns().length > 0 && (
                  <p><strong>Source Columns:</strong> {getAdvancedSourceTableColumns().map(c => c.column_name).join(', ')}</p>
                )}
                {getAdvancedDestinationTableColumns().length > 0 && (
                  <p><strong>Destination Columns:</strong> {getAdvancedDestinationTableColumns().map(c => c.column_name).join(', ')}</p>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mapping Name *
                </label>
                <input
                  type="text"
                  value={newAdvancedMapping.name || ''}
                  onChange={(e) => setNewAdvancedMapping(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500  text-black text-black-800"
                  placeholder="e.g., Users with Orders to Customer Profiles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sync Type
                </label>
                <select
                  value={newAdvancedMapping.sync_type || 'full'}
                  onChange={(e) => setNewAdvancedMapping(prev => ({ ...prev, sync_type: e.target.value as 'full' | 'incremental' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-black-800"
                >
                  <option value="full" className="text-black text-black-800">Full Sync</option>
                  <option value="incremental" className="text-black text-black-800">Incremental Sync</option>
                </select>
              </div>
            </div>

            {/* Table Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Source Table *
                </label>
                <select
                  value={newAdvancedMapping.source_table || ''}
                  onChange={(e) => setNewAdvancedMapping(prev => ({
                    ...prev,
                    source_table: e.target.value,
                    column_mappings: [],
                    joins: []
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-black-800"
                >
                  <option value="" className="text-black text-black-800">Select main source table...</option>
                  {sourceTables.map(table => (
                    <option key={table.table_name} value={table.table_name} className="text-black text-black-800">
                      {table.table_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Table *
                </label>
                <select
                  value={newAdvancedMapping.destination_table || ''}
                  onChange={(e) => setNewAdvancedMapping(prev => ({
                    ...prev,
                    destination_table: e.target.value,
                    column_mappings: []
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-black-800"
                >
                  <option value="" className="text-black text-black-800">Select destination table...</option>
                  {destinationTables.map(table => (
                    <option key={table.table_name} value={table.table_name} className="text-black text-black-800">
                      {table.table_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Key Selection */}
            {newAdvancedMapping.source_table && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Key *
                </label>
                <select
                  value={newAdvancedMapping.primary_key || ''}
                  onChange={(e) => setNewAdvancedMapping(prev => ({ ...prev, primary_key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-black-800"
                >
                  <option value="" className="text-black text-black-800">Select primary key...</option>
                  {getAdvancedPrimaryKeyOptions().map(key => (
                    <option key={key} value={key} className="text-black text-black-800">
                      {key}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* JOIN Configuration */}
            {newAdvancedMapping.source_table && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Table JOINs (Foreign Key Relationships)
                  </label>
                  <button
                    onClick={addJoin}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Add JOIN
                  </button>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {(newAdvancedMapping.joins || []).map((join, joinIndex) => (
                    <div key={`join-${joinIndex}-${join.table}-${join.type}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-800">JOIN #{joinIndex + 1}</h4>
                        <button
                          onClick={() => removeJoin(joinIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Debug info for available JOIN tables */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                        <p className="text-xs font-medium text-blue-800">Available Tables for JOIN:</p>
                        <p className="text-xs text-blue-700">
                          <strong>Source Tables:</strong> {sourceTables.length} |
                          <strong> Main Table:</strong> {newAdvancedMapping.source_table} |
                          <strong> Available for JOIN:</strong> {sourceTables.filter(t => t.table_name !== newAdvancedMapping.source_table).map(t => t.table_name).join(', ')}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Join Table</label>
                          <select
                            value={join.table}
                            onChange={(e) => updateJoin(joinIndex, 'table', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black text-black-800"
                          >
                            <option value="" className="text-black text-black-800">Select table...</option>
                            {sourceTables.filter(t => t.table_name !== newAdvancedMapping.source_table).map(table => (
                              <option key={table.table_name} value={table.table_name} className="text-black text-black-800">
                                {table.table_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Source Column</label>
                          <select
                            value={join.source_column || ''}
                            onChange={(e) => updateJoin(joinIndex, 'source_column', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black text-black-800"
                          >
                            <option value="" className="text-black text-black-800">Select source column...</option>
                            {getAdvancedSourceTableColumns().map(col => (
                              <option key={col.column_name} value={col.column_name} className="text-black text-black-800">
                                {col.column_name} ({col.data_type})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Join Column</label>
                          <select
                            key={`join-column-${joinIndex}-${join.table}`}
                            value={join.join_column || ''}
                            onChange={(e) => updateJoin(joinIndex, 'join_column', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black text-black-800"
                          >
                            <option value="" className="text-black text-black-800">Select join column...</option>
                            {getDestinationJoinTableColumns(join.table).map(col => (
                              <option key={col.column_name} value={col.column_name} className="text-black text-black-800">
                                {col.column_name} ({col.data_type})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Join Type</label>
                          <select
                            key={`join-type-${joinIndex}-${join.table}`}
                            value={join.type}
                            onChange={(e) => updateJoin(joinIndex, 'type', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black text-black-800"
                          >
                            <option value="LEFT" className="text-black text-black-800">LEFT JOIN</option>
                            <option value="INNER" className="text-black text-black-800">INNER JOIN</option>
                            <option value="RIGHT" className="text-black text-black-800">RIGHT JOIN</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ON Condition (Auto-generated)</label>
                          <input
                            type="text"
                            value={join.on}
                            readOnly
                            placeholder="Select source and join columns above to auto-generate"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black text-black-800 bg-gray-50"
                            title="This condition is automatically generated based on your column selections above"
                          />
                        </div>
                      </div>

                      {/* JOIN Column Mappings */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-medium text-gray-600">
                            Columns from {join.table || 'joined table'}
                          </label>
                          <button
                            onClick={() => addJoinColumn(joinIndex)}
                            disabled={!join.table}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-2 py-1 rounded text-xs"
                          >
                            Add Column
                          </button>
                        </div>

                        {/* Debug info for JOIN columns */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                          <p className="text-xs font-medium text-yellow-800">JOIN Debug:</p>
                          <p className="text-xs text-yellow-700">
                            <strong>Join Table:</strong> {join.table} |
                            <strong> Join Type:</strong> {join.type} |
                            <strong> Available Columns:</strong> {getJoinTableColumns(join.table, join.type).length}
                          </p>
                          <p className="text-xs text-yellow-700">
                            <strong>Source Column:</strong> {join.source_column || 'None'} |
                            <strong> Join Column:</strong> {join.join_column || 'None'}
                          </p>
                          <p className="text-xs text-yellow-700">
                            <strong>Generated ON:</strong> {join.on || 'Not generated yet'}
                          </p>
                          <p className="text-xs text-yellow-700">
                            <strong>Available Join Columns ({join.type}):</strong> {getJoinTableColumns(join.table, join.type).map(c => c.column_name).join(', ')}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {join.columns.map((column, columnIndex) => (
                            <div key={columnIndex} className="flex items-center space-x-2 bg-white p-2 rounded">
                              <div className="flex-1">
                                <select
                                  value={column.source_column}
                                  onChange={(e) => updateJoinColumn(joinIndex, columnIndex, 'source_column', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-black text-black-800"
                                >
                                  <option value="" className="text-black text-black-800">Source column...</option>
                                  {getJoinTableColumns(join.table, join.type).map(col => (
                                    <option key={col.column_name} value={col.column_name} className="text-black text-black-800">
                                      {col.column_name} ({col.data_type})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <span className="text-gray-500 text-xs">→</span>

                              <div className="flex-1">
                                <select
                                  value={column.destination_column}
                                  onChange={(e) => updateJoinColumn(joinIndex, columnIndex, 'destination_column', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-black text-black-800"
                                >
                                  <option value="" className="text-black text-black-800">Destination column...</option>
                                  {getAdvancedDestinationTableColumns().map(col => (
                                    <option key={col.column_name} value={col.column_name} className="text-black text-black-800">
                                      {col.column_name} ({col.data_type})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="w-20">
                                <select
                                  value={column.transform || ''}
                                  onChange={(e) => updateJoinColumn(joinIndex, columnIndex, 'transform', e.target.value || undefined)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs  text-black text-black-800"
                                >
                                  <option value="">No transform</option>
                                  <option value="lowercase">Lowercase</option>
                                  <option value="uppercase">Uppercase</option>
                                  <option value="trim">Trim</option>
                                </select>
                              </div>

                              <button
                                onClick={() => removeJoinColumn(joinIndex, columnIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!newAdvancedMapping.joins || newAdvancedMapping.joins.length === 0) && (
                    <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      No JOINs configured. Click "Add JOIN" to join with related tables.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Table Column Mappings */}
            {newAdvancedMapping.source_table && newAdvancedMapping.destination_table && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Main Table Column Mappings *
                  </label>
                  <button
                    onClick={addAdvancedColumnMapping}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Mapping
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(newAdvancedMapping.column_mappings || []).map((mapping, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <select
                          value={mapping.source_column}
                          onChange={(e) => updateAdvancedColumnMapping(index, 'source_column', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black text-black-800"
                        >
                          <option value="" className="text-black text-black-800">Source column...</option>
                          {getAdvancedSourceTableColumns().map(col => (
                            <option key={col.column_name} value={col.column_name} className="text-black text-black-800">
                              {col.column_name} ({col.data_type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <span className="text-gray-500">→</span>

                      <div className="flex-1">
                        <select
                          value={mapping.destination_column}
                          onChange={(e) => updateAdvancedColumnMapping(index, 'destination_column', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black text-black-800"
                        >
                          <option value="">Destination column...</option>
                          {getAdvancedDestinationTableColumns().map(col => (
                            <option key={col.column_name} value={col.column_name} className="text-black text-black-800">
                              {col.column_name} ({col.data_type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <select
                          value={mapping.transform || ''}
                          onChange={(e) => updateAdvancedColumnMapping(index, 'transform', e.target.value || undefined)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black text-black-800"
                        >
                          <option value="" className="text-black text-black-800">No transform</option>
                          <option value="lowercase" className="text-black text-black-800">Lowercase</option>
                          <option value="uppercase" className="text-black text-black-800">Uppercase</option>
                          <option value="trim" className="text-black text-black-800">Trim</option>
                        </select>
                      </div>

                      <button
                        onClick={() => removeAdvancedColumnMapping(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {(!newAdvancedMapping.column_mappings || newAdvancedMapping.column_mappings.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      No column mappings configured. Click "Add Mapping" to start.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetAdvancedMapping();
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={createAdvancedMapping}
                disabled={!newAdvancedMapping.name || !newAdvancedMapping.source_table || !newAdvancedMapping.destination_table || !newAdvancedMapping.column_mappings?.length}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md"
                title={
                  !newAdvancedMapping.name ? 'Mapping name is required' :
                  !newAdvancedMapping.source_table ? 'Source table is required' :
                  !newAdvancedMapping.destination_table ? 'Destination table is required' :
                  !newAdvancedMapping.column_mappings?.length ? 'At least one column mapping is required' :
                  'Create the advanced mapping'
                }
              >
                Create Advanced Mapping
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {mappings.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No mappings configured. Create your first mapping to get started.
            </li>
          ) : (
            mappings.map((mapping) => (
              <li key={mapping.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{mapping.name}</h3>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mapping.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {mapping.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {mapping.sync_type}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p><strong>Source:</strong> {mapping.source_table}</p>
                      <p><strong>Destination:</strong> {mapping.destination_table}</p>
                      <p><strong>Columns:</strong> {mapping.column_mappings.length} mapped</p>
                      {mapping.joins && mapping.joins.length > 0 && (
                        <p><strong>JOINs:</strong> {mapping.joins.map(j => `${j.type} ${j.table}`).join(', ')}</p>
                      )}
                      <p><strong>Primary Key:</strong> {mapping.primary_key}</p>
                      {mapping.last_sync && (
                        <p><strong>Last Sync:</strong> {new Date(mapping.last_sync).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleMappingEnabled(mapping.id, !mapping.enabled)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        mapping.enabled
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-green-200 text-green-800 hover:bg-green-300'
                      }`}
                    >
                      {mapping.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => executeMapping(mapping.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                      disabled={!mapping.enabled}
                    >
                      Execute
                    </button>
                    <button
                      onClick={() => setSelectedMapping(mapping)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteMapping(mapping.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {selectedMapping && (
        <MappingDetailModal
          mapping={selectedMapping}
          onClose={() => setSelectedMapping(null)}
        />
      )}
    </div>
  );
};

interface MappingDetailModalProps {
  mapping: TableMapping;
  onClose: () => void;
}

const MappingDetailModal: React.FC<MappingDetailModalProps> = ({ mapping, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Mapping Details: {mapping.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">Basic Information</h4>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p><strong>Source Table:</strong> {mapping.source_table}</p>
              <p><strong>Destination Table:</strong> {mapping.destination_table}</p>
              <p><strong>Primary Key:</strong> {mapping.primary_key}</p>
              <p><strong>Sync Type:</strong> {mapping.sync_type}</p>
              <p><strong>Status:</strong> {mapping.enabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Column Mappings</h4>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Column</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination Column</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mapping.column_mappings.map((cm, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cm.source_column}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cm.destination_column}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cm.transform || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cm.default_value || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {mapping.joins && mapping.joins.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900">Joins</h4>
              <div className="mt-2 space-y-2">
                {mapping.joins.map((join, index) => (
                  <div key={index} className="border rounded p-3 bg-gray-50">
                    <p className="text-sm"><strong>{join.type} JOIN {join.table}</strong></p>
                    <p className="text-sm text-gray-600">ON {join.on}</p>
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">Columns:</p>
                      {join.columns.map((cm, idx) => (
                        <p key={idx} className="text-xs text-gray-600">
                          {join.table}.{cm.source_column} → {cm.destination_column}
                          {cm.default_value && ` (default: ${cm.default_value})`}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mapping.where_clause && (
            <div>
              <h4 className="font-semibold text-gray-900">Filter Condition</h4>
              <p className="mt-2 text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                {mapping.where_clause}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BulkTransferRequest, 
  BulkTransferProgress, 
  SourceTableInfo, 
  DestinationTableStatus 
} from '../types';

interface BulkTransferManagerProps {
  onClose?: () => void;
}

export const BulkTransferManager: React.FC<BulkTransferManagerProps> = ({ onClose }) => {
  const [sourceTables, setSourceTables] = useState<SourceTableInfo[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [destinationStatus, setDestinationStatus] = useState<DestinationTableStatus[]>([]);
  const [transferOptions, setTransferOptions] = useState({
    create_tables: true,
    transfer_data: true,
    overwrite_existing: false
  });
  const [activeTransfer, setActiveTransfer] = useState<BulkTransferProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const loadSourceTables = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/bulk-transfer/source-tables');
      const data = await response.json();
      
      if (data.success) {
        setSourceTables(data.tables);
      } else {
        setError(data.message || 'Failed to load source tables');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to load source tables');
    } finally {
      setLoading(false);
    }
  };

  const checkDestinationTables = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/bulk-transfer/check-destination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables: selectedTables })
      });
      const data = await response.json();

      if (data.success) {
        setDestinationStatus(data.table_status);
      }
    } catch (error: unknown) {
      console.error('Error checking destination tables:', error);
    }
  }, [selectedTables]);

  const startBulkTransfer = async () => {
    if (selectedTables.length === 0) {
      setError('Please select at least one table to transfer');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const request: BulkTransferRequest = {
        tables: selectedTables,
        ...transferOptions
      };

      const response = await fetch('http://localhost:8080/api/bulk-transfer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json();
      
      if (data.success) {
        // Start polling for progress
        const transferId = data.transfer_id;
        pollTransferProgress(transferId);
      } else {
        setError(data.message || 'Failed to start bulk transfer');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to start bulk transfer');
    } finally {
      setLoading(false);
    }
  };

  const pollTransferProgress = async (transferId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bulk-transfer/progress/${transferId}`);
      const data = await response.json();
      
      if (data.success) {
        setActiveTransfer(data.progress);
      }
    } catch (error: unknown) {
      console.error('Error polling transfer progress:', error);
    }
  };

  const updateTransferProgress = useCallback(() => {
    if (activeTransfer) {
      pollTransferProgress(activeTransfer.transfer_id);
    }
  }, [activeTransfer]);

  // Effects
  useEffect(() => {
    loadSourceTables();
  }, []);

  useEffect(() => {
    if (selectedTables.length > 0) {
      checkDestinationTables();
    } else {
      setDestinationStatus([]);
    }
  }, [selectedTables, checkDestinationTables]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTransfer && (activeTransfer.status === 'pending' || activeTransfer.status === 'running')) {
      interval = setInterval(() => {
        updateTransferProgress();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTransfer, updateTransferProgress]);

  const handleTableSelection = (tableName: string, selected: boolean) => {
    if (selected) {
      setSelectedTables(prev => [...prev, tableName]);
    } else {
      setSelectedTables(prev => prev.filter(t => t !== tableName));
    }
  };

  const selectAllTables = () => {
    setSelectedTables(sourceTables.map(t => t.table_name));
  };

  const deselectAllTables = () => {
    setSelectedTables([]);
  };

  const getProgressPercentage = () => {
    if (!activeTransfer) return 0;
    return Math.round((activeTransfer.completed_tables / activeTransfer.total_tables) * 100);
  };

  const getRecordProgressPercentage = () => {
    if (!activeTransfer || !activeTransfer.total_records || !activeTransfer.transferred_records) return 0;
    return Math.round((activeTransfer.transferred_records / activeTransfer.total_records) * 100);
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Table Transfer</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!activeTransfer ? (
        <div className="space-y-6">
          {/* Table Selection */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Select Tables to Transfer</h3>
              <div className="space-x-2">
                <button
                  onClick={selectAllTables}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllTables}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading tables...</div>
              ) : sourceTables.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No tables found</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {sourceTables.map((table) => {
                    const isSelected = selectedTables.includes(table.table_name);
                    const destStatus = destinationStatus.find(d => d.table_name === table.table_name);
                    
                    return (
                      <div key={table.table_name} className="p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleTableSelection(table.table_name, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{table.table_name}</p>
                              <p className="text-xs text-gray-500">
                                {table.column_count} columns, {table.row_count.toLocaleString()} rows
                              </p>
                            </div>
                          </div>
                          
                          {destStatus && (
                            <div className="text-xs">
                              {destStatus.exists ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                  Exists in destination
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                                  Will be created
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Transfer Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Options</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={transferOptions.create_tables}
                  onChange={(e) => setTransferOptions(prev => ({ ...prev, create_tables: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Create tables if they don&apos;t exist</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={transferOptions.transfer_data}
                  onChange={(e) => setTransferOptions(prev => ({ ...prev, transfer_data: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Transfer table data</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={transferOptions.overwrite_existing}
                  onChange={(e) => setTransferOptions(prev => ({ ...prev, overwrite_existing: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Overwrite existing tables</span>
              </label>
            </div>
          </div>

          {/* Start Transfer Button */}
          <div className="flex justify-end">
            <button
              onClick={startBulkTransfer}
              disabled={loading || selectedTables.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium"
            >
              {loading ? 'Starting...' : `Start Transfer (${selectedTables.length} tables)`}
            </button>
          </div>
        </div>
      ) : (
        // Transfer Progress View
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-blue-900">Transfer Progress</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeTransfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                activeTransfer.status === 'failed' ? 'bg-red-100 text-red-800' :
                activeTransfer.status === 'running' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activeTransfer.status.toUpperCase()}
              </span>
            </div>
             
            <div className="space-y-3">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between text-sm text-blue-700 mb-1">
                  <span>Tables: {activeTransfer.completed_tables} / {activeTransfer.total_tables}</span>
                  <span>{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>

              {/* Record Progress */}
              {activeTransfer.total_records && (
                <div>
                  <div className="flex justify-between text-sm text-blue-700 mb-1">
                    <span>Records: {activeTransfer.transferred_records?.toLocaleString()} / {activeTransfer.total_records.toLocaleString()}</span>
                    <span>{getRecordProgressPercentage()}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getRecordProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Current Operation */}
              {activeTransfer.current_table && (
                <div className="text-sm text-blue-700">
                  <span className="font-medium">Current:</span> {activeTransfer.current_table}
                  {activeTransfer.current_operation && (
                    <span className="ml-2">({activeTransfer.current_operation.replace('_', ' ')})</span>
                  )}
                </div>
              )}

              {/* Duration */}
              <div className="text-sm text-blue-700">
                <span className="font-medium">Duration:</span> {formatDuration(activeTransfer.start_time, activeTransfer.end_time)}
              </div>
            </div>
          </div>

          {/* Table Progress Details */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Table Details</h4>
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {activeTransfer.table_progress.map((tableProgress) => (
                  <div key={tableProgress.table_name} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tableProgress.table_name}</p>
                        {tableProgress.total_records && (
                          <p className="text-xs text-gray-500">
                            {tableProgress.transferred_records?.toLocaleString() || 0} / {tableProgress.total_records.toLocaleString()} records
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tableProgress.status === 'completed' ? 'bg-green-100 text-green-800' :
                          tableProgress.status === 'failed' ? 'bg-red-100 text-red-800' :
                          tableProgress.status === 'transferring_data' ? 'bg-blue-100 text-blue-800' :
                          tableProgress.status === 'creating_table' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tableProgress.status.replace('_', ' ')}
                        </span>
                        {tableProgress.error && (
                          <p className="text-xs text-red-600 mt-1">{tableProgress.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Errors */}
          {activeTransfer.errors.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-red-900 mb-3">Errors</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="text-sm text-red-800 space-y-1">
                  {activeTransfer.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            {(activeTransfer.status === 'completed' || activeTransfer.status === 'failed') && (
              <button
                onClick={() => setActiveTransfer(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Start New Transfer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

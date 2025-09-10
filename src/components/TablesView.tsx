import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ConnectionStatus, TablesMap } from '../types';

interface SingleTableProps {
  title: string;
  connected?: boolean;
  tables: TablesMap;
  emptyText: string;
  connectHint: string;
}

const SingleTablesCard: React.FC<SingleTableProps> = ({ title, connected, tables, emptyText, connectHint }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {connected && <CheckCircle className="w-5 h-5 text-green-500" />}
      </div>
    </div>

    <div className="p-6 max-h-96 overflow-y-auto">
      {connected ? (
        Object.keys(tables).length ? (
          Object.entries(tables).map(([tableName, columns]) => (
            <div key={tableName} className="mb-4 border rounded-lg p-3">
              <h3 className="font-medium text-gray-900 mb-2">{tableName}</h3>
              <div className="text-sm text-gray-600">{columns.length} columns</div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">{emptyText}</p>
        )
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">{connectHint}</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

interface Props {
  connectionStatus?: ConnectionStatus;
  sourceTables: TablesMap;
  destTables: TablesMap;
}

const TablesView: React.FC<Props> = ({ connectionStatus, sourceTables, destTables }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SingleTablesCard
        title="Source Database Tables"
        connected={connectionStatus?.source?.connected}
        tables={sourceTables}
        emptyText="No tables found"
        connectHint="Connect to source database to view tables"
      />
      <SingleTablesCard
        title="Destination Database Tables"
        connected={connectionStatus?.destination?.connected}
        tables={destTables}
        emptyText="No tables found"
        connectHint="Connect to destination database to view tables"
      />
    </div>
  );
};

export default TablesView;

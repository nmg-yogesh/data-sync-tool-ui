export type DBType = 'source' | 'destination';

// Enhanced types for multi-source support
export enum DataSourceType {
  POSTGRESQL = 'postgresql',
  MSSQL = 'mssql',
  MYSQL = 'mysql',
  GOOGLE_SHEETS = 'google_sheets',
  AWS_RDS_POSTGRES = 'aws_rds_postgres',
  AWS_RDS_MYSQL = 'aws_rds_mysql',
  AWS_RDS_MSSQL = 'aws_rds_mssql',
  SUPABASE = 'supabase',
  MONGODB = 'mongodb',
  SQLITE = 'sqlite'
}

export interface ColumnInfo {
  column_name: string;
  data_type?: string;
  is_nullable?: boolean | string;
}

export type TablesMap = Record<string, ColumnInfo[]>;

export interface ConnectionConfig {
  type: DataSourceType;
  name: string;
  [key: string]: any; // Allow adapter-specific configuration
}

export interface PostgreSQLConfig extends ConnectionConfig {
  type: DataSourceType.POSTGRESQL | DataSourceType.AWS_RDS_POSTGRES | DataSourceType.SUPABASE;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  sslMode?: 'require' | 'prefer' | 'disable';
}

export interface MSSQLConfig extends ConnectionConfig {
  type: DataSourceType.MSSQL | DataSourceType.AWS_RDS_MSSQL;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  encrypt?: boolean;
  trustServerCertificate?: boolean;
}

export interface MySQLConfig extends ConnectionConfig {
  type: DataSourceType.MYSQL | DataSourceType.AWS_RDS_MYSQL;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

export interface GoogleSheetsConfig extends ConnectionConfig {
  type: DataSourceType.GOOGLE_SHEETS;
  spreadsheetId: string;
  serviceAccountKey: string;
  sheetName?: string;
}

export interface TunnelConfig {
  enabled: boolean;
  sshHost: string;
  sshPort: number;
  sshUser: string;
  sshPrivateKey?: string;
  sshPassword?: string;
  localPort?: number;
  remoteHost?: string;
  remotePort?: number;
}

export interface DataSourceCapabilities {
  supportsTransactions: boolean;
  supportsRealTimeCDC: boolean;
  supportsPollingCDC: boolean;
  supportsSchemaIntrospection: boolean;
  supportsBulkOperations: boolean;
  supportsCustomQueries: boolean;
  maxConnections?: number;
  supportedDataTypes: string[];
}

export interface SingleConnectionStatus {
  connected: boolean;
  error?: string;
  last_check?: string;
  adapter_type?: DataSourceType;
  capabilities?: DataSourceCapabilities;
  metadata?: {
    version?: string;
    server_info?: string;
  };
}

export interface ConnectionStatus {
  source?: SingleConnectionStatus;
  destination?: SingleConnectionStatus;
  source_config?: PublicConnectionConfig;
  dest_config?: PublicConnectionConfig;
}

export interface PublicConnectionConfig {
  name: string;
  type: DataSourceType;
  [key: string]: any; // Allow adapter-specific fields, but password will be masked
}

export interface SyncStatus {
  sync_running: boolean;
  errors?: string[];
  connection_ready?: boolean;
  total_records_synced: number;
  last_sync?: string | null;
  source_type?: DataSourceType;
  destination_type?: DataSourceType;
  sync_method?: 'polling' | 'realtime' | 'trigger';
  performance_metrics?: {
    records_per_second?: number;
    avg_latency_ms?: number;
    last_sync_duration_ms?: number;
  };
}

export interface SyncRule {
  table_name: string;
  primary_key: string;
  sync_type: 'full' | 'incremental';
  last_sync?: string | null;
}

// Legacy interface for backward compatibility
export interface LegacyConnectionConfig {
  name: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
}

export interface TestResult {
  success: boolean;
  message: string;
  metadata?: {
    version?: string;
    server_info?: string;
    capabilities?: string[];
  };
}

// New types for multi-source API
export interface SupportedDataSourcesResponse {
  supported_types: DataSourceType[];
}

export interface ConfigurationSchemaResponse {
  schema: {
    required: string[];
    optional: string[];
    properties: Record<string, {
      type: string;
      description: string;
      default?: any;
      enum?: string[];
    }>;
  };
}

export interface DataSourceFormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'boolean' | 'select' | 'textarea';
  required: boolean;
  description?: string;
  defaultValue?: any;
  options?: { value: string; label: string; }[];
  placeholder?: string;
}

export interface DataSourceTypeInfo {
  type: DataSourceType;
  name: string;
  description: string;
  icon?: string;
  category: 'database' | 'cloud' | 'file' | 'api';
  capabilities: DataSourceCapabilities;
  configFields: DataSourceFormField[];
}

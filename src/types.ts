export type DBType = 'source' | 'destination';
export type TabType = "connections" | "dashboard" | "sync-rules" | "tables" | "bulk-transfer";

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
  [key: string]: string | number | boolean | DataSourceType | null | undefined; // Allow adapter-specific configuration
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
  [key: string]: string | DataSourceType; // Allow adapter-specific fields, but password will be masked
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

// Advanced mapping interfaces
export interface ColumnMapping {
  source_column: string;
  destination_column: string;
  transform?: string; // Optional transformation function
  default_value?: string | number | boolean | null; // Default value if source is null
}

export interface JoinConfig {
  table: string;
  type: 'INNER' | 'LEFT' | 'RIGHT';
  on: string; // Join condition, e.g., "users.id = orders.user_id"
  source_column?: string; // Column from main table for JOIN condition
  join_column?: string; // Column from joined table for JOIN condition
  columns: ColumnMapping[]; // Columns to include from joined table
}

export interface TableMapping {
  id: string; // Unique identifier for the mapping
  name: string; // Human-readable name
  source_table: string;
  destination_table: string;
  primary_key: string;
  sync_type: 'full' | 'incremental';
  column_mappings: ColumnMapping[];
  joins?: JoinConfig[]; // Optional joins with other tables
  where_clause?: string; // Optional WHERE condition
  last_sync: Date | null;
  enabled: boolean;
}

// Bulk Transfer Types
export interface BulkTransferRequest {
  tables: string[]; // Array of table names to transfer
  create_tables: boolean; // Whether to create tables if they don't exist
  transfer_data: boolean; // Whether to transfer data
  overwrite_existing: boolean; // Whether to overwrite existing tables
}

export interface BulkTransferProgress {
  transfer_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_tables: number;
  completed_tables: number;
  current_table?: string;
  current_operation?: 'creating_table' | 'transferring_data' | 'completed';
  total_records?: number;
  transferred_records?: number;
  start_time: Date;
  end_time?: Date;
  errors: string[];
  table_progress: TableTransferProgress[];
}

export interface TableTransferProgress {
  table_name: string;
  status: 'pending' | 'creating_table' | 'transferring_data' | 'completed' | 'failed';
  total_records?: number;
  transferred_records?: number;
  error?: string;
  start_time?: Date;
  end_time?: Date;
}

export interface SourceTableInfo {
  table_name: string;
  column_count: number;
  row_count: number;
}

export interface DestinationTableStatus {
  table_name: string;
  exists: boolean;
  column_count?: number;
  row_count?: number;
  error?: string;
}

// Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  created_at?: string;
  last_login?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Legacy interface for backward compatibility
export interface LegacyConnectionConfig {
  name: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
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
      default?: string | number | boolean | null;
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
  defaultValue?: string | number | boolean | null;
  options?: { value: string; label: string; }[];
  placeholder?: string;
  dependsOn?: string; // Field name that this field depends on
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

import { DataSourceType, DataSourceTypeInfo, DataSourceFormField, DataSourceCapabilities, ConnectionConfig } from '../types';

export const DATA_SOURCE_CONFIGS: Record<DataSourceType, DataSourceTypeInfo> = {
  [DataSourceType.POSTGRESQL]: {
    type: DataSourceType.POSTGRESQL,
    name: 'PostgreSQL',
    description: 'PostgreSQL database connection',
    icon: '🐘',
    category: 'database',
    capabilities: {
      supportsTransactions: true,
      supportsRealTimeCDC: true,
      supportsPollingCDC: true,
      supportsSchemaIntrospection: true,
      supportsBulkOperations: true,
      supportsCustomQueries: true,
      supportedDataTypes: ['integer', 'varchar', 'text', 'boolean', 'timestamp', 'json']
    },
    configFields: [
      {
        name: 'host',
        label: 'Host',
        type: 'text',
        required: true,
        placeholder: 'localhost',
        description: 'The hostname or IP address of your PostgreSQL server'
      },
      {
        name: 'port',
        label: 'Port',
        type: 'number',
        required: true,
        defaultValue: 5432,
        description: 'The port number (default: 5432)'
      },
      {
        name: 'database',
        label: 'Database Name',
        type: 'text',
        required: true,
        placeholder: 'postgres',
        description: 'The name of the database to connect to'
      },
      {
        name: 'user',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'postgres',
        description: 'Database username'
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        description: 'Database password'
      },
      {
        name: 'ssl',
        label: 'Enable SSL',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Enable SSL connection for security'
      },
      { 
        name: 'sslMode', 
        label: 'SSL Mode', 
        type: 'select', 
        required: false, 
        defaultValue: 'prefer',
        options: [
          { value: 'require', label: 'Require' },
          { value: 'prefer', label: 'Prefer' },
          { value: 'disable', label: 'Disable' }
        ]
      }
    ]
  },

  [DataSourceType.MSSQL]: {
    type: DataSourceType.MSSQL,
    name: 'Microsoft SQL Server',
    description: 'Microsoft SQL Server database connection',
    icon: '🏢',
    category: 'database',
    capabilities: {
      supportsTransactions: true,
      supportsRealTimeCDC: true,
      supportsPollingCDC: true,
      supportsSchemaIntrospection: true,
      supportsBulkOperations: true,
      supportsCustomQueries: true,
      supportedDataTypes: ['int', 'varchar', 'nvarchar', 'bit', 'datetime', 'uniqueidentifier']
    },
    configFields: [
      { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { name: 'port', label: 'Port', type: 'number', required: true, defaultValue: 1433 },
      { name: 'database', label: 'Database', type: 'text', required: true },
      { name: 'user', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'encrypt', label: 'Enable Encryption', type: 'boolean', required: false, defaultValue: true },
      { name: 'trustServerCertificate', label: 'Trust Server Certificate', type: 'boolean', required: false, defaultValue: false }
    ]
  },

  [DataSourceType.MYSQL]: {
    type: DataSourceType.MYSQL,
    name: 'MySQL',
    description: 'MySQL database connection',
    icon: '🐬',
    category: 'database',
    capabilities: {
      supportsTransactions: true,
      supportsRealTimeCDC: true,
      supportsPollingCDC: true,
      supportsSchemaIntrospection: true,
      supportsBulkOperations: true,
      supportsCustomQueries: true,
      supportedDataTypes: ['int', 'varchar', 'text', 'boolean', 'datetime', 'json']
    },
    configFields: [
      { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { name: 'port', label: 'Port', type: 'number', required: true, defaultValue: 3306 },
      { name: 'database', label: 'Database', type: 'text', required: true },
      { name: 'user', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'ssl', label: 'Enable SSL', type: 'boolean', required: false, defaultValue: false }
    ]
  },

  [DataSourceType.GOOGLE_SHEETS]: {
    type: DataSourceType.GOOGLE_SHEETS,
    name: 'Google Sheets',
    description: 'Google Sheets as a data source',
    icon: '📊',
    category: 'cloud',
    capabilities: {
      supportsTransactions: false,
      supportsRealTimeCDC: false,
      supportsPollingCDC: true,
      supportsSchemaIntrospection: true,
      supportsBulkOperations: true,
      supportsCustomQueries: false,
      maxConnections: 100,
      supportedDataTypes: ['string', 'number', 'boolean', 'date']
    },
    configFields: [
      { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true, description: 'The ID from the Google Sheets URL' },
      { name: 'serviceAccountKey', label: 'Service Account Key', type: 'textarea', required: true, description: 'JSON service account key from Google Cloud Console' },
      { name: 'sheetName', label: 'Sheet Name', type: 'text', required: false, description: 'Optional: specific sheet name' }
    ]
  },

  [DataSourceType.SUPABASE]: {
    type: DataSourceType.SUPABASE,
    name: 'Supabase',
    description: 'Supabase PostgreSQL database',
    icon: '⚡',
    category: 'cloud',
    capabilities: {
      supportsTransactions: true,
      supportsRealTimeCDC: true,
      supportsPollingCDC: true,
      supportsSchemaIntrospection: true,
      supportsBulkOperations: true,
      supportsCustomQueries: true,
      supportedDataTypes: ['integer', 'varchar', 'text', 'boolean', 'timestamp', 'json', 'vector']
    },
    configFields: [
      { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'your-project.supabase.co' },
      { name: 'port', label: 'Port', type: 'number', required: true, defaultValue: 5432 },
      { name: 'database', label: 'Database', type: 'text', required: true, defaultValue: 'postgres' },
      { name: 'user', label: 'Username', type: 'text', required: true, defaultValue: 'postgres' },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'supabaseUrl', label: 'Supabase URL', type: 'text', required: false, description: 'Optional: Supabase project URL' },
      { name: 'supabaseKey', label: 'Supabase Key', type: 'password', required: false, description: 'Optional: Supabase anon/service key' }
    ]
  },

  [DataSourceType.AWS_RDS_POSTGRES]: {
    type: DataSourceType.AWS_RDS_POSTGRES,
    name: 'AWS RDS PostgreSQL',
    description: 'Amazon RDS PostgreSQL instance',
    icon: '☁️',
    category: 'cloud',
    capabilities: {
      supportsTransactions: true,
      supportsRealTimeCDC: true,
      supportsPollingCDC: true,
      supportsSchemaIntrospection: true,
      supportsBulkOperations: true,
      supportsCustomQueries: true,
      supportedDataTypes: ['integer', 'varchar', 'text', 'boolean', 'timestamp', 'json']
    },
    configFields: [
      {
        name: 'host',
        label: 'RDS Endpoint (Host)',
        type: 'text',
        required: true,
        placeholder: 'your-db.region.rds.amazonaws.com',
        description: 'The RDS endpoint URL from AWS Console → RDS → Databases → Your DB → Connectivity & security'
      },
      {
        name: 'port',
        label: 'Port Number',
        type: 'number',
        required: true,
        defaultValue: 5432,
        description: 'Default PostgreSQL port is 5432. Check your RDS security group settings.'
      },
      {
        name: 'database',
        label: 'Database Name',
        type: 'text',
        required: true,
        placeholder: 'postgres',
        description: 'The initial database name you specified when creating the RDS instance'
      },
      {
        name: 'user',
        label: 'Master Username',
        type: 'text',
        required: true,
        placeholder: 'postgres',
        description: 'The master username you set when creating the RDS instance'
      },
      {
        name: 'password',
        label: 'Master Password',
        type: 'password',
        required: true,
        description: 'The master password for your RDS instance'
      },
      {
        name: 'region',
        label: 'AWS Region',
        type: 'text',
        required: true,
        placeholder: 'us-east-1',
        description: 'The AWS region where your RDS instance is located (e.g., us-east-1, eu-west-1)'
      },
      {
        name: 'ssl',
        label: 'Enable SSL Connection',
        type: 'boolean',
        required: false,
        defaultValue: true,
        description: 'Recommended for secure connections. Most RDS instances require SSL.'
      },
      {
        name: 'tunnel.enabled',
        label: 'Enable SSH Tunnel',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Use SSH tunnel to connect through a bastion host'
      },
      {
        name: 'tunnel.sshHost',
        label: 'SSH Host',
        type: 'text',
        required: false,
        placeholder: 'bastion.example.com',
        description: 'SSH bastion host or jump server',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshPort',
        label: 'SSH Port',
        type: 'number',
        required: false,
        defaultValue: 22,
        description: 'SSH port (default: 22)',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshUser',
        label: 'SSH Username',
        type: 'text',
        required: false,
        placeholder: 'ec2-user',
        description: 'SSH username for bastion host',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshPrivateKey',
        label: 'SSH Private Key',
        type: 'textarea',
        required: false,
        placeholder: '-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----',
        description: 'SSH private key in PEM format (alternative to password)',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshPassword',
        label: 'SSH Password',
        type: 'password',
        required: false,
        description: 'SSH password (alternative to private key)',
        dependsOn: 'tunnel.enabled'
      }
    ]
  },

  [DataSourceType.AWS_RDS_MYSQL]: {
    type: DataSourceType.AWS_RDS_MYSQL,
    name: 'AWS RDS MySQL',
    description: 'Amazon RDS MySQL instance',
    icon: '☁️',
    category: 'cloud',
    capabilities: {
      supportsTransactions: true,
      supportsRealTimeCDC: true,
      supportsPollingCDC: true,
      supportsSchemaIntrospection: true,
      supportsBulkOperations: true,
      supportsCustomQueries: true,
      supportedDataTypes: ['int', 'varchar', 'text', 'boolean', 'datetime', 'json']
    },
    configFields: [
      {
        name: 'host',
        label: 'RDS Endpoint (Host)',
        type: 'text',
        required: true,
        placeholder: 'your-mysql-db.region.rds.amazonaws.com',
        description: 'The RDS endpoint URL from AWS Console → RDS → Databases → Your DB → Connectivity & security'
      },
      {
        name: 'port',
        label: 'Port Number',
        type: 'number',
        required: true,
        defaultValue: 3306,
        description: 'Default MySQL port is 3306. Check your RDS security group settings.'
      },
      {
        name: 'database',
        label: 'Database Name',
        type: 'text',
        required: true,
        placeholder: 'mysql',
        description: 'The initial database name you specified when creating the RDS instance'
      },
      {
        name: 'user',
        label: 'Master Username',
        type: 'text',
        required: true,
        placeholder: 'admin',
        description: 'The master username you set when creating the RDS instance'
      },
      {
        name: 'password',
        label: 'Master Password',
        type: 'password',
        required: true,
        description: 'The master password for your RDS instance'
      },
      {
        name: 'region',
        label: 'AWS Region',
        type: 'text',
        required: true,
        placeholder: 'us-east-1',
        description: 'The AWS region where your RDS instance is located (e.g., us-east-1, eu-west-1)'
      },
      {
        name: 'ssl',
        label: 'Enable SSL Connection',
        type: 'boolean',
        required: false,
        defaultValue: true,
        description: 'Recommended for secure connections. Most RDS instances require SSL.'
      },
      {
        name: 'tunnel.enabled',
        label: 'Enable SSH Tunnel',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Use SSH tunnel to connect through a bastion host'
      },
      {
        name: 'tunnel.sshHost',
        label: 'SSH Host',
        type: 'text',
        required: false,
        placeholder: 'bastion.example.com',
        description: 'SSH bastion host or jump server',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshPort',
        label: 'SSH Port',
        type: 'number',
        required: false,
        defaultValue: 22,
        description: 'SSH port (default: 22)',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshUser',
        label: 'SSH Username',
        type: 'text',
        required: false,
        placeholder: 'ec2-user',
        description: 'SSH username for bastion host',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshPrivateKey',
        label: 'SSH Private Key',
        type: 'textarea',
        required: false,
        placeholder: '-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----',
        description: 'SSH private key in PEM format (alternative to password)',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshPassword',
        label: 'SSH Password',
        type: 'password',
        required: false,
        description: 'SSH password (alternative to private key)',
        dependsOn: 'tunnel.enabled'
      }
    ]
  },

  [DataSourceType.AWS_RDS_MSSQL]: {
    type: DataSourceType.AWS_RDS_MSSQL,
    name: 'AWS RDS SQL Server',
    description: 'Amazon RDS SQL Server instance',
    icon: '☁️',
    category: 'cloud',
    capabilities: {
      supportsTransactions: true,
      supportsRealTimeCDC: true,
      supportsPollingCDC: true,
      supportsSchemaIntrospection: true,
      supportsBulkOperations: true,
      supportsCustomQueries: true,
      supportedDataTypes: ['int', 'varchar', 'nvarchar', 'bit', 'datetime', 'uniqueidentifier']
    },
    configFields: [
      {
        name: 'host',
        label: 'RDS Endpoint (Host)',
        type: 'text',
        required: true,
        placeholder: 'your-sqlserver-db.region.rds.amazonaws.com',
        description: 'The RDS endpoint URL from AWS Console → RDS → Databases → Your DB → Connectivity & security'
      },
      {
        name: 'port',
        label: 'Port Number',
        type: 'number',
        required: true,
        defaultValue: 1433,
        description: 'Default SQL Server port is 1433. Check your RDS security group settings.'
      },
      {
        name: 'database',
        label: 'Database Name',
        type: 'text',
        required: true,
        placeholder: 'master',
        description: 'The initial database name (usually "master" for SQL Server)'
      },
      {
        name: 'user',
        label: 'Master Username',
        type: 'text',
        required: true,
        placeholder: 'admin',
        description: 'The master username you set when creating the RDS instance'
      },
      {
        name: 'password',
        label: 'Master Password',
        type: 'password',
        required: true,
        description: 'The master password for your RDS instance'
      },
      {
        name: 'region',
        label: 'AWS Region',
        type: 'text',
        required: true,
        placeholder: 'us-east-1',
        description: 'The AWS region where your RDS instance is located (e.g., us-east-1, eu-west-1)'
      },
      {
        name: 'encrypt',
        label: 'Enable Encryption',
        type: 'boolean',
        required: false,
        defaultValue: true,
        description: 'Recommended for secure connections. Most RDS instances require encryption.'
      },
      {
        name: 'tunnel.enabled',
        label: 'Enable SSH Tunnel',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Use SSH tunnel to connect through a bastion host'
      },
      {
        name: 'tunnel.sshHost',
        label: 'SSH Host',
        type: 'text',
        required: false,
        placeholder: 'bastion.example.com',
        description: 'SSH bastion host or jump server',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshPort',
        label: 'SSH Port',
        type: 'number',
        required: false,
        defaultValue: 22,
        description: 'SSH port (default: 22)',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshUser',
        label: 'SSH Username',
        type: 'text',
        required: false,
        placeholder: 'ec2-user',
        description: 'SSH username for bastion host',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshPrivateKey',
        label: 'SSH Private Key',
        type: 'textarea',
        required: false,
        placeholder: '-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----',
        description: 'SSH private key in PEM format (alternative to password)',
        dependsOn: 'tunnel.enabled'
      },
      {
        name: 'tunnel.sshPassword',
        label: 'SSH Password',
        type: 'password',
        required: false,
        description: 'SSH password (alternative to private key)',
        dependsOn: 'tunnel.enabled'
      }
    ]
  },

  [DataSourceType.MONGODB]: {
    type: DataSourceType.MONGODB,
    name: 'MongoDB',
    description: 'MongoDB database connection',
    icon: '🍃',
    category: 'database',
    capabilities: {
      supportsTransactions: true,
      supportsRealTimeCDC: true,
      supportsPollingCDC: true,
      supportsSchemaIntrospection: false,
      supportsBulkOperations: true,
      supportsCustomQueries: true,
      supportedDataTypes: ['string', 'number', 'boolean', 'date', 'object', 'array']
    },
    configFields: [
      { name: 'connectionString', label: 'Connection String', type: 'text', required: true, placeholder: 'mongodb://localhost:27017/mydb' },
      { name: 'database', label: 'Database', type: 'text', required: true }
    ]
  },

  [DataSourceType.SQLITE]: {
    type: DataSourceType.SQLITE,
    name: 'SQLite',
    description: 'SQLite database file',
    icon: '📁',
    category: 'file',
    capabilities: {
      supportsTransactions: true,
      supportsRealTimeCDC: false,
      supportsPollingCDC: true,
      supportsSchemaIntrospection: true,
      supportsBulkOperations: true,
      supportsCustomQueries: true,
      supportedDataTypes: ['integer', 'text', 'real', 'blob']
    },
    configFields: [
      { name: 'filePath', label: 'Database File Path', type: 'text', required: true, placeholder: '/path/to/database.db' }
    ]
  }
};

export const getDataSourceConfig = (type: DataSourceType): DataSourceTypeInfo => {
  return DATA_SOURCE_CONFIGS[type];
};

export const getDataSourcesByCategory = () => {
  const categories: Record<string, DataSourceTypeInfo[]> = {};
  
  Object.values(DATA_SOURCE_CONFIGS).forEach(config => {
    if (!categories[config.category]) {
      categories[config.category] = [];
    }
    categories[config.category].push(config);
  });
  
  return categories;
};

export const createDefaultConfig = (type: DataSourceType): Partial<ConnectionConfig> => {
  const config = getDataSourceConfig(type);
  const defaultConfig: any = {
    type,
    name: `${config.name} Connection`
  };
  
  config.configFields.forEach(field => {
    if (field.defaultValue !== undefined) {
      defaultConfig[field.name] = field.defaultValue;
    }
  });
  
  return defaultConfig;
};

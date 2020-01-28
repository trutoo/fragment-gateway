declare module 'winston-azuretable' {
  import * as Transport from 'winston-transport';

  namespace AzureTable {
    interface AzureTransportOptions extends Transport.TransportStreamOptions {
      /**  boolean denoting whether to use the Azure Storage Emulator (default: false) */
      useDevStorage?: boolean;
      /**  Azure Storage Account Name. If unset, will use AZURE_STORAGE_ACCOUNT environment variable. */
      account?: string;
      /**  Azure Storage Account Key. If unset, will use AZURE_STORAGE_ACCESS_KEY environment variable. */
      key?: string;
      /**  logging level (default: info) */
      level?: string;
      /**  name of table where logs will be outputted (default: log) */
      tableName?: string;
      /**  table partition key (default: process.env.NODE_ENV) */
      partitionKey?: string;
      /**  boolean flag indicating whether to suppress output to tables (default: false) */
      silent?: boolean;
      /**  store metadata as a JSON document in meta column (default: false) */
      nestedMeta?: boolean;
      /** function called after table creation */
      callback?: Function;
    }
  }

  interface AzureTransportInstance extends Transport {
    /**  boolean denoting whether to use the Azure Storage Emulator (default: false) */
    useDevStorage: boolean;
    /**  Azure Storage Account Name. If unset, will use AZURE_STORAGE_ACCOUNT environment variable. */
    account: string;
    /**  Azure Storage Account Key. If unset, will use AZURE_STORAGE_ACCESS_KEY environment variable. */
    key: string;
    /**  logging level (default: info) */
    level: string;
    /**  name of table where logs will be outputted (default: log) */
    tableName: string;
    /**  table partition key (default: process.env.NODE_ENV) */
    partitionKey: string;
    /**  boolean flag indicating whether to suppress output to tables (default: false) */
    silent: boolean;
    /**  store metadata as a JSON document in meta column (default: false) */
    nestedMeta: boolean;
    /** function called after table creation */
    callback: Function;

    new (options?: AzureTable.AzureTransportOptions): AzureTransportInstance;
  }

  const Logger: { AzureLogger: AzureTransportInstance };

  export = Logger;
}

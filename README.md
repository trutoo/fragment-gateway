# Fragment Gateway

Responsible for fetching and storing npm packages and is accessible at `/fragments/scope$name@version`. Requests to these packages are returned in a fragment format, where body will be a rendered HTML and a X-Link header which may contain multiple `fragment-script` and `stylesheet`.

## Environmental Configurations

### PORT

**Default**: `3000`  
Port which the server listens on.

### REGISTRY

**Default**: `https://registry.npmjs.org`  
Url specifying an alternative or private registry to fetch packages from.

### REGISTRY_TOKEN

**Default**: `undefined`  
Access token used if registry is private or needs additional permissions.

### ALLOW_LATEST

**DEFAULT**: `false`  
Flag allowing usage of `@latest` as version tag. This will generate a new request to the registry each time, then checking cache. Not recommended in production.

### INCLUDE

**Default**: `undefined`  
List of patterns following [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) rules separated by comma without start and end slash, that should be included. If omitted all packages will be included, if not explicitly excluded.

### EXCLUDE

**Default**: `undefined`  
List of patterns following [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) rules separated by comma without start and end slash, that should be excluded. Takes precedence over [INCLUDE](#INCLUDE). If omitted all packages will be included.

### INCLUDE_FILES

**Default**: `undefined`  
List of patterns following [minimatch](https://github.com/isaacs/minimatch) rules separated by comma, that should be included. If omitted all files will be included, if not explicitly excluded.

### EXCLUDE_FILES

**Default**: `undefined`  
List of patterns following [minimatch](https://github.com/isaacs/minimatch) rules separated by comma, that should be excluded. Takes precedence over [INCLUDE_FILES](#INCLUDE_FILES). If omitted all files will be included.

### LOG_LEVEL

**Default**: `debug`  
Global log level.

### AZURE_STORAGE_ACCOUNT

**Default**: `undefined`  
Azure storage account name for logging to azure tables. If not defined no logs are written to azure.

### AZURE_STORAGE_ACCESS_KEY

**Default**: `undefined`  
Azure storage account access key for logging to azure tables.

### AZURE_STORAGE_TABLE

**Default**: `fragmentgateway`  
Azure storage account logging table name.

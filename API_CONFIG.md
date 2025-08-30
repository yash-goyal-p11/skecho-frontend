# API Configuration Guide

This project uses a centralized API configuration system with environment-based URLs for easy switching between development and production environments.

## Environment Setup

### Development
Copy `env.development` to `.env.development`:
```bash
cp env.development .env.development
```

### Production
Copy `env.production` to `.env.production` and update the API URL:
```bash
cp env.production .env.production
```

Then edit `.env.production` and set your production API URL:
```
VITE_API_BASE_URL=https://your-production-api.com/api
VITE_ENV=production
```

## Usage

### Import the API client
```typescript
import { apiClient } from '@/lib/api';
```

### Making API calls
Instead of:
```typescript
// Old way
import axios from 'axios';
const response = await axios.get('http://40.81.226.49/api/products');
```

Use:
```typescript
// New way
const response = await apiClient.get('/products');
```

### With parameters
```typescript
// For endpoints with parameters
const response = await apiClient.get(`/products/${productId}`);
```

### POST requests
```typescript
const response = await apiClient.post('/products', productData);
```

### PUT requests
```typescript
const response = await apiClient.put(`/products/${productId}`, updatedData);
```

### DELETE requests
```typescript
const response = await apiClient.delete(`/products/${productId}`);
```

## Features

### Automatic Authentication
The API client automatically adds authentication tokens to requests when a user is logged in.

### Error Handling
- 401 errors automatically redirect to login
- 403 errors are logged as access denied
- 500+ errors are logged as server errors

### Environment Detection
The system automatically detects the environment:
- `development` - Uses development API URL
- `staging` - Uses staging API URL (if VITE_ENV=staging)
- `production` - Uses production API URL

### Timeout Configuration
- Development: 10 seconds
- Staging: 12 seconds  
- Production: 15 seconds

## Migration Guide

### Simple Migration
To migrate existing code, just replace:

1. **Import statement:**
   ```typescript
   // Old
   import axios from 'axios';
   
   // New
   import { apiClient } from '@/lib/api';
   ```

2. **API calls:**
   ```typescript
   // Old
   const response = await axios.get('http://40.81.226.49/api/products');
   
   // New
   const response = await apiClient.get('/products');
   ```

### Benefits of Migration
- ✅ **Environment switching** - Just change the environment file
- ✅ **Automatic auth** - No need to manually add tokens
- ✅ **Better error handling** - Centralized error management
- ✅ **Consistent timeouts** - Environment-specific timeouts
- ✅ **Easy debugging** - Use `getApiConfig()` to see current settings

## Debugging

To check the current API configuration:
```typescript
import { getApiConfig } from '@/lib/api';
console.log(getApiConfig());
```

This will show:
```javascript
{
  environment: 'development',
  baseUrl: 'http://40.81.226.49/api',
  timeout: 10000
}
```

## Example Migrations

### Before (with hardcoded URLs)
```typescript
import axios from 'axios';

// Fetch products
const response = await axios.get('http://40.81.226.49/api/products');

// Create product
const createResponse = await axios.post('http://40.81.226.49/api/products', data);

// Update product
const updateResponse = await axios.put(`http://40.81.226.49/api/products/${id}`, data);
```

### After (with centralized config)
```typescript
import { apiClient } from '@/lib/api';

// Fetch products
const response = await apiClient.get('/products');

// Create product
const createResponse = await apiClient.post('/products', data);

// Update product
const updateResponse = await apiClient.put(`/products/${id}`, data);
```

That's it! Your existing code structure stays the same, just with the benefits of centralized configuration. 
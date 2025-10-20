# Agentic Configuration API Key Fix

## Issues Fixed

### Issue 1: 500 Error on Page Reload After Manual API Key Entry
When manually adding an API key in the agentic configuration page, saving the configuration would result in a 500 error on subsequent page loads.

### Issue 2: Manual API Key Not Persisting
Manually entered API keys were not being saved to the configuration, so they would be lost after page refresh.

### Issue 3: API Key Not Being Sent to Backend
Even when manually entered, the API key was sometimes not being properly sent to the backend, resulting in "OPENAI_API_KEY environment variable is missing" errors.

## Root Cause
The problem occurred due to several issues:

1. **Credential State Not Cleared**: When a user manually entered an API key in the bearer token field, the `selectedCredential` state was not being cleared. This meant that when the configuration was saved, it would save both the manually entered API key AND the old credential ID (which might be empty or invalid).

2. **Invalid Credential Loading**: When the page reloaded and tried to load the saved configuration, it would attempt to fetch the invalid credential ID, which could cause errors.

3. **Race Condition**: The `loadSolution()` function was being called before `fetchCredentials()` completed, so the credential validation couldn't check if the credential actually existed.

## Solutions Implemented

### 1. Clear Selected Credential on Manual API Key Entry
**File**: `packages/ui/src/views/agentic/index.jsx`

Added logic to clear the `selectedCredential` when a user manually enters an API key:

```javascript
onChange={(e) => {
    const value = e.target.value
    setBearerToken(value)
    // Extract just the API key (remove "Bearer " if present) for fullApiKey
    if (value.startsWith('Bearer ')) {
        setFullApiKey(value.substring(7).trim())
    } else {
        setFullApiKey(value.trim())
    }
    // Clear the selected credential when manually entering an API key
    if (value.trim()) {
        setSelectedCredential('')
    }
}}
```

### 2. Only Save Valid Credentials
**File**: `packages/ui/src/views/agentic/index.jsx`

Modified the `saveConfiguration` function to only save `selectedCredential` if it's a valid non-empty string:

```javascript
const config = {
    welcomeMessage,
    prompt,
    selectedModel,
    temperature,
    maxTokens,
    topP,
    tools,
    documents,
    // Only save selectedCredential if it's a valid non-empty string
    ...(selectedCredential && selectedCredential.trim() !== '' && { selectedCredential })
}
```

### 3. Validate Credentials Before Loading
**File**: `packages/ui/src/views/agentic/index.jsx`

Added validation in `loadSolution` to check if a saved credential exists before trying to load it:

```javascript
// Handle credential loading with validation
if (config.selectedCredential) {
    // First check if the credential exists before setting it
    const credentialExists = credentials.find(c => c.id === config.selectedCredential)
    if (credentialExists) {
        setSelectedCredential(config.selectedCredential)
        // Fetch the credential details
        handleCredentialChange(config.selectedCredential)
    } else {
        console.warn('Saved credential not found:', config.selectedCredential)
        // Clear the credential selection if it doesn't exist
        setSelectedCredential('')
        setFullApiKey('')
        setBearerToken('')
    }
}
```

### 4. Fix Race Condition
**File**: `packages/ui/src/views/agentic/index.jsx`

Added a `credentialsFetched` state to ensure credentials are loaded before validating them:

```javascript
// New state
const [credentialsFetched, setCredentialsFetched] = useState(false)

// In fetchCredentials
finally {
    setCredentialsFetched(true)
}

// Updated useEffect
useEffect(() => {
    if (solutionId && credentialsFetched) {
        // Only load solution after credentials have been fetched
        loadSolution()
    }
}, [solutionId, credentialsFetched])
```

### 5. Better Error Handling in handleCredentialChange
**File**: `packages/ui/src/views/agentic/index.jsx`

Added early return if credential doesn't exist:

```javascript
const selectedCred = credentials.find(c => c.id === credentialId)

if (!selectedCred) {
    console.warn('⚠️  Credential ID not found in credentials list:', credentialId)
    setFullApiKey('')
    setBearerToken('')
    return
}
```

## Testing
To verify the fix works:

1. Navigate to the agentic configuration page
2. Manually enter an API key in the "Bearer Token" field
3. Click "Save Configuration"
4. Refresh the page
5. Verify that no 500 error occurs and the page loads correctly

### 6. Save and Restore Manual API Keys
**Files**: 
- `packages/ui/src/views/agentic/index.jsx`

Added logic to save manually entered API keys to the configuration:

```javascript
const config = {
    welcomeMessage,
    prompt,
    selectedModel,
    temperature,
    maxTokens,
    topP,
    tools,
    documents,
    // Only save selectedCredential if it's a valid non-empty string
    ...(selectedCredential && selectedCredential.trim() !== '' && { selectedCredential }),
    // Save manually entered API key (if any)
    ...(fullApiKey && fullApiKey.trim() !== '' && !selectedCredential && { manualApiKey: fullApiKey })
}
```

And restore them when loading:

```javascript
else if (config.manualApiKey) {
    // Restore manually entered API key
    console.log('Restoring manually entered API key')
    setFullApiKey(config.manualApiKey)
    setBearerToken(`Bearer ${config.manualApiKey.substring(0, 10)}...${config.manualApiKey.substring(config.manualApiKey.length - 4)}`)
}
```

### 7. Better API Key Validation and Trimming
**Files**:
- `packages/ui/src/views/agentic/index.jsx`
- `packages/ui/src/api/agentic.js`
- `packages/server/src/services/agentic/index.ts`

Added proper trimming and validation of API keys throughout the flow:

**Frontend (index.jsx)**:
```javascript
const apiKeyToSend = fullApiKey ? fullApiKey.trim() : undefined
console.log('📤 Final API Key to send:', apiKeyToSend ? `${apiKeyToSend.substring(0, 20)}...` : 'undefined (will use backend env)')
response = await agenticApi.sendChatMessage(finalPayload, apiKeyToSend)
```

**API Layer (agentic.js)**:
```javascript
if (authToken && typeof authToken === 'string' && authToken.trim().length > 0) {
    config.headers = {
        'Authorization': `Bearer ${authToken.trim()}`
    }
}
```

**Backend (agentic/index.ts)**:
```javascript
logger.info('🔍 API Key Extraction Debug:')
logger.info('  - providedApiKey exists:', !!providedApiKey)
logger.info('  - providedApiKey type:', typeof providedApiKey)
logger.info('  - providedApiKey length:', providedApiKey ? providedApiKey.length : 0)

// Get API key from header (providedApiKey) or environment variable
// Trim the API key to remove any whitespace
let apiKey = (providedApiKey && providedApiKey.trim()) || process.env.OPENAI_API_KEY || process.env.AGENTIC_AI_API_KEY

if (!apiKey || apiKey.trim() === '') {
    throw new InternalFlowiseError(
        StatusCodes.PRECONDITION_FAILED,
        'OpenAI API key is required. Please select a credential or set OPENAI_API_KEY environment variable.'
    )
}
```

## Files Modified
- `packages/ui/src/views/agentic/index.jsx`
- `packages/ui/src/api/agentic.js`
- `packages/server/src/services/agentic/index.ts`

## Debugging Features Added
Added comprehensive logging throughout the flow to help diagnose API key issues:

1. **Frontend Console Logs**:
   - API key source (credential vs manual entry)
   - API key length and format validation
   - API key preview (masked)
   - Full request payload

2. **Backend Server Logs**:
   - API key extraction details
   - API key presence in payload vs environment
   - API key length and preview
   - OpenAI model initialization details

## Status
✅ **Fixed** - The agentic configuration page now:
- ✅ Properly handles manually entered API keys
- ✅ Saves manual API keys to configuration (persists across reloads)
- ✅ Validates and trims API keys before sending
- ✅ Provides comprehensive logging for debugging
- ✅ Clears credential selection when manually entering keys
- ✅ Prevents 500 errors from invalid credentials
- ✅ Handles race conditions between credential loading and solution loading

## User Instructions

### To Use a Manual API Key:
1. Navigate to the agentic configuration page from a bot solution
2. In the "Bearer Token" field, paste your API key (with or without "Bearer " prefix)
3. The UI will show "✓ API Key ready to use (X characters)"
4. Click "Save Configuration" to persist the API key
5. The API key will be restored automatically on page reload

### To Use a Credential:
1. Navigate to the agentic configuration page
2. Select a credential from the "Select Credential" dropdown
3. The API key will be automatically extracted from the credential
4. Click "Save Configuration" to save the credential selection

### To Switch Between Manual and Credential:
- When you manually enter an API key, the credential selection is automatically cleared
- When you select a credential, any manual API key entry is replaced

## Security Note
Manual API keys are stored in the solution's configuration as plain text in the database. For production use, it's recommended to use the Credentials feature instead, which provides encryption at rest.


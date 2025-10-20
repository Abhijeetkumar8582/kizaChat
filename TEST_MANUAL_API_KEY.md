# Testing Manual API Key Fix

## What Was Fixed
The agentic configuration page now properly handles manually entered API keys without causing errors. The key improvements are:

1. **Manual API keys are now saved** to the configuration and persist across page reloads
2. **Better validation and trimming** of API keys to prevent whitespace issues
3. **Credential selection is cleared** when manually entering a key
4. **Race conditions fixed** between credential loading and solution loading
5. **Comprehensive logging** added for debugging

## How to Test

### Test 1: Manual API Key Entry and Persistence
1. Navigate to Bot Management
2. Create or select a bot
3. Create or select a solution
4. Click "Configure" to open the agentic configuration page
5. In the "Bearer Token (Manual Entry for Testing)" field, paste your OpenAI API key:
   - You can enter it with or without the "Bearer " prefix
   - Example: `Bearer sk-proj-xxxxx` or just `sk-proj-xxxxx`
6. You should see: `✓ API Key ready to use (X characters)`
7. Click "Save Configuration"
8. **Refresh the page** (F5 or Ctrl+R)
9. **Expected Result**: The page loads without errors and your API key is still there

### Test 2: Sending a Chat Message with Manual API Key
1. After setting up your manual API key (see Test 1)
2. In the chat interface on the same page, type a message like "Hello"
3. Click Send or press Enter
4. **Expected Result**: You should receive a response from the AI
5. Open the browser console (F12 → Console tab) to see detailed logging:
   - Look for logs like "🔑 API: Adding Authorization header with API key"
   - Check that the API key is being sent correctly

### Test 3: Check Backend Logs
1. Look at the terminal where your Flowise server is running
2. When you send a chat message, you should see logs like:
   ```
   🔥 AGENTIC CHAT REQUEST RECEIVED
   🔍 API Key Extraction Debug:
     - providedApiKey exists: true
     - providedApiKey length: [your key length]
   ```
3. **Expected Result**: The backend should show that it received the API key

### Test 4: Switch from Manual to Credential
1. In the agentic configuration page with a manual API key entered
2. Select a credential from the "Select Credential" dropdown
3. **Expected Result**: The manual API key field should be cleared/updated
4. Click "Save Configuration"
5. Refresh the page
6. **Expected Result**: The credential is loaded, not the manual API key

### Test 5: Error Scenarios
1. Try entering an invalid API key (like "test123")
2. Send a chat message
3. **Expected Result**: You should get a clear error message indicating the API key is invalid
4. Check the console logs to see the debugging information

## Common Issues and Solutions

### Issue: "OPENAI_API_KEY environment variable is missing"
**Possible Causes:**
- The API key has extra whitespace (now fixed with trimming)
- The API key is empty or invalid
- The API key is not being saved properly

**How to Debug:**
1. Open browser console (F12)
2. Look for logs starting with "🔐 AUTHENTICATION FLOW:"
3. Check "API Key Length:" - should be > 40 characters for OpenAI keys
4. Check "API Key is valid format:" - should be `true`
5. Look at backend logs for "🔍 API Key Extraction Debug:"

### Issue: API Key Not Persisting After Refresh
**Solution:**
- Make sure you clicked "Save Configuration" before refreshing
- Check browser console for any errors during save
- Verify the configuration was saved by checking the solution details

### Issue: 500 Error on Page Load
**Solution:**
- This should now be fixed
- If it still occurs, check the browser console and backend logs
- The page should gracefully handle missing or invalid credentials

## Expected Console Output

### Frontend (Browser Console)
```
🚀 SENDING API REQUEST TO BACKEND
📍 Endpoint: POST /api/v1/agentic/chat
🔐 AUTHENTICATION FLOW:
  ℹ️  Authorization: Bearer token will be sent in header
  ℹ️  API Key Source: Manual Entry / Selected Credential
  ℹ️  API Key Length: 164
  ℹ️  API Key is valid format: true
📤 Final API Key to send: sk-proj-xxxxxxxxxxxxx...
🔑 API: Adding Authorization header with API key: sk-proj-xxxxxxxxxxxxx...
```

### Backend (Server Terminal)
```
🔥 AGENTIC CHAT REQUEST RECEIVED
🔍 API Key Extraction Debug:
  - providedApiKey exists: true
  - providedApiKey type: string
  - providedApiKey length: 164
  - providedApiKey preview: sk-proj-xxxxxxxxxxxxx...
  - Final apiKey selected: sk-proj-xxxxxxxxxxxxx...
🔑 AUTHORIZATION & API KEY INFO
  API Key Details: { source: 'Authorization Header (from frontend credential)', ... }
```

## Need Help?
If you encounter any issues:
1. Check the browser console (F12 → Console)
2. Check the server terminal logs
3. Look for error messages and the debugging logs added in this fix
4. The logs will show exactly where the API key is being lost or if it's invalid


# 🚀 Quick Setup Guide: Agentic AI Assistant

## ✅ What's Been Built

Your Flowise installation now has a complete **Agentic AI Assistant** feature with:

### 🎯 Features Implemented:
1. ✅ **AI Flow Generator** - Generate flows from natural language
2. ✅ **Flow Analyzer** - AI-powered flow optimization
3. ✅ **AI Debugger** - Intelligent error diagnosis
4. ✅ **Insights Dashboard** - Workspace analytics

### 📁 Files Created:

**Backend:**
- `packages/server/src/controllers/agentic/index.ts`
- `packages/server/src/services/agentic/index.ts`
- `packages/server/src/routes/agentic/index.ts`

**Frontend:**
- `packages/ui/src/views/agentic/index.jsx`
- `packages/ui/src/views/agentic/FlowGenerator.jsx`
- `packages/ui/src/views/agentic/FlowAnalyzer.jsx`
- `packages/ui/src/views/agentic/FlowDebugger.jsx`
- `packages/ui/src/views/agentic/AgenticInsights.jsx`
- `packages/ui/src/api/agentic.js`

**Modified:**
- `packages/server/src/routes/index.ts` (added agentic routes)
- `packages/ui/src/routes/MainRoutes.jsx` (added agentic route)
- `packages/ui/src/menu-items/dashboard.js` (added Agentic menu item)

## 🔧 Setup Instructions

### 1. Install Dependencies (Already Done!)
All dependencies are already part of Flowise:
- ✅ `@langchain/openai`
- ✅ `@langchain/core`
- ✅ `express`
- ✅ `react`
- ✅ `@mui/material`

### 2. Configure Environment Variables

Add to `packages/server/.env`:

```env
# REQUIRED: OpenAI API Key for Agentic features
OPENAI_API_KEY=sk-proj-your-key-here

# OPTIONAL: Customize the AI model (default: gpt-4o)
AGENTIC_AI_MODEL=gpt-4o

# OPTIONAL: Use separate API key for Agentic (falls back to OPENAI_API_KEY)
AGENTIC_AI_API_KEY=sk-proj-separate-key-here
```

### 3. Start Development Server

```bash
# From project root
pnpm install  # If needed
pnpm build    # Build all packages
pnpm dev      # Start development server
```

### 4. Access the Feature

1. Open browser: http://localhost:8080 (dev) or http://localhost:3000 (prod)
2. Login to Flowise
3. Look for **"Agentic"** in the sidebar menu (below Document Stores)
4. Click it to access all AI features!

## 🎯 Quick Test

### Test 1: AI Flow Generator
1. Navigate to **Agentic** → **AI Flow Generator**
2. Select flow type: **Chatflow**
3. Enter description:
   ```
   Create a customer support chatbot that answers questions from a PDF knowledge base
   ```
4. Click **Generate Flow**
5. Wait 10-30 seconds for AI to generate
6. Click **Open in Canvas** to see the generated flow!

### Test 2: Flow Analyzer
1. Navigate to **Agentic** → **Flow Analyzer**
2. Select an existing flow from dropdown
3. Click **Analyze Flow**
4. Review the score and recommendations

### Test 3: AI Debugger
1. Navigate to **Agentic** → **AI Debugger**
2. Paste an error message (or use this example):
   ```
   Error: Cannot read property 'invoke' of undefined
   at ConversationalRetrievalQAChain.run
   ```
3. Click **Debug Error**
4. Review the solution steps

### Test 4: Insights Dashboard
1. Navigate to **Agentic** → **Insights Dashboard**
2. View your workspace statistics
3. Check AI recommendations

## 🎨 What You'll See

### Sidebar Menu
```
├── Chatflows
├── Agentflows  
├── Executions
├── Assistants
├── Marketplaces
├── Tools
├── Credentials
├── Variables
├── API Keys
├── Document Stores
└── 🆕 Agentic ⭐  <-- NEW!
```

### Agentic Page Tabs
```
┌─────────────────────────────────────────┐
│  🌟 AI Flow Generator                   │
│  🔍 Flow Analyzer                       │
│  🐛 AI Debugger                         │
│  📊 Insights Dashboard                  │
└─────────────────────────────────────────┘
```

## 🔍 Troubleshooting

### Issue: "Agentic menu item not showing"
**Solution:**
1. Restart the dev server: `Ctrl+C` then `pnpm dev`
2. Clear browser cache: `Ctrl+Shift+R`
3. Check browser console for errors: `F12`

### Issue: "OpenAI API key is required"
**Solution:**
1. Add `OPENAI_API_KEY` to `packages/server/.env`
2. Restart server
3. Verify key is valid at https://platform.openai.com/api-keys

### Issue: "Failed to generate flow"
**Possible causes:**
- Invalid API key
- Insufficient OpenAI credits
- Network connectivity issues
- Rate limit reached

**Solutions:**
1. Check server logs in terminal
2. Verify OpenAI account status
3. Try simpler description
4. Wait a few minutes and retry

### Issue: Build errors
**Solution:**
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

## 📊 Monitoring Usage

### Check Server Logs
```bash
# Watch server logs
tail -f packages/server/logs/flowise.log
```

### Check OpenAI Usage
1. Visit: https://platform.openai.com/usage
2. Monitor API calls
3. Set spending limits if needed

### Typical Costs (GPT-4o)
- Flow Generation: $0.01 - $0.05 per generation
- Flow Analysis: $0.01 - $0.03 per analysis  
- Debugging: $0.005 - $0.02 per debug session
- Insights: Minimal (database queries only)

## 🎓 Best Practices

### For Flow Generation:
✅ Be specific and detailed
✅ Mention specific tools/integrations
✅ Specify memory requirements
✅ Include context about use case
❌ Don't be too vague
❌ Don't request impossible combinations

### For Flow Analysis:
✅ Analyze before deploying
✅ Fix high-severity issues first
✅ Review security recommendations
✅ Check cost optimizations
❌ Don't ignore warnings

### For Debugging:
✅ Include full error stack trace
✅ Provide flow configuration
✅ Mention when error occurs
✅ Try suggested solutions
❌ Don't paste sensitive data

## 🔒 Security Notes

- ✅ API keys stored securely in `.env` (never commit!)
- ✅ Flows sent to OpenAI for processing
- ✅ No flow data stored by Agentic service
- ✅ Standard Flowise authentication required
- ⚠️ Don't include sensitive data in descriptions
- ⚠️ Review generated flows before deployment

## 🚀 Next Steps

### Immediate:
1. ✅ Test all 4 features
2. ✅ Generate your first AI flow
3. ✅ Analyze an existing flow
4. ✅ Try debugging a common error

### Short-term:
- Create flow templates from AI-generated flows
- Use analyzer regularly for optimization
- Build a library of successful prompts
- Share AI-generated flows with team

### Long-term:
- Contribute improvements to the feature
- Add custom analyzers for your use cases
- Build automation around insights
- Track ROI from AI assistance

## 📚 Additional Resources

- **Full Documentation**: See `AGENTIC_FEATURE.md`
- **Flowise Docs**: https://docs.flowiseai.com
- **LangChain Docs**: https://docs.langchain.com
- **OpenAI Docs**: https://platform.openai.com/docs

## 🎉 You're Ready!

Everything is set up and ready to use. Navigate to the Agentic menu and start building flows with AI assistance!

**Pro Tip:** Start with the AI Flow Generator to create your first flow, then use the Analyzer to optimize it, and keep the Debugger handy for troubleshooting.

---

**Happy Building! 🚀**

Questions? Check `AGENTIC_FEATURE.md` for detailed documentation.


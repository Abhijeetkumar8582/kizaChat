# 🚀 Quick Start - Agentic Feature

## ✅ Everything is Ready!

All files have been created and configured. Here's how to start:

---

## 📝 **Start the Server:**

### Step 1: Stop Current Dev Server
In your terminal where `pnpm dev` is running:
- Press **Ctrl + C** to stop it

### Step 2: Restart Dev Server
```bash
cd C:\Users\AbhijeetKumar\Desktop\Flowise-main
pnpm dev
```

### Step 3: Wait for Both Servers
You'll see:
```
flowise-ui:dev:   ➜  Local:   http://localhost:8080/    ← Frontend ready!
flowise:dev: ⚡️ [server]: Flowise Server is listening    ← Backend ready!
```

### Step 4: Open Browser
```
http://localhost:8080
```

---

## 🎯 **Using the Agentic Feature:**

### 1. Login to Flowise

### 2. Look for "Agentic" in Sidebar
It appears after "Document Stores"

### 3. Click "Agentic" - You'll See:
- ✨ AI Flow Generator
- 🔬 Flow Analyzer  
- 🐛 AI Debugger
- 📊 Insights Dashboard

### 4. To Use AI Features (Optional):
Add to `packages/server/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
```

Then restart: **Ctrl+C** → `pnpm dev`

---

## 🎨 **What You Can Do:**

### Without OpenAI Key:
✅ See all 4 tabs
✅ View the beautiful UI
✅ See Insights Dashboard (shows your flows)
✅ Test the interface

### With OpenAI Key:
✅ Generate flows from natural language
✅ Analyze existing flows
✅ Debug errors with AI
✅ Get smart suggestions

---

## 🐛 **If Page is Still Blank:**

### Check Browser Console (F12):
Look for any red errors and share them

### Check Terminal:
Both these should be running without errors:
- `flowise-ui:dev` (Frontend)
- `flowise:dev` (Backend)

### Common Fix:
```bash
# Stop server (Ctrl+C)
# Build backend
cd packages/server
pnpm build

# Go back to root
cd ../..

# Start again
pnpm dev
```

---

## ✨ **Quick Test (No API Key Needed):**

1. Navigate to **http://localhost:8080**
2. Login
3. Click **"Agentic"** in sidebar
4. You should see the page with 4 tabs!
5. Click through each tab - they should all load

---

## 🎊 **Success Criteria:**

✅ Agentic menu item visible in sidebar
✅ Page loads (not blank)
✅ 4 tabs visible across the top
✅ Can click through tabs
✅ Each tab shows content

If you see all these, **it's working!** 🎉

To actually generate flows, add your OpenAI API key!

---

**Need help?** Check the terminal output for errors!


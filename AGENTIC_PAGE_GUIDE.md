# 🎯 Agentic Page - Complete Structure Guide

## 📐 Page Layout

```
┌────────────────────────────────────────────────────────────────────┐
│                     🤖 Agentic AI Assistant                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────────────┬──────────────────────────┐           │
│  │  LEFT PANEL (50%)       │  RIGHT PANEL (50%)       │           │
│  │                         │                          │           │
│  │  📝 PROMPT BOX          │  📤 OUTPUT               │           │
│  │  ▔▔▔▔▔▔▔▔▔▔▔▔▔         │  ▔▔▔▔▔▔▔                │           │
│  │  [Large text area]      │  [Output display]        │           │
│  │                         │                          │           │
│  │  🤖 MODEL SELECTION     │                          │           │
│  │  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔      │                          │           │
│  │  [Dropdown]             │                          │           │
│  │                         │                          │           │
│  │  ⚙️ PARAMETERS          │                          │           │
│  │  ▔▔▔▔▔▔▔▔▔▔            │                          │           │
│  │  Temperature: [slider]  │  [Generate Button]       │           │
│  │  Max Tokens: [slider]   │                          │           │
│  │  Top P: [slider]        │                          │           │
│  │                         │                          │           │
│  │  🔧 TOOLS               │                          │           │
│  │  ▔▔▔▔▔▔▔▔              │                          │           │
│  │  [Create Tool Button]   │                          │           │
│  │  [Tools Table]          │                          │           │
│  │                         │                          │           │
│  │  📄 DOCUMENTS           │                          │           │
│  │  ▔▔▔▔▔▔▔▔▔             │                          │           │
│  │  [Add Document Button]  │                          │           │
│  │  [Documents Table]      │                          │           │
│  └─────────────────────────┴──────────────────────────┘           │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │       GPT FUNCTION CALLING CONFIGURATION                    │  │
│  ├─────────────────────────┬───────────────────────────────────┤  │
│  │  LEFT (50%)             │  RIGHT (50%)                      │  │
│  │                         │                                   │  │
│  │  🔧 TOOL RESPONSE       │  ⚙️ VARIABLE MAPPING             │  │
│  │  ▔▔▔▔▔▔▔▔▔▔▔▔▔         │  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔              │  │
│  │  [Select Tool]          │  Variable Name: [input]          │  │
│  │  Tool: SearchTool       │  JS Code: [multiline]            │  │
│  │  [Edit Button]          │  [Add Button]                    │  │
│  │                         │  [Table showing mappings]        │  │
│  │  📊 QUERY VARIABLES     │                                   │  │
│  │  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔       │  🔨 FUNCTION RESPONSE            │  │
│  │  Variable Name: [input] │  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔             │  │
│  │  JS Code: [multiline]   │  Data Type: [dropdown]           │  │
│  │  [Add Button]           │  Response Value: [multiline]     │  │
│  │  [Table showing vars]   │                                   │  │
│  │                         │                                   │  │
│  │  🌐 API SELECTION       │                                   │  │
│  │  ▔▔▔▔▔▔▔▔▔▔▔▔▔         │                                   │  │
│  │  [API Dropdown]         │                                   │  │
│  │  Selected: API 1        │                                   │  │
│  │                         │                                   │  │
│  ├─────────────────────────┴───────────────────────────────────┤  │
│  │                   [Cancel] [Save Configuration]             │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Field Specifications

### **Query Variables Section**
**Field 1: Variable Name**
- Type: Text input
- Placeholder: "e.g., searchQuery"
- Example: `userInput`

**Field 2: JavaScript Code**
- Type: Multiline text (4 rows)
- Monospace font
- Placeholder: "return value;"
- Example:
  ```javascript
  return userInput.trim().toLowerCase();
  ```

**Button:** "Add Query Variable"
- Disabled until Variable Name is filled
- Adds to table below

**Table Display:**
| Variable Name | Actions |
|--------------|---------|
| searchQuery  | 🗑️     |
| userContext  | 🗑️     |

---

### **Variable Mapping Section**
**Field 1: Variable Name**
- Type: Text input
- Placeholder: "e.g., searchResults"
- Example: `apiResults`

**Field 2: JavaScript Code**
- Type: Multiline text (4 rows)
- Monospace font
- Placeholder: "return response.data.items;"
- Example:
  ```javascript
  return response.data.items.map(item => ({
    title: item.name,
    value: item.id
  }));
  ```

**Button:** "Add Variable Mapping"
- Disabled until Variable Name is filled
- Adds to table below

**Table Display:**
| Variable | JS Code | Actions |
|----------|---------|---------|
| results  | return... | ✏️ 🗑️ |
| count    | return... | ✏️ 🗑️ |

---

### **Function Response Section**
**Field 1: Data Type**
- Type: Dropdown
- Options: String, Number, Boolean, Object, Array
- Default: String

**Field 2: Response Value**
- Type: Multiline text (6 rows)
- Monospace font
- Placeholder: "Enter the function response value..."
- Example (String type):
  ```
  Search completed successfully
  ```
- Example (Object type):
  ```json
  {
    "status": "success",
    "results": [],
    "count": 0
  }
  ```

---

## 🎯 Complete Workflow Example

### **Step 1: Create a Tool**
1. Click "Create Tool" button
2. Fill in:
   - Tool Name: `WebSearchTool`
   - Description: `Searches the web for information`
3. Click "Add Parameter"
4. Fill parameter:
   - Name: `query`
   - Description: `Search query string`
   - Data Type: `string`
   - Required: ✓
5. Click "Save Parameter" → Shows in table
6. Click "Save Tool" → Shows in Tools table on main page

### **Step 2: Configure Tool Response**
1. In "Tool Response" section
2. Select `WebSearchTool` from dropdown
3. Tool displays with edit button
4. Click edit to modify if needed

### **Step 3: Add Query Variables**
1. Variable Name: `searchQuery`
2. JS Code:
   ```javascript
   return query.trim().replace(/\s+/g, '+');
   ```
3. Click "Add Query Variable"
4. Shows in table below

### **Step 4: Select API**
1. Choose "API 1 - Search API"
2. Green confirmation shows

### **Step 5: Map API Response Variables**
1. Variable Name: `searchResults`
2. JS Code:
   ```javascript
   return response.data.items.slice(0, 10);
   ```
3. Click "Add Variable Mapping"
4. Shows in table with edit/delete buttons

### **Step 6: Configure Function Response**
1. Select Data Type: `Object`
2. Enter Response Value:
   ```json
   {
     "results": searchResults,
     "total": response.data.total,
     "query": searchQuery
   }
   ```

### **Step 7: Save**
1. Click "Save Configuration" button
2. Alert shows: "Configuration saved successfully!"
3. Check console for complete saved data

---

## 📊 Data Structure

When you click "Save Configuration", here's what gets saved:

```javascript
{
  // Tool selected for response
  toolResponse: {
    id: 1,
    name: "WebSearchTool",
    description: "Searches the web",
    parameters: [
      {
        id: 1,
        name: "query",
        description: "Search query",
        datatype: "string",
        required: true
      }
    ]
  },
  
  // Query variables with JS code
  queryVariables: [
    {
      id: 1234567890,
      name: "searchQuery",
      code: "return query.trim();"
    }
  ],
  
  // Selected API
  selectedApi: "api1",
  
  // Variable mappings with JS code
  variableMappings: [
    {
      id: 1234567891,
      varName: "searchResults",
      apiPath: "return response.data.items;"
    }
  ],
  
  // Function response with type
  functionResponse: {
    type: "string",
    value: "Search completed successfully"
  }
}
```

---

## 🎨 UI Features

### **Query Variables:**
✅ 2 fields: Variable Name + JS Code
✅ Multiline code editor with monospace font
✅ Add button (disabled validation)
✅ Table display with delete action
✅ Auto-clears after adding

### **Variable Mapping:**
✅ 2 fields: Variable Name + JS Code
✅ Same structure as Query Variables
✅ Edit button (loads back into fields)
✅ Delete button
✅ Shows truncated code in table

### **Function Response:**
✅ Data Type dropdown (5 options)
✅ Large text field for response value
✅ Monospace font for code
✅ Properly tracked in state

### **Save/Cancel Buttons:**
✅ Located at bottom of GPT Function section
✅ Cancel: Resets all function calling configuration
✅ Save: Logs to console + shows success alert
✅ Large, prominent buttons

---

## 🚀 Ready to Use!

**Refresh your browser** (Ctrl + Shift + R) and you'll see the complete GPT Function Calling interface!

All sections properly configured with:
- ✅ JavaScript code editors
- ✅ Variable name fields  
- ✅ Data type selection
- ✅ Save and Cancel buttons
- ✅ Full CRUD operations
- ✅ Beautiful Material-UI design

**This is perfect for building GPT function calling configurations!** 🎉


# Agentic Bot Management System - Implementation Guide

## Overview

The Agentic Bot Management System has been successfully implemented with a hierarchical structure that allows users to create and manage multiple bots, each containing multiple solutions. The system automatically creates an orchestrator solution when a bot has more than one solution.

## Hierarchy

```
Agentic Bots (Menu Item)
├── Bot 1
│   ├── Solution 1
│   ├── Solution 2
│   └── Orchestrator Solution (Auto-created when 2+ solutions exist)
├── Bot 2
│   └── Solution 1
└── Bot 3
    ├── Solution 1
    ├── Solution 2
    ├── Solution 3
    └── Orchestrator Solution (Auto-created when 2+ solutions exist)
```

## User Flow

### 1. **Accessing Agentic Bots**
- Click on "Agentic Bots" in the sidebar menu
- You'll see the **Bots Management** page

### 2. **Bots Management Page** (`/bots`)
**Layout:**
- **Left Side (60%)**: Grid of existing bots
- **Right Side (40%)**: "Create New Bot" card

**Features:**
- View all your bots in card format
- Each bot card shows:
  - Bot name
  - Description (if provided)
  - Creation date
  - Delete button
- Click on any bot card to navigate to its solutions page
- Click the "Create New Bot" card to open the creation dialog

**Creating a Bot:**
1. Click the "Create New Bot" card
2. A dialog appears with:
   - Bot Name field (required)
   - Description field (optional)
   - Save button
3. Enter the bot name and optionally a description
4. Click "Save"
5. The bot is created and appears in the grid

### 3. **Bot Solutions Page** (`/bots/:botId/solutions`)

**Layout:**
- Header with bot name and description
- Back button to return to Bots Management
- Quick solution creation area:
  - Solution Name text field
  - "New Solution" button
- Solutions table showing all solutions for the bot

**Features:**
- **Quick Create**: Enter solution name and click "New Solution"
- **Solutions Table** with columns:
  - Solution Name
  - Type (Regular/Orchestrator)
  - Creation Time
  - Actions (Delete button for regular solutions)
- Click on any solution name to configure it in the Agentic AI Assistant

**Auto-Orchestrator:**
- When you create a **second solution**, the system automatically creates an "Orchestrator Solution"
- The orchestrator appears at the **top of the table** with a special badge
- If you delete solutions and only **1 regular solution remains**, the orchestrator is **automatically removed**
- Orchestrator solutions **cannot be manually deleted**

### 4. **Agentic AI Assistant Configuration Page** (`/agentic/:solutionId`)

**Layout:**
- Header showing:
  - Back button (returns to bot solutions page)
  - Solution name and description
  - Type badge (if orchestrator)
  - "Save Configuration" button
- Full agent configuration interface

**Features:**
- Configure:
  - Welcome message
  - System prompts
  - Model selection (GPT-4o, Claude, etc.)
  - Temperature, max tokens, top-p
  - Tools and their responses
  - Documents
  - Credentials
- All configurations are saved to the solution
- Click "Save Configuration" to persist changes

**Standalone Mode:**
- If you access `/agentic` without a solution ID, you'll see an info alert
- Configuration can be tested but won't be saved
- A message prompts you to navigate through a bot solution to save configurations

## Technical Implementation

### Backend (Server)

#### Database Entities
1. **Bot** (`packages/server/src/database/entities/Bot.ts`)
   - Fields: id, name, description, workspaceId, createdDate, updatedDate
   - Relationships: One-to-many with Solutions

2. **Solution** (`packages/server/src/database/entities/Solution.ts`)
   - Fields: id, name, type, description, configuration, botId, workspaceId, createdDate, updatedDate
   - Types: REGULAR, ORCHESTRATOR
   - Relationships: Many-to-one with Bot

#### API Routes
- **Bots**: `/api/v1/bots`
  - GET `/` - Get all bots
  - GET `/:id` - Get bot by ID
  - POST `/` - Create bot
  - PATCH `/:id` - Update bot
  - DELETE `/:id` - Delete bot

- **Solutions**: `/api/v1/solutions`
  - GET `/bot/:botId` - Get all solutions for a bot
  - GET `/:id` - Get solution by ID
  - POST `/` - Create solution
  - PATCH `/:id` - Update solution
  - DELETE `/:id` - Delete solution

#### Services
1. **Bots Service** (`packages/server/src/services/bots/index.ts`)
   - CRUD operations for bots
   - Workspace filtering

2. **Solutions Service** (`packages/server/src/services/solutions/index.ts`)
   - CRUD operations for solutions
   - Auto-orchestrator logic:
     - Creates orchestrator when 2nd solution is added
     - Removes orchestrator when only 1 solution remains

### Frontend (UI)

#### Components
1. **BotsManagement** (`packages/ui/src/views/bots/BotsManagement.jsx`)
   - Main page for managing bots
   - Grid layout with create card on right
   - Bot creation dialog

2. **BotSolutions** (`packages/ui/src/views/bots/BotSolutions.jsx`)
   - Solutions management for a specific bot
   - Quick solution creation
   - Solutions table with orchestrator highlighting
   - Auto-orchestrator status indicator

3. **Agentic** (`packages/ui/src/views/agentic/index.jsx`)
   - Updated to accept solutionId parameter
   - Loads and saves solution configuration
   - Shows solution context in header
   - Navigation back to solutions page

#### API Clients
1. **bots.js** (`packages/ui/src/api/bots.js`)
   - API calls for bot operations

2. **solutions.js** (`packages/ui/src/api/solutions.js`)
   - API calls for solution operations

#### Routing
- `/bots` → Bots Management
- `/bots/:botId/solutions` → Bot Solutions
- `/agentic/:solutionId` → Agentic Configuration
- `/agentic` → Standalone mode (read-only)

#### Menu
- Updated sidebar menu item "Agentic Bots" to navigate to `/bots`

## Key Features

### 1. Auto-Orchestrator
- **Trigger**: Automatically created when a bot has 2 or more regular solutions
- **Placement**: Always appears at the top of the solutions table
- **Badge**: "Orchestrator" badge for easy identification
- **Status Indicator**: Green chip showing "Auto-Orchestrator Active" in the solutions page
- **Auto-Removal**: Deleted when bot has only 1 regular solution remaining
- **Protection**: Cannot be manually deleted

### 2. Workspace Support
- All bots and solutions are workspace-aware
- Filtering by active workspace ID
- Enterprise multi-tenancy support

### 3. Cascade Deletion
- Deleting a bot removes all its solutions
- Database relationship with CASCADE delete

### 4. Configuration Persistence
- All agent configurations stored in solution.configuration as JSON
- Includes: prompts, models, tools, documents, credentials, parameters
- Loaded automatically when opening a solution
- Saved via "Save Configuration" button

### 5. User Experience
- Intuitive navigation with breadcrumbs
- Visual feedback with snackbar notifications
- Confirmation dialogs for destructive actions
- Loading states for async operations
- Responsive design for mobile/tablet

## Usage Examples

### Example 1: Creating a Customer Support Bot
1. Navigate to "Agentic Bots" in menu
2. Click "Create New Bot"
3. Enter:
   - Name: "Customer Support Bot"
   - Description: "24/7 customer assistance"
4. Click "Save"
5. Bot card appears, click on it
6. Create solution:
   - Name: "Product Inquiries"
   - Click "New Solution"
7. Click "Product Inquiries" to configure
8. Set up agent with product knowledge
9. Click "Save Configuration"
10. Return to solutions page
11. Create second solution:
    - Name: "Order Status"
12. Notice "Orchestrator Solution" automatically created at top
13. Configure each solution independently

### Example 2: Managing Multiple Solutions
1. Open bot with multiple solutions
2. See orchestrator at top (if 2+ solutions)
3. Click any solution to configure
4. Make changes and save
5. Delete a solution if needed
6. System auto-manages orchestrator based on solution count

## Migration Notes

### For Existing Agentic Users
- Old `/agentic` route still works in standalone mode
- No breaking changes to existing functionality
- Can continue using standalone mode for testing
- To save configurations, create a bot and solution, then access via `/agentic/:solutionId`

### Database Migration
- New tables will be created automatically:
  - `bot` table
  - `solution` table
- No changes to existing tables
- Run the application to auto-create tables via TypeORM

## Future Enhancements

Potential improvements for future versions:
1. Solution templates (pre-configured solutions)
2. Clone/duplicate solutions
3. Solution testing interface
4. Orchestrator configuration UI
5. Solution analytics and metrics
6. Export/import solutions
7. Solution versioning
8. Collaborative editing
9. Solution marketplace
10. Advanced orchestration rules

## Troubleshooting

### Bot not showing solutions
- Check workspace permissions
- Verify bot exists and you have access
- Check browser console for errors

### Orchestrator not auto-creating
- Ensure you have exactly 2+ regular solutions
- Check solution types in database
- Verify backend service is running

### Configuration not saving
- Ensure you're accessing via `/agentic/:solutionId` (not standalone `/agentic`)
- Check network tab for API errors
- Verify solution exists and is accessible

### Navigation issues
- Clear browser cache
- Check route configuration in MainRoutes.jsx
- Verify all components are properly loaded

## Support

For issues or questions:
1. Check the console for error messages
2. Verify API endpoints are responding
3. Check database entities are created
4. Review network requests in browser DevTools
5. Check backend logs for service errors

---

**Version**: 1.0.0  
**Last Updated**: October 16, 2024  
**Implementation Status**: ✅ Complete


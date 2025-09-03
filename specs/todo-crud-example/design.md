# Design - TODO CRUD Example

## Technical Architecture

### System Overview
Add a simple TODO list feature as the most basic CRUD example alongside existing CRM features. This demonstrates fundamental patterns in the simplest possible context.

### Database Design
```sql
todos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Design Rationale:**
- Minimal fields for clarity
- Boolean completion status (simpler than enum)
- Standard user association pattern
- Follows existing timestamp conventions

### Component Architecture
```
components/features/todos/
├── todo-list.tsx        # Main container component
├── todo-form.tsx        # Add new todo form  
├── todo-item.tsx        # Individual todo with actions
└── todo-filter.tsx      # Filter by status (optional)
```

### Server Layer
```
server/
├── queries/todos.ts     # Read operations
│   ├── getTodos()
│   └── getTodosCount()
└── actions/todos.ts     # Write operations
    ├── createTodo()
    ├── updateTodo()
    ├── toggleTodo()
    └── deleteTodo()
```

### Page Integration
- **Dashboard**: Show recent todos + quick add form
- **Dedicated Page**: `/dashboard/todos` for full todo management
- **Navigation**: Add todos link to dashboard layout

### Security Model
- RLS policies ensure user isolation
- Server actions validate user authentication
- All operations scoped to authenticated user

## Implementation Approach

### Phase 1: Database & Backend
1. Create migration with RLS policies
2. Implement server queries (read operations)
3. Implement server actions (write operations)
4. Regenerate TypeScript types

### Phase 2: UI Components
1. Build TodoItem component (display + actions)
2. Build TodoForm component (add new)
3. Build TodoList container component
4. Add basic styling with shadcn/ui

### Phase 3: Page Integration
1. Add todo section to dashboard
2. Create dedicated todos page
3. Update navigation
4. Test complete workflow

## Error Handling
- Form validation for empty titles
- Optimistic updates with error rollback
- Loading states for better UX
- Authentication error handling
# Tasks - TODO CRUD Example

## Implementation Checklist

### 1. Database Setup (REQ-2, REQ-3)
- [ ] 1.1 Create migration file for todos table
- [ ] 1.2 Define table schema with proper types
- [ ] 1.3 Enable RLS and create user-scoped policies  
- [ ] 1.4 Add indexes for performance
- [ ] 1.5 Add updated_at trigger
- [ ] 1.6 Apply migration and regenerate types

### 2. Server Queries (REQ-2)
- [ ] 2.1 Create `server/queries/todos.ts`
- [ ] 2.2 Implement `getTodos()` with filtering options
- [ ] 2.3 Implement `getTodosCount()` for metrics
- [ ] 2.4 Add proper TypeScript types
- [ ] 2.5 Follow existing query patterns from contacts

### 3. Server Actions (REQ-1, REQ-2)
- [ ] 3.1 Create `server/actions/todos.ts` 
- [ ] 3.2 Implement `createTodo()` with validation
- [ ] 3.3 Implement `updateTodo()` for text editing
- [ ] 3.4 Implement `toggleTodo()` for completion status
- [ ] 3.5 Implement `deleteTodo()` with confirmation
- [ ] 3.6 Add authentication checks to all actions
- [ ] 3.7 Include proper error handling and revalidation

### 4. UI Components (REQ-4)
- [ ] 4.1 Create `components/features/todos/todo-item.tsx`
- [ ] 4.2 Add checkbox for completion toggle
- [ ] 4.3 Add delete button with confirmation
- [ ] 4.4 Create `components/features/todos/todo-form.tsx`
- [ ] 4.5 Add form validation and submission
- [ ] 4.6 Create `components/features/todos/todo-list.tsx`
- [ ] 4.7 Implement list rendering and empty states
- [ ] 4.8 Add loading states and error handling

### 5. Dashboard Integration (REQ-1)
- [ ] 5.1 Add todos section to dashboard page
- [ ] 5.2 Show todo count in dashboard metrics
- [ ] 5.3 Display recent todos (limit 5)
- [ ] 5.4 Add quick "Add Todo" form
- [ ] 5.5 Link to dedicated todos page

### 6. Dedicated Todos Page (REQ-1, REQ-4)
- [ ] 6.1 Create `app/(dashboard)/todos/page.tsx`
- [ ] 6.2 Implement full todo management interface
- [ ] 6.3 Add filter options (all/active/completed)
- [ ] 6.4 Include bulk actions (clear completed)
- [ ] 6.5 Add proper page title and navigation

### 7. Testing & Polish (REQ-4)
- [ ] 7.1 Test complete CRUD workflow
- [ ] 7.2 Verify RLS policies work correctly
- [ ] 7.3 Test error states and edge cases
- [ ] 7.4 Ensure responsive design
- [ ] 7.5 Add loading states and transitions
- [ ] 7.6 Update navigation menu

## Traceability Matrix
- **REQ-1**: Tasks 3.1-3.7, 5.1-5.5, 6.1-6.5
- **REQ-2**: Tasks 1.1-1.6, 2.1-2.5, 3.1-3.7
- **REQ-3**: Tasks 1.3, 3.6, 7.2
- **REQ-4**: Tasks 4.1-4.8, 6.3-6.4, 7.4-7.6
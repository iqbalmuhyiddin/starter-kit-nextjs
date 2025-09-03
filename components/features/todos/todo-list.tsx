import { TodoItem } from './todo-item'
import { TodoForm } from './todo-form'

interface TodoListProps {
  todos: Array<{
    id: string
    title: string
    completed: boolean
    created_at: string
  }>
  showForm?: boolean
}

export function TodoList({ todos, showForm = true }: TodoListProps) {
  return (
    <div className="space-y-4">
      {showForm && <TodoForm />}
      
      {todos.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {showForm ? 'No todos yet. Add one above!' : 'No todos found.'}
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  )
}
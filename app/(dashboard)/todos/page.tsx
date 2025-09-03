import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTodos } from "@/server/queries/todos";
import { TodoList } from "@/components/features/todos/todo-list";

export default async function TodosPage() {
  const todos = await getTodos();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Todo List</h1>
        <p className="text-muted-foreground">
          Simple CRUD example demonstrating database operations, server actions,
          and UI patterns
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Todos</CardTitle>
          <CardDescription>
            Manage your personal todo list. This demonstrates basic Create,
            Read, Update, Delete operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TodoList todos={todos || []} />
        </CardContent>
      </Card>
    </div>
  );
}

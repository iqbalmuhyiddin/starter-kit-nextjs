import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "@/server/actions/auth";
import { getTodos, getTodosCount } from "@/server/queries/todos";
import { TodoList } from "@/components/features/todos/todo-list";
import { CheckSquare } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch dashboard data
  const [todosCount, recentTodos] = await Promise.all([
    getTodosCount(),
    getTodos({ limit: 5 }), // Recent todos
  ]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button variant="outline" type="submit">
            Sign Out
          </Button>
        </form>
      </div>

      {/* Welcome Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>You are signed in as {user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">User ID: {user?.id}</p>
        </CardContent>
      </Card>

      {/* Dashboard Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Overview</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Todos</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todosCount}</div>
              <p className="text-xs text-muted-foreground">
                <Link href="/todos" className="text-blue-600 hover:underline">
                  View all todos
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Todos */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Todos</CardTitle>
            <CardDescription>
              Your latest todos - demonstrating simple CRUD operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TodoList todos={recentTodos || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

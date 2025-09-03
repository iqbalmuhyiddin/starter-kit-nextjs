/**
 * Todo CRUD Actions - Simple example
 * Demonstrates: validation, user auth, error handling
 */
"use server";

import { revalidatePath } from "next/cache";
import { fetchUser } from "../queries/user";
import { redirect } from "next/navigation";
import { createTodo, toggleTodoById, updateTodoById, deleteTodoById } from "../queries/todos";

export interface TodoData {
  title: string;
}

export async function create(data: TodoData) {
  const user = await fetchUser();

  if (!user) {
    redirect("/");
  }

  if (!data.title?.trim()) {
    return { error: "Title is required" };
  }

  const error = await createTodo(user.id, data.title.trim());

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/todos");
  return { success: true };
}

export async function toggleTodo(id: string, completed: boolean) {
  const user = await fetchUser();

  if (!user) {
    redirect("/");
  }

  const error = await toggleTodoById(id, completed);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/todos");
  return { success: true };
}

export async function updateTodo(id: string, data: TodoData) {
  const user = await fetchUser();

  if (!user) {
    redirect("/");
  }

  if (!data.title?.trim()) {
    return { error: "Title is required" };
  }

  const error = await updateTodoById(id, data.title.trim());

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/todos");
  return { success: true };
}

export async function deleteTodo(id: string) {
  const user = await fetchUser();

  if (!user) {
    redirect("/");
  }

  const error = await deleteTodoById(id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/todos");
  return { success: true };
}

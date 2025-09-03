/**
 * Todo CRUD Actions - Simple example
 * Demonstrates: validation, user auth, error handling
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface TodoData {
  title: string
}

export async function createTodo(data: TodoData) {
  const supabase = await createClient()
  
  // Always validate user in server actions
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Validate required fields
  if (!data.title?.trim()) {
    return { error: 'Title is required' }
  }

  const { error } = await supabase
    .from('todos')
    .insert({
      user_id: user.id,
      title: data.title.trim(),
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/todos')
  return { success: true }
}

export async function toggleTodo(id: string, completed: boolean) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('todos')
    .update({ completed })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/todos')
  return { success: true }
}

export async function updateTodo(id: string, data: TodoData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  if (!data.title?.trim()) {
    return { error: 'Title is required' }
  }

  const { error } = await supabase
    .from('todos')
    .update({ title: data.title.trim() })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/todos')
  return { success: true }
}

export async function deleteTodo(id: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/todos')
  return { success: true }
}
/**
 * Todo Queries - Simple CRUD example
 * Demonstrates: basic queries, filtering, user scoping
 */
import { createClient } from '@/lib/supabase/server'

export interface GetTodosOptions {
  limit?: number
  completed?: boolean
}

export async function getTodos(options: GetTodosOptions = {}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  if (options.completed !== undefined) {
    query = query.eq('completed', options.completed)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getTodosCount() {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('todos')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}

export async function getTodoById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
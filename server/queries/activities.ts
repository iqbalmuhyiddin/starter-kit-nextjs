import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Type helper for table rows
type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export interface ActivitiesFilter {
  contact_id?: string
  deal_id?: string
  type?: string
  limit?: number
  offset?: number
}

// Get all activities with optional filtering
export async function getActivities(filter: ActivitiesFilter = {}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  let query = supabase
    .from('activities')
    .select(`
      *,
      contacts(id, name, email),
      deals(id, title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filter.contact_id) {
    query = query.eq('contact_id', filter.contact_id)
  }
  
  if (filter.deal_id) {
    query = query.eq('deal_id', filter.deal_id)
  }

  if (filter.type) {
    query = query.eq('type', filter.type)
  }

  // Apply pagination
  if (filter.limit) {
    query = query.limit(filter.limit)
  }
  if (filter.offset) {
    query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Get activities for a specific contact
export async function getContactActivities(contactId: string, limit = 10) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      deals(id, title)
    `)
    .eq('contact_id', contactId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Get activities for a specific deal
export async function getDealActivities(dealId: string, limit = 10) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      contacts(id, name)
    `)
    .eq('deal_id', dealId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Get recent activities for dashboard
export async function getRecentActivities(limit = 5) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      contacts(id, name, email),
      deals(id, title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Get activity count by type for stats
export async function getActivityCountByType() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('activities')
    .select('type')
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  // Count activities by type
  const countByType = data.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return countByType
}

// Get a single activity by ID
export async function getActivityById(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      contacts(id, name, email),
      deals(id, title)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
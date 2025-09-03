import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Type helper for table rows
type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export interface ContactsFilter {
  search?: string
  company?: string
  limit?: number
  offset?: number
}

// Get all contacts with optional search and pagination
export async function getContacts(filter: ContactsFilter = {}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  let query = supabase
    .from('contacts')
    .select(`
      *,
      deals(id, title, stage_id)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Apply search filter
  if (filter.search) {
    query = query.or(`name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,company.ilike.%${filter.search}%`)
  }

  // Apply company filter
  if (filter.company) {
    query = query.eq('company', filter.company)
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

// Get a single contact by ID with all related data
export async function getContactById(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      deals(*,
        deal_stages(name, order_index)
      ),
      activities(
        *,
        deals(title)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Get contacts count for stats
export async function getContactsCount(filter: Pick<ContactsFilter, 'search' | 'company'> = {}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return 0
  }

  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Apply search filter
  if (filter.search) {
    query = query.or(`name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,company.ilike.%${filter.search}%`)
  }

  // Apply company filter
  if (filter.company) {
    query = query.eq('company', filter.company)
  }

  const { count, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return count || 0
}

// Get unique companies for filter dropdown
export async function getCompanies() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('company')
    .eq('user_id', user.id)
    .not('company', 'is', null)
    .neq('company', '')

  if (error) {
    throw new Error(error.message)
  }

  // Get unique companies
  const uniqueCompanies = [...new Set(data.map(item => item.company))].sort()
  
  return uniqueCompanies
}
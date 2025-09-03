import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Type helper for table rows
type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export interface DealsFilter {
  stage_id?: string
  contact_id?: string
  search?: string
  limit?: number
  offset?: number
}

// Get all deals with stage and contact info, grouped by stage for Kanban
export async function getDealsByStage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // First get all deal stages for this user
  const { data: stages, error: stagesError } = await supabase
    .from('deal_stages')
    .select('*')
    .eq('user_id', user.id)
    .order('order_index')

  if (stagesError) {
    throw new Error(stagesError.message)
  }

  // Then get all deals with related data
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select(`
      *,
      contacts(id, name, email, company),
      deal_stages(id, name, order_index)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (dealsError) {
    throw new Error(dealsError.message)
  }

  // Group deals by stage
  const dealsByStage = stages.map(stage => ({
    stage,
    deals: deals.filter(deal => deal.stage_id === stage.id)
  }))

  return dealsByStage
}

// Get all deals with optional filtering
export async function getDeals(filter: DealsFilter = {}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  let query = supabase
    .from('deals')
    .select(`
      *,
      contacts(id, name, email, company),
      deal_stages(id, name, order_index)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filter.stage_id) {
    query = query.eq('stage_id', filter.stage_id)
  }
  
  if (filter.contact_id) {
    query = query.eq('contact_id', filter.contact_id)
  }

  if (filter.search) {
    query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`)
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

// Get a single deal by ID with all related data
export async function getDealById(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      contacts(*),
      deal_stages(id, name, order_index),
      activities(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Get deal stages for a user
export async function getDealStages() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('deal_stages')
    .select('*')
    .eq('user_id', user.id)
    .order('order_index')

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Get deals count by stage for dashboard stats
export async function getDealsCountByStage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('deals')
    .select(`
      stage_id,
      deal_stages(name),
      count
    `)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  // Group by stage and count
  const stages = await getDealStages()
  if (!stages) return null

  const countsByStage = stages.map(stage => {
    const dealsInStage = data.filter(deal => deal.stage_id === stage.id)
    return {
      stage_name: stage.name,
      count: dealsInStage.length
    }
  })

  return countsByStage
}

// Get total deal value by stage
export async function getDealValueByStage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('deals')
    .select(`
      stage_id,
      value,
      deal_stages(name)
    `)
    .eq('user_id', user.id)
    .not('value', 'is', null)

  if (error) {
    throw new Error(error.message)
  }

  // Group by stage and sum values
  const stages = await getDealStages()
  if (!stages) return null

  const valuesByStage = stages.map(stage => {
    const dealsInStage = data.filter(deal => deal.stage_id === stage.id)
    const totalValue = dealsInStage.reduce((sum, deal) => sum + (deal.value || 0), 0)
    return {
      stage_name: stage.name,
      total_value: totalValue
    }
  })

  return valuesByStage
}
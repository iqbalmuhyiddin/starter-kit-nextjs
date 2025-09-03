'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

export interface DealData {
  title: string
  description?: string
  value?: number
  stage_id: string
  contact_id?: string
}

// Create a new deal
export async function createDeal(data: DealData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  if (!data.title?.trim()) {
    return { error: 'Title is required' }
  }

  if (!data.stage_id) {
    return { error: 'Stage is required' }
  }

  const dealData: TablesInsert<'deals'> = {
    title: data.title.trim(),
    description: data.description?.trim() || null,
    value: data.value || null,
    stage_id: data.stage_id,
    contact_id: data.contact_id || null,
    user_id: user.id,
  }

  const { data: deal, error } = await supabase
    .from('deals')
    .insert(dealData)
    .select(`
      *,
      contacts(id, name, email),
      deal_stages(id, name, order_index)
    `)
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/pipeline')
  
  return { success: true, deal }
}

// Update an existing deal
export async function updateDeal(id: string, data: DealData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  if (!data.title?.trim()) {
    return { error: 'Title is required' }
  }

  const updateData: TablesUpdate<'deals'> = {
    title: data.title.trim(),
    description: data.description?.trim() || null,
    value: data.value || null,
    stage_id: data.stage_id,
    contact_id: data.contact_id || null,
  }

  const { data: deal, error } = await supabase
    .from('deals')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select(`
      *,
      contacts(id, name, email),
      deal_stages(id, name, order_index)
    `)
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/pipeline')
  
  return { success: true, deal }
}

// Update deal stage (for drag and drop)
export async function updateDealStage(dealId: string, stageId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data: deal, error } = await supabase
    .from('deals')
    .update({ stage_id: stageId })
    .eq('id', dealId)
    .eq('user_id', user.id)
    .select(`
      *,
      contacts(id, name, email),
      deal_stages(id, name, order_index)
    `)
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/pipeline')
  
  return { success: true, deal }
}

// Delete a deal
export async function deleteDeal(id: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/pipeline')
  
  return { success: true }
}
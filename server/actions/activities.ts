'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { TablesInsert } from '@/types/supabase'

export interface ActivityData {
  content: string
  type?: string
  contact_id?: string
  deal_id?: string
}

// Create a new activity
export async function createActivity(data: ActivityData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  if (!data.content?.trim()) {
    return { error: 'Content is required' }
  }

  // Must reference either a contact or a deal
  if (!data.contact_id && !data.deal_id) {
    return { error: 'Activity must be linked to either a contact or a deal' }
  }

  const activityData: TablesInsert<'activities'> = {
    content: data.content.trim(),
    type: data.type || 'note',
    contact_id: data.contact_id || null,
    deal_id: data.deal_id || null,
    user_id: user.id,
  }

  const { data: activity, error } = await supabase
    .from('activities')
    .insert(activityData)
    .select(`
      *,
      contacts(id, name),
      deals(id, title)
    `)
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidate relevant paths
  revalidatePath('/dashboard')
  if (data.contact_id) {
    revalidatePath(`/dashboard/contacts/${data.contact_id}`)
  }
  if (data.deal_id) {
    revalidatePath('/dashboard/pipeline')
  }
  
  return { success: true, activity }
}

// Update an existing activity
export async function updateActivity(id: string, data: Pick<ActivityData, 'content' | 'type'>) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  if (!data.content?.trim()) {
    return { error: 'Content is required' }
  }

  const { data: activity, error } = await supabase
    .from('activities')
    .update({
      content: data.content.trim(),
      type: data.type || 'note',
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select(`
      *,
      contacts(id, name),
      deals(id, title)
    `)
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  if (activity.contact_id) {
    revalidatePath(`/dashboard/contacts/${activity.contact_id}`)
  }
  if (activity.deal_id) {
    revalidatePath('/dashboard/pipeline')
  }
  
  return { success: true, activity }
}

// Delete an activity
export async function deleteActivity(id: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get the activity first to know which paths to revalidate
  const { data: activity } = await supabase
    .from('activities')
    .select('contact_id, deal_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  if (activity?.contact_id) {
    revalidatePath(`/dashboard/contacts/${activity.contact_id}`)
  }
  if (activity?.deal_id) {
    revalidatePath('/dashboard/pipeline')
  }
  
  return { success: true }
}
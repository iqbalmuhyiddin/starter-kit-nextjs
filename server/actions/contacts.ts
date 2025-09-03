'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

export interface ContactData {
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
}

// Create a new contact
export async function createContact(data: ContactData) {
  const supabase = await createClient()
  
  // Get the current user - following auth.ts pattern
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Validate required fields
  if (!data.name?.trim()) {
    return { error: 'Name is required' }
  }

  // Create contact
  const contactData: TablesInsert<'contacts'> = {
    name: data.name.trim(),
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    company: data.company?.trim() || null,
    notes: data.notes?.trim() || null,
    user_id: user.id,
  }

  const { data: contact, error } = await supabase
    .from('contacts')
    .insert(contactData)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidate the cache
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/contacts')
  
  return { success: true, contact }
}

// Update an existing contact
export async function updateContact(id: string, data: ContactData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  if (!data.name?.trim()) {
    return { error: 'Name is required' }
  }

  const updateData: TablesUpdate<'contacts'> = {
    name: data.name.trim(),
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    company: data.company?.trim() || null,
    notes: data.notes?.trim() || null,
  }

  const { data: contact, error } = await supabase
    .from('contacts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/contacts')
  revalidatePath(`/dashboard/contacts/${id}`)
  
  return { success: true, contact }
}

// Delete a contact
export async function deleteContact(id: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/contacts')
  
  return { success: true }
}
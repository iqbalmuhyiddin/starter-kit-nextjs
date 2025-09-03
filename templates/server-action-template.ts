/**
 * Server Action Template
 * 
 * Copy this pattern for new server actions:
 * 1. Always validate user authentication
 * 2. Validate input data
 * 3. Handle errors gracefully
 * 4. Revalidate paths after mutations
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface YourDataType {
  name: string
  // Add your fields here
}

export async function createYourResource(data: YourDataType) {
  const supabase = await createClient()
  
  // Always validate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Validate required fields
  if (!data.name?.trim()) {
    return { error: 'Name is required' }
  }

  // Create resource with user_id for RLS
  const { error } = await supabase
    .from('your_table')
    .insert({
      user_id: user.id,
      name: data.name,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/your-page')
  return { success: true }
}
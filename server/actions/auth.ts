/**
 * Authentication Server Actions
 * 
 * This file demonstrates the recommended patterns for handling authentication
 * in a Next.js 15.3 + Supabase application:
 * 
 * - Server Actions with 'use server' directive
 * - Type-safe interfaces for form data
 * - Proper error handling and user feedback
 * - Cache revalidation after mutations
 * - Secure server-side Supabase client usage
 */
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export async function signUp(data: SignUpData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName, // Stored in user metadata, auto-transferred to profiles table via trigger
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout') // Update auth state across app
  return { success: true }
}

export async function signIn(data: SignInData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/') // Automatic redirect after logout
}
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ContactForm } from './contact-form'
import type { Tables } from '@/types/supabase'

interface ContactDialogProps {
  contact?: Tables<'contacts'>
  trigger: React.ReactNode
  title?: string
  description?: string
}

export function ContactDialog({ 
  contact, 
  trigger, 
  title, 
  description 
}: ContactDialogProps) {
  const [open, setOpen] = useState(false)
  const isEditing = !!contact

  const defaultTitle = isEditing ? 'Edit Contact' : 'Create Contact'
  const defaultDescription = isEditing 
    ? 'Update the contact information below.' 
    : 'Add a new contact to your CRM.'

  const handleSuccess = () => {
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <ContactForm 
          contact={contact}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}
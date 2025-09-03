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
import { DealForm } from './deal-form'
import type { Tables } from '@/types/supabase'

interface DealDialogProps {
  deal?: Tables<'deals'> & {
    contacts?: Tables<'contacts'> | null
    deal_stages?: Tables<'deal_stages'> | null
  }
  stages: Tables<'deal_stages'>[]
  contacts: Tables<'contacts'>[]
  trigger: React.ReactNode
  title?: string
  description?: string
}

export function DealDialog({ 
  deal, 
  stages,
  contacts,
  trigger, 
  title, 
  description 
}: DealDialogProps) {
  const [open, setOpen] = useState(false)
  const isEditing = !!deal

  const defaultTitle = isEditing ? 'Edit Deal' : 'Create Deal'
  const defaultDescription = isEditing 
    ? 'Update the deal information below.' 
    : 'Add a new deal to your pipeline.'

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
        <DealForm 
          deal={deal}
          stages={stages}
          contacts={contacts}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}
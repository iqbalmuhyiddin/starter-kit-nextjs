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
import { ActivityForm } from './activity-form'
import type { Tables } from '@/types/supabase'

interface ActivityDialogProps {
  activity?: Tables<'activities'> & {
    contacts?: Tables<'contacts'> | null
    deals?: Tables<'deals'> | null
  }
  contact_id?: string
  deal_id?: string
  trigger: React.ReactNode
  title?: string
  description?: string
}

export function ActivityDialog({ 
  activity, 
  contact_id,
  deal_id,
  trigger, 
  title, 
  description 
}: ActivityDialogProps) {
  const [open, setOpen] = useState(false)
  const isEditing = !!activity

  const defaultTitle = isEditing ? 'Edit Activity' : 'Add Activity'
  const defaultDescription = isEditing 
    ? 'Update the activity details below.' 
    : 'Record a new activity or interaction.'

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
        <ActivityForm 
          activity={activity}
          contact_id={contact_id}
          deal_id={deal_id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}
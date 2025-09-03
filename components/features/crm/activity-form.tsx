'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createActivity, updateActivity } from '@/server/actions/activities'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useFormStatus } from 'react-dom'
import { ChevronDownIcon } from 'lucide-react'
import type { Tables } from '@/types/supabase'

const formSchema = z.object({
  content: z.string().min(1, 'Content is required').min(3, 'Content must be at least 3 characters'),
  type: z.string().default('note'),
})

type FormData = z.infer<typeof formSchema>

const ACTIVITY_TYPES = [
  { value: 'note', label: 'Note' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task', label: 'Task' },
]

interface ActivityFormProps {
  activity?: Tables<'activities'> & {
    contacts?: Tables<'contacts'> | null
    deals?: Tables<'deals'> | null
  }
  contact_id?: string
  deal_id?: string
  onSuccess?: () => void
  onCancel?: () => void
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending 
        ? (isEditing ? 'Updating...' : 'Creating...') 
        : (isEditing ? 'Update Activity' : 'Add Activity')
      }
    </Button>
  )
}

export function ActivityForm({ activity, contact_id, deal_id, onSuccess, onCancel }: ActivityFormProps) {
  const { toast } = useToast()
  const isEditing = !!activity

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: activity?.content || '',
      type: activity?.type || 'note',
    },
  })

  async function onSubmit(data: FormData) {
    try {
      const result = isEditing 
        ? await updateActivity(activity.id, {
            content: data.content,
            type: data.type,
          })
        : await createActivity({
            content: data.content,
            type: data.type,
            contact_id,
            deal_id,
          })
      
      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result?.success) {
        toast({
          title: 'Success',
          description: `Activity ${isEditing ? 'updated' : 'added'} successfully`,
        })
        form.reset()
        onSuccess?.()
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const selectedType = ACTIVITY_TYPES.find(t => t.value === form.watch('type'))

  return (
    <Form {...form}>
      <form action={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedType?.label || 'Select type'}
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {ACTIVITY_TYPES.map((type) => (
                      <DropdownMenuItem
                        key={type.value}
                        onClick={() => field.onChange(type.value)}
                      >
                        {type.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter activity details..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <SubmitButton isEditing={isEditing} />
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
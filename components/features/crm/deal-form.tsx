'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createDeal, updateDeal } from '@/server/actions/deals'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
  title: z.string().min(1, 'Title is required').min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  value: z.string().optional(),
  stage_id: z.string().min(1, 'Stage is required'),
  contact_id: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface DealFormProps {
  deal?: Tables<'deals'> & {
    contacts?: Tables<'contacts'> | null
    deal_stages?: Tables<'deal_stages'> | null
  }
  stages: Tables<'deal_stages'>[]
  contacts: Tables<'contacts'>[]
  onSuccess?: () => void
  onCancel?: () => void
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending 
        ? (isEditing ? 'Updating...' : 'Creating...') 
        : (isEditing ? 'Update Deal' : 'Create Deal')
      }
    </Button>
  )
}

export function DealForm({ deal, stages, contacts, onSuccess, onCancel }: DealFormProps) {
  const { toast } = useToast()
  const isEditing = !!deal

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: deal?.title || '',
      description: deal?.description || '',
      value: deal?.value?.toString() || '',
      stage_id: deal?.stage_id || (stages[0]?.id || ''),
      contact_id: deal?.contact_id || '',
    },
  })

  async function onSubmit(data: FormData) {
    try {
      const dealData = {
        title: data.title,
        description: data.description || undefined,
        value: data.value ? parseFloat(data.value) : undefined,
        stage_id: data.stage_id,
        contact_id: data.contact_id || undefined,
      }

      const result = isEditing 
        ? await updateDeal(deal.id, dealData)
        : await createDeal(dealData)
      
      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result?.success) {
        toast({
          title: 'Success',
          description: `Deal ${isEditing ? 'updated' : 'created'} successfully`,
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

  const selectedStage = stages.find(s => s.id === form.watch('stage_id'))
  const selectedContact = contacts.find(c => c.id === form.watch('contact_id'))

  return (
    <Form {...form}>
      <form action={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Deal title"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deal description..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stage_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stage *</FormLabel>
              <FormControl>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedStage?.name || 'Select stage'}
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {stages.map((stage) => (
                      <DropdownMenuItem
                        key={stage.id}
                        onClick={() => field.onChange(stage.id)}
                      >
                        {stage.name}
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
          name="contact_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <FormControl>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedContact?.name || 'Select contact (optional)'}
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem
                      onClick={() => field.onChange('')}
                    >
                      No contact
                    </DropdownMenuItem>
                    {contacts.map((contact) => (
                      <DropdownMenuItem
                        key={contact.id}
                        onClick={() => field.onChange(contact.id)}
                      >
                        {contact.name}
                        {contact.company && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({contact.company})
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { deleteContact } from '@/server/actions/contacts'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from '@/types/supabase'
import { Mail, Phone, Building, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

interface ContactWithDeals extends Tables<'contacts'> {
  deals?: Array<{
    id: string
    title: string
    stage_id: string
  }>
}

interface ContactCardProps {
  contact: ContactWithDeals
  onEdit?: (contact: ContactWithDeals) => void
  onView?: (contact: ContactWithDeals) => void
}

export function ContactCard({ contact, onEdit, onView }: ContactCardProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteContact(contact.id)
      
      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result?.success) {
        toast({
          title: 'Success',
          description: 'Contact deleted successfully',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete contact',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="group hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3" onClick={() => onView?.(contact)}>
            <Avatar>
              <AvatarFallback>
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{contact.name}</CardTitle>
              {contact.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Building className="h-3 w-3" />
                  {contact.company}
                </p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(contact)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={() => onView?.(contact)}>
        <div className="space-y-2">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <a 
                href={`mailto:${contact.email}`} 
                className="hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {contact.email}
              </a>
            </div>
          )}
          
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <a 
                href={`tel:${contact.phone}`} 
                className="hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {contact.phone}
              </a>
            </div>
          )}
          
          {contact.deals && contact.deals.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Deals:</span>
              <Badge variant="secondary" className="text-xs">
                {contact.deals.length} active
              </Badge>
            </div>
          )}
        </div>
        
        {contact.notes && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {contact.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { deleteDeal } from '@/server/actions/deals'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from '@/types/supabase'
import { DollarSign, User, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

interface DealWithRelations extends Tables<'deals'> {
  contacts?: {
    id: string
    name: string
    email: string | null
  } | null
  deal_stages?: {
    id: string
    name: string
    order_index: number
  } | null
}

interface DealCardProps {
  deal: DealWithRelations
  onEdit?: (deal: DealWithRelations) => void
  onView?: (deal: DealWithRelations) => void
}

export function DealCard({ deal, onEdit, onView }: DealCardProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

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
    if (!confirm('Are you sure you want to delete this deal?')) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteDeal(deal.id)
      
      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result?.success) {
        toast({
          title: 'Success',
          description: 'Deal deleted successfully',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete deal',
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
          <div className="flex-1 min-w-0" onClick={() => onView?.(deal)}>
            <CardTitle className="text-base line-clamp-1">{deal.title}</CardTitle>
            {deal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {deal.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(deal)}>
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
      
      <CardContent className="pt-0" onClick={() => onView?.(deal)}>
        <div className="space-y-3">
          {deal.value && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <Badge variant="secondary" className="font-semibold text-green-700">
                {formatCurrency(deal.value)}
              </Badge>
            </div>
          )}
          
          {deal.contacts && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getInitials(deal.contacts.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground line-clamp-1">
                  {deal.contacts.name}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Created {new Date(deal.created_at).toLocaleDateString()}
            </span>
            {deal.deal_stages && (
              <Badge variant="outline" className="text-xs">
                {deal.deal_stages.name}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
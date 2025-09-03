'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { deleteActivity } from '@/server/actions/activities'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from '@/types/supabase'
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Clock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

interface ActivityWithRelations extends Tables<'activities'> {
  contacts?: {
    id: string
    name: string
  } | null
  deals?: {
    id: string
    title: string
  } | null
}

interface ActivityLogProps {
  activities: ActivityWithRelations[]
  title?: string
  onEdit?: (activity: ActivityWithRelations) => void
  showRelatedItems?: boolean
}

interface ActivityItemProps {
  activity: ActivityWithRelations
  onEdit?: (activity: ActivityWithRelations) => void
  showRelatedItems?: boolean
}

// Activity type icons
const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'call':
      return <Phone className="h-4 w-4" />
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'meeting':
      return <Calendar className="h-4 w-4" />
    case 'note':
      return <FileText className="h-4 w-4" />
    default:
      return <MessageSquare className="h-4 w-4" />
  }
}

// Activity type colors
const getActivityColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'call':
      return 'text-blue-600'
    case 'email':
      return 'text-green-600'
    case 'meeting':
      return 'text-purple-600'
    case 'note':
      return 'text-gray-600'
    default:
      return 'text-gray-600'
  }
}

function ActivityItem({ activity, onEdit, showRelatedItems = true }: ActivityItemProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this activity?')) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteActivity(activity.id)
      
      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result?.success) {
        toast({
          title: 'Success',
          description: 'Activity deleted successfully',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete activity',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 2) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="group">
      <div className="flex gap-3 p-4">
        <div className={`flex-shrink-0 ${getActivityColor(activity.type)}`}>
          {getActivityIcon(activity.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {activity.type}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDate(activity.created_at)}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(activity)}>
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
          
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {activity.content}
          </p>
          
          {showRelatedItems && (activity.contacts || activity.deals) && (
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              {activity.contacts && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="text-xs">
                      {activity.contacts.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span>{activity.contacts.name}</span>
                </div>
              )}
              {activity.deals && (
                <div className="flex items-center gap-1">
                  <span>Deal: {activity.deals.title}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ActivityLog({ 
  activities, 
  title = "Recent Activities", 
  onEdit, 
  showRelatedItems = true 
}: ActivityLogProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activities yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Activities will appear here when you log calls, emails, meetings, and notes.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onEdit={onEdit}
              showRelatedItems={showRelatedItems}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
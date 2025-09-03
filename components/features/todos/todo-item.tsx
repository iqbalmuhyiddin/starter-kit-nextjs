'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Trash2, Edit2, Check, X } from 'lucide-react'
import { toggleTodo, updateTodo, deleteTodo } from '@/server/actions/todos'
import { toast } from 'sonner'

interface TodoItemProps {
  todo: {
    id: string
    title: string
    completed: boolean
  }
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    const result = await toggleTodo(todo.id, !todo.completed)
    
    if (result.error) {
      toast.error(result.error)
    }
    setIsLoading(false)
  }

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      toast.error('Title cannot be empty')
      return
    }

    setIsLoading(true)
    const result = await updateTodo(todo.id, { title: editTitle })
    
    if (result.error) {
      toast.error(result.error)
    } else {
      setIsEditing(false)
      toast.success('Todo updated')
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deleteTodo(todo.id)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Todo deleted')
    }
    setIsLoading(false)
  }

  const handleCancel = () => {
    setEditTitle(todo.title)
    setIsEditing(false)
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEdit()
              if (e.key === 'Escape') handleCancel()
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            size="sm" 
            onClick={handleEdit}
            disabled={isLoading}
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-between">
          <span 
            className={`${todo.completed ? 'line-through text-muted-foreground' : ''}`}
          >
            {todo.title}
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
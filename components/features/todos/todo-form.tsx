'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { createTodo } from '@/server/actions/todos'
import { toast } from 'sonner'

export function TodoForm() {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a todo')
      return
    }

    setIsLoading(true)
    const result = await createTodo({ title })
    
    if (result.error) {
      toast.error(result.error)
    } else {
      setTitle('')
      toast.success('Todo added')
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new todo..."
        disabled={isLoading}
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading || !title.trim()}>
        <Plus className="w-4 h-4" />
      </Button>
    </form>
  )
}
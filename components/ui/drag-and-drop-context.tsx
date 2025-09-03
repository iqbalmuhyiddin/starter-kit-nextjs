'use client'

import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { createContext, useContext, useState, ReactNode } from 'react'

interface DragAndDropContextType {
  activeId: string | null
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragOver: (event: DragOverEvent) => void
}

const DragAndDropContext = createContext<DragAndDropContextType | null>(null)

export function useDragAndDrop() {
  const context = useContext(DragAndDropContext)
  if (!context) {
    throw new Error('useDragAndDrop must be used within DragAndDropProvider')
  }
  return context
}

interface DragAndDropProviderProps {
  children: ReactNode
  onDragEnd?: (event: DragEndEvent) => void
  onDragOver?: (event: DragOverEvent) => void
}

export function DragAndDropProvider({ 
  children, 
  onDragEnd,
  onDragOver 
}: DragAndDropProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    onDragEnd?.(event)
  }

  const handleDragOver = (event: DragOverEvent) => {
    onDragOver?.(event)
  }

  return (
    <DragAndDropContext.Provider 
      value={{
        activeId,
        handleDragStart,
        handleDragEnd,
        handleDragOver
      }}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {children}
      </DndContext>
    </DragAndDropContext.Provider>
  )
}
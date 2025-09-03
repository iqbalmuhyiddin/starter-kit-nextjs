import { describe, it, expect, vi, beforeEach } from 'vitest'
import { create, toggleTodo, updateTodo, deleteTodo } from '@/server/actions/todos'
import { fetchUser } from '@/server/queries/user'
import { createTodo, toggleTodoById, updateTodoById, deleteTodoById } from '@/server/queries/todos'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

vi.mock('@/server/queries/user')
vi.mock('@/server/queries/todos')
vi.mock('next/cache')
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  })
}))

describe('Todo Actions', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a todo with valid data', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)
      vi.mocked(createTodo).mockResolvedValue(null)

      const result = await create({ title: 'Test todo' })

      expect(fetchUser).toHaveBeenCalled()
      expect(createTodo).toHaveBeenCalledWith('user-123', 'Test todo')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/todos')
      expect(result).toEqual({ success: true })
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(fetchUser).mockResolvedValue(null)

      await expect(create({ title: 'Test todo' })).rejects.toThrow('NEXT_REDIRECT')

      expect(redirect).toHaveBeenCalledWith('/')
      expect(createTodo).not.toHaveBeenCalled()
    })

    it('should return error for empty title', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)

      const result = await create({ title: '' })

      expect(result).toEqual({ error: 'Title is required' })
      expect(createTodo).not.toHaveBeenCalled()
    })

    it('should return error for whitespace-only title', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)

      const result = await create({ title: '   ' })

      expect(result).toEqual({ error: 'Title is required' })
      expect(createTodo).not.toHaveBeenCalled()
    })

    it('should trim title before creating', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)
      vi.mocked(createTodo).mockResolvedValue(null)

      await create({ title: '  Test todo  ' })

      expect(createTodo).toHaveBeenCalledWith('user-123', 'Test todo')
    })

    it('should return error if database operation fails', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)
      vi.mocked(createTodo).mockResolvedValue({ message: 'Database error' })

      const result = await create({ title: 'Test todo' })

      expect(result).toEqual({ error: 'Database error' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('toggleTodo', () => {
    it('should toggle todo completion status', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)
      vi.mocked(toggleTodoById).mockResolvedValue(null)

      const result = await toggleTodo('todo-123', true)

      expect(fetchUser).toHaveBeenCalled()
      expect(toggleTodoById).toHaveBeenCalledWith('todo-123', true)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/todos')
      expect(result).toEqual({ success: true })
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(fetchUser).mockResolvedValue(null)

      await expect(toggleTodo('todo-123', true)).rejects.toThrow('NEXT_REDIRECT')

      expect(redirect).toHaveBeenCalledWith('/')
      expect(toggleTodoById).not.toHaveBeenCalled()
    })

    it('should return error if database operation fails', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)
      vi.mocked(toggleTodoById).mockResolvedValue({ message: 'Update failed' })

      const result = await toggleTodo('todo-123', true)

      expect(result).toEqual({ error: 'Update failed' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('updateTodo', () => {
    it('should update todo with valid data', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)
      vi.mocked(updateTodoById).mockResolvedValue(null)

      const result = await updateTodo('todo-123', { title: 'Updated todo' })

      expect(fetchUser).toHaveBeenCalled()
      expect(updateTodoById).toHaveBeenCalledWith('todo-123', 'Updated todo')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/todos')
      expect(result).toEqual({ success: true })
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(fetchUser).mockResolvedValue(null)

      await expect(updateTodo('todo-123', { title: 'Updated todo' })).rejects.toThrow('NEXT_REDIRECT')

      expect(redirect).toHaveBeenCalledWith('/')
      expect(updateTodoById).not.toHaveBeenCalled()
    })

    it('should return error for empty title', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)

      const result = await updateTodo('todo-123', { title: '' })

      expect(result).toEqual({ error: 'Title is required' })
      expect(updateTodoById).not.toHaveBeenCalled()
    })

    it('should trim title before updating', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)
      vi.mocked(updateTodoById).mockResolvedValue(null)

      await updateTodo('todo-123', { title: '  Updated todo  ' })

      expect(updateTodoById).toHaveBeenCalledWith('todo-123', 'Updated todo')
    })

    it('should return error if database operation fails', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)
      vi.mocked(updateTodoById).mockResolvedValue({ message: 'Update failed' })

      const result = await updateTodo('todo-123', { title: 'Updated todo' })

      expect(result).toEqual({ error: 'Update failed' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('deleteTodo', () => {
    it('should delete todo successfully', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)
      vi.mocked(deleteTodoById).mockResolvedValue(null)

      const result = await deleteTodo('todo-123')

      expect(fetchUser).toHaveBeenCalled()
      expect(deleteTodoById).toHaveBeenCalledWith('todo-123')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/todos')
      expect(result).toEqual({ success: true })
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(fetchUser).mockResolvedValue(null)

      await expect(deleteTodo('todo-123')).rejects.toThrow('NEXT_REDIRECT')

      expect(redirect).toHaveBeenCalledWith('/')
      expect(deleteTodoById).not.toHaveBeenCalled()
    })

    it('should return error if database operation fails', async () => {
      vi.mocked(fetchUser).mockResolvedValue(mockUser)
      vi.mocked(deleteTodoById).mockResolvedValue({ message: 'Delete failed' })

      const result = await deleteTodo('todo-123')

      expect(result).toEqual({ error: 'Delete failed' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@/lib/supabase/server'
import { 
  getTodos, 
  getTodosCount, 
  getTodoById, 
  createTodo, 
  updateTodoById, 
  toggleTodoById, 
  deleteTodoById 
} from '@/server/queries/todos'

vi.mock('@/lib/supabase/server')

describe('Todo Queries', () => {
  const mockSupabaseClient = {
    from: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any)
  })

  describe('getTodos', () => {
    it('should get todos with default options', async () => {
      const mockData = [
        { id: '1', title: 'Todo 1', completed: false, created_at: '2024-01-01' },
        { id: '2', title: 'Todo 2', completed: true, created_at: '2024-01-02' }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await getTodos()

      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('todos')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockData)
    })

    it('should get todos with completed filter', async () => {
      const mockData = [{ id: '1', title: 'Completed todo', completed: true }]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await getTodos({ completed: true })

      expect(mockQuery.eq).toHaveBeenCalledWith('completed', true)
      expect(result).toEqual(mockData)
    })

    it('should get todos with limit', async () => {
      const mockData = [{ id: '1', title: 'Todo 1' }]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await getTodos({ limit: 5 })

      expect(mockQuery.limit).toHaveBeenCalledWith(5)
      expect(result).toEqual(mockData)
    })

    it('should get todos with both completed filter and limit', async () => {
      const mockData = [{ id: '1', title: 'Completed todo' }]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await getTodos({ completed: false, limit: 3 })

      expect(mockQuery.eq).toHaveBeenCalledWith('completed', false)
      expect(mockQuery.limit).toHaveBeenCalledWith(3)
      expect(result).toEqual(mockData)
    })

    it('should throw error if database query fails', async () => {
      const mockError = new Error('Database connection failed')
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      await expect(getTodos()).rejects.toThrow('Database connection failed')
    })
  })

  describe('getTodosCount', () => {
    it('should get total count of todos', async () => {
      const mockQuery = {
        select: vi.fn().mockResolvedValue({ count: 10, error: null })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await getTodosCount()

      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('todos')
      expect(mockQuery.select).toHaveBeenCalledWith('*', { count: 'exact', head: true })
      expect(result).toBe(10)
    })

    it('should return 0 if count is null', async () => {
      const mockQuery = {
        select: vi.fn().mockResolvedValue({ count: null, error: null })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await getTodosCount()

      expect(result).toBe(0)
    })

    it('should throw error if database query fails', async () => {
      const mockError = new Error('Count query failed')
      
      const mockQuery = {
        select: vi.fn().mockResolvedValue({ count: null, error: mockError })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      await expect(getTodosCount()).rejects.toThrow('Count query failed')
    })
  })

  describe('getTodoById', () => {
    it('should get single todo by id', async () => {
      const mockTodo = { id: 'todo-123', title: 'Test todo', completed: false }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTodo, error: null })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await getTodoById('todo-123')

      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('todos')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'todo-123')
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual(mockTodo)
    })

    it('should throw error if todo not found', async () => {
      const mockError = new Error('Todo not found')
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      await expect(getTodoById('nonexistent')).rejects.toThrow('Todo not found')
    })
  })

  describe('createTodo', () => {
    it('should create new todo successfully', async () => {
      const mockQuery = {
        insert: vi.fn().mockResolvedValue({ error: null })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await createTodo('user-123', 'New todo')

      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('todos')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        title: 'New todo'
      })
      expect(result).toBeNull()
    })

    it('should return error if insert fails', async () => {
      const mockError = { message: 'Insert failed' }
      
      const mockQuery = {
        insert: vi.fn().mockResolvedValue({ error: mockError })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await createTodo('user-123', 'New todo')

      expect(result).toEqual(mockError)
    })
  })

  describe('updateTodoById', () => {
    it('should update todo title successfully', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await updateTodoById('todo-123', 'Updated title')

      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('todos')
      expect(mockQuery.update).toHaveBeenCalledWith({ title: 'Updated title' })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'todo-123')
      expect(result).toBeNull()
    })

    it('should return error if update fails', async () => {
      const mockError = { message: 'Update failed' }
      
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await updateTodoById('todo-123', 'Updated title')

      expect(result).toEqual(mockError)
    })
  })

  describe('toggleTodoById', () => {
    it('should toggle todo completion status successfully', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await toggleTodoById('todo-123', true)

      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('todos')
      expect(mockQuery.update).toHaveBeenCalledWith({ completed: true })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'todo-123')
      expect(result).toBeNull()
    })

    it('should return error if toggle fails', async () => {
      const mockError = { message: 'Toggle failed' }
      
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await toggleTodoById('todo-123', false)

      expect(result).toEqual(mockError)
    })
  })

  describe('deleteTodoById', () => {
    it('should delete todo successfully', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await deleteTodoById('todo-123')

      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('todos')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'todo-123')
      expect(result).toBeNull()
    })

    it('should return error if delete fails', async () => {
      const mockError = { message: 'Delete failed' }
      
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError })
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await deleteTodoById('todo-123')

      expect(result).toEqual(mockError)
    })
  })
})
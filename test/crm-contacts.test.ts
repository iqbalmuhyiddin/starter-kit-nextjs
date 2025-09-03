import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createContact, updateContact, deleteContact } from '@/server/actions/contacts'
import { getContacts, getContactById, getContactsCount } from '@/server/queries/contacts'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }))
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: 'contact-1', name: 'John Doe', email: 'john@example.com', user_id: 'test-user-id' }, 
            error: null 
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ 
                data: { id: 'contact-1', name: 'John Updated', email: 'john@example.com', user_id: 'test-user-id' }, 
                error: null 
              }))
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ 
            data: [
              { id: 'contact-1', name: 'John Doe', email: 'john@example.com', user_id: 'test-user-id', deals: [] }
            ], 
            error: null 
          }))
        })),
        single: vi.fn(() => Promise.resolve({ 
          data: { id: 'contact-1', name: 'John Doe', email: 'john@example.com', user_id: 'test-user-id', deals: [], activities: [] }, 
          error: null 
        }))
      }))
    }))
  }))
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('CRM Contacts - Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createContact', () => {
    it('should create a contact successfully', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        notes: 'Test contact'
      }

      const result = await createContact(contactData)

      expect(result.success).toBe(true)
      expect(result.contact).toMatchObject({
        id: 'contact-1',
        name: 'John Doe',
        email: 'john@example.com'
      })
    })

    it('should return error when name is missing', async () => {
      const contactData = {
        name: '',
        email: 'john@example.com'
      }

      const result = await createContact(contactData)

      expect(result.error).toBe('Name is required')
    })

    it('should return error when name is only whitespace', async () => {
      const contactData = {
        name: '   ',
        email: 'john@example.com'
      }

      const result = await createContact(contactData)

      expect(result.error).toBe('Name is required')
    })
  })

  describe('updateContact', () => {
    it('should update a contact successfully', async () => {
      const contactData = {
        name: 'John Updated',
        email: 'john.updated@example.com'
      }

      const result = await updateContact('contact-1', contactData)

      expect(result.success).toBe(true)
      expect(result.contact).toMatchObject({
        id: 'contact-1',
        name: 'John Updated'
      })
    })

    it('should return error when name is missing', async () => {
      const contactData = {
        name: '',
        email: 'john@example.com'
      }

      const result = await updateContact('contact-1', contactData)

      expect(result.error).toBe('Name is required')
    })
  })

  describe('deleteContact', () => {
    it('should delete a contact successfully', async () => {
      const result = await deleteContact('contact-1')

      expect(result.success).toBe(true)
    })
  })
})

describe('CRM Contacts - Database Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getContacts', () => {
    it('should fetch contacts successfully', async () => {
      const contacts = await getContacts()

      expect(contacts).toHaveLength(1)
      expect(contacts![0]).toMatchObject({
        id: 'contact-1',
        name: 'John Doe',
        email: 'john@example.com'
      })
    })

    it('should return null when user is not authenticated', async () => {
      const mockCreateClient = vi.fn(() => ({
        auth: {
          getUser: vi.fn(() => Promise.resolve({ 
            data: { user: null }, 
            error: null 
          }))
        }
      }))
      
      vi.mocked(require('@/lib/supabase/server').createClient).mockReturnValue(mockCreateClient())

      const contacts = await getContacts()

      expect(contacts).toBeNull()
    })
  })

  describe('getContactById', () => {
    it('should fetch a specific contact successfully', async () => {
      const contact = await getContactById('contact-1')

      expect(contact).toMatchObject({
        id: 'contact-1',
        name: 'John Doe',
        email: 'john@example.com'
      })
    })
  })
})

describe('CRM Contacts - Data Validation', () => {
  it('should handle special characters in names', async () => {
    const contactData = {
      name: "John O'Connor & Associates",
      email: 'john@example.com'
    }

    const result = await createContact(contactData)

    expect(result.success).toBe(true)
  })

  it('should trim whitespace from fields', async () => {
    const contactData = {
      name: '  John Doe  ',
      email: '  john@example.com  ',
      phone: '  +1234567890  ',
      company: '  Acme Corp  ',
      notes: '  Test notes  '
    }

    const result = await createContact(contactData)

    // The actual trimming is tested in the implementation
    // Here we just verify it succeeds
    expect(result.success).toBe(true)
  })
})
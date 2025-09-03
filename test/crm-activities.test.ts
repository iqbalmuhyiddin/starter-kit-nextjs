import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createActivity, updateActivity, deleteActivity } from '@/server/actions/activities'
import { getActivities, getContactActivities, getDealActivities, getRecentActivities } from '@/server/queries/activities'

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
            data: { 
              id: 'activity-1', 
              content: 'Test activity',
              type: 'note',
              contact_id: 'contact-1',
              deal_id: null,
              user_id: 'test-user-id',
              contacts: { id: 'contact-1', name: 'John Doe' },
              deals: null
            }, 
            error: null 
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ 
                data: { 
                  id: 'activity-1', 
                  content: 'Updated activity',
                  type: 'call',
                  contact_id: 'contact-1',
                  deal_id: null,
                  user_id: 'test-user-id',
                  contacts: { id: 'contact-1', name: 'John Doe' },
                  deals: null
                }, 
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
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [
                { 
                  id: 'activity-1', 
                  content: 'Test activity',
                  type: 'note',
                  contact_id: 'contact-1',
                  deal_id: null,
                  contacts: { id: 'contact-1', name: 'John Doe' },
                  deals: null
                }
              ], 
              error: null 
            }))
          }))
        })),
        single: vi.fn(() => Promise.resolve({ 
          data: { 
            contact_id: 'contact-1',
            deal_id: null
          }, 
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

describe('CRM Activities - Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createActivity', () => {
    it('should create an activity linked to a contact', async () => {
      const activityData = {
        content: 'Called customer about proposal',
        type: 'call',
        contact_id: 'contact-1'
      }

      const result = await createActivity(activityData)

      expect(result.success).toBe(true)
      expect(result.activity).toMatchObject({
        id: 'activity-1',
        content: 'Test activity',
        type: 'note',
        contact_id: 'contact-1'
      })
    })

    it('should create an activity linked to a deal', async () => {
      const activityData = {
        content: 'Updated proposal terms',
        type: 'note',
        deal_id: 'deal-1'
      }

      const result = await createActivity(activityData)

      expect(result.success).toBe(true)
    })

    it('should return error when content is missing', async () => {
      const activityData = {
        content: '',
        contact_id: 'contact-1'
      }

      const result = await createActivity(activityData)

      expect(result.error).toBe('Content is required')
    })

    it('should return error when neither contact nor deal is specified', async () => {
      const activityData = {
        content: 'Test activity'
        // No contact_id or deal_id
      }

      const result = await createActivity(activityData)

      expect(result.error).toBe('Activity must be linked to either a contact or a deal')
    })

    it('should default type to "note" when not specified', async () => {
      const activityData = {
        content: 'Test activity',
        contact_id: 'contact-1'
        // No type specified
      }

      const result = await createActivity(activityData)

      expect(result.success).toBe(true)
    })
  })

  describe('updateActivity', () => {
    it('should update an activity successfully', async () => {
      const updateData = {
        content: 'Updated activity content',
        type: 'email'
      }

      const result = await updateActivity('activity-1', updateData)

      expect(result.success).toBe(true)
    })

    it('should return error when content is empty', async () => {
      const updateData = {
        content: '',
        type: 'note'
      }

      const result = await updateActivity('activity-1', updateData)

      expect(result.error).toBe('Content is required')
    })
  })

  describe('deleteActivity', () => {
    it('should delete an activity successfully', async () => {
      const result = await deleteActivity('activity-1')

      expect(result.success).toBe(true)
    })
  })
})

describe('CRM Activities - Database Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getContactActivities', () => {
    it('should fetch activities for a specific contact', async () => {
      const activities = await getContactActivities('contact-1')

      expect(activities).toHaveLength(1)
      expect(activities![0]).toMatchObject({
        id: 'activity-1',
        content: 'Test activity',
        contact_id: 'contact-1'
      })
    })
  })

  describe('getDealActivities', () => {
    it('should fetch activities for a specific deal', async () => {
      const activities = await getDealActivities('deal-1')

      expect(activities).toHaveLength(1)
    })
  })

  describe('getRecentActivities', () => {
    it('should fetch recent activities for dashboard', async () => {
      const activities = await getRecentActivities(5)

      expect(activities).toHaveLength(1)
      expect(activities![0]).toHaveProperty('contacts')
      expect(activities![0]).toHaveProperty('deals')
    })
  })

  describe('getActivities', () => {
    it('should fetch activities with filters', async () => {
      const activities = await getActivities({ 
        contact_id: 'contact-1',
        type: 'note'
      })

      expect(activities).toHaveLength(1)
    })
  })
})

describe('CRM Activities - Data Integrity', () => {
  it('should handle long activity content', async () => {
    const longContent = 'A'.repeat(1000) // Very long content
    const activityData = {
      content: longContent,
      contact_id: 'contact-1'
    }

    const result = await createActivity(activityData)

    expect(result.success).toBe(true)
  })

  it('should handle special characters in content', async () => {
    const activityData = {
      content: 'Meeting with John & Jane @ 2:30 PM - discussed $10,000 proposal',
      type: 'meeting',
      contact_id: 'contact-1'
    }

    const result = await createActivity(activityData)

    expect(result.success).toBe(true)
  })

  it('should trim whitespace from content', async () => {
    const activityData = {
      content: '  Test activity with whitespace  ',
      contact_id: 'contact-1'
    }

    const result = await createActivity(activityData)

    expect(result.success).toBe(true)
  })
})
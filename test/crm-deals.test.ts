import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createDeal, updateDeal, updateDealStage, deleteDeal } from '@/server/actions/deals'
import { getDealsByStage, getDeals, getDealStages } from '@/server/queries/deals'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }))
    },
    from: vi.fn((table: string) => {
      if (table === 'deals') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ 
                data: { 
                  id: 'deal-1', 
                  title: 'Test Deal', 
                  stage_id: 'stage-1',
                  user_id: 'test-user-id',
                  contacts: { id: 'contact-1', name: 'John Doe' },
                  deal_stages: { id: 'stage-1', name: 'Lead', order_index: 1 }
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
                      id: 'deal-1', 
                      title: 'Updated Deal',
                      stage_id: 'stage-2',
                      contacts: { id: 'contact-1', name: 'John Doe' },
                      deal_stages: { id: 'stage-2', name: 'In Progress', order_index: 2 }
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
              order: vi.fn(() => Promise.resolve({ 
                data: [
                  { 
                    id: 'deal-1', 
                    title: 'Test Deal', 
                    stage_id: 'stage-1',
                    contacts: { id: 'contact-1', name: 'John Doe' },
                    deal_stages: { id: 'stage-1', name: 'Lead', order_index: 1 }
                  }
                ], 
                error: null 
              }))
            }))
          }))
        }
      } else if (table === 'deal_stages') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ 
                data: [
                  { id: 'stage-1', name: 'Lead', order_index: 1, user_id: 'test-user-id' },
                  { id: 'stage-2', name: 'In Progress', order_index: 2, user_id: 'test-user-id' },
                  { id: 'stage-3', name: 'Won', order_index: 3, user_id: 'test-user-id' },
                  { id: 'stage-4', name: 'Lost', order_index: 4, user_id: 'test-user-id' }
                ], 
                error: null 
              }))
            }))
          }))
        }
      }
      return {}
    }))
  }))
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('CRM Deals - Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createDeal', () => {
    it('should create a deal successfully', async () => {
      const dealData = {
        title: 'Test Deal',
        description: 'A test deal',
        value: 10000,
        stage_id: 'stage-1',
        contact_id: 'contact-1'
      }

      const result = await createDeal(dealData)

      expect(result.success).toBe(true)
      expect(result.deal).toMatchObject({
        id: 'deal-1',
        title: 'Test Deal',
        stage_id: 'stage-1'
      })
    })

    it('should return error when title is missing', async () => {
      const dealData = {
        title: '',
        stage_id: 'stage-1'
      }

      const result = await createDeal(dealData)

      expect(result.error).toBe('Title is required')
    })

    it('should return error when stage_id is missing', async () => {
      const dealData = {
        title: 'Test Deal',
        stage_id: ''
      }

      const result = await createDeal(dealData)

      expect(result.error).toBe('Stage is required')
    })
  })

  describe('updateDealStage', () => {
    it('should update deal stage successfully', async () => {
      const result = await updateDealStage('deal-1', 'stage-2')

      expect(result.success).toBe(true)
      expect(result.deal?.stage_id).toBe('stage-2')
    })
  })

  describe('deleteDeal', () => {
    it('should delete a deal successfully', async () => {
      const result = await deleteDeal('deal-1')

      expect(result.success).toBe(true)
    })
  })
})

describe('CRM Deals - Database Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDealStages', () => {
    it('should fetch deal stages successfully', async () => {
      const stages = await getDealStages()

      expect(stages).toHaveLength(4)
      expect(stages![0]).toMatchObject({
        id: 'stage-1',
        name: 'Lead',
        order_index: 1
      })
    })
  })

  describe('getDealsByStage', () => {
    it('should organize deals by stage for Kanban board', async () => {
      const dealsByStage = await getDealsByStage()

      expect(dealsByStage).toHaveLength(4) // 4 stages
      expect(dealsByStage![0].stage.name).toBe('Lead')
      expect(dealsByStage![0].deals).toHaveLength(1)
    })
  })

  describe('getDeals', () => {
    it('should fetch deals with filters', async () => {
      const deals = await getDeals({ stage_id: 'stage-1' })

      expect(deals).toHaveLength(1)
      expect(deals![0]).toMatchObject({
        id: 'deal-1',
        title: 'Test Deal',
        stage_id: 'stage-1'
      })
    })
  })
})

describe('CRM Deals - Business Logic', () => {
  it('should handle deals without contacts', async () => {
    const dealData = {
      title: 'No Contact Deal',
      stage_id: 'stage-1'
      // No contact_id provided
    }

    const result = await createDeal(dealData)

    expect(result.success).toBe(true)
  })

  it('should handle deals with zero value', async () => {
    const dealData = {
      title: 'Free Deal',
      stage_id: 'stage-1',
      value: 0
    }

    const result = await createDeal(dealData)

    expect(result.success).toBe(true)
  })
})
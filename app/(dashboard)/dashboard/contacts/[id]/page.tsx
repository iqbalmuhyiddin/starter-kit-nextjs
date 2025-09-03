import { notFound } from 'next/navigation'
import { getContactById } from '@/server/queries/contacts'
import { getContactActivities } from '@/server/queries/activities'
import { getDealStages } from '@/server/queries/deals'
import { getContacts } from '@/server/queries/contacts'
import { ContactDialog } from '@/components/features/crm/contact-dialog'
import { DealDialog } from '@/components/features/crm/deal-dialog'
import { ActivityDialog } from '@/components/features/crm/activity-dialog'
import { ActivityLog } from '@/components/features/crm/activity-log'
import { DealCard } from '@/components/features/crm/deal-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Building, 
  FileText, 
  Plus,
  TrendingUp,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import type { Tables } from '@/types/supabase'

// Type definitions for contact with relations
type ContactWithRelations = Tables<'contacts'> & {
  deals?: Array<Tables<'deals'> & {
    deal_stages?: Tables<'deal_stages'> | null
  }>
  activities?: Tables<'activities'>[]
}

type DealWithStage = Tables<'deals'> & {
  deal_stages?: Tables<'deal_stages'> | null
}

interface ContactDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params
  
  const [contact, activities, dealStages, allContacts] = await Promise.all([
    getContactById(id),
    getContactActivities(id, 20),
    getDealStages(),
    getContacts({ limit: 100 })
  ])

  if (!contact) {
    notFound()
  }

  // Type assertion for complex Supabase relations
  const contactData = contact as ContactWithRelations

  const activeDeals: DealWithStage[] = contactData.deals?.filter((deal) => 
    deal.deal_stages?.name !== 'Won' && deal.deal_stages?.name !== 'Lost'
  ) || []

  const completedDeals: DealWithStage[] = contactData.deals?.filter((deal) => 
    deal.deal_stages?.name === 'Won' || deal.deal_stages?.name === 'Lost'
  ) || []

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/contacts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Button>
          </Link>
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {contactData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{contactData.name}</h1>
              {contactData.company && (
                <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                  <Building className="h-4 w-4" />
                  {contactData.company}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {contactData.email && (
                  <a 
                    href={`mailto:${contactData.email}`}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {contactData.email}
                  </a>
                )}
                {contactData.phone && (
                  <a 
                    href={`tel:${contactData.phone}`}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Phone className="h-4 w-4" />
                    {contactData.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <ActivityDialog
              contact_id={contactData.id}
              trigger={
                <Button variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Log Activity
                </Button>
              }
            />
            <ContactDialog 
              contact={contactData}
              trigger={
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Contact
                </Button>
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Contact Info & Notes */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-sm">{contactData.name}</dd>
              </div>
              {contactData.email && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="text-sm">
                    <a href={`mailto:${contactData.email}`} className="text-blue-600 hover:underline">
                      {contactData.email}
                    </a>
                  </dd>
                </div>
              )}
              {contactData.phone && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                  <dd className="text-sm">
                    <a href={`tel:${contactData.phone}`} className="text-blue-600 hover:underline">
                      {contactData.phone}
                    </a>
                  </dd>
                </div>
              )}
              {contactData.company && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Company</dt>
                  <dd className="text-sm">{contactData.company}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Added</dt>
                <dd className="text-sm">
                  {new Date(contactData.created_at).toLocaleDateString()}
                </dd>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {contactData.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{contactData.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Deals & Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Deals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Active Deals ({activeDeals.length})
                </CardTitle>
                <DealDialog
                  stages={dealStages || []}
                  contacts={allContacts || []}
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Deal
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {activeDeals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No active deals</p>
                  <p className="text-xs mt-1">Create a deal to start tracking opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Deals */}
          {completedDeals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Deal History ({completedDeals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedDeals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">{deal.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={deal.deal_stages?.name === 'Won' ? 'default' : 'secondary'}
                          >
                            {deal.deal_stages?.name}
                          </Badge>
                          {deal.value && (
                            <span className="text-sm text-muted-foreground">
                              ${deal.value.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(deal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity History</CardTitle>
                <ActivityDialog
                  contact_id={contactData.id}
                  trigger={
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Activity
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              <ActivityLog 
                activities={activities || []} 
                showRelatedItems={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signOut } from '@/server/actions/auth'
import { getContactsCount } from '@/server/queries/contacts'
import { getDealStages, getDealsCountByStage } from '@/server/queries/deals'
import { getContacts } from '@/server/queries/contacts'
import { getActivities } from '@/server/queries/activities'
import { ContactDialog } from '@/components/features/crm/contact-dialog'
import { DealDialog } from '@/components/features/crm/deal-dialog'
import { ActivityLog } from '@/components/features/crm/activity-log'
import { PlusIcon, Users, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch CRM overview data in parallel
  const [contactsCount, dealStages, contacts, dealsCountByStage, recentActivities] = await Promise.all([
    getContactsCount(),
    getDealStages(),
    getContacts({ limit: 5 }), // Recent contacts
    getDealsCountByStage(),
    getActivities({ limit: 5 }) // Recent activities
  ])

  const totalDeals = dealsCountByStage?.reduce((sum, stage) => sum + stage.count, 0) || 0

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form action={async () => {
          'use server'
          await signOut()
        }}>
          <Button variant="outline" type="submit">
            Sign Out
          </Button>
        </form>
      </div>

      {/* Welcome Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>
            You are signed in as {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            User ID: {user?.id}
          </p>
        </CardContent>
      </Card>

      {/* CRM Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">CRM Overview</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contacts
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contactsCount}</div>
              <p className="text-xs text-muted-foreground">
                <Link href="/dashboard/contacts" className="text-blue-600 hover:underline">
                  View all contacts
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Deals
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDeals}</div>
              <p className="text-xs text-muted-foreground">
                <Link href="/dashboard/pipeline" className="text-blue-600 hover:underline">
                  View pipeline
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Deal Stages
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dealStages?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active pipeline stages
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with your CRM tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ContactDialog 
                trigger={
                  <Button className="w-full justify-start">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add New Contact
                  </Button>
                }
              />
              <DealDialog 
                stages={dealStages || []}
                contacts={contacts || []}
                trigger={
                  <Button variant="outline" className="w-full justify-start">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create New Deal
                  </Button>
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline Status</CardTitle>
              <CardDescription>
                Deals by stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dealsCountByStage && dealsCountByStage.length > 0 ? (
                <div className="space-y-2">
                  {dealsCountByStage.map((stage, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{stage.stage_name}</span>
                      <span className="text-sm font-medium">{stage.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No deals yet. Create your first deal above!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest activities across your contacts and deals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityLog activities={recentActivities || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
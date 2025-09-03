import { getContacts } from '@/server/queries/contacts'
import { ContactCard } from '@/components/features/crm/contact-card'
import { ContactDialog } from '@/components/features/crm/contact-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PlusIcon, Search } from 'lucide-react'
import type { Tables } from '@/types/supabase'

interface ContactsPageProps {
  searchParams: Promise<{
    search?: string
    company?: string
  }>
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { search, company } = await searchParams
  
  const contacts = await getContacts({
    search,
    company,
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your customer contacts and relationships
          </p>
        </div>
        <ContactDialog 
          trigger={
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          }
        />
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search contacts by name, email, or company..."
                  className="pl-10"
                  defaultValue={search}
                  name="search"
                />
              </div>
            </div>
            <Button type="submit">Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Grid */}
      <div className="space-y-4">
        {contacts && contacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact: Tables<'contacts'>) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {search ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">No contacts found</h3>
                    <p>Try adjusting your search terms or add a new contact.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">No contacts yet</h3>
                    <p>Get started by adding your first contact.</p>
                  </>
                )}
              </div>
              <ContactDialog 
                trigger={
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Your First Contact
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      {contacts && contacts.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {contacts.length} contact{contacts.length === 1 ? '' : 's'}
          {search && ` matching "${search}"`}
        </div>
      )}
    </div>
  )
}
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  Code2, 
  Database, 
  Layers, 
  Rocket, 
  Shield, 
  Sparkles,
  Terminal,
  Zap,
  Github,
  Users,
  TrendingUp
} from "lucide-react";
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="flex justify-center mb-6">
          <Badge variant="secondary" className="px-4 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            Starter Kit • Next.js 15.3 + Supabase + Docker
          </Badge>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Production-ready
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {" "}starter kit
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Full-stack starter template with authentication, database, Docker containerization, 
          and a complete CRM example to demonstrate best practices.
        </p>
        
        <div className="flex gap-4 justify-center">
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signin">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline">
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to start building</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Next.js 15.3</CardTitle>
              <CardDescription>
                Latest App Router with Server Components, Server Actions, and streaming
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Supabase</CardTitle>
              <CardDescription>
                PostgreSQL database with real-time subscriptions and Row Level Security
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>TypeScript</CardTitle>
              <CardDescription>
                Full type safety with generated Supabase types and strict mode
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Tailwind CSS v4</CardTitle>
              <CardDescription>
                Modern CSS with design tokens and no configuration needed
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-pink-600" />
              </div>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Built-in auth with protected routes and middleware setup
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-cyan-600" />
              </div>
              <CardTitle>Docker Ready</CardTitle>
              <CardDescription>
                Multi-stage builds, docker-compose, and production deployment configs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Example Features */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">See it in action</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the included CRM example that demonstrates full-stack patterns, 
            database relationships, and modern React patterns.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Contact Management</CardTitle>
              <CardDescription>
                Full CRUD operations with form validation, server actions, and optimistic updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Sales Pipeline</CardTitle>
              <CardDescription>
                Drag-and-drop interface with real-time updates and relationship management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Activity Tracking</CardTitle>
              <CardDescription>
                Time-series data with proper indexing and efficient queries using Supabase
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Code Examples */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Quick Start</h2>
        
        <Tabs defaultValue="setup" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="component">Component</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Get up and running</CardTitle>
                <CardDescription>Clone the repo and install dependencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-400">Terminal</span>
                  </div>
                  <pre className="overflow-x-auto">
{`# Clone the repository
git clone https://github.com/your-repo/nextjs-supabase-starter.git

# Install dependencies (uses pnpm)
pnpm install

# Start local Supabase
supabase start

# Set up environment variables
cp .env.development.example .env.development

# Start development server
pnpm run dev`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Type-safe database queries</CardTitle>
                <CardDescription>Generated types from your schema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-400">server/queries/contacts.ts</span>
                  </div>
                  <pre className="overflow-x-auto">
{`import { createClient } from '@/lib/supabase/server'

export async function getContacts() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('contacts')
    .select('*, deals(title, value)')
    .order('created_at', { ascending: false })
    
  if (error) throw error
  return data // Fully typed with Supabase types!
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="component">
            <Card>
              <CardHeader>
                <CardTitle>Server Components by default</CardTitle>
                <CardDescription>Fetch data directly in components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-400">app/(dashboard)/dashboard/page.tsx</span>
                  </div>
                  <pre className="overflow-x-auto">
{`export default async function DashboardPage() {
  const [contacts, deals] = await Promise.all([
    getContacts({ limit: 5 }),
    getDeals({ limit: 5 })
  ])
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-6">
        <ContactsOverview contacts={contacts} />
        <DealsOverview deals={deals} />
      </div>
    </div>
  )
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to build?</h2>
            <p className="text-xl mb-8 text-blue-50">
              Start your next project with this production-ready starter
            </p>
            <div className="flex gap-4 justify-center">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/signin">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <Button size="lg" variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                Read Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

# Next.js 15.3 + Supabase Starter Kit

## 📋 Project Overview
Full-stack web application with authentication, database, and modern UI components.

## 🛠️ Tech Stack
- **Framework**: Next.js 15.3 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Testing**: Vitest + Testing Library
- **Package Manager**: pnpm (not npm)

## 📁 Project Structure

```
├── app/                      # App Router
│   ├── (auth)/              # Auth group routes (/signup, /signin)
│   ├── (dashboard)/         # Protected routes
│   ├── api/                 # API routes
│   └── globals.css          # Tailwind v4
├── components/
│   ├── ui/                  # shadcn/ui components  
│   └── features/            # Feature-specific components
├── lib/
│   ├── supabase/           # Client configs (client.ts, server.ts)
│   └── utils.ts            # cn() + helpers
├── server/                  # Server-only code
│   ├── queries/            # Database queries
│   └── actions/            # Server Actions
├── hooks/                   # Client-side React hooks
├── types/
│   └── supabase.ts         # Generated database types
└── supabase/
    ├── migrations/         # Database migrations
    └── config.toml         # Supabase configuration
```

## 🚨 Essential Rules

### Database & Types
- **Migration-first**: NEVER modify database directly. Always use `supabase migration new <name>`
- **Always regenerate types**: After ANY schema change run `supabase gen types --local > types/supabase.ts`
- **Enable RLS**: All new tables must have Row Level Security enabled
- **Commit both**: Migration file AND updated types

### Next.js Patterns  
- **Server Components by default** - Use Client Components only when needed
- **Separate Supabase clients** - `lib/supabase/server.ts` for server, `lib/supabase/client.ts` for client
- **Use `after()` for non-blocking operations** (analytics, notifications)

### Package Management
- **Use pnpm**: `pnpm install`, `pnpm add <package>`, `pnpm run <script>` (never npm)

### Development Workflow
- **Commit at logical breakpoints** - Don't wait for perfect completion
- **Check existing patterns** before adding new approaches
- **Test business logic**, not implementation details

## 🎯 Feature Development Workflow (Plan Mode)

### Kiro Methodology
When in plan mode, follow structured spec-driven development:

**Phase 1: Requirements**
- Create user stories: "As a [role], I want [feature], so that [benefit]"
- Define acceptance criteria using EARS format: "WHEN [condition] THEN system SHALL [action]"
- Iterate until requirements approved

**Phase 2: Design** 
- Technical architecture and implementation approach
- Component structure, data models, error handling
- Include Mermaid diagrams for visual representation
- Address all requirements from Phase 1
- Iterate until design approved

**Phase 3: Tasks**
- Break down design into actionable coding checklist
- Number tasks (1.1, 1.2, etc.) with requirement traceability
- Focus on incremental, testable progress
- Iterate until task list approved

### Spec Organization
```
.kiro/specs/{feature-name}/
├── requirements.md    # User stories & acceptance criteria
├── design.md         # Technical architecture & approach  
└── tasks.md          # Implementation checklist
```

### Implementation Context
- Generated specs provide rich context for coding phase
- Each task references specific requirements
- Design decisions documented for future reference
- Enables systematic, well-planned development

## ⚡ Key Commands

```bash
# Development
pnpm run dev              # Start development server
supabase start           # Start local Supabase

# Database  
supabase migration new <name>    # Create new migration
supabase db reset               # Apply migrations locally
pnpm run db:types              # Generate TypeScript types

# Testing & Build
pnpm run test             # Run tests
pnpm run build           # Type-safe production build

# UI Components
npx shadcn@latest add <component>  # Add shadcn/ui components
```

## 🔐 Authentication (Already Implemented)

Authentication is fully configured:
- Sign up/Sign in pages: `/signup`, `/signin`
- Protected routes: `app/(dashboard)/` with middleware
- Server actions: `server/actions/auth.ts` (signUp, signIn, signOut)
- Profile creation on signup

## 🎨 UI & Styling

### Tailwind v4
- Uses `@import "tailwindcss"` in `app/globals.css`
- Design tokens in `@theme` block
- No `@tailwind` directives needed

### shadcn/ui Components
- Pre-configured with Tailwind v4
- Add components: `npx shadcn@latest add <component>`
- Located in `components/ui/`

## 🧪 Testing Strategy

### What to Test
- Business logic in utilities and hooks
- Server Actions with mocked Supabase client  
- Component behavior (not visual appearance)
- Error states and edge cases

### Setup
- Vitest + Testing Library configured
- Supabase client mocked in `test/setup.ts`

## 📝 Coding Standards

### File Organization
- Database queries: `server/queries/`
- Mutations: `server/actions/` with "use server"
- Feature components: `components/features/`
- Shared utilities: `lib/`

### Database Patterns
- Enable RLS on all new tables
- Use typed queries with `Database` types
- Include indexes in migrations
- Add updated_at triggers for timestamp tracking

### Performance
- Load data in parallel with `Promise.all()`
- Use Suspense for streaming
- Use `after()` for non-blocking operations

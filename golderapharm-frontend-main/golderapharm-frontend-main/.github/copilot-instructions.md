# GitHub Copilot Instructions for GolderaPharm CRM

## Project Overview
GolderaPharm is a role-based pharmaceutical CRM system built with Next.js 16 App Router, TypeScript, and Tailwind CSS. The application supports three distinct user roles (Manager, Supervisor, Medical Rep) with customized interfaces and permissions.

---

## Core Architecture Patterns

### 1. Feature-Based Organization
**ALWAYS** organize code by feature domain, not by technical layer:

```
features/
  ├── [feature-name]/
  │   ├── api/              # Server actions and API calls
  │   ├── components/       # Feature-specific UI components
  │   ├── hooks/           # Custom React hooks
  │   ├── lib/             # Feature utilities
  │   │   ├── types/       # TypeScript interfaces/types
  │   │   ├── schemas/     # Zod validation schemas
  │   │   ├── constants/   # Feature constants
  │   │   └── utils/       # Helper functions
  │   └── assets/          # Feature-specific assets
```

### 2. Server Actions Pattern
**ALWAYS** implement API calls using Next.js Server Actions:

```typescript
"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";

/**
 * Fetch data from backend
 */
export async function fetchData(): Promise<DataResponse> {
  return apiFetch<DataResponse>("/api/endpoint", {
    method: "GET",
  });
}

/**
 * Server action - ALWAYS include error handling
 */
export async function getDataAction(): Promise<{
  success: boolean;
  data?: DataType;
  error?: {
    message: string;
    code: string;
    statusCode?: number;
  };
}> {
  try {
    const response = await fetchData();
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Failed to fetch data:", err);

    return {
      success: false,
      error: {
        message: err.message || "Failed to load data",
        code: err.code || "FETCH_ERROR",
        statusCode: err.statusCode,
      },
    };
  }
}
```

### 3. Type Safety Requirements
**ALWAYS** define TypeScript types before implementation:

```typescript
// 1. Define API response types
export interface DataResponse {
  status: "success";
  data: DataType;
}

// 2. Define data structure types
export interface DataType {
  id: string;
  name: string;
  createdAt: string;
  // ... other fields
}

// 3. Define component props
interface ComponentProps {
  data?: DataType;
  onAction?: () => void;
}
```

**CRITICAL**: Types must align with backend API responses. Check `lib/types/index.ts` for shared types.

---

## Role-Based Architecture

### Role Configuration Files
**NEVER** hardcode role permissions. **ALWAYS** use configuration files in `core/role-config/`:

- `role-features.ts` - Feature permissions per role
- `role-sidebar.ts` - Navigation items per role
- `role-quick-actions.ts` - Quick action buttons per role
- `role-theme.ts` - Color schemes per role
- `role-plan-stats.ts` - Plan statistics config
- `role-coaching-stats.ts` - Coaching stats config

### Role Types
```typescript
type UserRole = "MANAGER" | "SUPERVISOR" | "MEDICAL_REP";
```

### Theme System
Each role has distinct colors:
- **MANAGER**: Gold (`#c9a961`)
- **SUPERVISOR**: Blue (`#2563eb`)
- **MEDICAL_REP**: Green (`#10B981`)

Use `system-primary` class for role-based coloring (auto-applies correct color).

---

## Component Development Guidelines

### 1. Server vs Client Components
**DEFAULT**: Use React Server Components (no "use client")
**USE CLIENT** only when needed:
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, etc.)
- Browser APIs
- Interactive charts/forms

```typescript
// Server Component (default)
export default async function Page() {
  const data = await getDataAction();
  return <div>{data.data?.name}</div>;
}

// Client Component (when needed)
"use client";
export default function InteractiveCard() {
  const [state, setState] = useState(false);
  return <button onClick={() => setState(!state)}>Toggle</button>;
}
```

### 2. Data Fetching Pattern
**ALWAYS** fetch data in page components, pass to child components as props:

```typescript
// app/(dashboard)/role/page.tsx
export default async function Page() {
  const result = await getDataAction();
  const data = result.success ? result.data : null;

  return (
    <main>
      <ChildComponent data={data} />
    </main>
  );
}
```

### 3. Component Props Pattern
**ALWAYS** provide default values and handle empty states:

```typescript
interface ComponentProps {
  data?: DataType[];
  count?: number;
}

export function Component({ data = [], count = 0 }: ComponentProps) {
  if (data.length === 0) {
    return <EmptyState />;
  }
  
  return <div>{/* Render data */}</div>;
}
```

### 4. Form Components
**ALWAYS** use React Hook Form + Zod for forms:

```typescript
// 1. Define schema
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export type FormValues = z.infer<typeof formSchema>;

// 2. Use in component
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  
  async function onSubmit(values: FormValues) {
    const result = await submitAction(values);
    if (result.success) {
      // Handle success
    }
  }
  
  return <Form {...form}>{/* Form fields */}</Form>;
}
```

---

## Styling Guidelines

### Tailwind CSS Conventions
1. **Use semantic class names**: `bg-secondary-light`, `text-system-primary`
2. **Predefined colors**:
   - Dashboard: `dashboard-green`, `dashboard-blue`, `dashboard-orange`, `dashboard-red`, `dashboard-gold`
   - System: `system-primary` (role-based), `system-gradient-from`, `system-gradient-to`
   - Secondary: `secondary-light`, `secondary-dark`, `secondary-very-light`

3. **Layout patterns**:
   ```tsx
   // Card wrapper
   <Card className="border-secondary-light rounded-[25px] border bg-white shadow-none">
   
   // Gradient header (role-based)
   <header className="gradient-gold flex-col items-start justify-center rounded-[14px] p-6">
   
   // Stat card icon
   <div className="bg-system-primary flex size-11 items-center justify-center rounded-lg">
   ```

4. **Responsive breakpoints**:
   - `lg:w-[1024px]` - Standard laptop
   - `min-[1440px]:w-[1083px]!` - Large desktop

---

## Data Display Patterns

### 1. Date Formatting
**ALWAYS** use `date-fns` for date formatting:

```typescript
import { format } from "date-fns";

const formattedDate = format(new Date(dateString), "MMM d, yyyy");
```

### 2. Number Formatting
**ALWAYS** use `Intl.NumberFormat` for numbers/currency:

```typescript
// Currency
const formatted = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(totalSales);

// Large numbers
const formatted = `${(value / 1000).toFixed(0)}K`;
```

### 3. Icon Mapping
**ALWAYS** create icon mapping functions for dynamic icons:

```typescript
const getRequestIcon = (type: string) => {
  switch (type) {
    case "EXPENSE": return <DollarSign size={16} />;
    case "SAMPLE": return <PackageSearch size={16} />;
    case "MARKETING": return <FileCheck size={16} />;
    case "LEAVE": return <Calendar size={16} />;
    default: return <FileCheck size={16} />;
  }
};
```

### 4. Charts (Recharts)
**ALWAYS** handle empty data states in charts:

```typescript
export function Chart({ data }: ChartProps) {
  const chartData = data
    ? Object.entries(data).map(([key, value]) => ({ key, value }))
    : [];

  if (chartData.length === 0) {
    return <EmptyState />;
  }

  return <ChartContainer>{/* Chart */}</ChartContainer>;
}
```

---

## API Integration

### HTTP Client Usage
**ALWAYS** use `apiFetch` from `services/http.ts`:

```typescript
import { apiFetch } from "@/services/http";

// GET request
const data = await apiFetch<ResponseType>("/api/endpoint");

// POST request
const result = await apiFetch<ResponseType>("/api/endpoint", {
  method: "POST",
  body: JSON.stringify(payload),
});
```

**Features**:
- Automatic JWT token injection
- Error handling with typed errors
- Base URL from environment variables

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NODE_ENV=development
```

---

## Common Code Patterns

### 1. Status Badge Colors
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case "APPROVED": return "bg-dashboard-green";
    case "REJECTED": return "bg-dashboard-red";
    case "PENDING": return "bg-dashboard-orange";
    default: return "bg-dashboard-orange";
  }
};
```

### 2. Initials Generation
```typescript
import { getInitials } from "@/lib/utils";

const initials = getInitials("John Doe"); // "JD"
```

### 3. Empty State Pattern
```typescript
{items.length === 0 ? (
  <div className="py-8 text-center text-sm text-gray-500">
    No items found
  </div>
) : (
  <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>
)}
```

### 4. Conditional Rendering by Role
```typescript
import { useRoleUI } from "@/core/ui/role-ui-context";

export function Component() {
  const { role } = useRoleUI();
  
  if (role === "MANAGER") {
    return <ManagerView />;
  }
  
  return <DefaultView />;
}
```

---

## File Naming Conventions

1. **Components**: PascalCase - `DoctorCard.tsx`, `MainCards.tsx`
2. **Utilities**: camelCase - `formatDate.ts`, `calculateTotal.ts`
3. **Types**: camelCase - `index.ts`, `doctor-types.ts`
4. **Server Actions**: camelCase - `index.ts` (in api folder)
5. **Pages**: lowercase - `page.tsx`, `layout.tsx`, `loading.tsx`

---

## Import Path Aliases

**ALWAYS** use `@/` alias for absolute imports:

```typescript
// ✅ Correct
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getDataAction } from "@/features/data/api";

// ❌ Wrong
import { Button } from "../../../components/ui/button";
```

---

## Error Handling

### Client-Side Errors
```typescript
"use client";

export function Component() {
  const [error, setError] = useState<string>("");

  async function handleAction() {
    setError("");
    const result = await someAction();
    
    if (!result.success) {
      setError(result.error?.message || "An error occurred");
      return;
    }
    
    // Success logic
  }

  return (
    <div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <button onClick={handleAction}>Submit</button>
    </div>
  );
}
```

### Server-Side Errors
```typescript
try {
  const response = await apiFetch("/api/endpoint");
  return { success: true, data: response.data };
} catch (error) {
  const err = error as ApiError;
  return {
    success: false,
    error: {
      message: err.message || "Failed to fetch data",
      code: err.code || "FETCH_ERROR",
      statusCode: err.statusCode,
    },
  };
}
```

---

## Performance Best Practices

1. **Minimize Client Components**: Keep "use client" boundary as low as possible
2. **Parallel Data Fetching**: Fetch independent data in parallel
   ```typescript
   const [data1, data2] = await Promise.all([
     getData1Action(),
     getData2Action(),
   ]);
   ```
3. **Image Optimization**: Always use Next.js `<Image>` component
4. **Dynamic Imports**: Lazy load heavy components
   ```typescript
   const HeavyComponent = dynamic(() => import("./HeavyComponent"));
   ```

---

## Testing Patterns (Future)

When implementing tests:

1. **Unit Tests**: Feature utilities and helper functions
2. **Component Tests**: React Testing Library for UI components
3. **Integration Tests**: Server actions and API calls
4. **E2E Tests**: Critical user flows with Playwright

---

## Security Guidelines

1. **Never expose sensitive data**: Tokens in HTTP-only cookies only
2. **Validate all inputs**: Use Zod schemas for validation
3. **Role-based access**: Check permissions in server actions
4. **Sanitize user input**: React handles XSS by default, but validate on backend

---

## Common Mistakes to Avoid

1. ❌ Don't fetch data in client components
2. ❌ Don't hardcode role permissions in components
3. ❌ Don't forget default values in props
4. ❌ Don't skip empty state handling
5. ❌ Don't use relative imports (`../../../`)
6. ❌ Don't ignore TypeScript errors
7. ❌ Don't forget to handle loading states
8. ❌ Don't mix Manager/Supervisor/Rep specific logic in shared components

---

## Version Control Practices

1. **Commit Messages**: Use conventional commits
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `refactor:` - Code refactoring
   - `style:` - Formatting changes
   - `docs:` - Documentation

2. **Branch Naming**: `feature/feature-name`, `fix/bug-name`

---

## Quick Reference: Adding a New Feature

1. Create feature folder structure in `features/`
2. Define types in `lib/types/index.ts`
3. Create Zod schemas in `lib/schemas/`
4. Implement API functions in `api/index.ts`
5. Create server actions with error handling
6. Build UI components in `components/`
7. Add routes in `app/(dashboard)/[role]/`
8. Update role configurations if needed
9. Test with all three roles

---

## Dependencies Quick Reference

**UI Components**: Radix UI + Tailwind
**Forms**: React Hook Form + Zod
**Charts**: Recharts
**Icons**: Lucide React
**Dates**: date-fns
**HTTP**: Custom `apiFetch` wrapper
**Styling**: Tailwind CSS + CVA

---

## Key Files to Reference

- **Type definitions**: `lib/types/index.ts`
- **API client**: `services/http.ts`
- **Role config**: `core/role-config/*.ts`
- **Shared utils**: `lib/utils/index.ts`
- **Auth logic**: `features/auth/api/index.ts`
- **Middleware**: `proxy.ts`

---

## When in Doubt

1. Check existing feature implementation (e.g., `features/doctors/`)
2. Follow the same patterns used in similar features
3. Maintain type safety - no `any` types
4. Provide empty states for all data displays
5. Handle errors gracefully with user-friendly messages
6. Test with Manager, Supervisor, and Rep roles
7. Ensure responsive design matches existing pages

---

**Remember**: Consistency is key. Follow existing patterns rather than introducing new ones. This project values maintainability, type safety, and role-based architecture above all else.

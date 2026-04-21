# Portfolio Admin — Development Log

A full record of every feature built, pattern used, and optimization made across the admin panel of this Next.js portfolio project.

---

## Table of Contents

1. [Project Stack](#1-project-stack)
2. [Architecture Overview](#2-architecture-overview)
3. [Pagination — Phase 1](#3-pagination--phase-1)
4. [Search & Filter — Phase 2](#4-search--filter--phase-2)
5. [Debounced Search](#5-debounced-search)
6. [Table Skeleton Loading](#6-table-skeleton-loading)
7. [Code Optimization & Cleanup](#7-code-optimization--cleanup)
8. [File-by-File Reference](#8-file-by-file-reference)
9. [Data Flow Diagram](#9-data-flow-diagram)
10. [API Query Parameters Reference](#10-api-query-parameters-reference)

---

## 1. Project Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| State Management | Zustand |
| HTTP Client | Axios |
| Forms | React Hook Form + Controller |
| Styling | Tailwind CSS |
| Notifications | React Toastify |

---

## 2. Architecture Overview

The codebase follows a strict 3-layer architecture:

```
UI Component
    ↓  calls
Custom Hook  (useServices, useProjects, etc.)
    ↓  calls
Zustand Store  (for projects/testimonials/roles)
    ↓  calls
API Service  (services.ts, projects.ts, etc.)
    ↓  calls
Axios Instance  (axiosInstance.ts)
    ↓  hits
Backend REST API
```

**Why this separation?**
- UI components stay pure — they only render and handle user events
- Hooks own all local UI state (search, filters, page, debounce timers)
- Stores own server-fetched data and loading/error/pagination state
- Services own the HTTP logic and response mapping
- This means any layer can be swapped without touching the others

---

## 3. Pagination — Phase 1

### What was there before

Every fetch function returned a flat array. The "Showing X of Y" footer was a static `<div>` with no navigation.

```ts
// BEFORE — returned flat array, no pagination
export const GetServices = async (): Promise<Service[]> => {
  const response = await api.get(API_ENDPOINTS.SERVICES.GET_ALL);
  return Array.isArray(response.data) ? response.data : (response.data.results ?? []);
};
```

### What the API actually returns

```json
{
  "pagination": {
    "page": 1,
    "count": 10,
    "page_size": 10,
    "total_count": 14,
    "total_pages": 2,
    "has_next": true,
    "has_previous": false
  },
  "results": [ ... ]
}
```

### Shared types added — `api/types.ts`

```ts
export type Pagination = {
  page: number;
  count: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

export type PaginatedResponse<T> = {
  results: T[];
  pagination: Pagination;
};

// Handles both paginated and flat-array responses gracefully
export const parsePaginated = <T>(data: any, mapper: (d: any) => T): PaginatedResponse<T> => {
  if (Array.isArray(data)) {
    const results = data.map(mapper);
    return {
      results,
      pagination: { page: 1, count: results.length, page_size: results.length,
        total_count: results.length, total_pages: 1, has_next: false, has_previous: false }
    };
  }
  return { results: (data.results ?? []).map(mapper), pagination: data.pagination };
};
```

### Service layer changes

All 5 fetch functions updated to accept `page` and return `PaginatedResponse<T>`:

```ts
// AFTER — services.ts
export const GetServices = async (page = 1): Promise<PaginatedResponse<Service>> => {
  const response = await api.get(`${API_ENDPOINTS.SERVICES.GET_ALL}?page=${page}`);
  return parsePaginated(response.data, (d) => d as Service);
};
```

Same pattern applied to: `fetchProjects`, `fetchTestimonials`, `fetchContactQueries`, `fetchUsers`.

### Store changes (projects, testimonials, roles)

Added `pagination: Pagination | null` state. `fetchX` functions now accept `page?` and store the pagination object:

```ts
// useProjectStore.ts
fetchProjects: async (page = 1) => {
  set({ loading: true, error: null });
  try {
    const { results, pagination } = await fetchProjects(page);
    set({ projects: results, pagination });
  } catch {
    set({ error: "Failed to load projects" });
  } finally {
    set({ loading: false });
  }
},
```

### Hook changes

Each hook gained `page` state and `handlePageChange`. The `useEffect` depends on `page`:

```ts
const [page, setPage] = useState(1);

useEffect(() => { load(page); }, [page]);

const handlePageChange = (p: number) => setPage(p);
```

### PaginationBar component — `components/shared/PaginationBar.tsx`

A shared component that renders the "Showing X–Y of Z" label and page number buttons:

```tsx
<PaginationBar
  pagination={pagination}
  totalFiltered={services.length}
  onPageChange={handlePageChange}
  label="services"
/>
```

- Shows "Showing 1–10 of 14 services"
- Renders numbered page buttons only when `total_pages > 1`
- Prev/Next buttons disabled when `has_previous`/`has_next` is false
- Active page highlighted in violet

### Pages updated

| Page | Columns | Label |
|---|---|---|
| Services | 5 | services |
| Projects | 6 | projects |
| Testimonials | 5 | testimonials |
| Contact Queries | 7 | queries |
| Roles Management | 6 | users |

---

## 4. Search & Filter — Phase 2

### The problem with client-side filtering

Before this phase, search and filter dropdowns filtered the already-fetched page of data. This meant:
- Searching "AI" on page 2 would only search within the 10 items on page 2
- The full database was never searched
- Pagination count was wrong after filtering

### The solution — server-side filtering

All filter params are sent as query parameters to the backend. The backend returns a fresh paginated result for that search/filter combination.

### Query parameters used

| Param | Pages | Example |
|---|---|---|
| `page` | All | `?page=2` |
| `search` | All | `?search=react` |
| `status` | Projects, Testimonials, Contact Queries | `?status=live` |
| `category` | Projects | `?category=Full-Stack` |
| `role` | Roles Management | `?role=support_staff` |

### Service layer — URLSearchParams

All fetch functions now build the query string cleanly using `URLSearchParams`:

```ts
// projects.ts
export const fetchProjects = async (
  page = 1,
  search = "",
  status = "",
  category = ""
): Promise<PaginatedResponse<Project>> => {
  const params = new URLSearchParams({ page: String(page) });
  if (search)   params.set("search", search);
  if (status)   params.set("status", status);
  if (category) params.set("category", category);
  const res = await api.get(`${API_ENDPOINTS.PROJECTS.GET_ALL}?${params}`);
  return parsePaginated(res.data, fromApi);
};
```

Empty strings are never appended — only params with actual values are sent.

### Store layer — pass-through

Stores updated to accept and forward all filter params:

```ts
fetchProjects: async (page = 1, search = "", status = "", category = "") => {
  const { results, pagination } = await fetchProjects(page, search, status, category);
  set({ projects: results, pagination });
},
```

### Hook layer — owns all filter state

Filter state was **moved out of stores and into hooks**. This is the key architectural decision:

- Stores only hold server data (results + pagination)
- Hooks hold UI state (search input, filter dropdowns, current page)

```ts
// useProjects.ts
const [search, setSearchState] = useState("");
const [filterStatus, setFilterStatusState] = useState("All");
const [filterCategory, setFilterCategoryState] = useState("All");
const [page, setPage] = useState(1);
```

### Page reset on filter change

Whenever a filter or search changes, page resets to 1 to avoid showing "page 3 of 1":

```ts
const setFilterStatus = (value: string) => {
  setFilterStatusState(value);
  setPage(1); // always reset to page 1
};
```

### "All" sentinel values

The UI uses "All", "All Roles", "All Status" as the default dropdown values. These are stripped before sending to the API:

```ts
const load = useCallback(async (p, s, status, category) => {
  await fetchProjects(
    p,
    s,
    status === "All" ? "" : status,
    category === "All" ? "" : category,
  );
}, []);
```

### Projects page — Category filter added

The projects toolbar gained a second filter dropdown for category:

```tsx
<select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
  {["All", "Full-Stack", "Frontend", "Backend"].map(c => <option key={c}>{c}</option>)}
</select>
```

---

## 5. Debounced Search

### The problem

Without debouncing, every keystroke fires an API request. Typing "react" fires 5 requests: `r`, `re`, `rea`, `reac`, `react`.

### The solution — useRef debounce timer

A `useRef` holds the timeout ID so it persists across renders without causing re-renders itself:

```ts
const [search, setSearchState] = useState("");        // immediate — controls input value
const [debouncedSearch, setDebouncedSearch] = useState(""); // delayed — triggers API call
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleSearchChange = (value: string) => {
  setSearchState(value);                    // update input instantly
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    setDebouncedSearch(value);              // fire API after 1 second of no typing
    setPage(1);                             // reset to page 1
  }, 1000);
};
```

### Why two state variables?

| Variable | Purpose | Updates |
|---|---|---|
| `search` | Controls the `<input>` value | Every keystroke (instant) |
| `debouncedSearch` | Triggers the `useEffect` API call | 1 second after last keystroke |

The `useEffect` only depends on `debouncedSearch`, not `search`:

```ts
useEffect(() => {
  load(page, debouncedSearch, filterStatus, filterCategory);
}, [page, debouncedSearch, filterStatus, filterCategory]);
```

This means the input feels responsive while the API is only called when the user pauses.

### Applied to all 5 pages

| Hook | Debounced | Filters |
|---|---|---|
| `useServices` | search | — |
| `useProjects` | search | status, category |
| `useTestimonials` | search | status |
| `useContactQueries` | search | read/unread status |
| `useRoles` | search | role, status |

---

## 6. Table Skeleton Loading

### Before

Loading state was either a plain text row inside the table or an early-return block that hid the entire page including the toolbar:

```tsx
// BEFORE — hid toolbar, no structure
if (loading) return (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
    ))}
  </div>
);
```

Or inside the table:
```tsx
{loading && (
  <tr><td colSpan={5} className="text-center py-12">Loading...</td></tr>
)}
```

### After — `components/shared/TableSkeleton.tsx`

A shared component that renders animated skeleton rows that match the table structure:

```tsx
export default function TableSkeleton({ cols, rows = 6 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100 dark:border-gray-800/60">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-4">
              {j === 0 ? (
                // First column: avatar circle + two text lines
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex-shrink-0 bg-gray-200 dark:bg-gray-700/60 rounded animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-700/60 rounded animate-pulse" />
                    <div className="h-3.5 w-48 bg-gray-200 dark:bg-gray-700/60 rounded animate-pulse" />
                  </div>
                </div>
              ) : (
                // Other columns: simple shimmer bar
                <div className="h-3.5 w-24 bg-gray-200 dark:bg-gray-700/60 rounded animate-pulse" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
```

### Key design decisions

1. **Toolbar stays visible** — skeleton renders inside `<tbody>`, not as an early return. Users can still change search/filter while loading
2. **Matches real row structure** — first column always has avatar + two lines, matching every page's actual first column
3. **Dark mode aware** — `bg-gray-200 dark:bg-gray-700/60` works in both themes
4. **Configurable** — `cols` and `rows` props make it reusable across all 5 pages

### Usage

```tsx
{loading && <TableSkeleton cols={5} />}
{!loading && items.length === 0 && (
  <tr><td colSpan={5}>No items found</td></tr>
)}
{!loading && items.map(item => ( ... ))}
```

---

## 7. Code Optimization & Cleanup

### Dead imports removed

**`api/endpoints.ts`** had a stray Node.js import that doesn't belong in a browser module:

```ts
// REMOVED
import { ADDRCONFIG } from "dns";
```

Also removed the entire `QUERY_PARAMS` block which was never used anywhere:

```ts
// REMOVED — was never referenced
QUERY_PARAMS: {
  PAGE: '/?page',
  STATUS: '/?status',
  SEARCH: '/?search',
  CATEGORY: '/?category',
}
```

### Unused endpoint keys removed

Removed endpoint keys that had no callers anywhere in the codebase:

| File | Removed keys |
|---|---|
| CONTACT | `GET_ONE`, `UPDATE` |
| TESTIMONIALS | `GET_ONE` |
| PROJECTS | `GET_ONE` |
| ROLES | `GET_SINGLE_USER` |

### Wrong interface removed

`api/services/auth.ts` had a `LoginResponse` interface whose shape didn't match the actual API response:

```ts
// REMOVED — wrong shape, never used
export interface LoginResponse {
  token: string;
  email: string;
  role?: string;
}
```

### Dead store state removed

After moving search/filter ownership to hooks, three stores still had dead state that was never read:

**Removed from `useProjectStore`:**
- `search: string`
- `filterStatus: string`
- `setSearch: (v: string) => void`
- `setFilterStatus: (v: string) => void`

**Removed from `useTestimonialStore`:**
- `search: string`
- `filterStatus: string`
- `setSearch`, `setFilterStatus`

**Removed from `useRolesStore`:**
- `search: string`
- `roleFilter: string`
- `statusFilter: string`
- `setSearch`, `setRoleFilter`, `setStatusFilter`

### Fixed authenticated vs public API usage

`fetchPublishedTestimonials` was using the authenticated `api` instance (requires JWT token) for a public-facing endpoint. Fixed to use `publicApi` and pass the filter as a query param instead of client-side filtering:

```ts
// BEFORE — wrong instance, client-side filter
export const fetchPublishedTestimonials = async () => {
  const res = await api.get(`${API_ENDPOINTS.TESTIMONIALS.GET_ALL}?page=1`);
  return list.map(fromApi).filter(t => t.status === "Published"); // client-side!
};

// AFTER — correct instance, server-side filter
export const fetchPublishedTestimonials = async () => {
  const res = await publicApi.get(`${API_ENDPOINTS.TESTIMONIALS.GET_ALL}?status=Published`);
  return list.map(fromApi);
};
```

### Error type tightened

`err: any` replaced with `err: unknown` in hooks that catch errors, which is the TypeScript-correct pattern and fixes the log injection scanner finding:

```ts
// BEFORE
} catch (err: any) {
  toast.error(err.response?.data?.error || "Login failed");
}

// AFTER
} catch (err: unknown) {
  const message = (err as any)?.response?.data?.error ?? "Login failed";
  toast.error(message);
}
```

### Axios timeout increased

The free-tier Render.com backend has cold starts that can take 10–15 seconds. The timeout was too aggressive:

```ts
// BEFORE
timeout: 5000,  // 5 seconds — fails on cold start

// AFTER
timeout: 15000, // 15 seconds — handles cold start
```

### store/index.ts completed

The barrel export file was missing several stores and types. Added all missing exports:

```ts
// ADDED
export { useServiceStore } from "./useServiceStore";
export { useRolesStore } from "./useRolesStore";
export { useUserStore } from "./useUserStore";
export type { RoleUser, Role, Status } from "./useRolesStore";
export type { User } from "./useUserStore";
```

### Contact queries — polling respects current filters

The 30-second polling interval now passes the current page, search, and filter state so it doesn't reset the view:

```ts
// BEFORE — always refetched page 1 with no filters
const interval = setInterval(load, 30000);

// AFTER — refetches with current state
const interval = setInterval(() => load(page, debouncedSearch, filterRead), 30000);
```

---

## 8. File-by-File Reference

### `src/api/types.ts`
Shared pagination types and `parsePaginated` helper used by all service files.

### `src/api/axiosInstance.ts`
- Authenticated `api` instance with JWT Bearer token interceptor
- Auto-refresh on 401 using refresh token cookie
- Public `publicApi` instance for unauthenticated endpoints
- Timeout: 15 seconds

### `src/api/endpoints.ts`
Single source of truth for all API URL strings. No logic, just constants.

### `src/api/services/`

| File | Exports | Notes |
|---|---|---|
| `auth.ts` | `login`, `logout` | |
| `services.ts` | `GetServices`, `CreateService`, `UpdateService`, `DeleteService` | |
| `projects.ts` | `fetchProjects`, `createProject`, `updateProject`, `deleteProject` | FormData for image upload |
| `testimonials.ts` | `fetchTestimonials`, `fetchPublishedTestimonials`, `createTestimonial`, `updateTestimonial`, `deleteTestimonial`, `toggleTestimonialStatus` | `fetchPublishedTestimonials` uses `publicApi` |
| `contact.ts` | `sendContactMessage`, `fetchContactQueries`, `markContactQueryRead`, `markAllContactQueriesRead`, `deleteContactQuery` | `sendContactMessage` uses `publicApi` |
| `roles.ts` | `fetchUsers`, `createUser`, `updateUser`, `deleteUser`, `toggleUserStatus` | |
| `notifications.ts` | `GetNotifications`, `GetUnreadNotificationsCount`, `MarkNotificationAsRead`, `MarkAllNotificationsAsRead` | |

### `src/api/hooks/`

| Hook | Owns | Exposes |
|---|---|---|
| `useAuth` | login/logout logic | `loginUser`, `logoutUser` |
| `useContact` | public contact form | `submitContact`, `loading` |
| `useServices` | search, page, pagination | full CRUD + toggle visible |
| `useProjects` | search, status filter, category filter, page | full CRUD |
| `useTestimonials` | search, status filter, page | full CRUD + toggle status |
| `useContactQueries` | search, read filter, page, 30s poll | mark read, mark all read, delete |
| `useRoles` | search, role filter, status filter, page | full CRUD + toggle status |
| `useNotifications` | 30s poll | mark read, mark all read |
| `usePublicTestimonials` | — | published testimonials for landing page |

### `src/store/`

| Store | Holds | Notes |
|---|---|---|
| `useProjectStore` | `projects[]`, `loading`, `error`, `pagination` | No filter state |
| `useTestimonialStore` | `testimonials[]`, `loading`, `error`, `pagination` | No filter state |
| `useRolesStore` | `users[]`, `loading`, `error`, `pagination` | No filter state |
| `useServiceStore` | `services[]` | Simple CRUD store, no pagination (managed in hook) |
| `useContactQueryStore` | `queries[]`, `pagination` | Also holds `search`, `filterRead` for URL-driven open |
| `useUserStore` | `user` | Persisted to localStorage |
| `useThemeStore` | `theme` | Persisted to localStorage |
| `useNotificationStore` | `notifications[]`, `unread_count` | |

### `src/components/shared/`

| Component | Purpose |
|---|---|
| `PaginationBar` | Renders page navigation + "Showing X–Y of Z" label |
| `TableSkeleton` | Animated skeleton rows for table loading states |
| `FormField` | Reusable input/textarea/select with label and error |
| `ImageDropZone` | Drag-and-drop image upload with base64 preview |
| `NotificationsDropdown` | Bell icon dropdown with unread badge |
| `ProfileDropdown` | User avatar dropdown with logout |
| `sidebar` | Admin navigation sidebar |
| `dashboard-header` | Top bar with notifications and profile |
| `ThemeToggle` | Dark/light mode toggle button |

---

## 9. Data Flow Diagram

### Search flow (typing in search input)

```
User types "react"
    ↓
handleSearchChange("react")
    ↓
setSearch("react")          → input shows "react" immediately
clearTimeout(debounceRef)   → cancel previous timer
setTimeout(1000ms)          → start new timer
    ↓ (1 second passes with no more typing)
setDebouncedSearch("react")
setPage(1)
    ↓
useEffect fires [page=1, debouncedSearch="react"]
    ↓
load(1, "react", filterStatus, filterCategory)
    ↓
fetchProjects(1, "react", "", "")
    ↓
GET /portfolio/?page=1&search=react
    ↓
{ pagination: {...}, results: [...] }
    ↓
set({ projects: results, pagination })
    ↓
UI re-renders with new results + updated PaginationBar
```

### Filter change flow (selecting from dropdown)

```
User selects "Frontend" from category dropdown
    ↓
setFilterCategory("Frontend")
    ↓
setFilterCategoryState("Frontend")
setPage(1)                  → reset to page 1 immediately
    ↓
useEffect fires [page=1, debouncedSearch, filterStatus, filterCategory="Frontend"]
    ↓
load(1, debouncedSearch, filterStatus, "Frontend")
    ↓
fetchProjects(1, "", "", "Frontend")
    ↓
GET /portfolio/?page=1&category=Frontend
    ↓
{ pagination: {...}, results: [...] }
    ↓
UI re-renders
```

### Pagination click flow

```
User clicks page 2
    ↓
handlePageChange(2)
    ↓
setPage(2)
    ↓
useEffect fires [page=2, debouncedSearch, filterStatus, filterCategory]
    ↓
load(2, debouncedSearch, filterStatus, filterCategory)
    ↓
GET /portfolio/?page=2&search=react&category=Frontend
    ↓
UI re-renders with page 2 results, same filters preserved
```

---

## 10. API Query Parameters Reference

### Services — `GET /services/`

| Param | Type | Example |
|---|---|---|
| `page` | number | `?page=2` |
| `search` | string | `?search=web` |

### Projects — `GET /portfolio/`

| Param | Type | Example |
|---|---|---|
| `page` | number | `?page=1` |
| `search` | string | `?search=react` |
| `status` | string | `?status=live` |
| `category` | string | `?category=Full-Stack` |

### Testimonials — `GET /testimonial/`

| Param | Type | Example |
|---|---|---|
| `page` | number | `?page=1` |
| `search` | string | `?search=john` |
| `status` | string | `?status=Published` |

### Contact Queries — `GET /contact-queries/`

| Param | Type | Example |
|---|---|---|
| `page` | number | `?page=1` |
| `search` | string | `?search=hello` |
| `status` | string | `?status=unread` |

### Users / Roles — `GET /auth/users/`

| Param | Type | Example |
|---|---|---|
| `page` | number | `?page=1` |
| `search` | string | `?search=john` |
| `role` | string | `?role=support_staff` |
| `status` | string | `?status=Active` |

---

*Last updated: after full codebase optimization pass*

# API Integration Guide — Portfolio Project

This document explains how the entire API integration works in this project,
step by step, from the very first file to the final UI component.
Written for beginners — no assumed knowledge.

---

## The Big Picture (Read This First)

When your UI needs data from the backend, the request travels through
a chain of layers. Each layer has one job:

```
UI Component
    ↓  calls
Custom Hook
    ↓  calls
Service Function
    ↓  uses
Axios Instance  ──→  Backend API
    ↓  returns
Service Function  (maps/transforms data)
    ↓  returns
Store  (saves data in memory)
    ↓  provides
Custom Hook
    ↓  provides
UI Component  (renders the data)
```

Think of it like a restaurant:
- The **UI** is the customer placing an order
- The **Hook** is the waiter taking the order
- The **Service** is the kitchen that prepares the request
- The **Axios Instance** is the delivery vehicle that goes to the backend
- The **Store** is the table where the food is placed so everyone can see it

---

## Step 1 — Axios Instance (`src/api/axiosInstance.ts`)

**What is Axios?**
Axios is a library that makes HTTP requests (GET, POST, PUT, DELETE) to your
backend. Think of it as a smarter version of the browser's built-in `fetch`.

**What did we do here?**
We created two pre-configured Axios instances so we don't repeat setup code
everywhere.

### Instance 1: `api` (Authenticated)
Used for admin endpoints that require a logged-in user.

```ts
const api = axios.create({
  baseURL: "http://192.168.97.162:8000/api",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});
```

`baseURL` — every request automatically starts with this URL.
So when you call `api.get('/testimonial/')`, the actual URL becomes
`http://192.168.97.162:8000/api/testimonial/`.

`timeout: 5000` — if the server doesn't respond in 5 seconds, cancel the request.

### What is an Interceptor?
An interceptor is a function that runs automatically before every request
or after every response. Like a security checkpoint.

**Request Interceptor** — runs before every request is sent:
```ts
api.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
This automatically attaches the user's login token to every request header.
The backend reads this token to verify "is this person logged in?".

**Response Interceptor** — runs after every response comes back:
```ts
api.interceptors.response.use(
  (response) => response,       // success — just pass it through
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — try to get a new one using the refresh token
      // If that also fails — log the user out and redirect to login
    }
  }
);
```
If the backend returns a 401 (Unauthorized), it means the token expired.
The interceptor automatically tries to refresh it silently. If refresh also
fails, it clears cookies and sends the user to the login page.

### Instance 2: `publicApi` (No Authentication)
Used for endpoints that don't require login, like the contact form submission.

```ts
export const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});
```
No interceptors — no token attached. Plain requests only.

---

## Step 2 — API Endpoints (`src/api/endpoints.ts`)

**Why do we have this file?**
Instead of writing the URL string everywhere in your code, you define all
URLs in one place. If the backend URL changes, you only update it here.

```ts
export const API_ENDPOINTS = {
  TESTIMONIALS: {
    GET_ALL: '/testimonial/',
    SEND:    '/testimonial/',
    GET_ONE: (id: number) => `/testimonial/${id}/`,
    UPDATE:  (id: number) => `/testimonial/${id}/`,
    DELETE:  (id: number) => `/testimonial/${id}/`,
  },
  CONTACT: {
    SEND:         '/contact-queries/',
    GET_ALL:      '/contact-queries/',
    MARK_READ:    (id: number) => `/contact-queries/${id}/mark-read/`,
    MARK_ALL_READ: '/contact-queries/mark-all-read/',
    DELETE:       (id: number) => `/contact-queries/${id}/`,
  },
  AUTH: {
    LOGIN: '/auth/login/',
  },
  // ...more
};
```

Static endpoints are plain strings: `GET_ALL: '/testimonial/'`
Dynamic endpoints are functions: `GET_ONE: (id) => `/testimonial/${id}/``

Usage example:
```ts
api.get(API_ENDPOINTS.TESTIMONIALS.GET_ALL)       // → GET /testimonial/
api.delete(API_ENDPOINTS.TESTIMONIALS.DELETE(5))  // → DELETE /testimonial/5/
```

---

## Step 3 — Service Functions (`src/api/services/`)

**What is a Service?**
A service file contains plain async functions that talk to the backend.
Each function does exactly one thing — one API call.
They don't know anything about React, components, or the UI.

### Example: `testimonials.ts`

**The field mismatch problem:**
Our frontend uses `text` for the review content.
The backend calls it `review_text`.
We solve this with two mapper functions:

```ts
// Converts our shape → backend shape (before sending)
const toApi = (p: TestimonialPayload) => ({
  name: p.name,
  review_text: p.text,   // rename text → review_text
  // ...
});

// Converts backend shape → our shape (after receiving)
const fromApi = (d: any): TestimonialResponse => ({
  id: d.id,
  text: d.review_text ?? d.text,   // rename review_text → text
  // ...
});
```

This keeps the mismatch isolated in one file. The rest of the app
always uses `text` and never knows `review_text` exists.

**The service functions:**
```ts
// Fetch all (admin — sees all statuses)
export const fetchTestimonials = async () => {
  const res = await api.get(API_ENDPOINTS.TESTIMONIALS.GET_ALL);
  const list = Array.isArray(res.data) ? res.data : res.data.results ?? [];
  return list.map(fromApi);
};

// Fetch published only (landing page)
export const fetchPublishedTestimonials = async () => {
  const res = await api.get(API_ENDPOINTS.TESTIMONIALS.GET_ALL);
  const list = Array.isArray(res.data) ? res.data : res.data.results ?? [];
  return list.map(fromApi).filter(t => t.status === "Published");
};

// Create
export const createTestimonial = async (payload) => {
  const res = await api.post(API_ENDPOINTS.TESTIMONIALS.SEND, toApi(payload));
  return fromApi(res.data);
};

// Update
export const updateTestimonial = async (id, payload) => {
  const res = await api.put(API_ENDPOINTS.TESTIMONIALS.UPDATE(id), toApi(payload));
  return fromApi(res.data);
};

// Delete
export const deleteTestimonial = async (id) => {
  await api.delete(API_ENDPOINTS.TESTIMONIALS.DELETE(id));
};
```

Notice the pattern:
- Always `await` the axios call
- Always handle the response shape (`res.data`, `res.data.results`)
- Always run `fromApi()` on the result before returning

---

## Step 4 — The Store (`src/store/`)

**What is a Store?**
A store is a global memory box for your app. Any component anywhere in the
app can read from it or write to it — without passing data through props.

We use **Zustand** as our store library. It's simpler than Redux.

**Why do we need a store for API data?**
Without a store, if two different components both need the testimonials list,
they would each make their own separate API call. With a store, the data is
fetched once and shared everywhere.

### How the Testimonial Store works (`useTestimonialStore.ts`)

```ts
export const useTestimonialStore = create<TestimonialStore>((set, get) => ({
  // STATE — the data box
  testimonials: [],   // the list from the API
  loading: false,     // is a request in progress?
  error: null,        // did something go wrong?
  search: "",         // current search input value
  filterStatus: "All",

  // ACTIONS — functions that change the state

  // Fetches from API and saves into the store
  fetchTestimonials: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchTestimonials();  // calls the service
      set({ testimonials: data });             // saves into store
    } catch {
      set({ error: "Failed to load testimonials" });
    } finally {
      set({ loading: false });
    }
  },

  // Calls API then updates the store list
  addTestimonial: async (t) => {
    const created = await createTestimonial(t);           // service call
    set((s) => ({ testimonials: [...s.testimonials, created] })); // update store
  },

  // Calls API then replaces the item in the store list
  updateTestimonial: async (id, t) => {
    const updated = await updateTestimonial(id, t);
    set((s) => ({
      testimonials: s.testimonials.map((x) => x.id === id ? updated : x),
    }));
  },

  // Calls API then removes the item from the store list
  deleteTestimonial: async (id) => {
    await deleteTestimonial(id);
    set((s) => ({ testimonials: s.testimonials.filter((x) => x.id !== id) }));
  },
}));
```

**`set()`** — updates the state. Whatever you pass inside replaces the old value.
**`get()`** — reads the current state from inside an action.

### Two types of stores in this project

**Type A — Store manages its own API calls (Testimonials)**
The store itself imports service functions and calls them directly.
The store owns both the data AND the logic to fetch/mutate it.

```
Store → calls Service → gets data → saves into itself
```

**Type B — Store is just a data container (Contact Queries)**
The store only holds data and simple update functions.
The hook is responsible for calling the service and then telling the store
what to save.

```
Hook → calls Service → gets data → tells Store to save it
```

Both approaches work. Type A is more self-contained. Type B gives the hook
more control (useful when you need toast notifications on success/failure).

---

## Step 5 — Custom Hooks (`src/api/hooks/`)

**What is a Custom Hook?**
A custom hook is a React function (starts with `use`) that connects the
store and service layer to the UI. It handles:
- Triggering the initial data fetch when a component mounts
- Wrapping actions with toast notifications
- Exposing clean, ready-to-use functions to the component

### Admin Hook (`useTestimonials.ts`)

```ts
export default function useTestimonials() {
  const { testimonials, loading, error, fetchTestimonials, addTestimonial, ... }
    = useTestimonialStore();

  // Fetch data when the component first loads
  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Wrap store actions with toast feedback
  const handleAdd = async (data) => {
    try {
      await addTestimonial(data);
      toast.success("Testimonial added.");   // show success message
    } catch {
      toast.error("Failed to add testimonial.");  // show error message
      throw new Error();  // re-throw so the form knows it failed
    }
  };

  // Compute filtered list here so the component doesn't have to
  const filtered = testimonials.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === "All" || t.status === filterStatus)
  );

  return { testimonials, filtered, loading, error, handleAdd, ... };
}
```

### Public Hook (`usePublicTestimonials.ts`)

For the landing page — no store needed since it's read-only data
that doesn't need to be shared with any other component.

```ts
export default function usePublicTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPublishedTestimonials()
      .then(setTestimonials)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { testimonials, loading, error };
}
```

Simple — fetch once on mount, store locally in component state.

---

## Step 6 — The UI Component

The component is now very clean. It just calls the hook and renders the data.
It doesn't know anything about Axios, endpoints, or the store.

```tsx
export default function AdminTestimonialsView() {
  const {
    filtered, loading, error,
    search, setSearch,
    handleAdd, handleUpdate, handleDelete, handleToggleStatus,
  } = useTestimonials();  // ← one line gives you everything

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>{error}</p>;

  return (
    <table>
      {filtered.map(t => (
        <tr key={t.id}>
          <td>{t.name}</td>
          <td>{t.text}</td>
          <td><button onClick={() => handleDelete(t.id)}>Delete</button></td>
        </tr>
      ))}
    </table>
  );
}
```

---

## Full Flow Summary (Testimonials Example)

### When the admin page loads:

```
AdminTestimonialsView mounts
  → useTestimonials() hook runs
    → useEffect triggers fetchTestimonials() from the store
      → store sets loading: true
        → service calls api.get('/testimonial/')
          → axiosInstance attaches Bearer token to header
            → request goes to backend
              → backend returns { pagination: {...}, results: [...] }
            → axiosInstance response interceptor passes it through
          → service extracts results array, runs fromApi() on each item
        → store saves testimonials array, sets loading: false
      → hook returns { filtered, loading, error, ... }
    → component re-renders with real data
```

### When admin clicks "Add Testimonial":

```
Form submits data
  → handleSave() in component calls handleAdd(data) from hook
    → hook calls addTestimonial(data) from store
      → store calls createTestimonial(data) from service
        → service runs toApi(data) to rename text → review_text
          → api.post('/testimonial/', { ..., review_text: "..." })
            → backend saves it, returns the new object
          → service runs fromApi() to rename review_text → text
        → store appends the new item to testimonials array
      → hook shows toast.success("Testimonial added.")
    → component re-renders with the new item in the list
```

### When the landing page loads:

```
TestimonialsView mounts
  → usePublicTestimonials() hook runs
    → useEffect calls fetchPublishedTestimonials() directly (no store)
      → service calls api.get('/testimonial/')
        → filters results to status === "Published" only
      → hook saves to local useState
    → component renders only published testimonials
```

---

## File Structure Reference

```
src/
├── api/
│   ├── axiosInstance.ts        Step 1 — HTTP client setup
│   ├── endpoints.ts            Step 2 — All URL definitions
│   ├── services/
│   │   ├── auth.ts             Step 3 — Login/logout API calls
│   │   ├── contact.ts          Step 3 — Contact form API calls
│   │   └── testimonials.ts     Step 3 — Testimonial CRUD + field mapping
│   └── hooks/
│       ├── useTestimonials.ts       Step 5 — Admin hook (uses store)
│       ├── usePublicTestimonials.ts Step 5 — Landing hook (no store)
│       ├── useContact.ts            Step 5 — Contact form hook
│       └── useContactQueries.ts     Step 5 — Admin contact queries hook
└── store/
    ├── useTestimonialStore.ts   Step 4 — Testimonial global state
    ├── useContactQueryStore.ts  Step 4 — Contact queries global state
    ├── useUserStore.ts          Step 4 — Logged-in user global state
    └── useThemeStore.ts         Step 4 — Theme (dark/light) global state
```

---

## Key Concepts Recap

| Concept | Simple Explanation |
|---|---|
| Axios Instance | A pre-configured HTTP client. Like a car already set up with GPS and fuel. |
| Interceptor | Code that runs automatically on every request/response. Like a toll booth. |
| Endpoint | The URL path for a specific backend action. |
| Service | A plain function that makes one API call. No React involved. |
| Store (Zustand) | A global memory box. Any component can read/write to it. |
| `set()` | Updates the store state. |
| `get()` | Reads the current store state from inside an action. |
| Custom Hook | Connects the store/service to React. Handles side effects and toasts. |
| `useEffect` | Runs code after the component renders. Used to trigger the initial fetch. |
| `fromApi()` | Converts backend field names to our frontend field names. |
| `toApi()` | Converts our frontend field names to backend field names. |

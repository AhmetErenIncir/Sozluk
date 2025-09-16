<<<<<<< HEAD
# System Patterns & Architecture

## **Authentication & Authorization Patterns**

### **Client-Side Authentication Pattern**

The application uses a **pure client-side authentication** approach to avoid server/client state conflicts that previously caused critical logout failures.

#### **Implementation Details**

```typescript
// AuthProvider Context Pattern
const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Session refresh mechanism
  const refreshSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
  };

  // Auth state change listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
};
```

#### **Key Benefits**

- **State Consistency**: Single source of truth for authentication state
- **Conflict Prevention**: Eliminates server/client auth state mismatches
- **Session Refresh**: Automatic state synchronization after operations
- **Error Recovery**: Multiple fallback strategies for logout operations

### **Role-Based Access Control (RBAC)**

Implements hierarchical user roles with database-driven authorization.

#### **Database Schema**

```sql
-- User profiles with role management
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Only admins can update roles" ON profiles
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );
```

#### **React Implementation**

```typescript
// Admin route protection
const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!user || !isAdmin) return <Redirect to="/login" />;

  return children;
};

// Hook for admin status checking
const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus(user.id).then(setIsAdmin);
    }
  }, [user]);

  return isAdmin;
};
```

## **API Design Patterns**

### **RESTful API Structure**

Follows REST principles with clear resource-based endpoints and HTTP method semantics.

#### **Endpoint Design**

```typescript
// Word management endpoints
GET    /api/dictionary/words           # List words with pagination
POST   /api/dictionary/words           # Create new word
GET    /api/dictionary/words/[id]      # Get specific word
PUT    /api/dictionary/words/[id]      # Update word
DELETE /api/dictionary/words/[id]      # Delete word

// Search endpoints
GET    /api/dictionary/search?q=term   # Search words
GET    /api/dictionary/search/suggest  # Search suggestions
```

#### **Request/Response Patterns**

```typescript
// Standardized response format
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
}

// Error handling pattern
export const handleAPIError = (error: any): APIResponse<null> => {
  console.error("API Error:", error);

  return {
    success: false,
    error: {
      code: error.code || "UNKNOWN_ERROR",
      message: error.message || "An unexpected error occurred",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    },
  };
};
```

### **Data Validation Patterns**

Uses comprehensive input validation at both client and server levels.

#### **Client-Side Validation**

```typescript
// Form validation with Zod schema
const wordSchema = z.object({
  english_word: z
    .string()
    .min(1, "English word is required")
    .max(100, "English word too long"),
  turkish_word: z
    .string()
    .min(1, "Turkish word is required")
    .max(100, "Turkish word too long"),
  definition: z
    .string()
    .min(10, "Definition must be at least 10 characters")
    .max(1000, "Definition too long"),
  part_of_speech: z
    .enum(["noun", "verb", "adjective", "adverb", "other"])
    .optional(),
  pronunciation: z.string().max(200, "Pronunciation too long").optional(),
});
```

#### **Server-Side Validation**

```typescript
// API route validation
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input data
    const validatedData = wordSchema.parse(body);

    // Additional business logic validation
    if (await wordExists(validatedData.english_word)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "WORD_EXISTS", message: "Word already exists" },
        },
        { status: 409 }
      );
    }

    // Process valid data
    const result = await createWord(validatedData);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid input data" },
        },
        { status: 400 }
      );
    }
    return handleAPIError(error);
  }
}
```

## **State Management Patterns**

### **Context-Based State Management**

Uses React Context for global state that needs to be shared across components.

#### **Authentication Context**

```typescript
// Global auth state management
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook for consuming auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

### **Server State Management**

Uses SWR pattern for efficient server state caching and synchronization.

#### **Data Fetching Hooks**

```typescript
// Custom hook for word data
export const useWords = (params?: SearchParams) => {
  const { data, error, mutate } = useSWR(
    params ? `/api/dictionary/words?${new URLSearchParams(params)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    words: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
```

## **Component Architecture Patterns**

### **Composition Pattern**

Uses component composition for flexible and reusable UI components.

#### **Layout Composition**

```typescript
// Base layout component
const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto px-4 py-8">{children}</main>
    <Footer />
  </div>
);

// Page-specific layouts
const AdminLayout = ({ children }: { children: ReactNode }) => (
  <Layout>
    <AdminSidebar />
    <div className="admin-content">{children}</div>
  </Layout>
);
```

### **Compound Component Pattern**

Creates self-contained component families with internal state management.

#### **Form Components**

```typescript
// Compound form component
const Form = ({ children, onSubmit, ...props }) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form onSubmit={handleSubmit} {...props}>
      <FormProvider value={{ errors, setErrors, isSubmitting }}>
        {children}
      </FormProvider>
    </form>
  );
};

Form.Field = ({ name, children }) => {
  const { errors } = useFormContext();
  return (
    <div className="form-field">
      {children}
      {errors[name] && <span className="error">{errors[name]}</span>}
    </div>
  );
};

Form.Input = ({ name, ...props }) => {
  const { errors } = useFormContext();
  return (
    <input className={cn("input", errors[name] && "input-error")} {...props} />
  );
};
```

## **Database Patterns**

### **Schema Design Patterns**

Follows normalized database design with proper relationships and constraints.

#### **Audit Trail Pattern**

```sql
-- Automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_dictionary_updated_at
  BEFORE UPDATE ON dictionary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### **Query Optimization Patterns**

Implements efficient database queries with proper indexing strategies.

#### **Search Index Strategy**

```sql
-- Full-text search indexes
CREATE INDEX idx_dictionary_english_word_gin
  ON dictionary USING gin(to_tsvector('english', english_word));

CREATE INDEX idx_dictionary_turkish_word_gin
  ON dictionary USING gin(to_tsvector('turkish', turkish_word));

-- Compound indexes for filtering
CREATE INDEX idx_dictionary_composite
  ON dictionary(part_of_speech, created_at DESC);
```

## **Security Patterns**

### **Input Sanitization**

Comprehensive input validation and sanitization at all application layers.

#### **XSS Prevention**

```typescript
// HTML sanitization utility
import DOMPurify from "dompurify";

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em"],
    ALLOWED_ATTR: [],
  });
};

// Safe rendering component
const SafeHTML = ({ content }: { content: string }) => (
  <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }} />
);
```

### **Authentication Security**

Implements secure authentication practices with session management.

#### **Session Security**

```typescript
// Secure session handling
export const secureLogout = async () => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear local storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear auth context
    setSession(null);
    setUser(null);

    // Redirect to home
    router.push("/");
  } catch (error) {
    console.error("Logout error:", error);
    // Force clear even on error
    localStorage.clear();
    window.location.href = "/";
  }
};
```

## **Performance Patterns**

### **Code Splitting & Lazy Loading**

Implements strategic code splitting for optimal bundle sizes.

#### **Route-Based Splitting**

```typescript
// Lazy load admin components
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const AddWord = lazy(() => import("./AddWord"));

// Suspense wrapper
const LazyRoute = ({ component: Component, ...props }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component {...props} />
  </Suspense>
);
```

### **Memoization Patterns**

Uses React memoization for expensive computations and component renders.

#### **Component Memoization**

```typescript
// Memoized expensive components
const WordList = memo(({ words, filters }: WordListProps) => {
  const filteredWords = useMemo(() => {
    return filterWords(words, filters);
  }, [words, filters]);

  return (
    <div>
      {filteredWords.map((word) => (
        <WordCard key={word.id} word={word} />
      ))}
    </div>
  );
});
```

## **Error Handling Patterns**

### **Centralized Error Management**

Implements consistent error handling across the entire application.

#### **Error Boundary Pattern**

```typescript
// Global error boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Log to external service in production
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

#### **Async Error Handling**

```typescript
// Standardized async error handling
export const withErrorHandling = <T>(
  asyncFn: () => Promise<T>
): Promise<T | null> => {
  return asyncFn().catch((error) => {
    console.error("Async operation failed:", error);
    toast.error(error.message || "Operation failed");
    return null;
  });
};
```

## **Testing Patterns**

### **Component Testing Strategy**

Uses React Testing Library for component testing with realistic user interactions.

#### **Test Utilities**

```typescript
// Custom render function with providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: RenderOptions
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>
      <Router>{children}</Router>
    </AuthProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock auth context for testing
export const mockAuthContext = (overrides = {}) => ({
  user: null,
  session: null,
  isLoading: false,
  isAdmin: false,
  login: jest.fn(),
  logout: jest.fn(),
  refreshSession: jest.fn(),
  ...overrides,
});
```

## **Deployment Patterns**

### **Environment Configuration**

Uses environment-specific configuration with secure secret management.

#### **Configuration Pattern**

```typescript
// Environment configuration
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  app: {
    environment: process.env.NODE_ENV || "development",
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  },
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
    enableDebugMode: process.env.NODE_ENV === "development",
  },
};

// Validate required environment variables
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

## **Changelog**

- **2025-01-07**: Complete system patterns documentation with current architecture and established patterns
- **2024-08-15**: Added database and API patterns
- **2024-07-30**: Initial patterns documentation
=======
# System Patterns

## Architecture Overview

- **Components**:
  - **Frontend**: Next.js application (React, TypeScript, Tailwind CSS, Shadcn UI) responsible for the user interface and interaction.
  - **Visual Thesaurus Graph**: Interactive force-directed graph system with WebGL rendering, collision detection, and Turkish text support.
  - **State Management**: Zustand stores for graph data persistence and React Context for authentication.
  - **Backend**: (To be defined, likely Node.js/Python with a database) responsible for data storage, API endpoints, and business logic.
  - **Database**: (To be defined) for storing dictionary entries, user data, and other application-specific information.
- **Data Flow**:
  - User interacts with Frontend (traditional search or graph navigation).
  - Frontend makes API requests to Backend for word lookups, user authentication, etc.
  - Graph system uses dedicated API endpoints for relationship data.
  - Backend processes requests, interacts with Database, and returns data to Frontend.
  - Graph Store manages visualization state with persistence layer.

## Design Patterns & Rationale

- **Component-Based Architecture (Frontend)**: Utilizes React components for modularity, reusability, and maintainability. Shadcn UI provides pre-built, customizable components.
- **Graph Visualization Pattern**: Force-directed layout with WebGL rendering for performance, collision detection for readability, and state persistence for user experience continuity.
- **State Management Layers**: Zustand for complex graph state, React Context for authentication, and URL state for shareable navigation.
- **API-Driven Development**: Clear separation between frontend and backend via RESTful or GraphQL APIs, allowing independent development and scaling.
- **Layered Architecture (Backend)**: (Anticipated) Separation of concerns into presentation, business logic, and data access layers for better organization and testability.

## Critical Paths

- **Search Performance**: The speed and efficiency of word lookup are critical for user experience. This involves optimized database queries and efficient data transfer.
- **Graph Rendering Performance**: WebGL-based visualization must maintain 60 FPS with collision detection and physics simulation for up to 50 nodes.
- **Data Consistency**: Ensuring that dictionary definitions and related data are accurate and consistent across the system.
- **Scalability**: The ability to handle a growing number of users and dictionary entries without significant performance degradation.

## Changelog

- 2025-09-14: Updated architecture overview to include Visual Thesaurus graph system, state management layers, and graph-specific design patterns
- 2024-07-30: Created.
>>>>>>> test

# Agent Usage Rules

> Purpose: Define when and how to use specialized agents for different types of tasks in the Sozluk project.

---

## General Agent Usage Principles

- **Use the right agent for the task:** Always select the most specialized agent for the specific type of work
- **Proactive agent deployment:** Use agents immediately when their expertise matches the task
- **Parallel agent execution:** Run multiple agents simultaneously when working on independent tasks
- **Agent capabilities over manual work:** Prefer agent expertise over manual implementation

---

## Frontend Development Tasks

### React/Next.js Development
- **Agent:** `frontend-developer` or `typescript-pro`
- **When to use:**
  - Creating/modifying React components
  - Implementing responsive layouts
  - Client-side state management
  - Next.js App Router features
  - TypeScript type definitions

### UI/UX Implementation
- **Agent:** `ui-ux-designer`
- **When to use:**
  - Design system updates
  - Component library modifications
  - Accessibility improvements
  - User interface wireframing

---

## Backend & Database Tasks

### API Development
- **Agent:** `backend-architect` or `fastapi-pro`
- **When to use:**
  - Creating API routes in `app/api/`
  - Database schema design
  - Authentication flows
  - Error handling patterns

### Database Operations
- **Agent:** `database-optimizer` or `database-admin`
- **When to use:**
  - Supabase queries optimization
  - RLS policy creation
  - Performance tuning
  - Migration scripts

---

## Code Quality & Maintenance

### Code Review
- **Agent:** `code-reviewer`
- **When to use:**
  - After implementing any significant feature
  - Before commits
  - Security vulnerability checks
  - Code style compliance

### Testing
- **Agent:** `test-automator`
- **When to use:**
  - Writing Jest/Vitest tests
  - Component testing setup
  - API endpoint testing
  - Authentication flow testing

### Debugging
- **Agent:** `debugger` or `devops-troubleshooter`
- **When to use:**
  - Runtime errors
  - Build failures
  - Authentication issues
  - Performance problems

---

## Security & Performance

### Security Auditing
- **Agent:** `security-auditor`
- **When to use:**
  - Before production deployments
  - After authentication changes
  - API security review
  - Environment variable audits

### Performance Optimization
- **Agent:** `performance-engineer`
- **When to use:**
  - Page load optimization
  - Bundle size analysis
  - Database query optimization
  - Core Web Vitals improvements

---

## Documentation & Architecture

### Technical Documentation
- **Agent:** `docs-architect` or `api-documenter`
- **When to use:**
  - API documentation updates
  - Architecture documentation
  - Component documentation
  - Setup instructions

### Architecture Review
- **Agent:** `architect-review`
- **When to use:**
  - Before major refactoring
  - New feature architecture decisions
  - System design reviews
  - Scalability planning

---

## Language-Specific Tasks

### TypeScript
- **Agent:** `typescript-pro`
- **When to use:**
  - Complex type definitions
  - Generic implementations
  - Type safety improvements
  - Migration to strict mode

---

## Project-Specific Agent Usage

### Authentication Features
- **Primary agents:** `frontend-developer` + `security-auditor`
- **Use cases:**
  - AuthProvider improvements
  - Session management
  - Admin permission handling
  - Logout flow enhancements

### Word Management Features
- **Primary agents:** `frontend-developer` + `database-optimizer`
- **Use cases:**
  - Add word functionality
  - Dictionary search
  - Related words selection
  - Word validation

### Memory Bank Management
- **Primary agents:** `docs-architect`
- **Use cases:**
  - Updating project documentation
  - Context file maintenance
  - Progress tracking
  - Architecture decisions

---

## Agent Execution Guidelines

### Single Agent Tasks
Use single agents for focused, domain-specific work:
```
- Code review → code-reviewer
- Database optimization → database-optimizer
- UI design → ui-ux-designer
```

### Multi-Agent Workflows
Use multiple agents in parallel for complex features:
```
New Feature Development:
1. architect-review (design)
2. frontend-developer (implementation)
3. test-automator (testing)
4. security-auditor (security review)
5. docs-architect (documentation)
```

### Agent Selection Priority
1. **Exact match:** Use the most specific agent for the task
2. **General purpose:** Use `general-purpose` for research/exploration
3. **Fallback:** Use `typescript-pro` for TypeScript-heavy tasks

---

## Compliance Requirements

Before using any agent, ensure:
- [ ] Task matches agent expertise
- [ ] Agent has access to required tools
- [ ] Clear task description provided
- [ ] Expected deliverables defined
- [ ] Success criteria established

---

## Examples

### Good Agent Usage
```
Task: "Implement dark mode for the dictionary app"
Agents: ui-ux-designer (design) + frontend-developer (implementation)
Rationale: Combines design expertise with React implementation skills
```

### Poor Agent Usage
```
Task: "Fix TypeScript errors"
Agent: general-purpose
Issue: typescript-pro would be more appropriate for TypeScript-specific issues
```

---

## Agent Performance Monitoring

Track agent effectiveness by:
- Task completion quality
- Time to completion
- Code quality improvements
- Reduced manual intervention needed

Update these rules based on agent performance and project evolution.
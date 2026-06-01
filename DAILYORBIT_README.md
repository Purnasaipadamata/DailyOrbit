# DailyOrbit - Productivity Management System

## Overview

DailyOrbit is a full-featured, elegant task and time management web application designed to help users master their productivity. It combines hierarchical task organization, intelligent scheduling, and powerful analytics into a single, beautifully crafted platform.

## Key Features

### 1. **Hierarchical Folder & Task Management**
- Organize tasks into nested folders with unlimited depth
- Full CRUD operations for both folders and tasks
- Task properties: title, description, status, priority, due date, estimated duration
- Status labels: **Pending**, **In Progress**, **Completed**
- Priority levels: **Low**, **Medium**, **High**

### 2. **Timetable Scheduling Module**
- Weekly time grid (7 days × 24 hours)
- Assign tasks to specific time slots
- Recurrence options: **Daily**, **Weekly**, **Custom**
- Visual conflict detection with warning alerts
- Prevents scheduling overlapping tasks
- Daily view for focused scheduling

### 3. **Progress Analytics Dashboard**
Five comprehensive metrics to track productivity:
- **Completion Rate**: Percentage of tasks completed (by day, week, folder)
- **Overdue Task Count**: Number of tasks past their due date
- **Pending Workload**: Summary of tasks awaiting completion
- **Average Time in Progress**: Average duration tasks spend in "In Progress" status
- **Consecutive-Day Streak**: Tracker for daily engagement and motivation

Weekly completion trend visualization with bar charts and actionable insights.

### 4. **Responsive React UI**
- Built with React 19 and Tailwind CSS 4
- Sidebar dashboard layout with collapsible navigation
- Mobile-first responsive design
- Smooth animations and transitions
- Premium color palette with OKLCH color space
- Elegant visual hierarchy

### 5. **Authentication & Security**
- Manus OAuth integration for secure login
- JWT-based session management
- Protected routes for authenticated users
- Persistent session state

## Technology Stack

### Frontend
- **React 19**: Modern UI framework with hooks
- **Tailwind CSS 4**: Utility-first CSS framework
- **tRPC**: End-to-end type-safe API
- **Wouter**: Lightweight routing library
- **Recharts**: Data visualization library
- **shadcn/ui**: High-quality component library
- **Framer Motion**: Animation library

### Backend
- **Express.js**: Node.js web framework
- **tRPC**: Type-safe RPC framework
- **Drizzle ORM**: Modern TypeScript ORM
- **MySQL**: Relational database

### Development & Testing
- **Vite**: Fast build tool
- **TypeScript**: Type-safe JavaScript
- **Vitest**: Unit testing framework
- **Prettier**: Code formatter

## Project Structure

```
daily-orbit/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Landing page
│   │   │   ├── Dashboard.tsx         # Main dashboard
│   │   │   ├── FoldersPage.tsx       # Folder & task management
│   │   │   ├── TimetablePage.tsx     # Scheduling interface
│   │   │   └── AnalyticsPage.tsx     # Analytics dashboard
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx   # Main layout wrapper
│   │   │   ├── TaskForm.tsx          # Task creation form
│   │   │   ├── TaskList.tsx          # Task list display
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── App.tsx                   # Main app component
│   │   └── index.css                 # Global styles
├── server/
│   ├── routers.ts                    # tRPC procedure definitions
│   ├── db.ts                         # Database query helpers
│   ├── storage.ts                    # File storage utilities
│   └── _core/                        # Framework infrastructure
├── drizzle/
│   ├── schema.ts                     # Database schema
│   └── migrations/                   # Database migrations
├── shared/
│   ├── const.ts                      # Shared constants
│   └── types.ts                      # Shared types
└── package.json                      # Dependencies
```

## Database Schema

### Users Table
- `id`: Primary key
- `openId`: Manus OAuth identifier
- `name`: User's display name
- `email`: User's email
- `role`: User role (admin/user)
- `createdAt`, `updatedAt`, `lastSignedIn`: Timestamps

### Folders Table
- `id`: Primary key
- `userId`: Foreign key to users
- `parentId`: Self-referencing for hierarchy
- `name`: Folder name
- `createdAt`, `updatedAt`: Timestamps

### Tasks Table
- `id`: Primary key
- `userId`: Foreign key to users
- `folderId`: Foreign key to folders
- `title`: Task title
- `description`: Task description
- `status`: Pending / In Progress / Completed
- `priority`: Low / Medium / High
- `dueDate`: Optional due date
- `estimatedMinutes`: Estimated duration
- `createdAt`, `updatedAt`: Timestamps

### Timetable Slots Table
- `id`: Primary key
- `userId`: Foreign key to users
- `taskId`: Foreign key to tasks
- `dayOfWeek`: 0-6 (Sunday-Saturday)
- `startTime`: HH:MM format
- `endTime`: HH:MM format
- `recurrence`: Daily / Weekly / Custom
- `isActive`: Boolean flag
- `createdAt`: Timestamp

### Completion Events Table
- `id`: Primary key
- `userId`: Foreign key to users
- `taskId`: Foreign key to tasks
- `completedAt`: Completion timestamp
- `durationMinutes`: Time spent on task

## API Procedures

### Folders
- `folders.list()`: Get all root folders
- `folders.children({ folderId })`: Get child folders
- `folders.create({ name, parentId })`: Create new folder
- `folders.update({ id, name })`: Update folder name
- `folders.delete({ id })`: Delete folder and children

### Tasks
- `tasks.all()`: Get all tasks
- `tasks.list({ folderId })`: Get tasks in folder
- `tasks.get({ id })`: Get single task
- `tasks.create({ folderId, title, ... })`: Create task
- `tasks.update({ id, ... })`: Update task
- `tasks.delete({ id })`: Delete task

### Timetable
- `timetable.list()`: Get all scheduled slots
- `timetable.forDay({ dayOfWeek })`: Get slots for specific day
- `timetable.create({ taskId, dayOfWeek, startTime, endTime, recurrence })`: Schedule task
- `timetable.delete({ id })`: Remove scheduled slot

### Analytics
- `analytics.summary()`: Get all 5 key metrics
- `analytics.daily({ date })`: Get daily completion data
- `analytics.weekly()`: Get weekly trend data
- `analytics.completeTask({ taskId, durationMinutes })`: Log task completion

## Getting Started

### Prerequisites
- Node.js 22.x
- pnpm package manager
- MySQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
# (Database URL, OAuth credentials, etc. are pre-configured)

# Push database schema
pnpm db:push

# Start development server
pnpm dev

# Run tests
pnpm test
```

### Development

The application runs on `http://localhost:3000` with hot module reloading enabled.

**Key Development Commands:**
- `pnpm dev`: Start dev server
- `pnpm test`: Run vitest tests
- `pnpm build`: Build for production
- `pnpm start`: Run production build
- `pnpm format`: Format code with Prettier
- `pnpm db:push`: Apply database migrations

## Design Philosophy

### Elegance & Polish
Every component, spacing, typography choice, and interaction is intentional and refined. The UI feels like a best-in-class productivity tool with premium aesthetics.

### Type Safety
End-to-end type safety with TypeScript and tRPC ensures reliability and excellent developer experience.

### Performance
- Optimistic updates for instant UI feedback
- Efficient database queries with Drizzle ORM
- Lazy loading and code splitting with Vite
- Responsive design that works on all devices

### Accessibility
- Keyboard navigation support
- ARIA labels for screen readers
- Clear focus indicators
- Color contrast compliance

## Testing

The project includes comprehensive vitest tests covering:
- Authentication flows (login/logout)
- CRUD operations for folders, tasks, timetable
- Input validation and error handling
- Analytics calculations
- Protected route access control

**Run tests:**
```bash
pnpm test
```

**Test coverage:** 21 tests, all passing

## Deployment

The application is ready for production deployment on Manus or any Node.js hosting platform:

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

The build creates optimized bundles for both frontend and backend with:
- Minified JavaScript and CSS
- Tree-shaking for unused code
- Source maps for debugging
- Optimal performance

## Future Enhancements

Potential features for future iterations:
- Drag-and-drop task assignment in timetable
- Custom recurrence patterns
- Task templates and recurring task groups
- Notifications and reminders
- Team collaboration features
- Export analytics to PDF/CSV
- Dark mode toggle
- Mobile app (React Native)
- Integration with calendar apps

## License

MIT

## Support

For issues, questions, or feature requests, please contact the development team.

---

**Built with ❤️ for productivity enthusiasts**

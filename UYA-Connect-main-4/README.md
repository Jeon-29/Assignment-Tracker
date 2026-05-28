# UYA Connect - Member Management System

A modern, full-featured web application for managing members, activities, announcements, and attendance tracking with role-based access control.

## Features

### 🎯 Multi-Role System
- **Member**: View activities, join activities, mark attendance, view personal attendance history
- **Coordinator**: Same as Admin but without access to Reports
- **Admin**: Full access including member management, activity management, and comprehensive reports

### 📱 Fully Responsive
- Desktop-first design with mobile-optimized layouts
- Collapsible sidebar navigation on mobile
- Card-based layouts that adapt to screen size
- Touch-friendly interface elements

### 🎨 Modern UI Design
- Green and yellow color scheme
- Card-based layout with rounded corners and soft shadows
- Smooth transitions and hover effects
- Clean, professional typography

### 📊 Key Features

#### Activities
- Browse and search activities
- View detailed activity information
- Join activities (Members)
- Create and edit activities (Admin/Coordinator)
- Participant management

#### Attendance
- Self-marking attendance with optional proof upload
- Automatic timestamp recording
- Status tracking: Eligible, Pending, Approved, Rejected
- Validation rules (registration, time, duplicates)
- Approval/rejection workflow (Admin/Coordinator)

#### Announcements
- Create and manage announcements
- Card-based display
- Edit functionality with modal interface

#### Members (Admin/Coordinator)
- View all members in table or card layout
- Add new members
- Edit member information
- Manage roles and status

#### Reports (Admin Only)
- Attendance reports with charts
- Activity reports
- Filter by date range and activity
- Summary statistics
- Export to PDF/CSV (demo)
- Interactive bar and pie charts

#### Dashboard
- Role-specific summary cards
- Recent announcements
- Upcoming activities
- Activity logs (Admin/Coordinator)
- Quick statistics

## Demo Accounts

Use these credentials to explore different roles:

- **Member**: momo@uyaconnect.com (any password)
- **Coordinator**: jeongyeon@uyaconnect.com (any password)
- **Admin**: nayeon@uyaconnect.com (any password)

You can also use the Role Switcher button (bottom-right corner) to quickly switch between different roles.

## Mock Data

The application uses TWICE members as mock data:
- Nayeon (Admin)
- Jeongyeon (Coordinator)
- Momo, Sana, Mina, Dahyun, Chaeyoung, Tzuyu (Members)
- Jihyo (Coordinator)

## Technology Stack

- **React** with TypeScript
- **React Router** for navigation (Data mode)
- **Tailwind CSS** v4 for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Radix UI** components for modals and UI elements

## Pages

1. **Login Page** - Authentication entry point
2. **Dashboard** - Role-specific overview
3. **Activities** - Browse and manage activities
4. **Activity Details** - Detailed view with attendance marking
5. **Announcements** - View and manage announcements
6. **Attendance** - Personal history (Member) or management (Admin/Coordinator)
7. **Profile** - User profile and settings
8. **Manage Members** - Member management (Admin/Coordinator)
9. **Reports** - Analytics and reporting (Admin only)

## Design System

### Colors
- **Primary**: Green (#22c55e) - Main actions, highlights
- **Secondary**: Yellow (#eab308) - Accent elements
- **Accent**: Light Yellow (#fef08a) - Subtle highlights
- **Success**: Green variants - Approved, active states
- **Warning**: Yellow variants - Pending states
- **Error**: Red variants - Rejected, destructive actions

### Components
- Reusable UI components (Button, Input, Card, Badge, Modal)
- Consistent spacing (16-24px)
- Rounded corners (8-12px)
- Soft shadows for depth
- Smooth transitions

## Responsive Breakpoints

- **Mobile**: < 1024px (collapsible sidebar, stacked cards)
- **Desktop**: ≥ 1024px (fixed sidebar, table layouts)

## Features Highlights

### Attendance System
- Self-service attendance marking
- Proof upload capability
- Real-time status updates
- Admin approval workflow
- Validation rules enforcement

### Activity Management
- Grid/list view with search
- Detailed activity pages
- Join functionality
- Participant tracking
- Comments and feedback

### Reporting
- Visual charts (bar, pie)
- Filterable data
- Export capabilities
- Multiple report types
- Summary statistics

### User Experience
- Intuitive navigation
- Clear validation messages
- Status indicators
- Mobile-friendly modals
- Consistent design patterns

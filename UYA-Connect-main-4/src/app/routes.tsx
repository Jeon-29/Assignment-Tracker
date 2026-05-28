import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { ActivityDetailsPage } from './pages/ActivityDetailsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AttendancePage } from './pages/AttendancePage';
import { ProfilePage } from './pages/ProfilePage';
import { ManageMembersPage } from './pages/ManageMembersPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProposalsPage } from './pages/ProposalsPage';
import { CreateProposalPage } from './pages/CreateProposalPage';
import { ManageProposalsPage } from './pages/ManageProposalsPage';
import { CalendarPage } from './pages/CalendarPage';
import { MyCertificatesPage } from './pages/MyCertificatesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'login',
        Component: LoginPage,
      },
      {
        path: 'dashboard',
        Component: DashboardPage,
      },
      {
        path: 'activities',
        Component: ActivitiesPage,
      },
      {
        path: 'activities/:id',
        Component: ActivityDetailsPage,
      },
      {
        path: 'announcements',
        Component: AnnouncementsPage,
      },
      {
        path: 'attendance',
        Component: AttendancePage,
      },
      {
        path: 'certificates',
        Component: MyCertificatesPage,
      },
      {
        path: 'calendar',
        Component: CalendarPage,
      },
      {
        path: 'profile',
        Component: ProfilePage,
      },
      {
        path: 'members',
        Component: ManageMembersPage,
      },
      {
        path: 'reports',
        Component: ReportsPage,
      },
      {
        path: 'proposals',
        Component: ProposalsPage,
      },
      {
        path: 'proposals/create',
        Component: CreateProposalPage,
      },
      {
        path: 'proposals/manage',
        Component: ManageProposalsPage,
      },
      {
        path: '*',
        element: (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="mb-4">404 - Page Not Found</h1>
            <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          </div>
        ),
      },
    ],
  },
]);
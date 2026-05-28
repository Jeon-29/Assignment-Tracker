import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardCheck, 
  Megaphone, 
  User, 
  LogOut, 
  Users, 
  BarChart3,
  Award,
  Menu,
  X,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  role: 'member' | 'admin' | 'coordinator';
}

export function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const memberLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/activities', icon: Calendar, label: 'Activities' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/proposals', icon: Lightbulb, label: 'Proposals' },
    { path: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
    { path: '/certificates', icon: Award, label: 'My Certificates' },
    { path: '/announcements', icon: Megaphone, label: 'Announcements' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/members', icon: Users, label: 'Manage Members' },
    { path: '/activities', icon: Calendar, label: 'Manage Activities' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/proposals/manage', icon: Lightbulb, label: 'Manage Proposals' },
    { path: '/announcements', icon: Megaphone, label: 'Announcements' },
    { path: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
    { path: '/reports', icon: BarChart3, label: 'Analytics & Evaluation' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const coordinatorLinks = adminLinks.filter(link => link.path !== '/reports');

  const links = role === 'admin' ? adminLinks : role === 'coordinator' ? coordinatorLinks : memberLinks;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-sidebar-border bg-gradient-to-b from-primary/10 to-transparent">
        <h1 className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold drop-shadow-sm">
          UYA Connect
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path ||
            (link.path.includes('/proposals') && location.pathname.startsWith('/proposals'));
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-accent text-sidebar-primary-foreground shadow-lg shadow-primary/20 border border-primary/30'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:border-primary/10 border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border bg-gradient-to-t from-primary/5 to-transparent">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors border border-transparent hover:border-destructive/20"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-lg border border-border"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-40 w-64 bg-sidebar h-screen transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
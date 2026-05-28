import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { RoleSwitcher } from './RoleSwitcher';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If not logged in and not on login page, redirect to login
    if (!currentUser && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [currentUser, location.pathname, navigate]);

  // Show login page without layout
  if (!currentUser) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <Sidebar role={currentUser.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gradient-to-b from-transparent to-primary/5">
          <Outlet />
        </main>
      </div>
      <RoleSwitcher />
    </div>
  );
}

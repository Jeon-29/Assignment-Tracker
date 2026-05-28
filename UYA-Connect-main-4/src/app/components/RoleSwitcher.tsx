import React, { useState } from 'react';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { users } from '../data/mockData';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function RoleSwitcher() {
  const { currentUser, setCurrentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const switchToMember = () => {
    const member = users.find(u => u.role === 'member');
    if (member) setCurrentUser(member);
    setIsOpen(false);
  };

  const switchToCoordinator = () => {
    const coordinator = users.find(u => u.role === 'coordinator');
    if (coordinator) setCurrentUser(coordinator);
    setIsOpen(false);
  };

  const switchToAdmin = () => {
    const admin = users.find(u => u.role === 'admin');
    if (admin) setCurrentUser(admin);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-card border border-primary/30 rounded-lg shadow-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm">
              <strong className="capitalize bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{currentUser?.name}</strong> <span className="text-muted-foreground">({currentUser?.role})</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary/10 rounded">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={switchToMember} size="sm" variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
              Switch to Member
            </Button>
            <Button onClick={switchToCoordinator} size="sm" variant="outline" className="w-full border-secondary/30 hover:bg-secondary/10">
              Switch to Coordinator
            </Button>
            <Button onClick={switchToAdmin} size="sm" variant="outline" className="w-full border-accent/30 hover:bg-accent/10">
              Switch to Admin
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-card to-primary/5 border border-primary/30 rounded-lg shadow-2xl px-4 py-2 flex items-center gap-2 hover:shadow-primary/20 transition-all backdrop-blur-sm"
        >
          <span className="text-sm capitalize text-foreground">{currentUser?.role}</span>
          <ChevronUp className="w-4 h-4 text-primary" />
        </button>
      )}
    </div>
  );
}
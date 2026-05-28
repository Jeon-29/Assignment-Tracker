import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Edit, Plus, Megaphone, Trash2, Users } from 'lucide-react';
import { announcements as initialAnnouncements, Announcement } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

type AnnouncementAudience = 'all' | 'coordinator' | 'admin';

type AnnouncementWithAudience = Announcement & {
  targetAudience?: AnnouncementAudience;
};

const audienceLabels: Record<AnnouncementAudience, string> = {
  all: 'All',
  coordinator: 'Coordinator',
  admin: 'Admin',
};

const audienceBadgeStyles: Record<AnnouncementAudience, string> = {
  all: 'bg-blue-100 text-blue-700 border-blue-200',
  coordinator: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  admin: 'bg-green-100 text-green-700 border-green-200',
};

export function AnnouncementsPage() {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementWithAudience[]>(
    initialAnnouncements.map((announcement) => ({
      ...announcement,
      targetAudience: (announcement as AnnouncementWithAudience).targetAudience || 'all',
    }))
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementWithAudience | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: 'all' as AnnouncementAudience,
  });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'coordinator';
  const isBlankCleanAccount = currentUser?.mockAccountType === 'blank-clean';

  const canViewAnnouncement = (announcement: AnnouncementWithAudience) => {
    if (isBlankCleanAccount && !isAdmin) return false;

    const targetAudience = announcement.targetAudience || 'all';

    // Admin and coordinator accounts can still see all announcements on this page
    // because this is also where they manage announcements.
    if (isAdmin) return true;

    return targetAudience === 'all' || targetAudience === currentUser?.role;
  };

  const visibleAnnouncements = announcements.filter(canViewAnnouncement);

  const handleEdit = (announcement: AnnouncementWithAudience) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      targetAudience: (announcement as AnnouncementWithAudience).targetAudience || 'all',
    });
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      description: '',
      targetAudience: 'all',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedAnnouncement) {
      setAnnouncements(announcements.map(a =>
        a.id === selectedAnnouncement.id
          ? { ...a, ...formData }
          : a
      ));
      setIsEditModalOpen(false);
      setSelectedAnnouncement(null);
    }
  };

  const handleSaveNew = () => {
    const newAnnouncement: AnnouncementWithAudience = {
      id: `ann-${Date.now()}`,
      ...formData,
      date: new Date().toISOString().split('T')[0],
      author: currentUser?.name || 'Admin',
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setIsAddModalOpen(false);
  };

  const handleDelete = (announcement: AnnouncementWithAudience) => {
    if (window.confirm(`Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`)) {
      setAnnouncements(announcements.filter(a => a.id !== announcement.id));
    }
  };

  const renderTargetAudienceField = () => (
    <div>
      <label className="block mb-2 text-sm">Who can see this announcement?</label>
      <select
        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        value={formData.targetAudience}
        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as AnnouncementAudience })}
      >
        <option value="all">All</option>
        <option value="coordinator">Coordinator</option>
        <option value="admin">Admin</option>
      </select>
      <p className="text-xs text-muted-foreground mt-2">
        Choose the target role for this announcement.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Manage and create announcements' : 'Stay updated with the latest news'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Announcement
          </Button>
        )}
      </div>

      {/* Announcements Stack */}
      <div className="space-y-4">
        {visibleAnnouncements.map((announcement) => {
          const targetAudience = announcement.targetAudience || 'all';

          return (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Megaphone className="w-5 h-5 text-primary" />
                      <CardTitle>{announcement.title}</CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {new Date(announcement.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {isAdmin && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${audienceBadgeStyles[targetAudience]}`}>
                          <Users className="w-3 h-3" />
                          {audienceLabels[targetAudience]}
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleEdit(announcement)}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(announcement)}
                        variant="ghost"
                        size="sm"
                        className="text-red-700 hover:text-red-800 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  {announcement.description}
                </p>
                <div className="text-sm text-muted-foreground">
                  Posted by {announcement.author}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {visibleAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No announcements yet</p>
        </div>
      )}

      {/* Edit Announcement Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Announcement"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <div>
            <label className="block mb-2 text-sm">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-h-[150px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          {renderTargetAudienceField()}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Add Announcement Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Announcement"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter announcement title"
          />
          <div>
            <label className="block mb-2 text-sm">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-h-[150px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter announcement details"
            />
          </div>
          {renderTargetAudienceField()}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNew}>Create Announcement</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

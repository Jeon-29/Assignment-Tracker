import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { 
  CalendarMonth, 
  Groups, 
  Campaign, 
  TrendingUp, 
  CheckCircle, 
  Schedule, 
  Cancel, 
  LocalActivity,
  DateRange,
  LocationOn,
  Person,
  People
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { activities, announcements, attendanceRecords, users } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const isMember = currentUser.role === 'member';
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'coordinator';
  const isBlankCleanAccount = currentUser.mockAccountType === 'blank-clean';
  
  // Calculate stats based on role
  const totalActivities = activities.length;
  const joinedActivities = activities.filter(a => 
    a.participants.includes(currentUser.id)
  ).length;
  const upcomingActivities = isBlankCleanAccount
    ? 0
    : activities.filter(a => a.status === 'upcoming').length;
  
  const userAttendance = attendanceRecords.filter(r => r.userId === currentUser.id);
  const approvedAttendance = userAttendance.filter(r => r.status === 'approved').length;
  const attendanceRate = userAttendance.length > 0 
    ? Math.round((approvedAttendance / userAttendance.length) * 100) 
    : 0;

  const recentAnnouncements = isBlankCleanAccount ? [] : announcements.slice(0, 3);
  const upcomingActivityList = isBlankCleanAccount
    ? []
    : activities
        .filter(a => a.status === 'upcoming')
        .slice(0, 3);

  // Admin-specific stats
  const totalMembers = users.length;
  const activeMembers = users.filter(u => u.status === 'active').length;
  const pendingAttendance = attendanceRecords.filter(r => r.status === 'pending').length;
  const approvedCount = attendanceRecords.filter(r => r.status === 'approved').length;
  const rejectedCount = attendanceRecords.filter(r => r.status === 'rejected').length;
  const totalAttendanceRecords = attendanceRecords.length;
  const overallAttendanceRate = totalAttendanceRecords > 0 
    ? Math.round((approvedCount / totalAttendanceRecords) * 100) 
    : 0;

  // Member Dashboard
  if (isMember) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="text-foreground font-medium">{currentUser.name}</span>!
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-foreground">
                My Activities
              </CardTitle>
              <CalendarMonth className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{joinedActivities}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Activities joined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-foreground">
                Upcoming
              </CardTitle>
              <Schedule className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{upcomingActivities}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Upcoming activities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-foreground">
                Notifications
              </CardTitle>
              <Campaign className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{recentAnnouncements.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active announcements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-foreground">
                Attendance Rate
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{attendanceRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Your attendance
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAnnouncements.length > 0 ? recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <h4 className="mb-1">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {announcement.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{announcement.author}</span>
                    <span>•</span>
                    <span>{new Date(announcement.date).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 rounded-lg border border-dashed border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground">No announcements yet</p>
                </div>
              )}
              <Link to="/announcements" className="text-sm text-primary hover:underline block">
                View all announcements →
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingActivityList.length > 0 ? upcomingActivityList.map((activity) => (
                <div key={activity.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4>{activity.title}</h4>
                    <Badge variant="info">{activity.status}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <DateRange sx={{ fontSize: 16 }} />
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <LocationOn sx={{ fontSize: 16 }} />
                      {activity.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <People sx={{ fontSize: 16 }} />
                      {activity.participants.length} participants
                    </div>
                  </div>
                  <Link
                    to={`/activities?activityId=${activity.id}&action=view`}
                    className="inline-block w-full"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      View Activity
                    </Button>
                  </Link>
                </div>
              )) : (
                <div className="text-center py-8 rounded-lg border border-dashed border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground">No activities yet</p>
                </div>
              )}
              <Link to="/activities" className="text-sm text-primary hover:underline block">
                View all activities →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin/Coordinator Dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1>Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {currentUser.name}! Here's your overview
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-foreground">
              Total Members
            </CardTitle>
            <Groups className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeMembers} active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-foreground">
              Total Activities
            </CardTitle>
            <CalendarMonth className="w-5 h-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingActivities} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-foreground">
              Pending Approvals
            </CardTitle>
            <Schedule className="w-5 h-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{pendingAttendance}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Attendance awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-foreground">
              Overall Attendance
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallAttendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Approval rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Approved</div>
                <div className="text-2xl font-bold">{approvedCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <Schedule className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold">{pendingAttendance}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Cancel className="w-6 h-6 text-red-900" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rejected</div>
                <div className="text-2xl font-bold">{rejectedCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Announcements</CardTitle>
              <Link to="/announcements" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                <h4 className="mb-1">{announcement.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {announcement.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{announcement.author}</span>
                  <span>•</span>
                  <span>{new Date(announcement.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Activities</CardTitle>
              <Link to="/activities" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingActivityList.map((activity) => (
              <div key={activity.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <h4>{activity.title}</h4>
                  <Badge variant="info">{activity.status}</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <DateRange sx={{ fontSize: 16 }} />
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <LocationOn sx={{ fontSize: 16 }} />
                    {activity.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <People sx={{ fontSize: 16 }} />
                    {activity.participants.length} participants
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm p-3 bg-muted/30 rounded-lg">
            <Badge variant="warning">Pending</Badge>
            <span>Dahyun's attendance for Annual Sports Festival awaiting approval</span>
            <span className="text-muted-foreground ml-auto">1 day ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm p-3 bg-muted/30 rounded-lg">
            <Badge variant="success">Approved</Badge>
            <span>Sana's attendance for Cultural Night approved</span>
            <span className="text-muted-foreground ml-auto">2 days ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm p-3 bg-muted/30 rounded-lg">
            <Badge variant="info">New</Badge>
            <span>New activity "Leadership Training" created</span>
            <span className="text-muted-foreground ml-auto">3 days ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm p-3 bg-muted/30 rounded-lg">
            <Badge variant="success">Approved</Badge>
            <span>Momo's attendance for Cultural Night approved</span>
            <span className="text-muted-foreground ml-auto">3 days ago</span>
          </div>
          <Link to="/attendance" className="text-sm text-primary hover:underline block mt-4">
            View all attendance records →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  QrCode,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { activities, attendanceRecords, certificates } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatActivityStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusBadgeClass(status: string) {
  if (status === 'completed') {
    return 'border-green-200 bg-green-50 text-green-700';
  }

  if (status === 'ongoing') {
    return 'border-yellow-200 bg-yellow-50 text-yellow-700';
  }

  return 'border-blue-200 bg-blue-50 text-blue-700';
}

export function CalendarPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const openActivity = (activityId: string, action: 'view' | 'scan' = 'view') => {
    navigate(`/activities?activityId=${activityId}&action=${action}`);
  };
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 2, 22));

  const isAdminView = currentUser?.role === 'admin' || currentUser?.role === 'coordinator';
  const isBlankCleanAccount = currentUser?.mockAccountType === 'blank-clean';
  const activitiesVisibleToCurrentUser = isBlankCleanAccount && !isAdminView ? [] : activities;

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const startDate = new Date(year, month, 1 - startDay);

    return Array.from({ length: 42 }, (_, index) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + index);
      return d;
    });
  }, [currentMonth]);

  const selectedKey = toDateKey(selectedDate);

  const activitiesByDate = useMemo(() => {
    return activitiesVisibleToCurrentUser.reduce<Record<string, typeof activities>>((acc, activity) => {
      const key = activity.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(activity);
      return acc;
    }, {});
  }, [activitiesVisibleToCurrentUser]);

  const selectedActivities = activitiesByDate[selectedKey] || [];

  const upcomingActivities = useMemo(() => {
    return activitiesVisibleToCurrentUser
      .filter((activity) => activity.status === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, [activitiesVisibleToCurrentUser]);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            {isAdminView ? 'Calendar Management' : 'Calendar'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdminView
              ? 'Track scheduled activities and quickly manage QR attendance, certificates, feedback, and documentation.'
              : 'Check your upcoming activities, attendance actions, certificates, and feedback tasks.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <CardTitle>{formatMonthLabel(currentMonth)}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-3 grid grid-cols-7 gap-2 text-center text-sm text-muted-foreground">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-2 font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day) => {
                const dateKey = toDateKey(day);
                const dayActivities = activitiesByDate[dateKey] || [];
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isSelected = dateKey === selectedKey;

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(day)}
                    className={[
                      'min-h-[92px] rounded-xl border p-2 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5',
                      !isCurrentMonth ? 'bg-muted/30' : '',
                    ].join(' ')}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={[
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : isCurrentMonth
                            ? 'bg-muted text-foreground'
                            : 'bg-muted/60 text-muted-foreground',
                        ].join(' ')}
                      >
                        {day.getDate()}
                      </span>

                      {dayActivities.length > 0 && (
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-sm" />
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayActivities.slice(0, 2).map((activity) => (
                        <div
                          key={activity.id}
                          className={[
                            'truncate rounded-md border px-2 py-1 text-[11px] font-medium leading-tight shadow-sm',
                            activity.status === 'completed'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : activity.status === 'ongoing'
                              ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                              : 'border-blue-200 bg-blue-50 text-blue-700',
                          ].join(' ')}
                          title={activity.title}
                        >
                          {activity.title}
                        </div>
                      ))}

                      {dayActivities.length > 2 && (
                        <div className="text-[11px] font-medium text-foreground/80">
                          +{dayActivities.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {selectedActivities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No scheduled activity on this date.
                </div>
              ) : (
                selectedActivities.map((activity) => {
                  const isJoined = Boolean(currentUser && activity.participants.includes(currentUser.id));
                  const validatedAttendance = attendanceRecords.find(
                    (record) =>
                      record.activityId === activity.id &&
                      record.userId === currentUser?.id &&
                      record.status === 'approved' &&
                      Boolean(record.markedAt || record.timestamp),
                  );
                  const memberCertificate = certificates.find(
                    (certificate) => certificate.activityId === activity.id && certificate.userId === currentUser?.id,
                  );
                  const memberCanScan = isJoined && activity.attendanceOpen && activity.status !== 'completed';
                  const memberCanJoin = !isJoined && activity.registrationOpen && activity.status === 'upcoming';
                  const hasValidatedAttendance = Boolean(validatedAttendance);

                  return (
                    <div key={activity.id} className="space-y-3 rounded-xl border border-border bg-card/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold">{activity.title}</h3>
                        <Badge variant="outline" className={getStatusBadgeClass(activity.status)}>
                          {formatActivityStatus(activity.status)}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{activity.participants.length} participants</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">{activity.description}</p>

                      {!isAdminView && (
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => openActivity(activity.id, 'view')}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </Button>

                          {memberCanJoin && (
                            <Button size="sm" onClick={() => openActivity(activity.id, 'view')}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Join Activity
                            </Button>
                          )}

                          {isJoined && activity.status === 'upcoming' && !activity.attendanceOpen && (
                            <Button size="sm" variant="outline" disabled>
                              <Clock className="mr-2 h-4 w-4" />
                              Joined
                            </Button>
                          )}

                          {memberCanScan && (
                            <Button size="sm" onClick={() => openActivity(activity.id, 'scan')}>
                              <QrCode className="mr-2 h-4 w-4" />
                              Scan QR
                            </Button>
                          )}

                          {activity.status === 'completed' && hasValidatedAttendance && (
                            <Button size="sm" variant="outline" onClick={() => openActivity(activity.id, 'view')}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Add Feedback
                            </Button>
                          )}

                          {activity.status === 'completed' && memberCertificate && (
                            <Button size="sm" variant="outline" onClick={() => navigate('/certificates')}>
                              <Award className="mr-2 h-4 w-4" />
                              View Certificate
                            </Button>
                          )}
                        </div>
                      )}

                      {isAdminView && (
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => openActivity(activity.id, 'view')}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </Button>

                          {activity.status !== 'completed' && (
                            <Button size="sm" onClick={() => openActivity(activity.id, 'view')}>
                              <QrCode className="mr-2 h-4 w-4" />
                              {activity.attendanceOpen ? 'View QR / Attendance' : 'Prepare QR'}
                            </Button>
                          )}

                          {activity.status === 'completed' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => openActivity(activity.id, 'view')}>
                                <Award className="mr-2 h-4 w-4" />
                                Certificates
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openActivity(activity.id, 'view')}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Feedback
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openActivity(activity.id, 'view')}>
                                <Camera className="mr-2 h-4 w-4" />
                                Documentation
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Activities</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {upcomingActivities.length > 0 ? (
                upcomingActivities.map((activity) => {
                  const isJoined = Boolean(currentUser && activity.participants.includes(currentUser.id));

                  return (
                    <div key={activity.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{activity.title}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()} • {activity.location}
                          </div>
                        </div>

                        {!isAdminView && isJoined && (
                          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                            Joined
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No upcoming activities yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

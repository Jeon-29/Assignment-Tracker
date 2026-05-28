import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Calendar,
  MapPin,
  User,
  Search,
  Plus,
  Edit,
  Lock,
  Unlock,
  Trash2,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Image as ImageIcon,
  Upload,
  Eye,
  ArrowLeft,
  Award,
  Download,
  QrCode,
  Clock,
} from 'lucide-react';
import { activities as initialActivities, Activity, attendanceRecords as initialAttendance, AttendanceRecord, getCertificateRecords } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { QRScanner } from '../components/QRScanner';
import { QRCodeSVG } from 'qrcode.react';

interface ActivityFeedback {
  id: string;
  activityId: string;
  userName: string;
  rating: string;
  comment: string;
  submittedAt: string;
}

interface ActivityPhoto {
  id: string;
  activityId: string;
  title: string;
  imageUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

const initialActivityFeedback: ActivityFeedback[] = [
  {
    id: 'fb-act-3-1',
    activityId: 'act-3',
    userName: 'Momo',
    rating: 'Very helpful',
    comment: 'The activity was organized well and the instructions were clear.',
    submittedAt: '2026-03-20',
  },
  {
    id: 'fb-act-3-2',
    activityId: 'act-3',
    userName: 'Sana',
    rating: 'Good experience',
    comment: 'The event was fun, but the registration booth could be faster next time.',
    submittedAt: '2026-03-20',
  },
  {
    id: 'fb-act-4-1',
    activityId: 'act-4',
    userName: 'Mina',
    rating: 'Excellent',
    comment: 'The cultural presentations were meaningful and engaging for members.',
    submittedAt: '2026-03-15',
  },
];

const initialActivityPhotos: ActivityPhoto[] = [
  {
    id: 'doc-act-3-1',
    activityId: 'act-3',
    title: 'Opening Program',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=60',
    uploadedBy: 'Jeongyeon',
    uploadedAt: '2026-03-20',
  },
  {
    id: 'doc-act-4-1',
    activityId: 'act-4',
    title: 'Group Presentation',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=60',
    uploadedBy: 'Nayeon',
    uploadedAt: '2026-03-15',
  },
];

export function ActivitiesPage() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState(initialActivities);
  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendance);
  const [activityFeedback, setActivityFeedback] = useState<ActivityFeedback[]>(initialActivityFeedback);
  const [activityPhotos, setActivityPhotos] = useState<ActivityPhoto[]>(initialActivityPhotos);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showFinishedActivities, setShowFinishedActivities] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTargetActivity, setFeedbackTargetActivity] = useState<Activity | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: '',
    comment: '',
  });
  const [scanningActivityId, setScanningActivityId] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    organizer: '',
    duration: '',
    description: '',
  });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'coordinator';
  const isBlankCleanAccount = currentUser?.mockAccountType === 'blank-clean';
  const activitiesVisibleToCurrentUser = isBlankCleanAccount && !isAdmin ? [] : activities;

  const filteredActivities = activitiesVisibleToCurrentUser.filter(activity =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeActivities = filteredActivities.filter(activity => activity.status !== 'completed');
  const finishedActivities = filteredActivities.filter(activity => activity.status === 'completed');

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setFormData({
      title: activity.title,
      date: activity.date,
      location: activity.location,
      organizer: activity.organizer,
      duration: (activity as Activity & { duration?: string }).duration || '',
      description: activity.description,
    });
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      date: '',
      location: '',
      organizer: currentUser?.name || '',
      duration: '',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleViewDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveEdit = () => {
    if (selectedActivity) {
      setActivities(activities.map(a =>
        a.id === selectedActivity.id
          ? { ...a, ...formData }
          : a
      ));
      setIsEditModalOpen(false);
      setSelectedActivity(null);
    }
  };

  const handleSaveNew = () => {
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      ...formData,
      participants: [],
      status: 'upcoming',
      registrationOpen: true,
      attendanceOpen: false,
    };
    setActivities([newActivity, ...activities]);
    setIsAddModalOpen(false);
  };

  const toggleRegistration = (activityId: string) => {
    setActivities(activities.map(a =>
      a.id === activityId ? { ...a, registrationOpen: !a.registrationOpen } : a
    ));

    setSelectedActivity(prev =>
      prev?.id === activityId ? { ...prev, registrationOpen: !prev.registrationOpen } : prev
    );
  };

  const toggleAttendance = (activityId: string) => {
    setActivities(activities.map(a =>
      a.id === activityId ? { ...a, attendanceOpen: !a.attendanceOpen } : a
    ));

    setSelectedActivity(prev =>
      prev?.id === activityId ? { ...prev, attendanceOpen: !prev.attendanceOpen } : prev
    );
  };

  const handleGenerateQR = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    const generatedAt = new Date().toISOString();
    const validityHours = activity?.qrValidityHours || selectedActivity?.qrValidityHours || 2;

    const updatedFields = {
      qrGeneratedAt: generatedAt,
      qrValidityHours: validityHours,
      attendanceOpen: true,
    };

    setActivities(activities.map(a =>
      a.id === activityId ? { ...a, ...updatedFields } : a
    ));

    setSelectedActivity(prev =>
      prev?.id === activityId ? { ...prev, ...updatedFields } : prev
    );
  };

  const handleQRValidityChange = (activityId: string, validityHours: number) => {
    setActivities(activities.map(a =>
      a.id === activityId ? { ...a, qrValidityHours: validityHours } : a
    ));

    setSelectedActivity(prev =>
      prev?.id === activityId ? { ...prev, qrValidityHours: validityHours } : prev
    );
  };

  const handleDelete = (activity: Activity) => {
    if (window.confirm(`Are you sure you want to delete "${activity.title}"? This action cannot be undone.`)) {
      setActivities(activities.filter(a => a.id !== activity.id));
      setAttendanceRecords(attendanceRecords.filter(r => r.activityId !== activity.id));
      setActivityPhotos(activityPhotos.filter(photo => photo.activityId !== activity.id));
    }
  };

  const handleOpenFeedbackModal = (activity: Activity) => {
    setFeedbackTargetActivity(activity);
    setFeedbackForm({
      rating: '',
      comment: '',
    });
    setIsFeedbackModalOpen(true);
  };

  const hasCurrentUserSubmittedFeedback = (activityId: string) => {
    if (!currentUser) return false;
    return activityFeedback.some(
      feedback => feedback.activityId === activityId && feedback.userName === currentUser.name
    );
  };

  const handleSubmitFeedback = () => {
    if (!feedbackTargetActivity || !currentUser || !feedbackForm.rating || !feedbackForm.comment.trim()) return;

    const newFeedback: ActivityFeedback = {
      id: `fb-${Date.now()}`,
      activityId: feedbackTargetActivity.id,
      userName: currentUser.name,
      rating: feedbackForm.rating,
      comment: feedbackForm.comment.trim(),
      submittedAt: new Date().toISOString().split('T')[0],
    };

    setActivityFeedback([newFeedback, ...activityFeedback]);
    setIsFeedbackModalOpen(false);
    setFeedbackTargetActivity(null);
    setFeedbackForm({
      rating: '',
      comment: '',
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedActivity || !currentUser) return;

    const reader = new FileReader();

    reader.onload = () => {
      const newPhoto: ActivityPhoto = {
        id: `doc-${Date.now()}`,
        activityId: selectedActivity.id,
        title: file.name,
        imageUrl: reader.result as string,
        uploadedBy: currentUser.name,
        uploadedAt: new Date().toISOString().split('T')[0],
      };

      setActivityPhotos([newPhoto, ...activityPhotos]);
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: { [key: string]: string } = {
      upcoming: 'bg-blue-100 text-blue-900 border-blue-200',
      ongoing: 'bg-yellow-100 text-yellow-900 border-yellow-200',
      completed: 'bg-green-100 text-green-900 border-green-200',
    };

    const readableStatus = status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <Badge
        variant="outline"
        className={`capitalize ${statusStyles[status] || 'bg-muted text-muted-foreground border-border'}`}
      >
        {readableStatus}
      </Badge>
    );
  };

  const getActivityCardStyle = (_activity: Activity) => {
    // Keep activity cards neutral even when registration or attendance is closed.
    // Status is communicated through badges/buttons instead of a red warning card.
    return 'flex flex-col';
  };

  const isUserRegistered = (activity: Activity) => {
    return currentUser && activity.participants.includes(currentUser.id);
  };

  const hasUserMarkedAttendance = (activityId: string) => {
    if (!currentUser) return false;
    return attendanceRecords.some(
      r => r.activityId === activityId && r.userId === currentUser.id && r.status === 'approved'
    );
  };

  const getActivityAttendanceStats = (activityId: string) => {
    const records = attendanceRecords.filter(record => record.activityId === activityId);
    const present = records.filter(record => record.status === 'approved').length;
    const eligible = records.filter(record => record.status === 'eligible').length;

    return {
      present,
      registered: records.length,
      waiting: eligible,
    };
  };

  const handleOpenScanner = (activityId: string) => {
    setScanningActivityId(activityId);
    setShowScanner(true);
    setScanMessage(null);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const activityId = params.get('activityId');
    const action = params.get('action');

    if (!activityId) return;

    const activityFromCalendar = activitiesVisibleToCurrentUser.find(activity => activity.id === activityId);
    if (!activityFromCalendar) return;

    setSelectedActivity(activityFromCalendar);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (action === 'scan' && !isAdmin) {
      const isRegistered = activityFromCalendar.participants.includes(currentUser?.id || '');

      if (!isRegistered) {
        setScanMessage({ type: 'error', text: 'You must join this activity before scanning the QR code.' });
        return;
      }

      if (!activityFromCalendar.attendanceOpen) {
        setScanMessage({ type: 'error', text: 'Attendance is not open for this activity yet.' });
        return;
      }

      if (activityFromCalendar.status === 'completed') {
        setScanMessage({ type: 'error', text: 'This activity is already completed.' });
        return;
      }

      handleOpenScanner(activityFromCalendar.id);
    }
  }, [activitiesVisibleToCurrentUser, currentUser?.id, isAdmin]);

  const handleQRScan = (qrData: string) => {
    setShowScanner(false);

    if (!currentUser || !scanningActivityId) return;

    const activity = activities.find(a => a.id === scanningActivityId);
    if (!activity) return;

    const scannedActivityId = qrData.includes('::')
      ? qrData.split('::')[0]
      : qrData.startsWith(`${activity.id}-`)
        ? activity.id
        : qrData.split('-')[0];

    if (scannedActivityId !== activity.id) {
      setScanMessage({ type: 'error', text: 'Invalid QR code. This code is not for this activity.' });
      return;
    }

    if (!isUserRegistered(activity)) {
      setScanMessage({ type: 'error', text: 'You are not registered for this activity.' });
      return;
    }

    if (!activity.attendanceOpen) {
      setScanMessage({ type: 'error', text: 'Attendance window has closed.' });
      return;
    }

    if (activity.qrGeneratedAt && activity.qrValidityHours) {
      const qrGeneratedTime = new Date(activity.qrGeneratedAt).getTime();
      const currentTime = Date.now();
      const validityMs = activity.qrValidityHours * 60 * 60 * 1000;

      if (currentTime - qrGeneratedTime > validityMs) {
        setScanMessage({ type: 'error', text: `QR code has expired. Valid for ${activity.qrValidityHours} hour(s) only.` });
        return;
      }
    }

    if (hasUserMarkedAttendance(activity.id)) {
      setScanMessage({ type: 'error', text: 'Attendance already recorded.' });
      return;
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      activityId: activity.id,
      activityTitle: activity.title,
      userId: currentUser.id,
      userName: currentUser.name,
      date: activity.date,
      status: 'approved',
      timestamp: new Date().toISOString(),
      markedAt: new Date().toISOString(),
    };

    setAttendanceRecords([...attendanceRecords, newRecord]);
    setScanMessage({ type: 'success', text: 'Attendance successfully recorded.' });
    setScanningActivityId(null);
  };

  const handleJoin = (activity: Activity) => {
    if (!currentUser || isUserRegistered(activity)) return;

    setActivities(activities.map(a =>
      a.id === activity.id
        ? { ...a, participants: [...a.participants, currentUser.id] }
        : a
    ));

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      activityId: activity.id,
      userId: currentUser.id,
      userName: currentUser.name,
      activityTitle: activity.title,
      status: 'eligible',
      submittedAt: '',
      proofUrl: '',
    };
    setAttendanceRecords([...attendanceRecords, newRecord]);
  };

  const renderActivityActions = (activity: Activity) => {
    if (isAdmin) {
      return (
        <>
          <Button
            onClick={() => handleViewDetails(activity)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          <Button
            onClick={() => handleEdit(activity)}
            variant="ghost"
            size="sm"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => handleDelete(activity)}
            variant="ghost"
            size="sm"
            className="text-red-700 hover:text-red-800 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      );
    }

    return (
      <div className="flex-1 space-y-2">
        <Button
          onClick={() => handleViewDetails(activity)}
          variant="outline"
          size="sm"
          className="w-full h-10 justify-center rounded-lg"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>

        {!isUserRegistered(activity) && (
          activity.registrationOpen ? (
            <Button
              onClick={() => handleJoin(activity)}
              size="sm"
              className="w-full h-10 justify-center rounded-lg !bg-blue-600 !text-white hover:!bg-blue-700"
            >
              Join Activity
            </Button>
          ) : (
            <div className={`flex h-10 w-full items-center justify-center px-3 text-sm font-medium rounded-lg ${
              activity.status === 'completed'
                ? 'text-gray-700 bg-gray-100 border border-gray-300'
                : 'text-red-900 bg-red-100 border border-red-300'
            }`}>
              <Lock className="w-4 h-4 mr-2" />
              Registration Closed
            </div>
          )
        )}

        {isUserRegistered(activity) && (
          <>
            {activity.attendanceOpen ? (
              hasUserMarkedAttendance(activity.id) ? (
                <div className="flex h-10 w-full items-center justify-center gap-2 px-3 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-900" />
                  <span className="text-sm text-emerald-900 font-medium">Attendance Recorded</span>
                </div>
              ) : (
                <Button
                  onClick={() => handleOpenScanner(activity.id)}
                  size="sm"
                  className="w-full h-10 justify-center rounded-lg flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4" />
                  Scan QR
                </Button>
              )
            ) : (
              <div className="flex h-10 w-full items-center justify-center px-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <span className="text-xs text-yellow-900 font-medium">Joined - Attendance not open</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderActivityGridCard = (activity: Activity) => (
    <Card key={activity.id} className={getActivityCardStyle(activity)}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2 gap-3">
          <CardTitle className="flex-1">{activity.title}</CardTitle>
          {getStatusBadge(activity.status)}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date(activity.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {activity.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            Organized by {activity.organizer}
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {activity.description}
          </p>

          {isAdmin && (
            <div className="pt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Registration:</span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRegistration(activity.id);
                  }}
                  size="sm"
                  variant={activity.registrationOpen ? 'default' : 'outline'}
                  className={`h-7 px-2 text-xs ${
                    activity.registrationOpen
                      ? ''
                      : 'bg-red-100 text-red-900 border-red-300 hover:bg-red-200 hover:text-red-950'
                  }`}
                >
                  {activity.registrationOpen ? (
                    <><Unlock className="w-3 h-3 mr-1" /> Open</>
                  ) : (
                    <><Lock className="w-3 h-3 mr-1" /> Closed</>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Attendance:</span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAttendance(activity.id);
                  }}
                  size="sm"
                  variant={activity.attendanceOpen ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                >
                  {activity.attendanceOpen ? (
                    <><Unlock className="w-3 h-3 mr-1" /> Open</>
                  ) : (
                    <><Lock className="w-3 h-3 mr-1" /> Closed</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-auto pt-4 border-t border-border">
          {renderActivityActions(activity)}
        </div>
      </CardContent>
    </Card>
  );

  const renderFinishedActivityListCard = (activity: Activity) => {
    const stats = getActivityAttendanceStats(activity.id);
    const feedbackCount = activityFeedback.filter(feedback => feedback.activityId === activity.id).length;
    const documentationCount = activityPhotos.filter(photo => photo.activityId === activity.id).length;

    return (
      <Card key={activity.id} className="border-gray-200 bg-gray-50/60">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-semibold text-foreground">{activity.title}</h3>
                {getStatusBadge(activity.status)}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {activity.location}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {activity.organizer}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {stats.present} present
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[180px]">
              {isAdmin ? (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-white border border-border px-3 py-2">
                    <p className="text-xs text-muted-foreground">Feedback</p>
                    <p className="font-semibold">{feedbackCount}</p>
                  </div>
                  <div className="rounded-lg bg-white border border-border px-3 py-2">
                    <p className="text-xs text-muted-foreground">Photos</p>
                    <p className="font-semibold">{documentationCount}</p>
                  </div>
                </div>
              ) : (
                hasCurrentUserSubmittedFeedback(activity.id) ? (
                  <Button
                    disabled
                    variant="outline"
                    size="sm"
                    className="w-full text-muted-foreground border-border bg-transparent"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Feedback Submitted
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleOpenFeedbackModal(activity)}
                    size="sm"
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Feedback
                  </Button>
                )
              )}

              <Button onClick={() => handleViewDetails(activity)} variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const selectedActivityFeedback = selectedActivity
    ? activityFeedback.filter(feedback => feedback.activityId === selectedActivity.id)
    : [];

  const selectedActivityPhotos = selectedActivity
    ? activityPhotos.filter(photo => photo.activityId === selectedActivity.id)
    : [];

  const selectedActivityStats = selectedActivity
    ? getActivityAttendanceStats(selectedActivity.id)
    : { present: 0, registered: 0, waiting: 0 };

  const selectedActivityQRCodeData = selectedActivity
    ? `${selectedActivity.id}::${selectedActivity.qrGeneratedAt || new Date().toISOString()}`
    : '';

  const selectedActivityCertificateRecords = selectedActivity
    ? getCertificateRecords().filter(
        record => record.activityId === selectedActivity.id && record.certificateStatus === 'Certificate Available'
      )
    : [];

  if (selectedActivity) {
    const userSubmittedFeedback = currentUser
      ? selectedActivityFeedback.find(feedback => feedback.userName === currentUser.name)
      : undefined;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedActivity(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Activities
            </Button>
          </div>

        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-foreground">{selectedActivity.title}</h1>
                  {getStatusBadge(selectedActivity.status)}
                </div>
                <p className="text-muted-foreground max-w-3xl">{selectedActivity.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
                  <div className="rounded-lg border border-border p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedActivity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {selectedActivity.location}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground">Organizer</p>
                    <p className="font-medium flex items-center gap-2 mt-1">
                      <User className="w-4 h-4" />
                      {selectedActivity.organizer}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" />
                      {(selectedActivity as Activity & { duration?: string }).duration || 'Not set'}
                    </p>
                  </div>
                  {selectedActivity.status !== 'completed' && (
                    <div className="rounded-lg border border-border p-3 bg-muted/20">
                      <p className="text-xs text-muted-foreground">Attendance</p>
                      <p className="font-medium flex items-center gap-2 mt-1">
                        <CheckCircle className="w-4 h-4" />
                        {selectedActivityStats.present} present / {selectedActivityStats.registered} registered
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedActivity.status !== 'completed' && (
                <div className="w-full lg:w-[260px] rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Registration</span>
                    <Badge variant="outline" className={selectedActivity.registrationOpen ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-300'}>
                      {selectedActivity.registrationOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Attendance</span>
                    <Badge variant="outline" className={selectedActivity.attendanceOpen ? 'bg-yellow-50 text-yellow-900 border-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-300'}>
                      {selectedActivity.attendanceOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Feedback</span>
                    <span className="font-semibold">{selectedActivityFeedback.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Photos</span>
                    <span className="font-semibold">{selectedActivityPhotos.length}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className={selectedActivity.status === 'completed' ? 'grid grid-cols-1 gap-6' : 'grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6'}>
          <div className="space-y-6">
            {isAdmin && selectedActivity.status !== 'completed' && (
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <QrCode className="w-5 h-5" />
                        Attendance QR Code
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Admin and coordinator can generate the event QR here. Members scan this QR to mark themselves present.
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={selectedActivity.attendanceOpen ? 'bg-yellow-50 text-yellow-900 border-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-300'}
                    >
                      Attendance {selectedActivity.attendanceOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          QR Validity Period
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Choose how long this QR code should be valid after generation.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={selectedActivity.qrValidityHours || 2}
                          onChange={(e) => handleQRValidityChange(selectedActivity.id, Number(e.target.value))}
                          className="px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value={1}>1 hour</option>
                          <option value={2}>2 hours</option>
                          <option value={3}>3 hours</option>
                          <option value={4}>4 hours</option>
                          <option value={6}>6 hours</option>
                          <option value={12}>12 hours</option>
                          <option value={24}>24 hours</option>
                        </select>

                        <Button onClick={() => handleGenerateQR(selectedActivity.id)} size="sm">
                          <QrCode className="w-4 h-4 mr-2" />
                          Generate QR
                        </Button>

                        <Button
                          onClick={() => toggleAttendance(selectedActivity.id)}
                          variant={selectedActivity.attendanceOpen ? 'default' : 'outline'}
                          size="sm"
                        >
                          {selectedActivity.attendanceOpen ? (
                            <><Unlock className="w-4 h-4 mr-2" /> Close Attendance</>
                          ) : (
                            <><Lock className="w-4 h-4 mr-2" /> Open Attendance</>
                          )}
                        </Button>
                      </div>
                    </div>

                    {selectedActivity.qrGeneratedAt && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
                        <p>Generated: {new Date(selectedActivity.qrGeneratedAt).toLocaleString()}</p>
                        <p>Expires: {new Date(new Date(selectedActivity.qrGeneratedAt).getTime() + (selectedActivity.qrValidityHours || 2) * 60 * 60 * 1000).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {selectedActivity.qrGeneratedAt ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white p-6">
                      <QRCodeSVG
                        value={selectedActivityQRCodeData}
                        size={240}
                        level="H"
                        includeMargin
                      />
                      <p className="mt-4 text-sm text-muted-foreground text-center max-w-md">
                        Only registered members can be validated. If a member did not join this activity, scanning this QR will not mark them present.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                      <QrCode className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No QR generated yet. Click Generate QR to create the attendance QR for this activity.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isAdmin && selectedActivity.status === 'completed' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Certificates
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Members listed here have certificates because their attendance was validated through QR scanning.
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                      {selectedActivityCertificateRecords.length} available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedActivityCertificateRecords.length > 0 ? (
                    <div className="space-y-3">
                      {selectedActivityCertificateRecords.map(record => (
                        <div
                          key={record.id}
                          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{record.memberName}</p>
                              <Badge variant="outline" className="bg-green-100 text-green-900 border-green-200">
                                Certificate Available
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 text-sm text-muted-foreground">
                              <div>
                                <span className="block text-xs">Attendance</span>
                                <span className="font-medium text-foreground">{record.attendanceStatus}</span>
                              </div>
                              <div>
                                <span className="block text-xs">Certificate No.</span>
                                <span className="font-medium text-foreground">{record.certificateNumber || 'Pending number'}</span>
                              </div>
                              <div>
                                <span className="block text-xs">Issued Date</span>
                                <span className="font-medium text-foreground">{record.issuedAt || 'Not issued yet'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[170px]">
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="w-4 h-4 mr-2" />
                              View Certificate
                            </Button>
                            <Button variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                      <Award className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No certificates are available yet. Certificates will appear here after members scan the activity QR and are marked present.
                      </p>
                    </div>
                  )}
                </CardContent>
                </Card>

                <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Activity Feedback
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        All feedback for this activity is visible to admin and coordinator.
                      </p>
                    </div>
                    <Badge variant="outline">{selectedActivityFeedback.length} feedback</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedActivityFeedback.length > 0 ? (
                    <div className="space-y-3">
                      {selectedActivityFeedback.map(feedback => (
                        <div key={feedback.id} className="rounded-lg border border-border bg-muted/30 p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <p className="font-medium">{feedback.userName}</p>
                              <p className="text-xs text-muted-foreground">{feedback.submittedAt}</p>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                              {feedback.rating}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                      <p className="text-sm text-muted-foreground">No feedback has been submitted for this activity yet.</p>
                    </div>
                  )}
                </CardContent>
                </Card>
              </div>
            )}

            {!isAdmin && selectedActivity.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Your Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userSubmittedFeedback ? (
                    <div className="rounded-lg border border-border p-4">
                      <Button
                        disabled
                        variant="outline"
                        className="mb-3 text-muted-foreground border-border bg-transparent"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Thanks for your feedback
                      </Button>
                      <div>
                        <Badge variant="outline" className="mb-3">
                          {userSubmittedFeedback.rating}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{userSubmittedFeedback.comment}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">
                        Share your experience from this finished activity.
                      </p>
                      <Button
                        onClick={() => handleOpenFeedbackModal(selectedActivity)}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Feedback
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Documentation
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Event photos uploaded by admin or coordinator are visible to members.
                    </p>
                  </div>

                  {isAdmin && (
                    <label className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedActivityPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedActivityPhotos.map(photo => (
                      <div key={photo.id} className="rounded-xl border border-border overflow-hidden bg-card">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="h-44 w-full object-cover"
                        />
                        <div className="p-3">
                          <p className="font-medium text-sm line-clamp-1">{photo.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploaded by {photo.uploadedBy} • {photo.uploadedAt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground">No documentation photos uploaded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {selectedActivity.status !== 'completed' && (
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-semibold">{selectedActivityStats.present}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="text-2xl font-semibold">{selectedActivityStats.registered}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Waiting</p>
                  <p className="text-2xl font-semibold">{selectedActivityStats.waiting}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Modal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          title="Add Activity Feedback"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Activity</p>
              <p className="font-semibold text-foreground">{feedbackTargetActivity?.title}</p>
            </div>

            <div>
              <label className="block mb-2 text-sm">Feedback Type</label>
              <select
                value={feedbackForm.rating}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: e.target.value })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select feedback type</option>
                <option value="Excellent">Excellent</option>
                <option value="Good experience">Good experience</option>
                <option value="Very helpful">Very helpful</option>
                <option value="Needs improvement">Needs improvement</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm">Your Feedback</label>
              <textarea
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]"
                value={feedbackForm.comment}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                placeholder="Share your thoughts about this activity"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsFeedbackModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={!feedbackForm.rating || !feedbackForm.comment.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </Modal>

      {scanMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-in">
          <div className={`p-4 rounded-lg shadow-lg ${
            scanMessage.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-900'
              : 'bg-red-100 text-red-900 border-2 border-red-900'
          }`}>
            <div className="flex items-start gap-3">
              {scanMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <span className="text-xl flex-shrink-0">⚠️</span>
              )}
              <div className="flex-1">
                <p className="font-medium">{scanMessage.text}</p>
              </div>
              <button
                onClick={() => setScanMessage(null)}
                className="text-current opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => {
            setShowScanner(false);
            setScanningActivityId(null);
          }}
        />
      )}

      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">{isAdmin ? 'Manage Activities' : 'Activities'}</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Create and manage all activities' : 'Browse and join activities'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Activity
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFinishedActivities(!showFinishedActivities)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
        >
          <div>
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              {showFinishedActivities ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              Finished Activities
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Completed activities are separated here for cleaner browsing.
            </p>
          </div>
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            {finishedActivities.length} completed
          </Badge>
        </button>

        {showFinishedActivities && (
          <div className="p-4 space-y-3 bg-background">
            {finishedActivities.length > 0 ? (
              finishedActivities.map(renderFinishedActivityListCard)
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No finished activities found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Active Activities</h2>
          <span className="text-sm text-muted-foreground">{activeActivities.length} listed</span>
        </div>

        {activeActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeActivities.map(renderActivityGridCard)}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">No active activities found</p>
          </div>
        )}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No activities found</p>
        </div>
      )}

      {scanMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-in">
          <div className={`p-4 rounded-lg shadow-lg ${
            scanMessage.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-900'
              : 'bg-red-100 text-red-900 border-2 border-red-900'
          }`}>
            <div className="flex items-start gap-3">
              {scanMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <span className="text-xl flex-shrink-0">⚠️</span>
              )}
              <div className="flex-1">
                <p className="font-medium">{scanMessage.text}</p>
              </div>
              <button
                onClick={() => setScanMessage(null)}
                className="text-current opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Add Activity Feedback"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Activity</p>
            <p className="font-semibold text-foreground">{feedbackTargetActivity?.title}</p>
          </div>

          <div>
            <label className="block mb-2 text-sm">Feedback Type</label>
            <select
              value={feedbackForm.rating}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select feedback type</option>
              <option value="Excellent">Excellent</option>
              <option value="Good experience">Good experience</option>
              <option value="Very helpful">Very helpful</option>
              <option value="Needs improvement">Needs improvement</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm">Your Feedback</label>
            <textarea
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]"
              value={feedbackForm.comment}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
              placeholder="Share your thoughts about this activity"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={!feedbackForm.rating || !feedbackForm.comment.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Activity"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Activity Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <Input
            label="Organizer"
            value={formData.organizer}
            onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
          />
          <Input
            label="Duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g., 3 hours, Half day, Full day"
          />
          <div>
            <label className="block mb-2 text-sm">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Activity"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Activity Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter activity title"
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Enter location"
          />
          <Input
            label="Organizer"
            value={formData.organizer}
            onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
          />
          <Input
            label="Duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g., 3 hours, Half day, Full day"
          />
          <div>
            <label className="block mb-2 text-sm">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter activity description"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNew}>Create Activity</Button>
          </div>
        </div>
      </Modal>

      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => {
            setShowScanner(false);
            setScanningActivityId(null);
          }}
        />
      )}
    </div>
  );
}

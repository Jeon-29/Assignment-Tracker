import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Calendar, MapPin, User, ArrowLeft, QrCode, Camera, CheckCircle, Users, Clock } from 'lucide-react';
import { activities as initialActivities, attendanceRecords as initialAttendance, AttendanceRecord } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { QRScanner } from '../components/QRScanner';
import { QRCodeSVG } from 'qrcode.react';

export function ActivityDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState(initialActivities);
  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendance);
  const [isJoined, setIsJoined] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const activity = activities.find(a => a.id === id);
  const [qrValidityHours, setQrValidityHours] = useState(activity?.qrValidityHours || 2);

  if (!activity || !currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Activity not found</p>
        <Button onClick={() => navigate('/activities')} className="mt-4">
          Back to Activities
        </Button>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'coordinator';
  const isParticipant = activity.participants.includes(currentUser.id) || isJoined;

  // Get attendance for this activity
  const activityAttendance = attendanceRecords.filter(r => r.activityId === activity.id);
  const userAttendance = activityAttendance.find(r => r.userId === currentUser.id);
  const totalPresent = activityAttendance.filter(r => r.status === 'approved').length;
  const attendanceRate = activity.participants.length > 0
    ? Math.round((totalPresent / activity.participants.length) * 100)
    : 0;

  const handleJoinActivity = () => {
    setActivities(activities.map(a =>
      a.id === activity.id
        ? { ...a, participants: [...a.participants, currentUser.id] }
        : a
    ));
    setIsJoined(true);
  };

  const handleGenerateQR = () => {
    setActivities(activities.map(a =>
      a.id === activity.id
        ? {
            ...a,
            qrGeneratedAt: new Date().toISOString(),
            qrValidityHours: qrValidityHours,
          }
        : a
    ));
  };

  const toggleAttendance = () => {
    setActivities(activities.map(a =>
      a.id === activity.id ? { ...a, attendanceOpen: !a.attendanceOpen } : a
    ));
  };

  const handleQRScan = (qrData: string) => {
    setShowScanner(false);

    // Validate QR data format: activityId-timestamp
    const [scannedActivityId] = qrData.split('-');

    // Check if correct activity
    if (scannedActivityId !== activity.id) {
      setScanMessage({ type: 'error', text: 'Invalid QR code. This code is not for this activity.' });
      return;
    }

    // Check if user is registered
    if (!isParticipant) {
      setScanMessage({ type: 'error', text: 'You are not registered for this activity.' });
      return;
    }

    // Check if attendance window is open
    if (!activity.attendanceOpen) {
      setScanMessage({ type: 'error', text: 'Attendance window has closed.' });
      return;
    }

    // Check if already marked attendance
    if (userAttendance) {
      setScanMessage({ type: 'error', text: 'Attendance already recorded.' });
      return;
    }

    // Record attendance automatically
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      activityId: activity.id,
      activityTitle: activity.title,
      userId: currentUser.id,
      userName: currentUser.name,
      date: activity.date,
      status: 'approved', // Automatically approved
      timestamp: new Date().toISOString(),
      markedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      proofUrl: '',
    };

    setAttendanceRecords([...attendanceRecords, newRecord]);
    setScanMessage({ type: 'success', text: 'Attendance successfully recorded.' });
  };

  // Generate QR code data
  const qrCodeData = `${activity.id}-${Date.now()}`;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/activities')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Activities
      </Button>

      {/* Activity Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1>{activity.title}</h1>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                  {new Date(activity.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  {activity.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-5 h-5" />
                  Organized by {activity.organizer}
                </div>
              </div>
            </div>
            <Badge variant={activity.status === 'upcoming' ? 'info' : activity.status === 'ongoing' ? 'warning' : 'success'}>
              {activity.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Description</h3>
              <p className="text-muted-foreground">{activity.description}</p>
            </div>

            {/* Registration Status for Members */}
            {!isAdmin && (
              <div>
                <h3 className="mb-3">Registration Status</h3>
                {isParticipant ? (
                  <div className="p-4 bg-emerald-100 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-900" />
                    <span className="text-emerald-900 font-medium">Registered</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm">Not Registered</p>
                    </div>
                    {activity.registrationOpen && (
                      <Button onClick={handleJoinActivity} className="w-full md:w-auto">
                        Register for Activity
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Member: Scan QR Section */}
      {!isAdmin && isParticipant && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {!activity.attendanceOpen ? (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground text-sm">
                  🔒 Attendance window is not yet open. The coordinator will open it during the activity.
                </p>
              </div>
            ) : userAttendance ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-100 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-900" />
                    <span className="text-emerald-900 font-medium">Attendance Recorded</span>
                  </div>
                  <p className="text-sm text-emerald-800">
                    Marked on {new Date(userAttendance.markedAt || '').toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Scan the QR code displayed by the coordinator to record your attendance.
                </p>

                {scanMessage && (
                  <div className={`p-4 rounded-lg ${
                    scanMessage.type === 'success'
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-red-100 text-red-900'
                  }`}>
                    {scanMessage.text}
                  </div>
                )}

                <Button
                  onClick={() => setShowScanner(true)}
                  className="w-full md:w-auto flex items-center gap-2"
                  size="lg"
                >
                  <Camera className="w-5 h-5" />
                  Scan Attendance QR
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin/Coordinator: QR Code & Statistics */}
      {isAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Registered</div>
                    <div className="text-2xl font-bold">{activity.participants.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-900" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Present</div>
                    <div className="text-2xl font-bold">{totalPresent}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <QrCode className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Attendance Rate</div>
                    <div className="text-2xl font-bold">{attendanceRate}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* QR Validity Settings */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    QR Code Validity Period
                  </h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-sm text-muted-foreground">Valid for:</label>
                    <select
                      value={qrValidityHours}
                      onChange={(e) => setQrValidityHours(Number(e.target.value))}
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
                    <Button onClick={handleGenerateQR} size="sm">
                      Generate QR
                    </Button>
                  </div>

                  {/* Attendance Window Control */}
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Attendance Window Control</p>
                        <p className="text-xs text-muted-foreground">Override time limit and manually control attendance</p>
                      </div>
                      <Button
                        onClick={toggleAttendance}
                        variant={activity.attendanceOpen ? 'default' : 'outline'}
                        size="sm"
                      >
                        {activity.attendanceOpen ? '🔓 Close Attendance' : '🔒 Open Attendance'}
                      </Button>
                    </div>
                  </div>

                  {activity.qrGeneratedAt && (
                    <div className="text-xs text-muted-foreground pt-3 border-t border-border">
                      <p>Generated: {new Date(activity.qrGeneratedAt).toLocaleString()}</p>
                      <p>Expires: {new Date(new Date(activity.qrGeneratedAt).getTime() + (activity.qrValidityHours || 2) * 60 * 60 * 1000).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* QR Code Display */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-6 bg-white rounded-lg border-2 border-border shadow-lg">
                    <QRCodeSVG
                      value={qrCodeData}
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Members must scan this QR code within the attendance time window to record their attendance.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Attendance Window:</span>
                      <Badge variant={activity.attendanceOpen ? 'success' : 'default'}>
                        {activity.attendanceOpen ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                    {activity.qrValidityHours && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">QR Valid for:</span>
                        <Badge variant="info">
                          {activity.qrValidityHours} hour(s)
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3">Member Name</th>
                      <th className="text-left p-3">Time Scanned</th>
                      <th className="text-left p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityAttendance.map((record) => (
                      <tr key={record.id} className="border-b border-border">
                        <td className="p-3">{record.userName}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {record.markedAt ? new Date(record.markedAt).toLocaleString() : '-'}
                        </td>
                        <td className="p-3">
                          <Badge variant={record.status === 'approved' ? 'success' : 'default'}>
                            {record.status === 'approved' ? 'Present' : 'Absent'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {activityAttendance.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-muted-foreground">
                          No attendance records yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

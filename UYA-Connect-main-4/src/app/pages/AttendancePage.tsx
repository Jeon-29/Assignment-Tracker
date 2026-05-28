import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { attendanceRecords as initialRecords, activities, users } from '../data/mockData';
import { CheckCircle, XCircle, Edit2 } from 'lucide-react';

export function AttendancePage() {
  const { currentUser } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState(initialRecords);
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [editModal, setEditModal] = useState<{ isOpen: boolean; record: typeof initialRecords[0] | null }>({
    isOpen: false,
    record: null,
  });
  const [editStatus, setEditStatus] = useState<'eligible' | 'pending' | 'approved' | 'rejected'>('pending');

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'coordinator';

  type AttendanceDisplayStatus = 'present' | 'late' | 'absent';

  const getAttendanceDisplayStatus = (record: typeof initialRecords[0]): AttendanceDisplayStatus => {
    if (record.attendanceStatus) return record.attendanceStatus;

    if (record.status === 'approved') return 'present';
    if (record.status === 'rejected') return 'absent';

    return record.markedAt || record.timestamp ? 'late' : 'absent';
  };

  const getAttendanceBadge = (record: typeof initialRecords[0]) => {
    const displayStatus = getAttendanceDisplayStatus(record);

    const badgeConfig = {
      present: {
        label: 'Present',
        className: 'border-green-200 bg-green-50 text-green-700',
      },
      late: {
        label: 'Present but Late',
        className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      },
      absent: {
        label: 'Absent',
        className: 'border-red-200 bg-red-50 text-red-700',
      },
    } satisfies Record<AttendanceDisplayStatus, { label: string; className: string }>;

    return badgeConfig[displayStatus];
  };


  // Member view: show their own attendance history
  if (!isAdmin) {
    const userRecords = attendanceRecords.filter(r => r.userId === currentUser.id);
    
    // Calculate summary statistics
    const totalAttended = userRecords.filter(r => getAttendanceDisplayStatus(r) === 'present' || getAttendanceDisplayStatus(r) === 'late').length;
    const lateCount = userRecords.filter(r => getAttendanceDisplayStatus(r) === 'late').length;
    const absentCount = userRecords.filter(r => getAttendanceDisplayStatus(r) === 'absent').length;
    const attendanceRate = userRecords.length > 0 
      ? Math.round((totalAttended / userRecords.length) * 100) 
      : 0;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">My Attendance</h1>
          <p className="text-muted-foreground mt-1">
            View your complete attendance history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Total Records</div>
              <div className="text-3xl font-bold">{userRecords.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All attendance entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Present</div>
              <div className="text-3xl font-bold text-primary">{totalAttended}</div>
              <p className="text-xs text-muted-foreground mt-1">On-time and late scans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Late</div>
              <div className="text-3xl font-bold text-secondary">{lateCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Present but late</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Absent</div>
              <div className="text-3xl font-bold text-red-700">{absentCount}</div>
              <p className="text-xs text-muted-foreground mt-1">No valid QR scan</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Attendance Rate</div>
              <div className="text-3xl font-bold text-primary">{attendanceRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Approval success rate</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Activity</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userRecords.map((record) => (
                    <tr key={record.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">{record.activityTitle}</td>
                      <td className="py-3 px-4">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          const badge = getAttendanceBadge(record);
                          return (
                            <Badge variant="outline" className={badge.className}>
                              {badge.label}
                            </Badge>
                          );
                        })()}
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
              {userRecords.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mobile view - Card layout */}
        <div className="lg:hidden space-y-4">
          {userRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <h4 className="mb-2">{record.activityTitle}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {(() => {
                      const badge = getAttendanceBadge(record);
                      return (
                        <Badge variant="outline" className={badge.className}>
                          {badge.label}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    );
  }

  // Admin/Coordinator view: manage all attendance
  const filteredRecords = selectedActivity === 'all'
    ? attendanceRecords
    : attendanceRecords.filter(r => r.activityId === selectedActivity);

  // Calculate stats for selected activity or all activities
  const selectedActivityData = activities.find(a => a.id === selectedActivity);
  let totalRecords, presentCount, lateCountAdmin, absentCountAdmin, overallRate;

  if (selectedActivity === 'all') {
    // Overall summary statistics
    totalRecords = attendanceRecords.length;
    presentCount = attendanceRecords.filter(r => getAttendanceDisplayStatus(r) === 'present').length;
    lateCountAdmin = attendanceRecords.filter(r => getAttendanceDisplayStatus(r) === 'late').length;
    absentCountAdmin = attendanceRecords.filter(r => getAttendanceDisplayStatus(r) === 'absent').length;
    overallRate = totalRecords > 0 ? Math.round(((presentCount + lateCountAdmin) / totalRecords) * 100) : 0;
  } else {
    // Activity-specific statistics
    const totalParticipants = selectedActivityData?.participants.length || 0;
    presentCount = filteredRecords.filter(r => getAttendanceDisplayStatus(r) === 'present').length;
    lateCountAdmin = filteredRecords.filter(r => getAttendanceDisplayStatus(r) === 'late').length;
    absentCountAdmin = filteredRecords.filter(r => getAttendanceDisplayStatus(r) === 'absent').length;
    overallRate = totalParticipants > 0 
      ? Math.round(((presentCount + lateCountAdmin) / totalParticipants) * 100) 
      : 0;
  }

  const handleApprove = (recordId: string) => {
    setAttendanceRecords(attendanceRecords.map(r =>
      r.id === recordId ? { ...r, status: 'approved', attendanceStatus: 'present' } : r
    ));
  };

  const handleReject = (recordId: string) => {
    setAttendanceRecords(attendanceRecords.map(r =>
      r.id === recordId ? { ...r, status: 'rejected', attendanceStatus: 'absent' } : r
    ));
  };

  const handleEdit = (record: typeof initialRecords[0]) => {
    setEditModal({ isOpen: true, record });
    setEditStatus(record.status);
  };

  const handleSaveEdit = () => {
    if (editModal.record) {
      setAttendanceRecords(attendanceRecords.map(r =>
        r.id === editModal.record?.id ? { ...r, status: editStatus } : r
      ));
      setEditModal({ isOpen: false, record: null });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve member attendance
        </p>
      </div>

      {/* Activity Selector */}
      <div>
        <label className="block mb-2 text-sm">Select Activity</label>
        <select
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          className="w-full md:w-auto px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Activities</option>
          {activities.map(activity => (
            <option key={activity.id} value={activity.id}>
              {activity.title}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">
              {selectedActivity === 'all' ? 'Total Records' : 'Total Participants'}
            </div>
            <div className="text-2xl">
              {selectedActivity === 'all' ? totalRecords : selectedActivityData?.participants.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Present</div>
            <div className="text-2xl text-primary">{presentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Late</div>
            <div className="text-2xl text-secondary">{lateCountAdmin}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Absent</div>
            <div className="text-2xl text-red-700">{absentCountAdmin}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Attendance Rate
            </div>
            <div className="text-2xl text-primary">{overallRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Member Name</th>
                  <th className="text-left py-3 px-4">Activity</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Timestamp</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">{record.userName}</td>
                    <td className="py-3 px-4">{record.activityTitle}</td>
                    <td className="py-3 px-4">
                      {(() => {
                        const badge = getAttendanceBadge(record);
                        return (
                          <Badge variant="outline" className={badge.className}>
                            {badge.label}
                          </Badge>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {record.markedAt 
                        ? new Date(record.markedAt).toLocaleString()
                        : '-'
                      }
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {record.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleApprove(record.id)}
                              size="sm"
                              variant="outline"
                              className="text-primary hover:text-primary/80"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleReject(record.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-700 hover:text-red-800"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleEdit(record)}
                          size="sm"
                          variant="ghost"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile view - Card layout */}
      <div className="lg:hidden space-y-4">
        {filteredRecords.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h4>{record.userName}</h4>
                {(() => {
                  const badge = getAttendanceBadge(record);
                  return (
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  );
                })()}
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Activity: </span>
                  <span>{record.activityTitle}</span>
                </div>
                {record.markedAt && (
                  <div>
                    <span className="text-muted-foreground">Timestamp: </span>
                    <span>{new Date(record.markedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {record.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleApprove(record.id)}
                      size="sm"
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(record.id)}
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => handleEdit(record)}
                  size="sm"
                  variant="outline"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && editModal.record && (
        <Modal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, record: null })}
          title="Edit Attendance Record"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Member</p>
              <p className="font-medium">{editModal.record.userName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Activity</p>
              <p className="font-medium">{editModal.record.activityTitle}</p>
            </div>
            <div>
              <label className="block mb-2 text-sm">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as typeof editStatus)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="eligible">Eligible</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => setEditModal({ isOpen: false, record: null })}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
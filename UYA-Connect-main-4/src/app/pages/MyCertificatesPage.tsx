import React from 'react';
import { Link } from 'react-router-dom';
import { Award, CalendarDays, Download, FileCheck, Hash, QrCode, Search } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import {
  activities,
  attendanceRecords,
  getActivityById,
  getCertificatesByUserId,
} from '../data/mockData';

const formatDate = (dateValue?: string) => {
  if (!dateValue) return 'Not issued yet';

  return new Date(dateValue).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export function MyCertificatesPage() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const memberCertificates = getCertificatesByUserId(currentUser.id);

  const certificateCards = memberCertificates.map((certificate) => {
    const activity = getActivityById(certificate.activityId);
    const attendance = attendanceRecords.find(record => record.id === certificate.attendanceId);

    return {
      ...certificate,
      activityTitle: activity?.title ?? 'Unknown Activity',
      activityDate: activity?.date ?? attendance?.date,
      attendanceStatus: 'Present',
      certificateStatus: 'Available',
    };
  });

  const attendedActivities = attendanceRecords.filter(record => (
    record.userId === currentUser.id &&
    record.status === 'approved' &&
    Boolean(record.markedAt || record.timestamp)
  )).length;

  const joinedActivities = activities.filter(activity => activity.participants.includes(currentUser.id)).length;

  const handleDownload = (certificateNumber: string) => {
    window.alert(`Mock PDF download for certificate ${certificateNumber}. The real Laravel version will generate a downloadable PDF file.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          My Certificates
        </h1>
        <p className="text-muted-foreground mt-1">
          View and download your certificates from UYA activities you have successfully attended.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Certificates</p>
                <p className="text-3xl font-bold mt-1">{certificateCards.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">QR Validated Attendance</p>
                <p className="text-3xl font-bold mt-1">{attendedActivities}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Joined Activities</p>
                <p className="text-3xl font-bold mt-1">{joinedActivities}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CalendarDays className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {certificateCards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No certificates available yet</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No certificates available yet. Certificates will appear here after you attend an activity and your attendance is validated through QR scanning.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {certificateCards.map((certificate) => (
            <Card key={certificate.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-lg">{certificate.activityTitle}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Certificate of Attendance from Union of Youth Alliance activities.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Present
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          Available
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="w-4 h-4" />
                        <span>Activity: {formatDate(certificate.activityDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileCheck className="w-4 h-4" />
                        <span>Issued: {formatDate(certificate.issuedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                        <Hash className="w-4 h-4" />
                        <span>Certificate No: {certificate.certificateNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                    <Link to={`/certificates/${certificate.id}`} className="w-full">
                      <Button variant="outline" className="w-full gap-2">
                        <FileCheck className="w-4 h-4" />
                        View Certificate
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="primary"
                      className="w-full gap-2"
                      onClick={() => handleDownload(certificate.certificateNumber)}
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

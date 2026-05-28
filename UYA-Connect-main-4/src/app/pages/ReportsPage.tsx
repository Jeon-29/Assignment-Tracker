import React, { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Activity, BarChart3, ClipboardList, Lightbulb, Search, Users } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { activities, attendanceRecords, proposals, TOTAL_MEMBERS, users } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const safeRate = (value: number, total: number) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

const isDeadlineDone = (deadline: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(23, 59, 59, 999);

  return deadlineDate < today;
};

const getActivityEvaluationStatus = (rate: number) => {
  if (rate >= 80) return 'Excellent';
  if (rate >= 60) return 'Needs Improvement';
  return 'Critical';
};

const getEngagementLevel = (rate: number) => {
  if (rate >= 80) return 'Highly Active';
  if (rate >= 60) return 'Active';
  if (rate >= 40) return 'At Risk';
  return 'Inactive';
};

const getBadgeClass = (label: string) => {
  switch (label) {
    case 'Excellent':
    case 'Highly Active':
    case 'Approved':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'Active':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'Needs Improvement':
    case 'At Risk':
    case 'Pending':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'Critical':
    case 'Inactive':
    case 'Rejected':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
};

export function ReportsPage() {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'activities' | 'members' | 'proposals'>('activities');
  const [memberSearch, setMemberSearch] = useState('');
  const [engagementFilter, setEngagementFilter] = useState('all');

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const activityEvaluationReport = useMemo(() => {
    return activities.map((activity) => {
      const registeredIds = activity.participants;
      const records = attendanceRecords.filter((record) => record.activityId === activity.id);
      const presentCount = records.filter((record) => record.attendanceStatus === 'present').length;
      const lateCount = records.filter((record) => record.attendanceStatus === 'late').length;
      const attendedCount = presentCount + lateCount;
      const absentCount = Math.max(registeredIds.length - attendedCount, 0);
      const attendanceRate = safeRate(attendedCount, registeredIds.length);
      const evaluationStatus = getActivityEvaluationStatus(attendanceRate);

      return {
        id: activity.id,
        title: activity.title,
        date: activity.date,
        totalRegistered: registeredIds.length,
        presentCount,
        lateCount,
        absentCount,
        attendanceRate,
        evaluationStatus,
      };
    });
  }, []);

  const memberEngagementReport = useMemo(() => {
    return users
      .filter((user) => user.role === 'member')
      .map((member) => {
        const joinedActivities = activities.filter((activity) => activity.participants.includes(member.id));

        const presentCount = joinedActivities.filter((activity) =>
          attendanceRecords.some(
            (record) =>
              record.activityId === activity.id &&
              record.userId === member.id &&
              record.attendanceStatus === 'present',
          ),
        ).length;

        const lateCount = joinedActivities.filter((activity) =>
          attendanceRecords.some(
            (record) =>
              record.activityId === activity.id &&
              record.userId === member.id &&
              record.attendanceStatus === 'late',
          ),
        ).length;

        const absentCount = Math.max(joinedActivities.length - presentCount - lateCount, 0);
        const engagementRate = safeRate(presentCount + lateCount, joinedActivities.length);
        const engagementLevel = getEngagementLevel(engagementRate);

        return {
          id: member.id,
          name: member.name,
          totalActivitiesJoined: joinedActivities.length,
          presentCount,
          lateCount,
          absentCount,
          engagementRate,
          engagementLevel,
        };
      });
  }, []);

  const filteredMemberEngagementReport = memberEngagementReport.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesFilter = engagementFilter === 'all' || member.engagementLevel === engagementFilter;
    return matchesSearch && matchesFilter;
  });

  const proposalVotingOutcomeReport = useMemo(() => {
    return proposals.map((proposal) => {
      const totalVotes = proposal.yesVotes + proposal.noVotes;
      const approvalPercentage = safeRate(proposal.yesVotes, totalVotes);
      const votingClosed = isDeadlineDone(proposal.votingDeadline) || totalVotes >= TOTAL_MEMBERS;

      let status: 'Approved' | 'Rejected' | 'Pending' = 'Pending';
      let reason = 'Voting is still ongoing.';

      if (proposal.status === 'approved' || (votingClosed && approvalPercentage >= 80)) {
        status = 'Approved';
        reason = 'Reached the 80% voting requirement.';
      } else if (proposal.status === 'rejected' || votingClosed) {
        status = 'Rejected';
        reason = 'Did not reach the 80% voting requirement.';
      }

      return {
        id: proposal.id,
        title: proposal.title,
        proposerName: proposal.proposerName,
        yesVotes: proposal.yesVotes,
        noVotes: proposal.noVotes,
        totalVotes,
        approvalPercentage,
        status,
        reason,
      };
    });
  }, []);

  const averageAttendanceRate = activityEvaluationReport.length
    ? Math.round(
        activityEvaluationReport.reduce((sum, activity) => sum + activity.attendanceRate, 0) /
          activityEvaluationReport.length,
      )
    : 0;
  const highlyActiveMembers = memberEngagementReport.filter(
    (member) => member.engagementLevel === 'Highly Active',
  ).length;
  const criticalActivities = activityEvaluationReport.filter(
    (activity) => activity.evaluationStatus === 'Critical',
  ).length;
  const approvedProposals = proposalVotingOutcomeReport.filter(
    (proposal) => proposal.status === 'Approved',
  ).length;

  const sectionButtons = [
    { id: 'activities', label: 'Activity Evaluation Report', icon: Activity },
    { id: 'members', label: 'Member Engagement Report', icon: Users },
    { id: 'proposals', label: 'Proposal Voting Outcome Report', icon: Lightbulb },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <BarChart3 className="h-5 w-5" />
          <span className="text-sm font-medium">Admin only module</span>
        </div>
        <div>
          <h1>Analytics & Evaluation</h1>
          <p className="text-muted-foreground mt-1">
            Decision-support reports for activity attendance, member engagement, and proposal voting outcomes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Average Activity Attendance Rate</p>
                <p className="mt-2 text-3xl font-semibold">{averageAttendanceRate}%</p>
              </div>
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Highly Active Members</p>
                <p className="mt-2 text-3xl font-semibold">{highlyActiveMembers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Critical Activities</p>
                <p className="mt-2 text-3xl font-semibold">{criticalActivities}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Approved Proposals</p>
                <p className="mt-2 text-3xl font-semibold">{approvedProposals}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {sectionButtons.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="font-medium">{section.label}</span>
            </button>
          );
        })}
      </div>

      {activeSection === 'activities' && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Evaluation Report</CardTitle>
            <p className="text-sm text-muted-foreground">
              Attendance Rate = ((Present + Late) / Total Registered Members) × 100
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border text-sm text-muted-foreground">
                    <th className="px-4 py-3 text-left">Activity Title</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-center">Registered</th>
                    <th className="px-4 py-3 text-center">Present</th>
                    <th className="px-4 py-3 text-center">Late</th>
                    <th className="px-4 py-3 text-center">Absent</th>
                    <th className="px-4 py-3 text-center">Attendance Rate</th>
                    <th className="px-4 py-3 text-left">Evaluation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activityEvaluationReport.map((activity) => (
                    <tr key={activity.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-4 font-medium">{activity.title}</td>
                      <td className="px-4 py-4">{formatDate(activity.date)}</td>
                      <td className="px-4 py-4 text-center">{activity.totalRegistered}</td>
                      <td className="px-4 py-4 text-center">{activity.presentCount}</td>
                      <td className="px-4 py-4 text-center">{activity.lateCount}</td>
                      <td className="px-4 py-4 text-center">{activity.absentCount}</td>
                      <td className="px-4 py-4 text-center font-medium">{activity.attendanceRate}%</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={getBadgeClass(activity.evaluationStatus)}>
                          {activity.evaluationStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'members' && (
        <Card>
          <CardHeader>
            <CardTitle>Member Engagement Report</CardTitle>
            <p className="text-sm text-muted-foreground">
              Engagement Rate = ((Present + Late) / Total Activities Joined) × 100
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  placeholder="Search member name..."
                  className="w-full rounded-lg border border-border bg-input-background py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <select
                value={engagementFilter}
                onChange={(event) => setEngagementFilter(event.target.value)}
                className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All engagement levels</option>
                <option value="Highly Active">Highly Active</option>
                <option value="Active">Active</option>
                <option value="At Risk">At Risk</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-border text-sm text-muted-foreground">
                    <th className="px-4 py-3 text-left">Member Name</th>
                    <th className="px-4 py-3 text-center">Activities Joined</th>
                    <th className="px-4 py-3 text-center">Present</th>
                    <th className="px-4 py-3 text-center">Late</th>
                    <th className="px-4 py-3 text-center">Absent</th>
                    <th className="px-4 py-3 text-center">Engagement Rate</th>
                    <th className="px-4 py-3 text-left">Engagement Level</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMemberEngagementReport.map((member) => (
                    <tr key={member.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-4 font-medium">{member.name}</td>
                      <td className="px-4 py-4 text-center">{member.totalActivitiesJoined}</td>
                      <td className="px-4 py-4 text-center">{member.presentCount}</td>
                      <td className="px-4 py-4 text-center">{member.lateCount}</td>
                      <td className="px-4 py-4 text-center">{member.absentCount}</td>
                      <td className="px-4 py-4 text-center font-medium">{member.engagementRate}%</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={getBadgeClass(member.engagementLevel)}>
                          {member.engagementLevel}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'proposals' && (
        <Card>
          <CardHeader>
            <CardTitle>Proposal Voting Outcome Report</CardTitle>
            <p className="text-sm text-muted-foreground">
              Approval Percentage = (Yes Votes / Total Votes) × 100. Mock voting examples use {TOTAL_MEMBERS} total members.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-border text-sm text-muted-foreground">
                    <th className="px-4 py-3 text-left">Proposal Title</th>
                    <th className="px-4 py-3 text-left">Proposed By</th>
                    <th className="px-4 py-3 text-center">Yes Votes</th>
                    <th className="px-4 py-3 text-center">No Votes</th>
                    <th className="px-4 py-3 text-center">Total Votes</th>
                    <th className="px-4 py-3 text-center">Approval %</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {proposalVotingOutcomeReport.map((proposal) => (
                    <tr key={proposal.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-4 font-medium">{proposal.title}</td>
                      <td className="px-4 py-4">{proposal.proposerName}</td>
                      <td className="px-4 py-4 text-center">{proposal.yesVotes}</td>
                      <td className="px-4 py-4 text-center">{proposal.noVotes}</td>
                      <td className="px-4 py-4 text-center">{proposal.totalVotes}</td>
                      <td className="px-4 py-4 text-center font-medium">{proposal.approvalPercentage}%</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={getBadgeClass(proposal.status)}>
                          {proposal.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{proposal.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

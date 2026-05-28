import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  MapPin,
  MessageSquare,
  Settings,
  ThumbsDown,
  ThumbsUp,
  Timer,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/textarea';
import {
  Activity,
  Proposal,
  ProposalPhase,
  ProposalReviewHistoryItem,
  ProposalReviewStatus,
  ProposalSettings,
  ProposalVoteFeedback,
  activities as initialActivities,
  getStoredProposalSettings,
  proposals as initialProposals,
  proposalVoteFeedbacks as initialProposalVoteFeedbacks,
  REQUIRED_YES_VOTES,
  saveStoredProposalSettings,
  TOTAL_MEMBERS,
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const APP_CURRENT_DATE = new Date('2026-05-15');

const phaseLabel: Record<ProposalPhase, string> = {
  submission: 'Submission',
  voting: 'Voting',
  closed: 'Closed',
};

const reviewStatusLabel: Record<ProposalReviewStatus, string> = {
  pending_review: 'Pending Review',
  revision_requested: 'Revision Requested',
  approved_for_voting: 'Approved for Voting',
  rejected: 'Rejected',
};

const formatDate = (date?: string) => {
  if (!date) return 'Not set';

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getProposalPhase = (proposal: Proposal): ProposalPhase => {
  if (proposal.phase) return proposal.phase;
  if (proposal.status === 'approved' || proposal.status === 'rejected') return 'closed';
  return 'submission';
};

const getReviewStatus = (proposal: Proposal): ProposalReviewStatus => {
  if (proposal.reviewStatus) return proposal.reviewStatus;
  if (proposal.status === 'approved') return 'approved_for_voting';
  if (proposal.status === 'rejected') return 'rejected';
  return 'pending_review';
};

const isVotingDeadlinePassed = (deadline: string) => APP_CURRENT_DATE > new Date(deadline);

const totalVotes = (proposal: Proposal) => proposal.yesVotes + proposal.noVotes;

const approvalRate = (proposal: Proposal) => {
  if (TOTAL_MEMBERS <= 0) return 0;
  return Math.round((proposal.yesVotes / TOTAL_MEMBERS) * 100);
};

const shouldAutoRejectProposal = (proposal: Proposal) => {
  return (
    getProposalPhase(proposal) === 'voting' &&
    getReviewStatus(proposal) === 'approved_for_voting' &&
    isVotingDeadlinePassed(proposal.votingDeadline) &&
    proposal.yesVotes < REQUIRED_YES_VOTES
  );
};

const applyAutoRejection = (proposalList: Proposal[]) => {
  return proposalList.map((proposal) => {
    if (!shouldAutoRejectProposal(proposal)) return proposal;

    return {
      ...proposal,
      phase: 'closed' as const,
      reviewStatus: 'rejected' as const,
      status: 'rejected' as const,
      rejectionReason: 'Did not reach the 80% voting requirement.',
    };
  });
};

export function ManageProposalsPage() {
  const { currentUser } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>(applyAutoRejection(initialProposals));
  const [proposalVoteFeedbacks] = useState<ProposalVoteFeedback[]>(initialProposalVoteFeedbacks);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [settings, setSettings] = useState<ProposalSettings>(() => getStoredProposalSettings());
  const [detailsProposal, setDetailsProposal] = useState<Proposal | null>(null);
  const [reviewAction, setReviewAction] = useState<{ proposalId: string; action: 'revision' | 'reject' } | null>(null);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    pending_review: true,
    revision_requested: true,
    approved_for_voting: true,
    rejected: false,
  });

  const updateSettings = (nextSettings: ProposalSettings) => {
    setSettings(nextSettings);
    saveStoredProposalSettings(nextSettings);
  };

  const handlePhaseChange = (phase: ProposalSettings['currentPhase']) => {
    updateSettings({
      ...settings,
      currentPhase: phase,
      // When the admin/coordinator chooses Submission Phase again,
      // open submissions automatically so members can submit/revise proposals.
      submissionsOpen: phase === 'submission',
    });
  };

  const toggleSubmissions = () => {
    updateSettings({
      ...settings,
      currentPhase: 'submission',
      submissionsOpen: !settings.submissionsOpen,
    });
  };

  const closeProposalCycle = () => {
    updateSettings({
      ...settings,
      currentPhase: 'closed',
      submissionsOpen: false,
    });
  };

  const appendReviewHistory = (
    proposal: Proposal,
    type: ProposalReviewHistoryItem['type'],
    message: string
  ): ProposalReviewHistoryItem[] => [
    ...(proposal.reviewFeedbackHistory || []),
    {
      id: `review-${Date.now()}`,
      type,
      officerId: currentUser?.id || 'officer',
      officerName: currentUser?.name || 'Officer',
      message,
      timestamp: new Date().toISOString(),
    },
  ];

  const openReviewModal = (proposalId: string, action: 'revision' | 'reject') => {
    setReviewAction({ proposalId, action });
    setReviewMessage('');
    setReviewError('');
  };

  const closeReviewModal = () => {
    setReviewAction(null);
    setReviewMessage('');
    setReviewError('');
  };

  const submitReviewAction = () => {
    if (!reviewAction || !currentUser) return;

    const proposal = proposals.find((item) => item.id === reviewAction.proposalId);
    const trimmedMessage = reviewMessage.trim();

    if (!proposal) return;

    if (!trimmedMessage) {
      setReviewError(
        reviewAction.action === 'revision'
          ? 'Feedback is required when requesting a revision.'
          : 'A rejection reason is required.'
      );
      return;
    }

    setProposals(proposals.map((item) => {
      if (item.id !== reviewAction.proposalId) return item;

      if (reviewAction.action === 'revision') {
        return {
          ...item,
          phase: 'submission' as const,
          reviewStatus: 'revision_requested' as const,
          status: 'pending' as const,
          reviewFeedbackHistory: appendReviewHistory(item, 'revision', trimmedMessage),
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        ...item,
        phase: 'closed' as const,
        reviewStatus: 'rejected' as const,
        status: 'rejected' as const,
        rejectionReason: trimmedMessage,
        reviewFeedbackHistory: appendReviewHistory(item, 'rejection', trimmedMessage),
        updatedAt: new Date().toISOString(),
      };
    }));

    if (detailsProposal?.id === reviewAction.proposalId) {
      setDetailsProposal(null);
    }

    closeReviewModal();
  };

  const approveForVoting = (proposalId: string) => {
    setProposals(proposals.map((proposal) =>
      proposal.id === proposalId
        ? {
            ...proposal,
            phase: 'voting' as const,
            reviewStatus: 'approved_for_voting' as const,
            status: 'pending' as const,
            updatedAt: new Date().toISOString(),
          }
        : proposal
    ));

    if (detailsProposal?.id === proposalId) {
      setDetailsProposal(null);
    }
  };

  const createActivityFromProposal = (proposal: Proposal) => {
    if (!currentUser) return;

    if (proposal.yesVotes < REQUIRED_YES_VOTES) {
      alert(`This proposal needs at least ${REQUIRED_YES_VOTES} Yes votes out of ${TOTAL_MEMBERS} members before creating an activity.`);
      return;
    }

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: proposal.title,
      description: proposal.description,
      date: proposal.proposedDate,
      location: proposal.location || 'TBD',
      organizer: currentUser.name,
      participants: [],
      status: 'upcoming',
      registrationOpen: true,
      attendanceOpen: false,
    };

    setActivities([newActivity, ...activities]);
    setProposals(proposals.map((item) =>
      item.id === proposal.id
        ? {
            ...item,
            phase: 'closed' as const,
            reviewStatus: 'approved_for_voting' as const,
            status: 'approved' as const,
            updatedAt: new Date().toISOString(),
          }
        : item
    ));

    alert(`Activity "${newActivity.title}" has been created.`);
  };

  const handleDelete = (proposalId: string, proposalTitle: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${proposalTitle}"? This action cannot be undone.`)) {
      setProposals(proposals.filter((proposal) => proposal.id !== proposalId));
      if (detailsProposal?.id === proposalId) setDetailsProposal(null);
    }
  };

  const getPhaseBadgeClass = (phase: ProposalPhase) => {
    switch (phase) {
      case 'submission':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'voting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed':
        return 'bg-slate-800 text-white border-slate-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getReviewBadgeClass = (status: ProposalReviewStatus) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'approved_for_voting':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const renderBadges = (proposal: Proposal) => {
    const phase = getProposalPhase(proposal);
    const reviewStatus = getReviewStatus(proposal);

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={getPhaseBadgeClass(phase)}>{phaseLabel[phase]}</Badge>
        <Badge variant="outline" className={getReviewBadgeClass(reviewStatus)}>{reviewStatusLabel[reviewStatus]}</Badge>
      </div>
    );
  };

  const renderVoteSummary = (proposal: Proposal) => {
    const rate = approvalRate(proposal);
    const total = totalVotes(proposal);

    return (
      <div className="bg-muted/40 rounded-xl p-4 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Votes</span>
          <span className="text-xl font-bold text-foreground">{total}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Approval Rate</span>
          <span className="text-xl font-bold text-primary">{rate}%</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Required: {REQUIRED_YES_VOTES} Yes votes / {TOTAL_MEMBERS} members.
          {proposal.yesVotes < REQUIRED_YES_VOTES
            ? ` Needs ${REQUIRED_YES_VOTES - proposal.yesVotes} more Yes vote(s).`
            : ' Requirement met.'}
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(rate, 100)}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 font-medium text-primary">
            <ThumbsUp className="w-4 h-4" />
            {proposal.yesVotes} Yes
          </div>
          <div className="flex items-center gap-1 justify-end font-medium text-red-800">
            <ThumbsDown className="w-4 h-4" />
            {proposal.noVotes} No
          </div>
        </div>
      </div>
    );
  };


  const renderCompactVoteSummary = (proposal: Proposal) => {
    const rate = approvalRate(proposal);
    const total = totalVotes(proposal);
    const neededVotes = Math.max(REQUIRED_YES_VOTES - proposal.yesVotes, 0);

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-700">Voting Progress</p>
            <p className="text-[11px] text-slate-500">{REQUIRED_YES_VOTES} Yes votes required out of {TOTAL_MEMBERS}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-950">{rate}%</p>
            <p className="text-[11px] text-slate-500">{total} vote(s)</p>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(rate, 100)}%` }} />
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-primary">
              <ThumbsUp className="w-3.5 h-3.5" />
              {proposal.yesVotes} Yes
            </span>
            <span className="flex items-center gap-1 font-medium text-red-800">
              <ThumbsDown className="w-3.5 h-3.5" />
              {proposal.noVotes} No
            </span>
          </div>
          <span className="text-slate-600 text-right">
            {neededVotes > 0 ? `Needs ${neededVotes} more` : 'Requirement met'}
          </span>
        </div>
      </div>
    );
  };


  const renderOfficerFeedback = (proposal: Proposal) => {
    const feedbacks = proposal.reviewFeedbackHistory || [];

    if (feedbacks.length === 0) return null;

    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-orange-950">
          <AlertTriangle className="w-5 h-5" />
          Review Feedback History
        </div>
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white/80 border border-orange-100 rounded-lg p-3">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
              <p className="text-sm font-semibold text-orange-950">
                {feedback.type === 'revision' ? 'Revision Requested' : 'Rejection Reason'} by {feedback.officerName}
              </p>
              <p className="text-xs text-orange-800">{formatDate(feedback.timestamp)}</p>
            </div>
            <p className="text-sm text-orange-950 leading-relaxed">{feedback.message}</p>
          </div>
        ))}
      </div>
    );
  };


  const getProposalVoteFeedbacks = (proposalId: string) => {
    return proposalVoteFeedbacks.filter((feedback) => feedback.proposalId === proposalId);
  };

  const renderVotingFeedbackSection = (proposal: Proposal) => {
    const feedbacks = getProposalVoteFeedbacks(proposal.id);
    const yesFeedbacks = feedbacks.filter((feedback) => feedback.vote === 'yes').length;
    const noFeedbacks = feedbacks.filter((feedback) => feedback.vote === 'no').length;

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-950">
              <MessageSquare className="w-5 h-5 text-primary" />
              Member Voting Feedback
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Feedback submitted by members when they voted on this proposal.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{yesFeedbacks} Yes feedback</Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{noFeedbacks} No feedback</Badge>
          </div>
        </div>

        {feedbacks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{feedback.userName}</p>
                    <p className="text-[11px] text-slate-500">{formatDate(feedback.timestamp)}</p>
                  </div>
                  <Badge variant="outline" className={feedback.vote === 'yes' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
                    {feedback.vote === 'yes' ? 'Voted Yes' : 'Voted No'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{feedback.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No member feedback yet.</p>
            <p className="text-xs text-slate-500 mt-1">Feedback will appear here once members vote and submit their comments.</p>
          </div>
        )}
      </div>
    );
  };

  const renderProposalActions = (proposal: Proposal) => {
    const phase = getProposalPhase(proposal);
    const reviewStatus = getReviewStatus(proposal);

    if (phase === 'submission' && reviewStatus !== 'rejected') {
      return (
        <div className="grid grid-cols-1 gap-2">
          <Button type="button" variant="outline" className="w-full gap-2 border-orange-300 text-orange-800 hover:bg-orange-50" onClick={() => openReviewModal(proposal.id, 'revision')}>
            <MessageSquare className="w-4 h-4" />
            Request Revision
          </Button>
          <Button type="button" className="w-full gap-2" onClick={() => approveForVoting(proposal.id)}>
            <CheckCircle className="w-4 h-4" />
            Approve for Voting
          </Button>
          <Button type="button" variant="outline" className="w-full gap-2 border-red-300 text-red-800 hover:bg-red-50" onClick={() => openReviewModal(proposal.id, 'reject')}>
            <XCircle className="w-4 h-4" />
            Reject Proposal
          </Button>
        </div>
      );
    }

    if (phase === 'voting' && reviewStatus === 'approved_for_voting') {
      return (
        <div className="space-y-2">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm font-medium text-yellow-900 text-center">
            Voting active. Member editing is locked.
          </div>
          <Button type="button" variant="outline" className="w-full gap-2" onClick={() => createActivityFromProposal(proposal)}>
            <CheckCircle className="w-4 h-4" />
            Create Activity if 80% Met
          </Button>
        </div>
      );
    }

    if (phase === 'closed' && proposal.status === 'approved') {
      return <div className="rounded-lg bg-emerald-100 text-emerald-900 px-3 py-2 text-sm font-medium text-center">Approved and activity-ready</div>;
    }

    if (reviewStatus === 'rejected') {
      return <div className="rounded-lg bg-red-100 text-red-900 px-3 py-2 text-sm font-medium text-center">Rejected and editing locked</div>;
    }

    return null;
  };


  const renderCompactProposalActions = (proposal: Proposal) => {
    const phase = getProposalPhase(proposal);
    const reviewStatus = getReviewStatus(proposal);

    if (phase === 'submission' && reviewStatus !== 'rejected') {
      return (
        <div className="space-y-2">
          <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => setDetailsProposal(proposal)}>
            <Eye className="w-4 h-4" />
            View Details
          </Button>
          <Button type="button" variant="outline" className="w-full justify-start gap-2 border-orange-300 text-orange-800 hover:bg-orange-50" onClick={() => openReviewModal(proposal.id, 'revision')}>
            <MessageSquare className="w-4 h-4" />
            Request Revision
          </Button>
          <Button type="button" className="w-full justify-start gap-2" onClick={() => approveForVoting(proposal.id)}>
            <CheckCircle className="w-4 h-4" />
            Approve for Voting
          </Button>
          <Button type="button" variant="outline" className="w-full justify-start gap-2 border-red-300 text-red-800 hover:bg-red-50" onClick={() => openReviewModal(proposal.id, 'reject')}>
            <XCircle className="w-4 h-4" />
            Reject Proposal
          </Button>
        </div>
      );
    }

    if (phase === 'voting' && reviewStatus === 'approved_for_voting') {
      return (
        <div className="space-y-2">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs font-medium text-yellow-900">
            Voting active. Member editing is locked.
          </div>
          <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => setDetailsProposal(proposal)}>
            <Eye className="w-4 h-4" />
            View Details
          </Button>
          <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => createActivityFromProposal(proposal)}>
            <CheckCircle className="w-4 h-4" />
            Create Activity
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {phase === 'closed' && proposal.status === 'approved' && (
          <div className="rounded-lg bg-emerald-100 text-emerald-900 px-3 py-2 text-xs font-medium">Approved and activity-ready</div>
        )}
        {reviewStatus === 'rejected' && (
          <div className="rounded-lg bg-red-100 text-red-900 px-3 py-2 text-xs font-medium">Rejected and editing locked</div>
        )}
        <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => setDetailsProposal(proposal)}>
          <Eye className="w-4 h-4" />
          View Details
        </Button>
      </div>
    );
  };

  const renderProposalCard = (proposal: Proposal) => {
    const phase = getProposalPhase(proposal);
    const reviewStatus = getReviewStatus(proposal);

    return (
      <Card key={proposal.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-4 items-start">
            <div className="min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground leading-tight">{proposal.title}</h3>
                  <p className="mt-1 text-sm text-slate-700 leading-relaxed line-clamp-2">{proposal.description}</p>
                </div>
                {renderBadges(proposal)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-700 rounded-lg bg-slate-50 px-3 py-2 min-w-0">
                  <User className="w-4 h-4 shrink-0" />
                  <span className="truncate">{proposal.proposerName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 rounded-lg bg-slate-50 px-3 py-2 min-w-0">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{proposal.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 rounded-lg bg-slate-50 px-3 py-2 min-w-0">
                  <Timer className="w-4 h-4 shrink-0" />
                  <span className="truncate">{proposal.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 rounded-lg bg-slate-50 px-3 py-2 min-w-0">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="truncate">{formatDate(proposal.proposedDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 rounded-lg bg-slate-50 px-3 py-2 min-w-0">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="truncate">Deadline: {formatDate(proposal.votingDeadline)}</span>
                </div>
              </div>

              {renderCompactVoteSummary(proposal)}

              <div className="flex items-center justify-between gap-3 flex-wrap border-t border-border pt-2 text-xs text-slate-600">
                <span>Phase: {phaseLabel[phase]} • Status: {reviewStatusLabel[reviewStatus]}</span>
                <button type="button" className="inline-flex items-center gap-1 text-red-800 hover:text-red-900 hover:underline" onClick={() => handleDelete(proposal.id, proposal.title)}>
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Proposal
                </button>
              </div>

              {renderOfficerFeedback(proposal)}
            </div>

            <aside className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review Actions</p>
                <p className="mt-1 text-xs text-slate-600">Choose the next action for this proposal.</p>
              </div>
              {renderCompactProposalActions(proposal)}
            </aside>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProposalDetails = (proposal: Proposal) => {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setDetailsProposal(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Proposals
        </Button>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2 min-w-0 flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{proposal.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{proposal.description}</p>
                  </div>
                  {renderBadges(proposal)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700 rounded-lg bg-slate-50 p-3"><User className="w-4 h-4" />{proposal.proposerName}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 rounded-lg bg-slate-50 p-3"><MapPin className="w-4 h-4" />{proposal.location}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 rounded-lg bg-slate-50 p-3"><Timer className="w-4 h-4" />{proposal.duration}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 rounded-lg bg-slate-50 p-3"><Calendar className="w-4 h-4" />{formatDate(proposal.proposedDate)}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 rounded-lg bg-slate-50 p-3 sm:col-span-2"><Clock className="w-4 h-4" />Voting deadline: {formatDate(proposal.votingDeadline)}</div>
                </div>

                {renderOfficerFeedback(proposal)}
                {renderVotingFeedbackSection(proposal)}
              </div>

              <div className="space-y-3 xl:sticky xl:top-4">
                {renderVoteSummary(proposal)}
                {renderProposalActions(proposal)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const groupedProposals = {
    pending_review: proposals.filter((proposal) => getReviewStatus(proposal) === 'pending_review'),
    revision_requested: proposals.filter((proposal) => getReviewStatus(proposal) === 'revision_requested'),
    approved_for_voting: proposals.filter((proposal) => getReviewStatus(proposal) === 'approved_for_voting'),
    rejected: proposals.filter((proposal) => getReviewStatus(proposal) === 'rejected'),
  };

  const renderSection = (key: keyof typeof groupedProposals, title: string) => {
    const isExpanded = expandedSections[key];
    const items = groupedProposals[key];

    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setExpandedSections({ ...expandedSections, [key]: !isExpanded })}
          className="flex items-center justify-between w-full rounded-xl border border-border bg-white px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-foreground">{title}</h2>
            <Badge variant="outline">{items.length}</Badge>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {isExpanded && (
          items.length > 0 ? (
            <div className="space-y-4">{items.map(renderProposalCard)}</div>
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground">No proposals in this section.</p>
            </div>
          )
        )}
      </div>
    );
  };

  if (detailsProposal) {
    const latestDetails = proposals.find((proposal) => proposal.id === detailsProposal.id) || detailsProposal;
    return renderProposalDetails(latestDetails);
  }

  const phaseDeadlineLabel = settings.currentPhase === 'voting' ? 'Voting Deadline' : settings.currentPhase === 'submission' ? 'Submission Deadline' : 'Phase Closed';
  const phaseDeadlineValue = settings.currentPhase === 'voting' ? settings.votingDeadline : settings.currentPhase === 'submission' ? settings.submissionDeadline : '';
  const phaseStatusLabel = settings.currentPhase === 'submission' ? `Submissions ${settings.submissionsOpen ? 'Open' : 'Closed'}` : settings.currentPhase === 'voting' ? 'Voting Active' : 'Phase Closed';
  const phaseStatusClass = settings.currentPhase === 'submission' && settings.submissionsOpen ? 'bg-green-100 text-green-700 border-green-200' : settings.currentPhase === 'voting' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-red-100 text-red-700 border-red-200';

  return (
    <div className="space-y-6">
      <div>
        <h1>Manage Proposals</h1>
        <p className="text-muted-foreground mt-1">Review member proposals, request revisions, approve for voting, or reject invalid submissions.</p>
      </div>

      <Card className="bg-gradient-to-r from-primary/15 to-accent/15 border-primary/30">
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
            <div>
              <div className="flex items-center gap-2 text-foreground font-semibold mb-2">
                <Clock className="w-5 h-5 text-primary" />
                Current Phase
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold capitalize">{settings.currentPhase}</h2>
                <Badge variant="outline" className={phaseStatusClass}>{phaseStatusLabel}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {settings.currentPhase === 'submission' && 'Members can submit and revise proposals while the phase is open.'}
                {settings.currentPhase === 'voting' && 'Voting is active. Member proposal editing should be locked.'}
                {settings.currentPhase === 'closed' && 'The proposal cycle is closed.'}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white/80 p-4 text-sm text-muted-foreground max-w-md">
              Members can submit proposals only within the configured dates. Review status controls whether revisions are allowed.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" />{phaseDeadlineLabel}</div>
              <p className="mt-2 font-semibold text-foreground">{formatDate(phaseDeadlineValue)}</p>
            </div>
            <div className="rounded-xl border border-border bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" />Proposed Date Range</div>
              <p className="mt-2 font-semibold text-foreground">{formatDate(settings.proposedDateStart)} - {formatDate(settings.proposedDateEnd)}</p>
            </div>
            <div className="rounded-xl border border-border bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Settings className="w-4 h-4" />Voting Rule</div>
              <p className="mt-2 font-semibold text-foreground">{REQUIRED_YES_VOTES}/{TOTAL_MEMBERS} Yes votes required</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white/80 p-4">
            <h3 className="font-semibold text-foreground mb-3">Proposal Schedule Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <label className="space-y-1 text-sm font-medium text-foreground">
                Current Phase
                <select value={settings.currentPhase} onChange={(event) => handlePhaseChange(event.target.value as ProposalSettings['currentPhase'])} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm">
                  <option value="submission">Submission Phase</option>
                  <option value="voting">Voting Phase</option>
                  <option value="closed">Closed Phase</option>
                </select>
              </label>
              {settings.currentPhase === 'submission' && (
                <label className="space-y-1 text-sm font-medium text-foreground">
                  Submission Deadline
                  <input type="date" value={settings.submissionDeadline || ''} onChange={(event) => updateSettings({ ...settings, submissionDeadline: event.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
                </label>
              )}
              {settings.currentPhase === 'voting' && (
                <label className="space-y-1 text-sm font-medium text-foreground">
                  Voting Deadline
                  <input type="date" value={settings.votingDeadline || ''} onChange={(event) => updateSettings({ ...settings, votingDeadline: event.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
                </label>
              )}
              <label className="space-y-1 text-sm font-medium text-foreground">
                Proposed Date Start
                <input type="date" value={settings.proposedDateStart || ''} onChange={(event) => updateSettings({ ...settings, proposedDateStart: event.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
              </label>
              <label className="space-y-1 text-sm font-medium text-foreground">
                Proposed Date End
                <input type="date" value={settings.proposedDateEnd || ''} onChange={(event) => updateSettings({ ...settings, proposedDateEnd: event.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
              </label>
              {settings.currentPhase === 'submission' ? (
                <Button
                  type="button"
                  variant={settings.submissionsOpen ? 'destructive' : 'primary'}
                  onClick={toggleSubmissions}
                >
                  {settings.submissionsOpen ? 'Close Submissions' : 'Open Submissions'}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant={settings.currentPhase === 'closed' ? 'outline' : 'destructive'}
                  onClick={closeProposalCycle}
                  disabled={settings.currentPhase === 'closed'}
                >
                  {settings.currentPhase === 'closed' ? 'Proposal Cycle Closed' : 'Close Proposal Cycle'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {renderSection('pending_review', 'Pending Review')}
      {renderSection('revision_requested', 'Revision Requested')}
      {renderSection('approved_for_voting', 'Approved for Voting')}
      {renderSection('rejected', 'Rejected')}

      <Modal isOpen={!!reviewAction} onClose={closeReviewModal} title={reviewAction?.action === 'revision' ? 'Request Revision' : 'Reject Proposal'} size="md">
        <div className="space-y-4">
          <div className={`rounded-lg border p-4 ${reviewAction?.action === 'revision' ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'}`}>
            <p className={`text-sm ${reviewAction?.action === 'revision' ? 'text-orange-950' : 'text-red-900'}`}>
              {reviewAction?.action === 'revision'
                ? 'Provide clear feedback. The proposal stays in Submission phase and the member can revise it.'
                : 'Provide a clear rejection reason. The proposal moves to Closed phase and editing is locked.'}
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="review-message" className="text-sm font-medium text-foreground">
              {reviewAction?.action === 'revision' ? 'Revision Feedback' : 'Rejection Reason'} <span className="text-red-700">*</span>
            </label>
            <Textarea id="review-message" value={reviewMessage} onChange={(event) => { setReviewMessage(event.target.value); setReviewError(''); }} className="min-h-28" placeholder={reviewAction?.action === 'revision' ? 'Example: Please revise the venue, date, or duration.' : 'Example: This proposal is duplicated or not aligned with UYA goals.'} />
            {reviewError && <p className="text-xs text-red-800">{reviewError}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button type="button" variant="outline" onClick={closeReviewModal}>Cancel</Button>
            <Button type="button" variant={reviewAction?.action === 'revision' ? 'primary' : 'outline'} onClick={submitReviewAction} className={reviewAction?.action === 'revision' ? 'gap-2' : 'gap-2 border-red-300 text-red-800 hover:bg-red-50'}>
              {reviewAction?.action === 'revision' ? <MessageSquare className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {reviewAction?.action === 'revision' ? 'Send Revision Request' : 'Reject Proposal'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Info,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Timer,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/textarea';
import {
  Proposal,
  ProposalPhase,
  ProposalReviewStatus,
  ProposalReviewHistoryItem,
  Vote,
  ProposalVoteFeedback,
  getStoredProposalSettings,
  proposals as initialProposals,
  votes as initialVotes,
  proposalVoteFeedbacks as initialProposalVoteFeedbacks,
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const REQUIRED_APPROVAL_RATE = 80;
const APP_CURRENT_DATE = new Date('2026-05-15');

type ProposalDisplayState = {
  phaseText: string;
  phaseClass: string;
  statusText: string;
  statusClass: string;
};

const formatDate = (date?: string) => {
  if (!date) return 'Not set';

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

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

export function ProposalsPage() {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [votes, setVotes] = useState<Vote[]>(initialVotes);
  const [proposalFeedbacks, setProposalFeedbacks] = useState<ProposalVoteFeedback[]>(initialProposalVoteFeedbacks);
  const [pendingVote, setPendingVote] = useState<{ proposalId: string; voteType: 'yes' | 'no' } | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [reviewAction, setReviewAction] = useState<{ proposalId: string; action: 'revision' | 'reject' } | null>(null);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [myProposalsExpanded, setMyProposalsExpanded] = useState(true);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    duration: '',
    proposedDate: '',
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const proposalSettings = getStoredProposalSettings();
  const isOfficer = currentUser?.role === 'admin' || currentUser?.role === 'coordinator';
  const isBlankCleanAccount = currentUser?.mockAccountType === 'blank-clean';
  const proposalsVisibleToCurrentUser = isBlankCleanAccount && !isOfficer ? [] : proposals;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const proposalIdFromUrl = params.get('proposalId');

    if (proposalIdFromUrl && proposalsVisibleToCurrentUser.some(proposal => proposal.id === proposalIdFromUrl)) {
      setSelectedProposalId(proposalIdFromUrl);
    }
  }, [location.search, proposalsVisibleToCurrentUser]);

  const getProposalPhase = (proposal: Proposal): ProposalPhase => {
    if (proposal.phase) return proposal.phase;
    if (proposal.status === 'approved' || proposal.status === 'rejected') return 'closed';
    return proposalSettings.currentPhase;
  };

  const getReviewStatus = (proposal: Proposal): ProposalReviewStatus => {
    if (proposal.reviewStatus) return proposal.reviewStatus;
    if (proposal.status === 'approved') return 'approved_for_voting';
    if (proposal.status === 'rejected') return 'rejected';
    return 'pending_review';
  };

  const getLegacyStatus = (phase: ProposalPhase, reviewStatus: ProposalReviewStatus): Proposal['status'] => {
    if (reviewStatus === 'rejected') return 'rejected';
    if (reviewStatus === 'approved_for_voting' && phase === 'closed') return 'approved';
    return 'pending';
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

  const isVotingExpired = (deadline: string) => APP_CURRENT_DATE > new Date(deadline);

  const totalVotes = (proposal: Proposal) => proposal.yesVotes + proposal.noVotes;

  const getApprovalPercentage = (proposal: Proposal) => {
    const total = totalVotes(proposal);
    return total > 0 ? Math.round((proposal.yesVotes / total) * 100) : 0;
  };

  const hasUserVoted = (proposalId: string): boolean => {
    if (!currentUser) return false;
    return votes.some(v => v.proposalId === proposalId && v.userId === currentUser.id);
  };

  const getUserVote = (proposalId: string): 'yes' | 'no' | null => {
    if (!currentUser) return null;
    const vote = votes.find(v => v.proposalId === proposalId && v.userId === currentUser.id);
    return vote ? vote.vote : null;
  };

  const canViewProposalFeedback = (proposal: Proposal) => {
    if (!currentUser) return false;

    return isOfficer || proposal.proposerId === currentUser.id;
  };

  const getVisibleFeedbacks = (proposal: Proposal) => {
    if (!canViewProposalFeedback(proposal)) return [];
    return proposalFeedbacks.filter(feedback => feedback.proposalId === proposal.id);
  };

  const getVisibleReviewFeedbacks = (proposal: Proposal) => {
    if (!canViewProposalFeedback(proposal)) return [];
    return proposal.reviewFeedbackHistory || [];
  };

  const canEditProposal = (proposal: Proposal) => {
    const phase = getProposalPhase(proposal);
    const reviewStatus = getReviewStatus(proposal);

    return Boolean(
      currentUser &&
      currentUser.role === 'member' &&
      proposal.proposerId === currentUser.id &&
      phase === 'submission' &&
      (reviewStatus === 'pending_review' || reviewStatus === 'revision_requested')
    );
  };

  const getEditLockNote = (proposal: Proposal) => {
    if (!currentUser || proposal.proposerId !== currentUser.id) return '';

    const phase = getProposalPhase(proposal);
    const reviewStatus = getReviewStatus(proposal);

    if (reviewStatus === 'rejected') {
      return 'This proposal was rejected and can no longer be edited.';
    }

    if (phase === 'voting' || reviewStatus === 'approved_for_voting') {
      return 'Editing is locked because voting has already started.';
    }

    if (phase === 'closed') {
      return 'Editing is locked because the proposal phase is already closed.';
    }

    return '';
  };

  const canVoteOnProposal = (proposal: Proposal) => {
    if (!currentUser || currentUser.role !== 'member') return false;
    if (proposal.proposerId === currentUser.id) return false;
    if (hasUserVoted(proposal.id)) return false;

    return (
      getProposalPhase(proposal) === 'voting' &&
      getReviewStatus(proposal) === 'approved_for_voting' &&
      !isVotingExpired(proposal.votingDeadline)
    );
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


  const getProposalDisplayState = (proposal: Proposal): ProposalDisplayState => {
    const phase = getProposalPhase(proposal);
    const reviewStatus = getReviewStatus(proposal);
    const approvalPercentage = getApprovalPercentage(proposal);
    const votingExpired = isVotingExpired(proposal.votingDeadline);

    if (phase === 'submission') {
      return {
        phaseText: 'Submission',
        phaseClass: getPhaseBadgeClass('submission'),
        statusText: reviewStatus === 'revision_requested' ? 'Revision Requested' : 'Under Review',
        statusClass: reviewStatus === 'revision_requested'
          ? getReviewBadgeClass('revision_requested')
          : getReviewBadgeClass('pending_review'),
      };
    }

    if (phase === 'voting') {
      if (votingExpired) {
        return {
          phaseText: 'Voting Ended',
          phaseClass: getPhaseBadgeClass('closed'),
          statusText: approvalPercentage >= REQUIRED_APPROVAL_RATE ? 'Passed Vote' : 'Failed Vote',
          statusClass: approvalPercentage >= REQUIRED_APPROVAL_RATE
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-red-100 text-red-800 border-red-200',
        };
      }

      return {
        phaseText: 'Voting',
        phaseClass: getPhaseBadgeClass('voting'),
        statusText: 'Open for Voting',
        statusClass: 'bg-green-100 text-green-800 border-green-200',
      };
    }

    return {
      phaseText: 'Closed',
      phaseClass: getPhaseBadgeClass('closed'),
      statusText: proposal.status === 'approved' || approvalPercentage >= REQUIRED_APPROVAL_RATE ? 'Approved' : 'Rejected',
      statusClass: proposal.status === 'approved' || approvalPercentage >= REQUIRED_APPROVAL_RATE
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-red-100 text-red-800 border-red-200',
    };
  };

  const getVotingAvailabilityNote = (proposal: Proposal) => {
    if (!currentUser || currentUser.role !== 'member') return '';

    const phase = getProposalPhase(proposal);
    const reviewStatus = getReviewStatus(proposal);

    if (proposal.proposerId === currentUser.id) {
      return 'You cannot vote on your own proposal.';
    }

    if (hasUserVoted(proposal.id)) {
      const userVote = getUserVote(proposal.id);
      return `You already voted ${userVote?.toUpperCase()}.`;
    }

    if (phase === 'submission') {
      return 'Voting is not available yet. This proposal is still under review.';
    }

    if (phase === 'closed' || isVotingExpired(proposal.votingDeadline)) {
      return 'Voting is already closed for this proposal.';
    }

    if (reviewStatus !== 'approved_for_voting') {
      return 'Voting is not available for this proposal.';
    }

    return '';
  };

  const getOwnerStatusMessage = (proposal: Proposal) => {
    const phase = getProposalPhase(proposal);
    const reviewStatus = getReviewStatus(proposal);
    const approvalPercentage = getApprovalPercentage(proposal);

    if (reviewStatus === 'revision_requested') {
      return 'Revision requested. Open the proposal details or edit form to review the officer feedback before resubmitting.';
    }

    if (reviewStatus === 'rejected') {
      return proposal.rejectionReason || 'Rejected. Open the details to review the reason or officer feedback.';
    }

    if (reviewStatus === 'approved_for_voting' && phase === 'voting') {
      return 'Approved for voting. Editing is now locked while members vote on your proposal.';
    }

    if (reviewStatus === 'approved_for_voting' && phase === 'closed') {
      return `Voting ended with ${approvalPercentage}% approval.`;
    }

    return 'Submitted for officer review. You may still edit this proposal while it remains in the Submission phase.';
  };

  const openEditProposal = (event: React.MouseEvent, proposal: Proposal) => {
    event.stopPropagation();
    setEditSuccess('');

    if (!canEditProposal(proposal)) {
      setEditError(getEditLockNote(proposal) || 'You are not allowed to edit this proposal.');
      return;
    }

    setEditingProposalId(proposal.id);
    setEditForm({
      title: proposal.title,
      description: proposal.description,
      location: proposal.location,
      duration: proposal.duration,
      proposedDate: proposal.proposedDate,
    });
    setEditError('');
  };

  const closeEditProposal = () => {
    setEditingProposalId(null);
    setEditForm({ title: '', description: '', location: '', duration: '', proposedDate: '' });
    setEditError('');
  };

  const handleSaveProposalChanges = () => {
    if (!currentUser || !editingProposalId) return;

    const proposal = proposals.find(p => p.id === editingProposalId);

    if (!proposal) {
      setEditError('Proposal not found.');
      return;
    }

    if (proposal.proposerId !== currentUser.id || currentUser.role !== 'member') {
      setEditError('Access denied. You can only edit your own proposals.');
      return;
    }

    if (getProposalPhase(proposal) !== 'submission') {
      setEditError(getEditLockNote(proposal) || 'Editing is locked for the current proposal phase.');
      return;
    }

    const reviewStatus = getReviewStatus(proposal);
    if (reviewStatus !== 'pending_review' && reviewStatus !== 'revision_requested') {
      setEditError(getEditLockNote(proposal) || 'Editing is locked because this proposal has already been reviewed.');
      return;
    }

    const trimmedTitle = editForm.title.trim();
    const trimmedDescription = editForm.description.trim();
    const trimmedLocation = editForm.location.trim();
    const trimmedDuration = editForm.duration.trim();

    if (!trimmedTitle || !trimmedDescription || !trimmedLocation || !trimmedDuration || !editForm.proposedDate) {
      setEditError('Title, description, venue/location, duration, and proposed date are required.');
      return;
    }

    if (proposalSettings.proposedDateStart && editForm.proposedDate < proposalSettings.proposedDateStart) {
      setEditError(`Proposed date must not be earlier than ${formatDate(proposalSettings.proposedDateStart)}.`);
      return;
    }

    if (proposalSettings.proposedDateEnd && editForm.proposedDate > proposalSettings.proposedDateEnd) {
      setEditError(`Proposed date must not be later than ${formatDate(proposalSettings.proposedDateEnd)}.`);
      return;
    }

    setProposals(proposals.map(p => {
      if (p.id !== editingProposalId) return p;

      return {
        ...p,
        title: trimmedTitle,
        description: trimmedDescription,
        location: trimmedLocation,
        duration: trimmedDuration,
        proposedDate: editForm.proposedDate,
        phase: 'submission',
        reviewStatus: 'pending_review',
        status: 'pending',
        updatedAt: new Date().toISOString(),
      };
    }));

    closeEditProposal();
    setSelectedProposalId(null);
    setEditSuccess('Proposal updated successfully. It was returned to Pending Review for admin/coordinator checking.');
  };

  const openReviewModal = (proposalId: string, action: 'revision' | 'reject') => {
    if (!isOfficer) return;
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
    if (!currentUser || !isOfficer || !reviewAction) return;

    const proposal = proposals.find(p => p.id === reviewAction.proposalId);
    const trimmedMessage = reviewMessage.trim();

    if (!proposal) return;

    if (!trimmedMessage) {
      setReviewError(
        reviewAction.action === 'revision'
          ? 'Please add feedback explaining what the member needs to revise.'
          : 'Please add a rejection reason.'
      );
      return;
    }

    setProposals(proposals.map(p => {
      if (p.id !== reviewAction.proposalId) return p;

      if (reviewAction.action === 'revision') {
        return {
          ...p,
          phase: 'submission',
          reviewStatus: 'revision_requested',
          status: 'pending',
          reviewFeedbackHistory: appendReviewHistory(p, 'revision', trimmedMessage),
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        ...p,
        phase: 'closed',
        reviewStatus: 'rejected',
        status: 'rejected',
        rejectionReason: trimmedMessage,
        reviewFeedbackHistory: appendReviewHistory(p, 'rejection', trimmedMessage),
        updatedAt: new Date().toISOString(),
      };
    }));

    addNotification({
      type: 'proposal',
      title: reviewAction.action === 'revision' ? 'Revision Requested' : 'Proposal Rejected',
      message:
        reviewAction.action === 'revision'
          ? `Your proposal "${proposal.title}" needs revisions. Open it to view the feedback.`
          : `Your proposal "${proposal.title}" was rejected. Open it to view the reason.`,
      relatedId: proposal.id,
      actionUrl: `/proposals?proposalId=${proposal.id}`,
      actionLabel: reviewAction.action === 'revision' ? 'Revise proposal' : 'View reason',
      targetUserIds: [proposal.proposerId],
    });

    closeReviewModal();
  };

  const handleApproveForVoting = (proposalId: string) => {
    if (!currentUser || !isOfficer) return;

    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;

    setProposals(proposals.map(p =>
      p.id === proposalId
        ? {
            ...p,
            phase: 'voting',
            reviewStatus: 'approved_for_voting',
            status: 'pending',
            updatedAt: new Date().toISOString(),
          }
        : p
    ));

    addNotification({
      type: 'proposal',
      title: 'Proposal Approved for Voting',
      message: `Your proposal "${proposal.title}" was approved for voting. Editing is now locked.`,
      relatedId: proposalId,
      actionUrl: `/proposals?proposalId=${proposalId}`,
      actionLabel: 'View status',
      targetUserIds: [proposal.proposerId],
    });
  };

  const handleDeleteProposal = (proposalId: string) => {
    if (!currentUser || !isOfficer) return;

    setProposals(proposals.filter(p => p.id !== proposalId));
    setVotes(votes.filter(v => v.proposalId !== proposalId));
    setProposalFeedbacks(proposalFeedbacks.filter(f => f.proposalId !== proposalId));

    if (selectedProposalId === proposalId) {
      setSelectedProposalId(null);
    }
  };

  const handleVote = (proposalId: string, voteType: 'yes' | 'no') => {
    const proposal = proposalsVisibleToCurrentUser.find(p => p.id === proposalId);

    if (!currentUser || !proposal) return;

    if (!canVoteOnProposal(proposal)) {
      alert('Voting is not available for this proposal.');
      return;
    }

    setPendingVote({ proposalId, voteType });
    setFeedbackMessage('');
    setFeedbackError('');
  };

  const closeFeedbackModal = () => {
    setPendingVote(null);
    setFeedbackMessage('');
    setFeedbackError('');
  };

  const submitVoteFeedback = () => {
    if (!currentUser || !pendingVote) return;

    const proposal = proposals.find(p => p.id === pendingVote.proposalId);
    const trimmedFeedback = feedbackMessage.trim();

    if (!proposal) return;

    if (!trimmedFeedback) {
      setFeedbackError('Please share your thoughts before submitting your vote.');
      return;
    }

    const newVote: Vote = {
      id: `vote-${Date.now()}`,
      proposalId: pendingVote.proposalId,
      userId: currentUser.id,
      vote: pendingVote.voteType,
      timestamp: new Date().toISOString(),
    };

    const newFeedback: ProposalVoteFeedback = {
      id: `feedback-${Date.now()}`,
      proposalId: pendingVote.proposalId,
      userId: currentUser.id,
      userName: currentUser.name,
      vote: pendingVote.voteType,
      message: trimmedFeedback,
      timestamp: new Date().toISOString(),
    };

    setVotes([...votes, newVote]);
    setProposalFeedbacks([...proposalFeedbacks, newFeedback]);
    setProposals(proposals.map(p => {
      if (p.id !== pendingVote.proposalId) return p;

      return {
        ...p,
        yesVotes: pendingVote.voteType === 'yes' ? p.yesVotes + 1 : p.yesVotes,
        noVotes: pendingVote.voteType === 'no' ? p.noVotes + 1 : p.noVotes,
        voters: [...p.voters, currentUser.id],
      };
    }));

    if (proposal.proposerId !== currentUser.id) {
      addNotification({
        type: 'vote',
        title: 'Anonymous Vote Received',
        message: `A member voted ${pendingVote.voteType.toUpperCase()} and left feedback on your proposal "${proposal.title}". Voter names are hidden for privacy.`,
        relatedId: pendingVote.proposalId,
        actionUrl: `/proposals?proposalId=${pendingVote.proposalId}`,
        actionLabel: 'View my proposal',
        targetUserIds: [proposal.proposerId],
      });
    }

    addNotification({
      type: 'vote',
      title: 'Proposal Vote Update',
      message: `${currentUser.name} voted ${pendingVote.voteType.toUpperCase()} on "${proposal.title}". Review the updated voting progress and feedback.`,
      relatedId: pendingVote.proposalId,
      actionUrl: `/proposals?proposalId=${pendingVote.proposalId}`,
      actionLabel: 'Review proposal',
      targetRoles: ['admin', 'coordinator'],
    });

    closeFeedbackModal();
  };

  const selectedProposal = selectedProposalId
    ? proposalsVisibleToCurrentUser.find(proposal => proposal.id === selectedProposalId) || null
    : null;

  const myProposals = currentUser?.role === 'member'
    ? proposalsVisibleToCurrentUser.filter(proposal => proposal.proposerId === currentUser.id)
    : [];

  const otherProposals = currentUser?.role === 'member'
    ? proposalsVisibleToCurrentUser.filter(proposal => proposal.proposerId !== currentUser.id)
    : proposalsVisibleToCurrentUser;

  const hasSubmittedFeedback = (proposalId: string): boolean => {
    if (!currentUser) return false;
    return proposalFeedbacks.some(feedback => feedback.proposalId === proposalId && feedback.userId === currentUser.id);
  };

  const renderPhaseAndStatusBadges = (proposal: Proposal) => {
    const display = getProposalDisplayState(proposal);

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={`${display.phaseClass} shrink-0`}>
          {display.phaseText}
        </Badge>
        <Badge variant="outline" className={`${display.statusClass} shrink-0`}>
          {display.statusText}
        </Badge>
      </div>
    );
  };

  const renderLatestOfficerFeedback = (proposal: Proposal) => {
    const reviewStatus = getReviewStatus(proposal);
    const latestFeedback = [...(proposal.reviewFeedbackHistory || [])].reverse()[0];

    if (!latestFeedback) return null;

    const isRevision = reviewStatus === 'revision_requested' || latestFeedback.type === 'revision';

    return (
      <div className={`rounded-lg border px-3 py-2 text-xs ${
        isRevision
          ? 'bg-orange-50 text-orange-950 border-orange-300'
          : 'bg-red-50 text-red-950 border-red-300'
      }`}>
        <div className="font-semibold mb-1">
          {isRevision ? 'Revision feedback' : 'Officer feedback'}
        </div>
        <p className="leading-relaxed line-clamp-2">{latestFeedback.message}</p>
      </div>
    );
  };

  const renderProposalCard = (proposal: Proposal) => {
    const total = totalVotes(proposal);
    const yesPercentage = total > 0 ? (proposal.yesVotes / total) * 100 : 0;
    const isOwnProposal = proposal.proposerId === currentUser?.id;
    const voted = hasUserVoted(proposal.id);
    const userVote = getUserVote(proposal.id);
    const feedbackSubmitted = hasSubmittedFeedback(proposal.id);
    const phase = getProposalPhase(proposal);
    const reviewStatus = getReviewStatus(proposal);
    const votingExpired = isVotingExpired(proposal.votingDeadline);

    return (
      <Card
        key={proposal.id}
        onClick={() => setSelectedProposalId(proposal.id)}
        className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden bg-white border-slate-300"
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground leading-tight truncate">{proposal.title}</h3>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed line-clamp-2">{proposal.description}</p>
              </div>
              {renderPhaseAndStatusBadges(proposal)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-700 rounded-lg bg-slate-50 px-3 py-2">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{proposal.proposerName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 rounded-lg bg-slate-50 px-3 py-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{proposal.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 rounded-lg bg-slate-50 px-3 py-2">
                <Timer className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{proposal.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 rounded-lg bg-slate-50 px-3 py-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{formatDate(proposal.proposedDate)}</span>
              </div>
              <div className={`flex items-center gap-2 text-xs rounded-lg bg-slate-50 px-3 py-2 ${votingExpired ? 'text-red-900 font-medium' : 'text-slate-700'}`}>
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Deadline: {formatDate(proposal.votingDeadline)}</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3 text-xs mb-2">
                <span className="font-semibold text-slate-800">Voting Summary</span>
                <span className="font-semibold text-slate-900">{total} total votes</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex items-center justify-between rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs">
                  <span className="flex items-center gap-1 font-semibold text-teal-900">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Yes Votes
                  </span>
                  <span className="text-sm font-bold text-teal-950">{proposal.yesVotes}</span>
                </div>

                <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs">
                  <span className="flex items-center gap-1 font-semibold text-red-900">
                    <ThumbsDown className="w-3.5 h-3.5" />
                    No Votes
                  </span>
                  <span className="text-sm font-bold text-red-950">{proposal.noVotes}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-primary transition-all" style={{ width: `${yesPercentage}%` }} />
                </div>
                <span className="text-xs font-semibold text-slate-800 shrink-0">
                  {Math.round(yesPercentage)}% approval
                </span>
              </div>
            </div>

            <div
              className={`grid gap-2 ${isOwnProposal && canEditProposal(proposal) ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 border-slate-300 text-slate-800 hover:bg-slate-50"
                onClick={() => setSelectedProposalId(proposal.id)}
              >
                <Eye className="w-4 h-4" />
                View Details
              </Button>

              {isOwnProposal && canEditProposal(proposal) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/10"
                  onClick={(event) => openEditProposal(event, proposal)}
                >
                  <Pencil className="w-4 h-4" />
                  Edit Proposal
                </Button>
              )}
            </div>

            {isOfficer && phase === 'submission' && reviewStatus !== 'rejected' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" onClick={(event) => event.stopPropagation()}>
                <Button type="button" variant="outline" size="sm" className="gap-2 border-orange-300 text-orange-800 hover:bg-orange-50" onClick={() => openReviewModal(proposal.id, 'revision')}>
                  <MessageSquare className="w-4 h-4" />
                  Request Revision
                </Button>
                <Button type="button" variant="primary" size="sm" className="gap-2" onClick={() => handleApproveForVoting(proposal.id)}>
                  <CheckCircle className="w-4 h-4" />
                  Approve for Voting
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-2 border-red-300 text-red-800 hover:bg-red-50" onClick={() => openReviewModal(proposal.id, 'reject')}>
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>

          {canVoteOnProposal(proposal) && (
            <div
              className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <p className="text-sm font-semibold text-slate-900">Cast your vote</p>
                <p className="text-xs text-slate-600">A feedback pop-up will open after choosing Yes or No.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); handleVote(proposal.id, 'yes'); }}
                  variant="primary"
                  size="sm"
                  className="w-full gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Vote Yes
                </Button>
                <Button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); handleVote(proposal.id, 'no'); }}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-red-300 text-red-800 hover:bg-red-50"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Vote No
                </Button>
              </div>
            </div>
          )}

          {voted && !isOwnProposal && !isOfficer && (
            <div className="text-xs text-center py-2 mt-3 bg-slate-50 text-slate-700 rounded">
              You voted: <span className="font-medium capitalize">{userVote}</span>
              {feedbackSubmitted && <span className="font-medium text-green-700"> • Feedback submitted</span>}
            </div>
          )}

          {!canVoteOnProposal(proposal) && !isOwnProposal && !isOfficer && getVotingAvailabilityNote(proposal) && (
            <div className="text-xs text-center py-2 mt-3 bg-slate-50 text-slate-700 rounded">
              {getVotingAvailabilityNote(proposal)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderExpandedProposal = (proposal: Proposal) => {
    const total = totalVotes(proposal);
    const yesPercentage = total > 0 ? (proposal.yesVotes / total) * 100 : 0;
    const noPercentage = total > 0 ? (proposal.noVotes / total) * 100 : 0;
    const isOwnProposal = proposal.proposerId === currentUser?.id;
    const voted = hasUserVoted(proposal.id);
    const userVote = getUserVote(proposal.id);
    const visibleFeedbacks = getVisibleFeedbacks(proposal);
    const visibleReviewFeedbacks = getVisibleReviewFeedbacks(proposal);
    const feedbackSubmitted = hasSubmittedFeedback(proposal.id);
    const phase = getProposalPhase(proposal);
    const reviewStatus = getReviewStatus(proposal);

    return (
      <div className="space-y-6">
        <Button type="button" variant="outline" onClick={() => setSelectedProposalId(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Proposals
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2 flex-1 min-w-[240px]">
                <CardTitle>{proposal.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  {proposal.proposerName}
                </div>
              </div>
              {renderPhaseAndStatusBadges(proposal)}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-sm text-slate-700 leading-relaxed">{proposal.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-700 rounded-lg bg-muted/40 p-3">
                <MapPin className="w-4 h-4" />
                {proposal.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 rounded-lg bg-muted/40 p-3">
                <Timer className="w-4 h-4" />
                {proposal.duration}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 rounded-lg bg-muted/40 p-3">
                <Calendar className="w-4 h-4" />
                Proposed date: {formatDate(proposal.proposedDate)}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 rounded-lg bg-muted/40 p-3">
                <Clock className="w-4 h-4" />
                Voting deadline: {formatDate(proposal.votingDeadline)}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Vote Summary</span>
                <span className="text-muted-foreground">{total} total votes</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary font-medium">Yes: {proposal.yesVotes}</span>
                  <span className="text-red-800 font-medium">No: {proposal.noVotes}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary transition-all" style={{ width: `${yesPercentage}%` }} />
                  <div className="h-full bg-red-700 transition-all" style={{ width: `${noPercentage}%` }} />
                </div>
              </div>
            </div>

            {isOwnProposal && (
              <div className={`rounded-lg border p-4 space-y-3 ${
                reviewStatus === 'revision_requested'
                  ? 'bg-orange-50 border-orange-300 text-orange-950'
                  : reviewStatus === 'rejected'
                  ? 'bg-red-50 border-red-300 text-red-950'
                  : reviewStatus === 'approved_for_voting'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}>
                <div className="font-semibold">{reviewStatusLabel[reviewStatus]}</div>
                <p className="text-sm leading-relaxed">{getOwnerStatusMessage(proposal)}</p>
              </div>
            )}

            {isOwnProposal && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Proposal editing</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Editable only during Submission phase while the status is Pending Review or Revision Requested.
                  </p>
                </div>
                {canEditProposal(proposal) ? (
                  <Button type="button" variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/10" onClick={(event) => openEditProposal(event, proposal)}>
                    <Pencil className="w-4 h-4" />
                    Edit Proposal
                  </Button>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                    {getEditLockNote(proposal) || 'Editing is not available for this proposal.'}
                  </div>
                )}
              </div>
            )}

            {isOfficer && phase === 'submission' && reviewStatus !== 'rejected' && (
              <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
                <div>
                  <p className="text-sm font-semibold text-foreground">Officer Review Actions</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Request minor corrections, approve the proposal for voting, or reject it with a clear reason.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button type="button" variant="outline" className="w-full gap-2 border-orange-300 text-orange-800 hover:bg-orange-50" onClick={() => openReviewModal(proposal.id, 'revision')}>
                    <MessageSquare className="w-4 h-4" />
                    Request Revision
                  </Button>
                  <Button type="button" variant="primary" className="w-full gap-2" onClick={() => handleApproveForVoting(proposal.id)}>
                    <CheckCircle className="w-4 h-4" />
                    Approve for Voting
                  </Button>
                  <Button type="button" variant="outline" className="w-full gap-2 border-red-300 text-red-800 hover:bg-red-50" onClick={() => openReviewModal(proposal.id, 'reject')}>
                    <XCircle className="w-4 h-4" />
                    Reject Proposal
                  </Button>
                </div>
              </div>
            )}

            {canVoteOnProposal(proposal) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button onClick={() => handleVote(proposal.id, 'yes')} variant="primary" className="gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  Vote Yes
                </Button>
                <Button onClick={() => handleVote(proposal.id, 'no')} variant="outline" className="gap-2 border-red-300 text-red-800 hover:bg-red-50">
                  <ThumbsDown className="w-4 h-4" />
                  Vote No
                </Button>
              </div>
            )}

            {voted && !isOwnProposal && (
              <div className="text-sm text-center py-3 bg-muted/50 rounded-lg">
                You voted: <span className="font-medium capitalize">{userVote}</span>
                {feedbackSubmitted && <span className="font-medium text-green-700"> • Feedback submitted</span>}
              </div>
            )}

            {!canVoteOnProposal(proposal) && !isOwnProposal && !isOfficer && getVotingAvailabilityNote(proposal) && !voted && (
              <div className="text-sm text-center py-3 bg-muted/50 rounded-lg text-slate-700">
                {getVotingAvailabilityNote(proposal)}
              </div>
            )}

            {visibleReviewFeedbacks.length > 0 && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-950">
                  <AlertTriangle className="w-4 h-4" />
                  Admin/Coordinator Feedback History
                </div>
                <div className="space-y-2">
                  {visibleReviewFeedbacks.map(feedback => (
                    <div key={feedback.id} className="rounded-lg bg-white/70 border border-orange-100 p-3">
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-semibold text-orange-950">
                          {feedback.type === 'revision' ? 'Revision Requested' : 'Rejection Reason'} by {feedback.officerName}
                        </span>
                        <span className="text-xs text-orange-800">{formatDate(feedback.timestamp)}</span>
                      </div>
                      <p className="text-sm text-orange-950 leading-relaxed">{feedback.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canViewProposalFeedback(proposal) && (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Voting feedback from members
                </div>
                {visibleFeedbacks.length > 0 ? (
                  <div className="space-y-2">
                    {visibleFeedbacks.map((feedback, index) => (
                      <div key={feedback.id} className="rounded-lg border border-border bg-muted/40 p-3">
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <div className="text-xs font-medium text-foreground">
                            {isOfficer ? feedback.userName : `Anonymous Member #${index + 1}`}
                          </div>
                          <Badge variant="outline" className={feedback.vote === 'yes' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
                            Voted {feedback.vote.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{feedback.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-center text-muted-foreground py-6 bg-muted/30 rounded-lg border border-dashed border-border">
                    No voting feedback submitted yet for this proposal.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (selectedProposal) {
    return renderExpandedProposal(selectedProposal);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Activity Proposals</h1>
          <p className="text-muted-foreground mt-1">Submit, review, revise, and vote on member activity proposals.</p>
        </div>
        {currentUser?.role === 'member' && (
          <Button onClick={() => navigate('/proposals/create')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Proposal
          </Button>
        )}
      </div>

      {editSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {editSuccess}
        </div>
      )}

      <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/40">
        <CardContent className="p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <Info className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-[220px]">
              <h3 className="font-semibold text-foreground mb-2">Proposal Workflow</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Submission</Badge>
                <span className="text-xs text-muted-foreground">Review and revisions</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Voting</Badge>
                <span className="text-xs text-muted-foreground">Member votes</span>
                <Badge variant="outline" className="bg-slate-800 text-white border-slate-800">Closed</Badge>
                <span className="text-xs text-muted-foreground">Final result</span>
              </div>
            </div>
            <div className="bg-muted/40 rounded-lg p-4 border border-primary/30">
              <p className="text-sm text-foreground font-medium mb-1">Current module phase</p>
              <p className="text-xs text-muted-foreground capitalize">{proposalSettings.currentPhase}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentUser?.role === 'member' && myProposals.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setMyProposalsExpanded(!myProposalsExpanded)}
            className="flex items-center gap-3 w-full p-4 bg-gradient-to-r from-secondary/20 to-accent/20 hover:from-secondary/30 hover:to-accent/30 border-2 border-secondary/40 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md group"
          >
            <div className="flex items-center gap-3 flex-1">
              <h2 className="text-xl font-semibold text-foreground">My Proposals</h2>
              <Badge variant="default" className="bg-secondary">{myProposals.length}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary font-medium">
              <span className="hidden sm:inline">{myProposalsExpanded ? 'Click to hide' : 'Click to show'}</span>
              {myProposalsExpanded ? <ChevronUp className="w-6 h-6 text-secondary" /> : <ChevronDown className="w-6 h-6 text-secondary" />}
            </div>
          </button>
          {myProposalsExpanded && <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{myProposals.map(renderProposalCard)}</div>}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">{currentUser?.role === 'member' && myProposals.length > 0 ? 'Other Proposals' : 'All Proposals'}</h2>
          <Badge variant="outline">{currentUser?.role === 'member' ? otherProposals.length : proposalsVisibleToCurrentUser.length}</Badge>
        </div>

        {currentUser?.role === 'member' ? (
          otherProposals.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{otherProposals.map(renderProposalCard)}</div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground">No other proposals yet</p>
            </div>
          )
        ) : proposalsVisibleToCurrentUser.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{proposalsVisibleToCurrentUser.map(renderProposalCard)}</div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground">No proposals yet</p>
          </div>
        )}
      </div>

      <Modal isOpen={!!editingProposalId} onClose={closeEditProposal} title="Edit Proposal" size="lg">
        <div className="space-y-4">
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
            <p className="text-sm text-foreground">
              You may update only the title, description, venue/location, duration, and proposed date. Saving a revision returns the status to Pending Review.
            </p>
          </div>

          {editingProposalId && renderLatestOfficerFeedback(proposals.find(p => p.id === editingProposalId) as Proposal)}

          {editError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{editError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="edit-proposal-title" className="text-sm font-medium text-foreground">Proposal Title <span className="text-red-700">*</span></label>
              <input id="edit-proposal-title" type="text" value={editForm.title} onChange={(event) => { setEditForm({ ...editForm, title: event.target.value }); setEditError(''); }} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Enter proposal title" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="edit-proposal-description" className="text-sm font-medium text-foreground">Description <span className="text-red-700">*</span></label>
              <Textarea id="edit-proposal-description" value={editForm.description} onChange={(event) => { setEditForm({ ...editForm, description: event.target.value }); setEditError(''); }} className="min-h-32" placeholder="Describe your proposal" />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-proposal-location" className="text-sm font-medium text-foreground">Venue / Location <span className="text-red-700">*</span></label>
              <input id="edit-proposal-location" type="text" value={editForm.location} onChange={(event) => { setEditForm({ ...editForm, location: event.target.value }); setEditError(''); }} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g., UYA Activity Area" />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-proposal-duration" className="text-sm font-medium text-foreground">Duration <span className="text-red-700">*</span></label>
              <input id="edit-proposal-duration" type="text" value={editForm.duration} onChange={(event) => { setEditForm({ ...editForm, duration: event.target.value }); setEditError(''); }} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g., 3 hours" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="edit-proposal-date" className="text-sm font-medium text-foreground">Proposed Date <span className="text-red-700">*</span></label>
              <input id="edit-proposal-date" type="date" value={editForm.proposedDate} min={proposalSettings.proposedDateStart} max={proposalSettings.proposedDateEnd} onChange={(event) => { setEditForm({ ...editForm, proposedDate: event.target.value }); setEditError(''); }} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground">Allowed date range: {formatDate(proposalSettings.proposedDateStart)} to {formatDate(proposalSettings.proposedDateEnd)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button type="button" variant="outline" onClick={closeEditProposal}>Cancel</Button>
            <Button type="button" onClick={handleSaveProposalChanges} className="gap-2"><Pencil className="w-4 h-4" />Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!pendingVote} onClose={closeFeedbackModal} title="Share your thoughts on this proposal" size="md">
        <div className="space-y-4">
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
            <p className="text-sm text-foreground">You selected <span className="font-semibold uppercase">{pendingVote?.voteType}</span>. Add short feedback so the proposer and officers can understand your vote.</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="proposal-feedback" className="text-sm font-medium text-foreground">Thoughts on this proposal</label>
            <Textarea id="proposal-feedback" value={feedbackMessage} onChange={(event) => { setFeedbackMessage(event.target.value); setFeedbackError(''); }} placeholder="Example: This activity is helpful because..." className="min-h-28" />
            {feedbackError && <p className="text-xs text-red-800">{feedbackError}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button type="button" variant="outline" onClick={closeFeedbackModal}>Cancel</Button>
            <Button type="button" onClick={submitVoteFeedback} className="gap-2"><MessageSquare className="w-4 h-4" />Submit Vote & Feedback</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!reviewAction} onClose={closeReviewModal} title={reviewAction?.action === 'revision' ? 'Request proposal revision' : 'Reject proposal'} size="md">
        <div className="space-y-4">
          <div className={`rounded-lg border p-4 ${reviewAction?.action === 'revision' ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'}`}>
            <p className={`text-sm ${reviewAction?.action === 'revision' ? 'text-orange-950' : 'text-red-900'}`}>
              {reviewAction?.action === 'revision'
                ? 'Explain the minor correction needed. The member will be allowed to edit and resubmit the proposal for review.'
                : 'Add a clear rejection reason. The proposal will move to Closed phase and editing will be locked.'}
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="proposal-review-message" className="text-sm font-medium text-foreground">
              {reviewAction?.action === 'revision' ? 'Revision feedback' : 'Rejection reason'} <span className="text-red-700">*</span>
            </label>
            <Textarea id="proposal-review-message" value={reviewMessage} onChange={(event) => { setReviewMessage(event.target.value); setReviewError(''); }} placeholder={reviewAction?.action === 'revision' ? 'Example: Please adjust the venue and duration to match the planned activity.' : 'Example: This proposal is not aligned with the organization goals.'} className="min-h-28" />
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

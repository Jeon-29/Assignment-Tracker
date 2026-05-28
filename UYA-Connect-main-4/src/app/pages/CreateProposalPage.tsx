import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, AlertCircle, Calendar, Clock, Vote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getStoredProposalSettings, ProposalSettings } from '../data/mockData';

const formatDisplayDate = (date?: string) => {
  if (!date) return 'Not set';

  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const isDateWithinAllowedTimeframe = (date: string, settings: ProposalSettings) => {
  const startDate = settings.proposedDateStart;
  const endDate = settings.proposedDateEnd;

  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;

  return true;
};

export function CreateProposalPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [settings] = useState(() => getStoredProposalSettings());
  const canSubmitProposal = settings.currentPhase === 'submission';
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration: '',
    proposedDate: '',
    votingDeadline: settings.votingDeadline || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Proposals can be created while the proposal cycle is in Submission phase.
    // This prevents the form from being locked by an outdated localStorage "submissionsOpen" value.
    if (!canSubmitProposal) {
      alert('Proposal submissions are currently unavailable because the proposal phase is not Submission.');
      return;
    }

    if (!formData.title || !formData.description || !formData.location || !formData.duration || !formData.proposedDate || !formData.votingDeadline) {
      alert('Please fill in all fields');
      return;
    }

    if (!isDateWithinAllowedTimeframe(formData.proposedDate, settings)) {
      alert(`The proposed activity date must be within the allowed timeframe: ${formatDisplayDate(settings.proposedDateStart)} to ${formatDisplayDate(settings.proposedDateEnd)}.`);
      return;
    }

    // In a real app, this would save to a database
    alert('Proposal submitted successfully! Phase: Submission. Status: Pending Review.');
    navigate('/proposals');
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/proposals')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Proposals
      </Button>

      {/* Submission Status Banner */}
      {!canSubmitProposal && (
        <div className="bg-red-100 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-900 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Proposal Creation Unavailable</h3>
            <p className="text-sm text-red-800 mt-1">
              Members can only create proposals during the Submission phase. Current phase: <span className="font-medium capitalize">{settings.currentPhase}</span>
            </p>
          </div>
        </div>
      )}

      {canSubmitProposal && settings.submissionDeadline && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground">Proposal Submission Rules</h3>
            <div className="text-sm text-muted-foreground mt-1 space-y-1">
              <p>
                Proposals must be submitted by {formatDisplayDate(settings.submissionDeadline)}.
              </p>
              <p>
                Voting deadline is set by the admin/coordinator and will be automatically applied as {formatDisplayDate(settings.votingDeadline)}.
              </p>
              <p>
                Proposed activity date must be from {formatDisplayDate(settings.proposedDateStart)} to {formatDisplayDate(settings.proposedDateEnd)}.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="max-w-6xl mx-auto">
        {canSubmitProposal ? (
          <>
            <CardHeader>
              <CardTitle>Create New Proposal</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Submit a proposal for a new activity or program. Officers will review it first before it can move to voting.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.9fr] gap-5 items-start">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          label="Proposal Title *"
                          placeholder="e.g., Beach Cleanup Activity"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>

                      <Input
                        label="Location *"
                        placeholder="e.g., Silang, Cavite"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />

                      <Input
                        label="Duration *"
                        placeholder="e.g., 3 hours, Half day, Full day"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />

                      <div>
                        <Input
                          label="Proposed Date *"
                          type="date"
                          min={settings.proposedDateStart}
                          max={settings.proposedDateEnd}
                          value={formData.proposedDate}
                          onChange={(e) => setFormData({ ...formData, proposedDate: e.target.value })}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Allowed: {formatDisplayDate(settings.proposedDateStart)} to {formatDisplayDate(settings.proposedDateEnd)}.
                        </p>
                      </div>

                      <div>
                        <Input
                          label="Voting Deadline *"
                          type="date"
                          value={formData.votingDeadline}
                          readOnly
                          className="cursor-not-allowed opacity-80"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Auto-filled from admin/coordinator settings.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">Description *</label>
                      <textarea
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-h-[130px]"
                        placeholder="Describe your proposal in detail..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <aside className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Submission Deadline
                        </div>
                        <p className="mt-2 font-medium">{formatDisplayDate(settings.submissionDeadline)}</p>
                      </div>

                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Vote className="w-4 h-4" />
                          Voting Deadline
                        </div>
                        <p className="mt-2 font-medium">{formatDisplayDate(settings.votingDeadline)}</p>
                      </div>

                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          Proposed Date Range
                        </div>
                        <p className="mt-2 font-medium">
                          {formatDisplayDate(settings.proposedDateStart)} - {formatDisplayDate(settings.proposedDateEnd)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted/50 border border-border rounded-xl p-4">
                      <h4 className="text-sm font-medium mb-2">What happens next?</h4>
                      <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                        <li>Your proposal will be submitted under <span className="font-medium">Submission Phase</span>.</li>
                        <li>Initial status will be <span className="font-medium">Pending Review</span>.</li>
                        <li>Admin/Coordinator may request revisions for minor corrections.</li>
                        <li>Once approved for voting, editing will be locked.</li>
                        <li>The proposed date must stay within the configured schedule range.</li>
                      </ul>
                    </div>
                  </aside>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/proposals')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Proposal
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        ) : (
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Proposal Creation Unavailable</h3>
            <p className="text-muted-foreground">
              Proposal submissions are only available during the Submission phase.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

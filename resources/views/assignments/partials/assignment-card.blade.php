<div class="col-12 col-md-6 col-lg-4 col-xl-3">
    <div class="card shadow-sm rounded-4 p-3 d-flex flex-column assignment-card"
        style="background-color:#EDE7F6; min-height:240px; transition:transform .2s;">

        <h5 class="fw-semibold">{{ $assignment->title }}</h5>
        <p class="text-muted small">{{ $assignment->description ?? 'No description' }}</p>

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mt-3 mt-2">
            @php
            $dueDate = \Carbon\Carbon::parse($assignment->due_date);
            $isCompleted = $assignment->status == 'completed';
            $isOverdue = $assignment->status == 'pending' && $dueDate->isPast() && !$dueDate->isToday();

            if ($isCompleted) {
                $statusClass = 'bg-success';
                $statusLabel = 'Completed';
            } elseif ($dueDate->isToday()) {
                $statusClass = 'bg-warning text-dark';
                $statusLabel = 'Due Today';
            } elseif ($isOverdue) {
                $statusClass = 'bg-danger';
                $statusLabel = 'Overdue';
            } else {
                $statusClass = 'bg-warning text-dark';
                $statusLabel = 'Pending';
            }
            @endphp

            <span class="badge {{ $statusClass }}">{{ $statusLabel }}</span>
            <span class="badge bg-light text-dark mt-3">
                <i class="material-icons small">schedule</i>
                Due: {{ $dueDate->format('M d, Y') }}
            </span>

        </div>

        <div class="mt-auto pt-3">

            <!-- Edit & Delete Row -->
            <div class="d-flex gap-2 mb-2">
                <button class="btn btn-sm btn-outline-secondary w-50 rounded-3 shadow-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#editAssignmentModal{{ $assignment->id }}">
                    Edit
                </button>

                <button
                    type="button"
                    class="btn btn-sm btn-danger w-50 rounded-3 shadow-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteAssignmentModal{{ $assignment->id }}">
                        Delete
                </button>
            </div>

            <!-- Status Button -->
            @if($assignment->status == 'pending')
            <form action="/assignments/{{ $assignment->id }}/complete" method="POST">
                @csrf
                <button type="submit" class="btn btn-sm btn-primary w-100 rounded-3 shadow-sm">
                    Mark Completed
                </button>
            </form>
            @else
            <button class="btn btn-sm btn-success w-100 rounded-3 shadow-sm" disabled>
                Completed
            </button>
            @endif

        </div>
    </div>
</div>

<div class="modal fade" id="editAssignmentModal{{ $assignment->id }}" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="material-icons me-1">edit</i>
                    Edit Assignment
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <form action="/tasks/{{ $assignment->id }}/update" method="POST">
                @csrf

                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Title</label>
                        <input
                            type="text"
                            name="title"
                            class="form-control rounded-3"
                            value="{{ $assignment->title }}"
                            required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea name="description" class="form-control rounded-3" rows="4">{{ $assignment->description }}</textarea>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Due Date</label>
                        <input
                            type="date"
                            name="due_date"
                            class="form-control rounded-3"
                            value="{{ \Carbon\Carbon::parse($assignment->due_date)->format('Y-m-d') }}"
                            required>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="deleteAssignmentModal{{ $assignment->id }}" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0" style="background-color: #EDE7F6; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.14);">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-semibold d-flex align-items-center">
                    <span class="material-icons me-2" style="color: #D32F2F;">warning</span>
                    Delete Assignment
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body pt-2">
                <div class="card border-0 rounded-4 p-3 mb-3" style="background-color: rgba(255, 255, 255, 0.62);">
                    <div class="fw-semibold">{{ $assignment->title }}</div>
                    <div class="text-muted small">{{ $assignment->description ?? 'No description' }}</div>
                </div>
                <p class="mb-0 text-muted">Are you sure you want to delete this assignment? This action cannot be undone.</p>
            </div>

            <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-light rounded-3" data-bs-dismiss="modal">
                    Cancel
                </button>
                <form action="/tasks/{{ $assignment->id }}/delete" method="POST">
                    @csrf
                    <button type="submit" class="btn btn-danger rounded-3 px-4">
                        Delete
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

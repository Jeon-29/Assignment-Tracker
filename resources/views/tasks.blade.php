@extends('layouts.app')

@section('content')
<div class="container-fluid" style="min-height: 100vh">
    <h2 class="mb-4">My Assignments</h2>

    <!-- Completed Section -->
    <div class="mb-4">
        <h4 class="fw-semibold mb-3">
            <i class="material-icons me-2" style="vertical-align: middle;">task_alt</i>
            Completed
        </h4>
        <div class="row g-3">
            @forelse($completed as $assignment)
                @include('assignments.partials.assignment-card', ['assignment' => $assignment])
            @empty
                <p class="text-muted ms-3">No completed assignments yet.</p>
            @endforelse
        </div>
    </div>

    <!-- All Assignments Section -->
    <div class="mb-4">
        <h4 class="fw-semibold mb-3">
            <i class="material-icons me-2" style="vertical-align: middle;">assignment</i>
            All Assignments
        </h4>
        <div class="row g-3">
            @forelse($allAssignments as $assignment)
                @include('assignments.partials.assignment-card', ['assignment' => $assignment])
            @empty
                <p class="text-muted ms-3">No assignments found.</p>
            @endforelse
        </div>
    </div>

</div>
@endsection
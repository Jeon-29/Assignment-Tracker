@extends('layouts.app')

@section('content')

<h2 class="mb-4">Dashboard</h2>

<div class="mb-4">

    <h3 class="fw-bold">
        Hello, {{ $name }}
    </h3>

    <p class="text-muted mb-0">
        Here's a quick overview of your assignments today.
    </p>

</div>

@php
$focusTask = $assignments->where('status', 'pending')->sortBy('due_date')->first();
@endphp

@if($focusTask)
<div class="card focus-widget p-3 mb-4">
    <div class="d-flex align-items-center">
        <span class="material-icons focus-icon me-3">priority_high</span>
        <div>
            <h6 class="mb-1 fw-semibold">Today's Focus</h6>
            <strong>{{ $focusTask->title }}</strong>
            <div class="text-muted small">
                Due: {{ \Carbon\Carbon::parse($focusTask->due_date)->format('M d') }}
            </div>
        </div>
    </div>
</div>
@else
<div class="card focus-widget p-3 mb-4">
    <div class="d-flex align-items-center">
        <div>
            <h6 class="mb-1 fw-semibold">Today's Focus</h6>
            <strong>You have no Upcoming Assignments</strong>
        </div>
    </div>
</div>
@endif



<div class="mt-4">
    <h5 class="mb-3 fw-semibold">Recent Assignments</h5>
    <div class="row g-3">


        @foreach($assignments as $assignment)

        @php
        $due = \Carbon\Carbon::parse($assignment->due_date);
        $now = now();

        if ($assignment->status === 'completed') {
        $badgeColor = 'bg-success';
        $label = 'Completed';

        } elseif ($due->lt($now->startOfDay())) {
        // Only overdue if before today
        $badgeColor = 'bg-danger';
        $label = 'Overdue';

        } elseif ($due->isToday()) {
            $badgeColor='bg-warning text-dark' ;
            $label='Due Today' ;

        } elseif ($due->diffInDays($now) <= 2) {
            // Due within 2 days
            $badgeColor='bg-warning text-dark' ;
            $label='Due Soon' ;

            } else {
            $badgeColor='bg-primary' ;
            $label='Upcoming' ;
            }
            @endphp

            <div class="col-12 col-md-6">
            <div class="card shadow-sm rounded-4 p-3 assignment-card d-flex flex-column"
                style="background-color: #EDE7F6; transition: transform 0.2s; cursor: pointer;"
                onmouseover="this.style.transform='scale(1.02)';"
                onmouseout="this.style.transform='scale(1)';">

                <h5 class="fw-semibold">{{ $assignment->title }}</h5>
                <p class="text-muted small">{{ $assignment->description ?? 'No description' }}</p>

                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="badge bg-light text-dark">
                        <i class="material-icons small">schedule</i> Due: {{ $due->format('M d, Y') }}
                    </span>

                    <span class="badge {{ $badgeColor }}">
                        <i class="material-icons small">event</i>
                        {{ $label }}
                    </span>
                </div>

                <div class="mt-auto">
                    @if($assignment->status == 'pending')
                    <form action="/assignments/{{ $assignment->id }}/complete" method="POST">
                        @csrf
                        <button type="submit" class="btn btn-sm btn-primary w-100 rounded-3 shadow-sm py-2 mt-3">
                            Mark as Completed
                        </button>
                    </form>
                    @else
                    <button class="btn btn-sm btn-success w-100 rounded-3 py-2 mt-3" disabled>
                        Completed
                    </button>
                    @endif
                </div>
            </div>
    </div>
    @endforeach
</div>
</div>
@endsection

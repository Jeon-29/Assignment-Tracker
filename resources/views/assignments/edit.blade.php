@extends('layouts.app')

@section('content')
<div class="container mt-5">

    <h3 class="mb-4 text-center">Edit Assignment</h3>

    <form action="{{ url('/assignments') }}" method="POST" class="p-4 bg-light rounded-4 shadow-sm">
        @csrf

        <!-- Title -->
        <div class="mb-3">
            <label class="form-label">Title</label>
            <input type="text" name="title" class="form-control form-control-md rounded-3" required>
        </div>

        <!-- Description -->
        <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea name="description" class="form-control rounded-3" rows="4" ></textarea>
        </div>

        <!-- Due Date -->
        <div class="mb-3">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-control rounded-3" value="{{ date('Y-m-d') }}" required>
            <!-- value="{{ date('Y-m-d') }}" sets the current date -->
        </div>

        <button class="btn btn-primary w-100 rounded-3">Edit Assignment</button>
    </form>

</div>
@endsection
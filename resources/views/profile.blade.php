@extends('layouts.app')

@section('content')
<div class="d-grid gap-4">
    <div>
        <h2 class="mb-1">User Profile</h2>
        <p class="text-muted mb-0">View and update your personal information.</p>
    </div>

    <div class="row g-4">
        <div class="col-12 col-lg-4">
            <div class="card p-4 h-100 border-0" style="background-color: #EDE7F6; box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08); border-radius: 18px;">
                <div class="text-center">
                    @if($user->profile_picture)
                    <img
                        src="/{{ $user->profile_picture }}"
                        alt="{{ $user->name }}"
                        class="rounded-circle mb-3"
                        style="width: 120px; height: 120px; object-fit: cover; border: 4px solid rgba(255,255,255,0.9);">
                    @else
                    <div
                        class="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style="width: 120px; height: 120px; background: linear-gradient(135deg, #6750A4, #9C8CF2); color: white; font-size: 2.5rem; font-weight: 700;">
                        {{ strtoupper(substr($user->name, 0, 1)) }}
                    </div>
                    @endif

                    <h4 class="fw-semibold mb-1">{{ $user->name }}</h4>
                    <p class="text-muted mb-3">{{ $user->email }}</p>
                </div>

                <div class="card border-0 rounded-4 p-3" style="background-color: rgba(255, 255, 255, 0.62);">
                    <div class="mb-3">
                        <div class="text-muted small">Phone Number</div>
                        <div class="fw-semibold">{{ $user->phone_number ?: 'Not set' }}</div>
                    </div>
                    <div class="mb-3">
                        <div class="text-muted small">Gender</div>
                        <div class="fw-semibold">{{ $user->gender ?: 'Not set' }}</div>
                    </div>
                    <div class="mb-3">
                        <div class="text-muted small">Address</div>
                        <div class="fw-semibold">{{ $user->address ?: 'Not set' }}</div>
                    </div>
                    <div>
                        <div class="text-muted small">Member Since</div>
                        <div class="fw-semibold">{{ $user->created_at->format('M d, Y') }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-8">
            <div class="card p-4 border-0" style="background-color: #EDE7F6; box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08); border-radius: 18px;">
                <div class="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h4 class="fw-semibold mb-1">Edit Profile</h4>
                        <p class="text-muted mb-0">Update information and upload a new profile picture.</p>
                    </div>
                </div>

                <form action="/profile/update" method="POST" enctype="multipart/form-data">
                    @csrf

                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <label class="form-label">Name</label>
                            <input type="text" name="name" class="form-control rounded-3" value="{{ old('name', $user->name) }}" required>
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-control rounded-3" value="{{ old('email', $user->email) }}" required>
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label">Phone Number</label>
                            <input type="text" name="phone_number" class="form-control rounded-3" value="{{ old('phone_number', $user->phone_number) }}">
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label">Gender</label>
                            <select name="gender" class="form-select rounded-3">
                                <option value="">Select gender</option>
                                @foreach(['Male', 'Female'] as $gender)
                                <option value="{{ $gender }}" {{ old('gender', $user->gender) === $gender ? 'selected' : '' }}>{{ $gender }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="col-12">
                            <label class="form-label">Address</label>
                            <input type="text" name="address" class="form-control rounded-3" value="{{ old('address', $user->address) }}">
                        </div>

                        <div class="col-12">
                            <label class="form-label">Profile Picture Upload</label>
                            <input type="file" name="profile_picture" class="form-control rounded-3" accept="image/*">
                            <div class="form-text">Upload a JPG, PNG, or WEBP image up to 2MB.</div>
                        </div>
                    </div>

                    <div class="mt-4 d-flex justify-content-between align-items-center gap-3 flex-wrap">
                        <a href="/logout" class="btn btn-danger rounded-3 px-4">
                            Logout
                        </a>
                        <button type="submit" class="btn btn-primary rounded-3 px-4">
                            Update Information
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

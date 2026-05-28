@extends('layouts.app')

@section('content')
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
            <h2 class="mb-1">Admin Dashboard</h2>
            <p class="text-muted mb-0">Manage registered users from one place.</p>
        </div>

        <button class="btn btn-primary rounded-3 px-4 shadow-sm" data-bs-toggle="modal" data-bs-target="#addUserModal">
            <span class="material-icons align-middle me-1" style="font-size: 18px;">person_add</span>
            Add User
        </button>
    </div>

    <div class="card p-3 p-md-4 border-0" style="background-color: #EDE7F6; box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08); border-radius: 18px;">
        <div class="table-responsive">
            <table class="table admin-table align-middle mb-0">
                <thead>
                    <tr>
                        <th class="border-0">Name</th>
                        <th class="border-0">Email</th>
                        <th class="border-0">Role</th>
                        <th class="border-0">Created Date</th>
                        <th class="border-0 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($users as $user)
                        <tr>
                            <td>
                                <div class="fw-semibold">{{ $user->name }}</div>
                            </td>
                            <td>{{ $user->email }}</td>
                            <td>
                                <span class="badge {{ $user->is_admin ? 'bg-primary' : 'bg-light text-dark' }}">
                                    {{ $user->is_admin ? 'Admin' : 'User' }}
                                </span>
                            </td>
                            <td>{{ $user->created_at->format('M d, Y') }}</td>
                            <td class="text-center">
                                <div class="d-flex gap-2 justify-content-center">
                                    <button class="btn btn-sm btn-outline-secondary rounded-3" data-bs-toggle="modal"
                                        data-bs-target="#editUserModal{{ $user->id }}">
                                        Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger rounded-3" data-bs-toggle="modal"
                                        data-bs-target="#deleteUserModal{{ $user->id }}">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center text-muted py-4">No users found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="modal fade" id="addUserModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0" style="background-color: #EDE7F6;">
                <div class="modal-header border-0">
                    <h5 class="modal-title fw-semibold">
                        <i class="material-icons me-1 align-middle">person_add</i>
                        Add User
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form action="/admin/users/store" method="POST">
                    @csrf
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Name</label>
                            <input type="text" name="name" class="form-control rounded-3" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-control rounded-3" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input type="password" name="password" class="form-control rounded-3" required>
                        </div>
                        <div>
                            <label class="form-label">Role</label>
                            <input type="text" class="form-control rounded-3" value="User" disabled>
                        </div>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-light rounded-3" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary rounded-3">Add User</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    @foreach ($users as $user)
        <div class="modal fade" id="editUserModal{{ $user->id }}" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content rounded-4 border-0" style="background-color: #EDE7F6;">
                    <div class="modal-header border-0">
                        <h5 class="modal-title fw-semibold">
                            <i class="material-icons me-1 align-middle">edit</i>
                            Edit User
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form action="/admin/users/{{ $user->id }}/update" method="POST">
                        @csrf
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input type="text" name="name" class="form-control rounded-3"
                                    value="{{ $user->name }}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" name="email" class="form-control rounded-3"
                                    value="{{ $user->email }}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">New Password</label>
                                <input type="password" name="password" class="form-control rounded-3"
                                    placeholder="Leave blank to keep current password">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Created Date</label>
                                <input type="text" class="form-control rounded-3"
                                    value="{{ $user->created_at->format('M d, Y') }}" disabled>
                            </div>
                            <div>
                                <label class="form-label">Role</label>
                                <select name="role" class="form-select rounded-3">
                                    <option value="user" {{ !$user->is_admin ? 'selected' : '' }}>User</option>
                                    <option value="admin" {{ $user->is_admin ? 'selected' : '' }}>Admin</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-light rounded-3"
                                data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary rounded-3">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="modal fade" id="deleteUserModal{{ $user->id }}" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content rounded-4 border-0" style="background-color: #EDE7F6;">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title fw-semibold d-flex align-items-center">
                            <span class="material-icons me-2 text-danger">warning</span>
                            Delete User
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body pt-2">
                        <div class="card border-0 rounded-4 p-3 mb-3"
                            style="background-color: rgba(255, 255, 255, 0.62);">
                            <div class="fw-semibold">{{ $user->name }}</div>
                            <div class="text-muted small">{{ $user->email }}</div>
                        </div>
                        <p class="mb-0 text-muted">Delete this user account? This action cannot be undone.</p>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-light rounded-3" data-bs-dismiss="modal">Cancel</button>
                        <form action="/admin/users/{{ $user->id }}/delete" method="POST">
                            @csrf
                            <button type="submit" class="btn btn-danger rounded-3">Delete User</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    @endforeach
@endsection

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    private function ensureAdmin()
    {
        if (!session()->has('logged_in_user')) {
            return redirect('/login')->with('error', 'You must log in first.');
        }

        if (!session('logged_in_is_admin')) {
            return redirect('/dashboard')->with('error', 'Admin access only.');
        }

        return null;
    }

    public function dashboard()
    {
        if ($redirect = $this->ensureAdmin()) {
            return $redirect;
        }

        $users = User::orderBy('created_at', 'desc')->get();

        return view('admin.dashboard', [
            'users' => $users,
            'name' => session('logged_in_name'),
        ]);
    }

    public function stats()
    {
        if ($redirect = $this->ensureAdmin()) {
            return $redirect;
        }

        $users = User::orderBy('created_at', 'asc')->get();
        $months = collect(range(5, 0))
            ->map(fn ($monthsAgo) => now()->copy()->subMonths($monthsAgo)->startOfMonth())
            ->push(now()->copy()->startOfMonth());

        $monthlyRegistrations = $months->map(function ($month) use ($users) {
            $monthKey = $month->format('Y-m');

            return [
                'label' => $month->format('M'),
                'count' => $users->filter(function ($user) use ($monthKey) {
                    return $user->created_at->format('Y-m') === $monthKey;
                })->count(),
            ];
        })->values();

        $roleBreakdown = [
            ['label' => 'Admins', 'value' => $users->where('is_admin', true)->count(), 'color' => '#6750A4'],
            ['label' => 'Users', 'value' => $users->where('is_admin', false)->count(), 'color' => '#B8A8FF'],
        ];

        return view('admin.stats', [
            'totalUsers' => $users->count(),
            'adminCount' => $users->where('is_admin', true)->count(),
            'userCount' => $users->where('is_admin', false)->count(),
            'latestUser' => $users->sortByDesc('created_at')->first(),
            'monthlyRegistrations' => $monthlyRegistrations,
            'roleBreakdown' => $roleBreakdown,
        ]);
    }

    public function store(Request $request)
    {
        if ($redirect = $this->ensureAdmin()) {
            return $redirect;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return back()->with('error', $validator->errors()->first());
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_admin' => false,
        ]);

        return back()->with('success', 'User added successfully.');
    }

    public function update(Request $request, $id)
    {
        if ($redirect = $this->ensureAdmin()) {
            return $redirect;
        }

        $user = User::find($id);

        if (!$user) {
            return back()->with('error', 'User not found.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:admin,user',
        ]);

        if ($user->id === session('logged_in_user') && $request->role !== 'admin') {
            return back()->with('error', 'You cannot remove admin access from your own account.');
        }

        $payload = [
            'name' => $request->name,
            'email' => $request->email,
            'is_admin' => $request->role === 'admin',
        ];

        if ($request->filled('password')) {
            $payload['password'] = Hash::make($request->password);
        }

        $user->update($payload);

        if ($user->id === session('logged_in_user')) {
            session([
                'logged_in_name' => $user->name,
                'logged_in_is_admin' => $user->is_admin,
            ]);
        }

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        if ($redirect = $this->ensureAdmin()) {
            return $redirect;
        }

        $user = User::find($id);

        if (!$user) {
            return back()->with('error', 'User not found.');
        }

        if ($user->id === session('logged_in_user')) {
            return back()->with('error', 'You cannot delete your own admin account.');
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}

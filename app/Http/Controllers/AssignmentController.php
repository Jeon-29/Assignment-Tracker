<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    // display the form
    public function create()
    {
        if (!session()->has('logged_in_user')) {
            return redirect('/login');
        }

        if (session('logged_in_is_admin')) {
            return redirect('/admin/dashboard');
        }

        return view('/assignments.create');
    }
    // 
    public function store(Request $request)
    {
        if (session('logged_in_is_admin')) {
            return redirect('/admin/dashboard');
        }

        // validation form
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable',
            'due_date' => 'required|date',
        ]);

        //save the assignment
        Assignment::create([
            'user_id' => session('logged_in_user'),
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date,
        ]);

        // rediret to dashboard
        return back()->with('success', 'Assignment created');
    }

    // retrieve all assignments for the logged-in user
    public function dashboard()
    {
        // page protection
        if (!session()->has('logged_in_user')) {
            return redirect('/login')->with('error', 'You must log in first.');
        }

        if (session('logged_in_is_admin')) {
            return redirect('/admin/dashboard');
        }

        // Get assignments for the logged-in user

        $user_id = session('logged_in_user');

        // Get all assignments for stats
        $allAssignments = Assignment::where('user_id', $user_id)->get();

        $recentAssignments = Assignment::where('user_id', $user_id)
            ->where('status', 'pending')
            ->whereDate('due_date', '>=', now())
            ->orderBy('due_date', 'asc')
            ->take(4)
            ->get();

        // Count of overdue assignments (only pending ones)
        $overdueCount = Assignment::where('user_id', $user_id)
            ->where('status', 'pending')
            ->whereDate('due_date', '<', now())
            ->count();

        // Pass it to the dashboard view
        return view('dashboard', [
            'assignments' => $recentAssignments, // for the list
            'allAssignments' => $allAssignments, // for stats
            'overdueCount' => $overdueCount,
            'name' => session('logged_in_name')
        ]);
    }
    // mark assignment as completed
    public function markCompleted($id)
    {
        // page protection
        if (!session()->has('logged_in_user')) {
            return redirect('/login');
        }

        if (session('logged_in_is_admin')) {
            return redirect('/admin/dashboard');
        }

        $assignment = Assignment::where('id', $id)->where('user_id', session('logged_in_user'))->first();

        // Check if assignment exists and belongs to the logged-in user
        if (!$assignment) {
            session()->flash('error', 'Assignment not found or access denied.');
            return redirect('/dashboard');
        }

        // Update status to completed
        $assignment->status = 'completed';
        $assignment->save();


        return back()->with('success', 'Assignment marked as completed!');
    }

    // task details page
    public function tasks()
    {
        if (!session()->has('logged_in_user')) {
            return redirect('/login')->with('error', 'You must log in first.');
        }

        if (session('logged_in_is_admin')) {
            return redirect('/admin/dashboard');
        }

        $user_id = session('logged_in_user');

        $assignments = Assignment::where('user_id', $user_id)
            ->get();

        $today = now()->format('Y-m-d');

        // Separate completed and pending assignments
        $completed = $assignments->where('status', 'completed');
        $pending = $assignments->where('status', 'pending');

        // Smart categories
        $overdue = $pending->where('due_date', '<', $today);
        $dueToday = $pending->where('due_date', $today);
        $upcoming = $pending->where('due_date', '>', $today);

        // merge all smart categories into one collection for the view
        $assignments = $overdue->concat($dueToday)->concat($upcoming)->concat($completed);

        return view('tasks', [
            'completed' => $completed,
            'allAssignments' => $assignments
        ]);
    }

    public function stats()
    {
        if (!session()->has('logged_in_user')) {
            return redirect('/login')->with('error', 'You must log in first.');
        }

        if (session('logged_in_is_admin')) {
            return redirect('/admin/dashboard');
        }

        $userId = session('logged_in_user');
        $assignments = Assignment::where('user_id', $userId)
            ->orderBy('due_date', 'asc')
            ->get();

        $today = Carbon::today();
        $startMonth = $today->copy()->startOfMonth();
        $recentMonths = collect(range(5, 0))
            ->map(fn ($monthsAgo) => $today->copy()->subMonths($monthsAgo)->startOfMonth())
            ->push($startMonth);

        $monthlyData = $recentMonths->map(function ($month) use ($assignments) {
            $monthKey = $month->format('Y-m');

            return [
                'label' => $month->format('M'),
                'count' => $assignments->filter(function ($assignment) use ($monthKey) {
                    return Carbon::parse($assignment->due_date)->format('Y-m') === $monthKey;
                })->count(),
            ];
        })->values();

        $statusData = [
            'completed' => $assignments->where('status', 'completed')->count(),
            'pending' => $assignments->where('status', 'pending')->filter(function ($assignment) use ($today) {
                return Carbon::parse($assignment->due_date)->greaterThanOrEqualTo($today);
            })->count(),
            'overdue' => $assignments->where('status', 'pending')->filter(function ($assignment) use ($today) {
                return Carbon::parse($assignment->due_date)->lt($today);
            })->count(),
        ];

        $completionRate = $assignments->count() > 0
            ? (int) round(($statusData['completed'] / $assignments->count()) * 100)
            : 0;

        return view('stats', [
            'name' => session('logged_in_name'),
            'totalAssignments' => $assignments->count(),
            'statusData' => $statusData,
            'monthlyData' => $monthlyData,
            'completionRate' => $completionRate,
        ]);
    }

    public function destroy($id)
    {
        if (session('logged_in_is_admin')) {
            return redirect('/admin/dashboard');
        }

        $assignment = Assignment::where('id', $id)->where('user_id', session('logged_in_user'))->first();

        if (!$assignment) {
            return back()->with('error', 'Assignment not found.');
        }

        $assignment->delete();
        return back()->with('success', 'Assignment deleted successfully.');
    }
    public function update(Request $request, $id)
    {
        if (!session()->has('logged_in_user')) {
            return redirect('/login')->with('error', 'You must log in first.');
        }

        if (session('logged_in_is_admin')) {
            return redirect('/admin/dashboard');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
        ]);

        $assignment = Assignment::where('id', $id)->where('user_id', session('logged_in_user'))->first();

        if (!$assignment) {
            return back()->with('error', 'Assignment not found.');
        }

        $assignment->update([
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date,
        ]);

        return back()->with('success', 'Assignment updated successfully.');
    }
}

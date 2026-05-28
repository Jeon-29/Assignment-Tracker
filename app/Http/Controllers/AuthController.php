<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // display registration page
    public function register()
    {
        //loads the register page
        return view('auth.register');
    }
    public function login()
    {
        //loads the login page
        return view('auth.login');
    }
    // handle the registration submition
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
        ]);

        if ($validator->fails()) {
            return back()->withInput()->with('error', $validator->errors()->first());
        }

        // Save user
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_admin' => false,
        ]);

        // Flash success and redirect
        Session::flash('success', 'Registration successful! You can now log in.');
        return redirect('/login');
    }
    // handle the login submition
    public function authenticate(Request $request)
    {
        // 1️⃣ Validate input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2️⃣ Check if user exists
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // If credentials invalid
            Session::flash('error', 'Invalid email or password');
            return redirect('/login')->withInput();
        }

        // 3️⃣ Create session
        $request->session()->put('logged_in_user', $user->id);
        $request->session()->put('logged_in_name', $user->name);
        $request->session()->put('logged_in_is_admin', (bool) $user->is_admin);

        // 4️⃣ Redirect by role
        return redirect($user->is_admin ? '/admin/dashboard' : '/dashboard');
    }
    // logout
    public function logout(Request $request)
    {
        // Clear session data
        $request->session()->flush();

        // Redirect to login page
        return redirect('/login');
    }

    // display dashboard
    public function dashboard()
    {
        // get the logged-in user_id
        $user_id = session('logged_in_user');

        if (!$user_id) {
            // If not logged in, redirect to login page
            return redirect('/login');
        }

        //fetch the assignments for the logged-in user
        $assignments = Assignment::where('user_id', $user_id)->orderBy('due_date', 'asc')->get();
        // Pass the assignments to the dashboard view
        return view('dashboard', compact('assignments'));
    }
}

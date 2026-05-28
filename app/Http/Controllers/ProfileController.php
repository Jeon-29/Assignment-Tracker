<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    private function getLoggedInUser()
    {
        if (!session()->has('logged_in_user')) {
            return null;
        }

        return User::find(session('logged_in_user'));
    }

    public function show()
    {
        $user = $this->getLoggedInUser();

        if (!$user) {
            return redirect('/login')->with('error', 'You must log in first.');
        }

        if (session('logged_in_is_admin')) {
            return redirect('/admin/dashboard');
        }

        return view('profile', [
            'user' => $user,
        ]);
    }

    public function update(Request $request)
    {
        $user = $this->getLoggedInUser();

        if (!$user) {
            return redirect('/login')->with('error', 'You must log in first.');
        }

        if (session('logged_in_is_admin')) {
            return redirect('/admin/dashboard');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:50',
            'gender' => 'nullable|in:Male,Female,Non-binary,Prefer not to say',
            'address' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|max:2048',
        ]);

        $payload = [
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'gender' => $request->gender,
            'address' => $request->address,
        ];

        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $fileName = 'user-' . $user->id . '-' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/profile-pictures'), $fileName);
            $payload['profile_picture'] = 'uploads/profile-pictures/' . $fileName;
        }

        $user->update($payload);

        session([
            'logged_in_name' => $user->name,
        ]);

        return back()->with('success', 'Profile updated successfully.');
    }
}

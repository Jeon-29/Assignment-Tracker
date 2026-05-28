<?php

use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('/auth.login');
});

// registration
Route::get('/register', [AuthController::class, 'register']);
Route::post('/register', [AuthController::class, 'store']);

// login
Route::get('/login', [AuthController::class, 'login']);
Route::post('/login', [AuthController::class, 'authenticate']);

// logout
Route::get('/logout', [AuthController::class, 'logout']);

// dashboard
Route::get('/dashboard', function () {
    if (!session()->has('logged_in_user')){
        return redirect('/login');
    }
    $name = session('logged_in_name');
    return view('dashboard', compact('name'));
});


// create assignment route
Route::get('/assignments/create', [AssignmentController::class, 'create']);

Route::post('/assignments/store', [AssignmentController::class, 'store']);

// dashboard route to display assignments
Route::get('/dashboard', [AssignmentController::class, 'dashboard']);

// mark assignment as completed
Route::post('/assignments/{id}/complete', [AssignmentController::class, 'markCompleted']);

// task details page
Route::get('/tasks', [AssignmentController::class, 'tasks']);

// stats page
Route::get('/stats', [AssignmentController::class, 'stats']);

// admin dashboard
Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
Route::get('/admin/stats', [AdminController::class, 'stats']);
Route::post('/admin/users/store', [AdminController::class, 'store']);
Route::post('/admin/users/{id}/update', [AdminController::class, 'update']);
Route::post('/admin/users/{id}/delete', [AdminController::class, 'destroy']);

// profile page
Route::get('/profile', [ProfileController::class, 'show']);
Route::post('/profile/update', [ProfileController::class, 'update']);

// delete assignment
Route::post('/tasks/{id}/delete', [AssignmentController::class, 'destroy']);

// edit assignment
Route::post('/tasks/{id}/update', [AssignmentController::class, 'update']);

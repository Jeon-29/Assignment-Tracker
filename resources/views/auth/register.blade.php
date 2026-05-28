@extends('layouts.auth')

@section('content')

<div class="card p-4" style="width:400px">

    <h4 class="text-center mb-4">Create Account</h4>

    <form action="{{ url('/register') }}" method="POST">
        @csrf

        <div class="form-floating mb-3">
            <input type="text" class="form-control" name="name" placeholder="Name" required>
            <label>Full Name</label>
        </div>

        <div class="form-floating mb-3">
            <input type="email" class="form-control" name="email" placeholder="Email" required>
            <label>Email Address</label>
        </div>

        <div class="form-floating mb-3">
            <input type="password" class="form-control" name="password" placeholder="Password" required>
            <label>Password</label>
        </div>

        <button class="btn btn-primary w-100">Register</button>

        <p class="text-center mt-3">
            Already have an account?
            <a class="link" href="{{ url('/login') }}">Login</a>
        </p>

    </form>

</div>

@endsection
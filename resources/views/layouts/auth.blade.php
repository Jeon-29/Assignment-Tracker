<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>{{ $title ?? 'Assignment Tracker' }}</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Material Icons -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <style>
        body {
            font-family: 'Roboto', 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #EDE7F6, #F3E5F5, #E8F5E9);
        }

        /* APP HEADER */

        .logo-circle {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: #6750A4;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: auto;
            margin-bottom: 15px;
            color: white;
            font-size: 32px;
        }

        .app-title {
            font-size: 34px;
            font-weight: 600;
            color: #4A3F75;
        }

        .app-subtitle {
            color: #6c757d;
        }

        /* CARD */

        .card {
            border-radius: 18px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
            animation: fadeUp 0.6s ease;
        }

        /* INPUT */

        .form-control {
            border-radius: 10px;
            transition: 0.2s;
        }

        .form-control:focus {
            border-color: #6750A4;
            box-shadow: 0 0 0 0.15rem rgba(103, 80, 164, 0.25);
        }

        /* BUTTON */

        .btn-primary {
            background: #6750A4;
            border: none;
            border-radius: 10px;
        }

        .btn-primary:hover {
            background: #5a468c;
        }
        .link{
            color: #6750A4;
            text-decoration: none;
        }
        .link:hover{
            text-decoration: underline;
        }

        /* ANIMATION */

        @keyframes fadeUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>

</head>

<body>

    <div class="container vh-100 d-flex flex-column justify-content-center align-items-center">

        <!-- APP HEADER -->
        <div class="text-center mb-4">

            <div class="logo-circle">
                <span class="material-icons">task_alt</span>
            </div>

            <div class="app-title">Assignment Tracker</div>

            <div class="app-subtitle">
                Organize and track your academic tasks
            </div>

        </div>

        <!-- PAGE CONTENT -->
        @yield('content')

    </div>

    @if(session('success') || session('error'))
    <div class="position-fixed bottom-0 start-50 translate-middle-x mb-5">
        <div
            id="authToast"
            class="toast text-white"
            role="alert"
            style="background-color: {{ session('error') ? '#D85C63' : '#8A7BE0' }}; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.15);">
            <div class="d-flex">
                <div class="toast-body">
                    {{ session('success') ?? session('error') }}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    </div>
    @endif

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const toastElement = document.getElementById('authToast');

            if (toastElement) {
                const toast = new bootstrap.Toast(toastElement, {
                    delay: 4000
                });

                toast.show();
            }
        });
    </script>

</body>

</html>

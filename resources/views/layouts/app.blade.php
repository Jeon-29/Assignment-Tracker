<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Assignment Tracker</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">


    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <style>
        body {
            font-family: 'Roboto', 'Segoe UI', sans-serif;
            background: #d4d4f8;
            padding-bottom: 90px;
        }

        /* PAGE CONTAINER */

        .page-container {
            padding: 25px;
        }

        /* FLOATING NAVBAR */

        .bottom-nav {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 500px;
            border-radius: 20px;
            display: flex;
            justify-content: space-around;
            padding: 10px 0;
            /* From https://css.glass */
            background: rgba(255, 255, 255, 0.23);
            border-radius: 16px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(4.4px);
            -webkit-backdrop-filter: blur(4.4px);
            border: 1px solid rgba(255, 255, 255, 0.13);
        }

        /* NAV ITEMS */

        .nav-item {
            text-align: center;
            color: #000000;
            text-decoration: none;
            font-size: 12px;
            padding: 6px 10px;
            border-radius: 12px;
            transition: all .25s ease;
        }

        .nav-item .material-icons {
            display: block;
            font-size: 26px;
        }

        .nav-item:hover {
            background: #F1ECFF;
            color: #6750A4;
            transform: translateY(-2px);
        }

        .nav-active {
            color: #6750A4;
        }

        /* STAT CARDS */

        .stat-card {
            border: none;
            border-radius: 16px;
            background: #F3EDFF;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transition: .2s;
        }

        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
            font-size: 28px;
            color: #8B7CF6;
        }

        /* FLOATING ACTION BUTTON */

        .fab {
            position: fixed;
            bottom: 95px;
            right: 25px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #6750A4;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            transition: all .25s ease;
        }

        .fab .material-icons {
            font-size: 30px;
        }

        .fab:hover {
            background: #5a468c;
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 16px 35px rgba(0, 0, 0, 0.25);
        }

        /* CENTER ADD BUTTON */

        .nav-add {
            position: relative;
            top: -25px;
            right: 10px;
            width: 60px;
            height: 60px;
            background: #6750A4;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-decoration: none;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
            transition: all .25s ease;
        }

        .nav-add .material-icons {
            font-size: 32px;
        }

        .nav-add:hover {
            background: #5a468c;
            transform: scale(1.08);
            box-shadow: 0 14px 35px rgba(0, 0, 0, 0.3);
        }

        /* BUTTONS */

        .btn-primary {
            background: #6750A4;
            border: none;
            border-radius: 10px;
        }

        .btn-primary:hover {
            background: #5a468c;
        }

        /* INPUT */

        .form-control {
            border-radius: 10px;
            transition: .2s;
        }

        .form-control:focus {
            border-color: #6750A4;
            box-shadow: 0 0 0 .15rem rgba(103, 80, 164, .25);
        }

        /* DASHBOARD */

        .dashboard-bg {
            background: #ECEAF8;
            min-height: 100vh;
            padding-bottom: 80px;
        }

        /* ASSIGNMENT CARD */

        .assignment-card {
            border: none;
            border-radius: 18px;
            background: #fff;
            box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
            transition: .25s ease;
        }

        .assignment-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 14px 32px rgba(0, 0, 0, 0.12);
        }

        .card-accent {
            height: 6px;
            border-radius: 18px 18px 0 0;
        }

        /* FOCUS WIDGET */

        .focus-widget {
            border: none;
            border-radius: 18px;
            background: linear-gradient(135deg, #B8A8FF, #9C8CF2);
            color: white;
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.15);
        }

        .focus-icon {
            font-size: 32px;
        }

        /* TASK PAGE */

        .tasks-page {
            padding: 20px;
        }

        .page-title {
            font-weight: 600;
            margin-bottom: 20px;
        }

        .section-title {
            font-weight: 500;
            margin-bottom: 15px;
        }

        .task-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 15px;
        }

        .task-card {
            background: white;
            padding: 18px;
            border-radius: 14px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
            transition: .25s ease;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .task-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .task-header h5 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .task-header h5 {
            font-size: 16px;
            font-weight: 600;
            margin: 0;
        }

        .task-desc {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
        }

        .task-date {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            color: #777;
        }

        .task-actions {
            display: flex;
            gap: 10px;
        }

        .task-actions button {
            border: none;
            background: #f5f5f5;
            border-radius: 10px;
            padding: 6px;
            cursor: pointer;
            transition: .2s;
        }

        .task-actions button:hover {
            background: #eaeaea;
        }

        .material-icons {
            font-size: 18px;
        }

        /* TASK STATUS COLORS */

        .completed {
            background: #dcedc1;
            border-left: 5px solid #4caf50;
        }

        .due-today {
            border-left: 5px solid #ff6b6b;
        }

        .due-soon {
            border-left: 5px solid #ffd166;
        }

        .due-week {
            border-left: 5px solid #06d6a0;
        }

        /* STATS PAGE */

        .stats-shell {
            display: grid;
            gap: 20px;
        }

        .stats-hero,
        .chart-card,
        .timeline-card {
            border: none;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.8);
            box-shadow: 0 18px 45px rgba(88, 72, 146, 0.12);
        }

        .stats-hero {
            background: linear-gradient(135deg, #6750A4, #8B7CF6);
            color: white;
            overflow: hidden;
            position: relative;
        }

        .stats-hero::after {
            content: "";
            position: absolute;
            inset: auto -40px -70px auto;
            width: 180px;
            height: 180px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.14);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
        }

        .stats-mini-card {
            border-radius: 18px;
            padding: 18px;
            color: white;
            min-height: 120px;
            box-shadow: 0 12px 24px rgba(88, 72, 146, 0.14);
        }

        .stats-mini-card h3 {
            font-size: 2rem;
            margin-bottom: 4px;
        }

        .chart-wrap {
            position: relative;
            width: 100%;
            height: 280px;
        }

        .chart-wrap canvas {
            width: 100%;
            height: 100%;
            display: block;
        }

        .chart-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 16px;
        }

        .chart-legend span {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #5f5b74;
        }

        .chart-legend i {
            width: 12px;
            height: 12px;
            display: inline-block;
            border-radius: 999px;
        }

        .timeline-list {
            display: grid;
            gap: 14px;
        }

        .timeline-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 14px 16px;
            border-radius: 16px;
            background: #f6f3ff;
        }

        .timeline-item strong {
            display: block;
        }

        .timeline-date {
            color: #6750A4;
            font-weight: 600;
            white-space: nowrap;
        }

        .admin-table th,
        .admin-table td {
            background: transparent !important;
            border-color: rgba(103, 80, 164, 0.12);
        }

        .admin-table thead th {
            color: #6750A4;
            font-weight: 700;
        }

        .admin-table tbody tr:hover,
        .admin-table tbody tr:hover > * {
            background: transparent !important;
        }

        @media (max-width: 576px) {
            .assignment-card {
                padding: 1.25rem !important;
            }

            .timeline-item {
                align-items: flex-start;
                flex-direction: column;
            }
        }
    </style>

</head>

<body>

    <!-- PAGE CONTENT -->

    <div class="page-container">

        @yield('content')


    </div>

    <!-- FLOATING NAVBAR -->

    <div class="bottom-nav">
        @if(session('logged_in_is_admin'))
        <a href="/admin/dashboard" class="nav-item {{ request()->is('admin/dashboard') ? 'nav-active' : '' }}">
            <span class="material-icons">dashboard</span>
            Dashboard
        </a>

        <a href="/admin/stats" class="nav-item {{ request()->is('admin/stats') ? 'nav-active' : '' }}">
            <span class="material-icons">bar_chart</span>
            Stats
        </a>

        <a href="/logout" class="nav-item">
            <span class="material-icons">logout</span>
            Logout
        </a>
        @else
        <a href="/dashboard" class="nav-item {{ request()->is('dashboard') ? 'nav-active' : '' }}">
            <span class="material-icons">dashboard</span>
            Dashboard
        </a>

        <a href="/tasks" class="nav-item {{ request()->is('tasks') ? 'nav-active' : '' }}">
            <span class="material-icons">assignment</span>
            Tasks
        </a>

        <button class="nav-add" data-bs-toggle="modal" data-bs-target="#addAssignmentModal">
            <span class="material-icons">add</span>
        </button>

        <a href="/stats" class="nav-item {{ request()->is('stats') ? 'nav-active' : '' }}">
            <span class="material-icons">bar_chart</span>
            Stats
        </a>

        <a href="/profile" class="nav-item {{ request()->is('profile') ? 'nav-active' : '' }}">
            <span class="material-icons">person</span>
            Profile
        </a>
        @endif
    </div>
    @if(session('success') || session('error'))

    <div class="position-fixed bottom-0 start-50 translate-middle-x mb-5" style="
            background-color:{{ session('error') ? '#D85C63' : '#8A7BE0' }};
            border-radius:14px;
            box-shadow:0 6px 18px rgba(0,0,0,0.15);
            backdrop-filter: blur(6px);
            ">

        <div id="successToast" class="toast text-white"
            role="alert"
            style="background-color:{{ session('error') ? '#D85C63' : '#8A7BE0' }}; border-radius:12px;">

            <div class="d-flex">
                <div class="toast-body">
                    {{ session('success') ?? session('error') }}
                </div>

                <button type="button"
                    class="btn-close btn-close-white me-2 m-auto"
                    data-bs-dismiss="toast">
                </button>
            </div>

        </div>

    </div>

    @endif
    @if(!session('logged_in_is_admin'))
    <div class="modal fade" id="addAssignmentModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4">

                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="material-icons me-1">assignment</i>
                        Add Assignment
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <form action="/assignments/store" method="POST">
                    @csrf

                    <div class="modal-body">

                        <div class="mb-3">
                            <label class="form-label">Title</label>
                            <input type="text" name="title" class="form-control rounded-3" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Description</label>
                            <textarea name="description" class="form-control rounded-3"></textarea>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Due Date</label>
                            <input type="date" name="due_date" class="form-control rounded-3" value="{{ date('Y-m-d') }}" required>
                        </div>

                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                            Cancel
                        </button>

                        <button type="submit" class="btn btn-primary">
                            Create Assignment
                        </button>
                    </div>

                </form>

            </div>

        </div>
    </div>
    @endif
    <script>
        document.addEventListener("DOMContentLoaded", function() {

            const toastElement = document.getElementById('successToast');

            if (toastElement) {
                const toast = new bootstrap.Toast(toastElement, {
                    delay: 4000
                });

                toast.show();
            }

        });
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    @stack('scripts')
</body>

</html>

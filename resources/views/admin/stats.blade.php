@extends('layouts.app')

@section('content')
@php
    $summaryCards = [
        ['label' => 'Number of Users', 'value' => $totalUsers, 'icon' => 'groups'],
        ['label' => 'Admins', 'value' => $adminCount, 'icon' => 'shield'],
        ['label' => 'Regular Users', 'value' => $userCount, 'icon' => 'person'],
    ];
@endphp

<div class="stats-shell">
    <div>
        <h2 class="mb-1">Admin Stats</h2>
        <p class="text-muted mb-0">Reports and charts for registered users.</p>
    </div>

    <div class="stats-grid">
        @foreach($summaryCards as $card)
        <div class="card p-3 border-0" style="background-color: #EDE7F6; box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08); border-radius: 18px;">
            <span class="material-icons mb-3" style="font-size: 30px; color: #6750A4;">{{ $card['icon'] }}</span>
            <h3 class="fw-bold mb-1">{{ $card['value'] }}</h3>
            <div class="text-muted small">{{ $card['label'] }}</div>
        </div>
        @endforeach
    </div>

    <div class="row g-4">
        <div class="col-12 col-xl-8">
            <div class="card p-4 border-0" style="background-color: #EDE7F6; box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08); border-radius: 18px;">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h4 class="fw-semibold mb-1">User Registrations</h4>
                        <p class="text-muted mb-0">Number of users created over the last seven months.</p>
                    </div>
                    <span class="badge bg-light text-dark">Bar graph</span>
                </div>
                <div class="chart-wrap">
                    <canvas id="adminUsersChart" aria-label="Admin users chart"></canvas>
                </div>
            </div>
        </div>

        <div class="col-12 col-xl-4">
            <div class="card p-4 border-0 h-100" style="background-color: #EDE7F6; box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08); border-radius: 18px;">
                <div class="mb-3">
                    <h4 class="fw-semibold mb-1">Role Breakdown</h4>
                    <p class="text-muted mb-0">Current distribution of admin and user accounts.</p>
                </div>
                <div class="chart-wrap" style="height: 250px;">
                    <canvas id="adminRolesChart" aria-label="Admin roles chart"></canvas>
                </div>
                <div class="chart-legend">
                    @foreach($roleBreakdown as $item)
                    <span>
                        <i style="background: {{ $item['color'] }};"></i>
                        {{ $item['label'] }}: {{ $item['value'] }}
                    </span>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <div class="card p-4 border-0" style="background-color: #EDE7F6; box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08); border-radius: 18px;">
        <h4 class="fw-semibold mb-2">Latest Registered User</h4>
        @if($latestUser)
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
                <div class="fw-semibold">{{ $latestUser->name }}</div>
                <div class="text-muted">{{ $latestUser->email }}</div>
            </div>
            <div class="text-end">
                <span class="badge {{ $latestUser->is_admin ? 'bg-primary' : 'bg-light text-dark' }}">
                    {{ $latestUser->is_admin ? 'Admin' : 'User' }}
                </span>
                <div class="text-muted small mt-2">{{ $latestUser->created_at->format('M d, Y h:i A') }}</div>
            </div>
        </div>
        @else
        <p class="text-muted mb-0">No users found.</p>
        @endif
    </div>
</div>
@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const monthlyData = @json($monthlyRegistrations);
        const roleData = @json($roleBreakdown);

        function prepareCanvas(canvas) {
            const ratio = window.devicePixelRatio || 1;
            const bounds = canvas.getBoundingClientRect();
            canvas.width = bounds.width * ratio;
            canvas.height = bounds.height * ratio;

            const context = canvas.getContext('2d');
            context.scale(ratio, ratio);
            return {
                context,
                width: bounds.width,
                height: bounds.height
            };
        }

        function drawBarChart(canvas, data) {
            const { context, width, height } = prepareCanvas(canvas);
            const padding = { top: 20, right: 10, bottom: 40, left: 20 };
            const chartHeight = height - padding.top - padding.bottom;
            const chartWidth = width - padding.left - padding.right;
            const maxValue = Math.max(...data.map(item => item.count), 1);
            const barWidth = chartWidth / data.length * 0.58;
            const gap = chartWidth / data.length * 0.42;

            context.clearRect(0, 0, width, height);
            context.font = '12px Roboto, sans-serif';
            context.fillStyle = '#7C7496';
            context.strokeStyle = '#DDD6F7';

            for (let step = 0; step <= 4; step++) {
                const y = padding.top + chartHeight * (step / 4);
                context.beginPath();
                context.moveTo(padding.left, y);
                context.lineTo(width - padding.right, y);
                context.stroke();
            }

            data.forEach((item, index) => {
                const barHeight = (item.count / maxValue) * (chartHeight - 12);
                const x = padding.left + index * (barWidth + gap) + gap / 2;
                const y = padding.top + chartHeight - barHeight;
                const gradient = context.createLinearGradient(0, y, 0, padding.top + chartHeight);
                gradient.addColorStop(0, '#6750A4');
                gradient.addColorStop(1, '#B8A8FF');

                context.fillStyle = gradient;
                context.beginPath();
                context.roundRect(x, y, barWidth, barHeight, 14);
                context.fill();

                context.fillStyle = '#4D4666';
                context.textAlign = 'center';
                context.fillText(item.count, x + barWidth / 2, y - 8);
                context.fillStyle = '#7C7496';
                context.fillText(item.label, x + barWidth / 2, height - 12);
            });
        }

        function drawDonutChart(canvas, data) {
            const { context, width, height } = prepareCanvas(canvas);
            const total = data.reduce((sum, item) => sum + item.value, 0);
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) / 2 - 20;
            const innerRadius = radius * 0.6;
            let startAngle = -Math.PI / 2;

            context.clearRect(0, 0, width, height);

            if (total === 0) {
                context.fillStyle = '#DDD6F7';
                context.beginPath();
                context.arc(centerX, centerY, radius, 0, Math.PI * 2);
                context.fill();

                context.fillStyle = '#FFFFFF';
                context.beginPath();
                context.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
                context.fill();

                context.fillStyle = '#7C7496';
                context.textAlign = 'center';
                context.font = '600 14px Roboto, sans-serif';
                context.fillText('No data yet', centerX, centerY + 5);
                return;
            }

            data.forEach((item) => {
                const sliceAngle = (item.value / total) * Math.PI * 2;
                context.beginPath();
                context.moveTo(centerX, centerY);
                context.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                context.closePath();
                context.fillStyle = item.color;
                context.fill();
                startAngle += sliceAngle;
            });

            context.fillStyle = '#FFFFFF';
            context.beginPath();
            context.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
            context.fill();

            context.fillStyle = '#4D4666';
            context.textAlign = 'center';
            context.font = '700 28px Roboto, sans-serif';
            context.fillText(total, centerX, centerY - 4);
            context.font = '500 13px Roboto, sans-serif';
            context.fillStyle = '#7C7496';
            context.fillText('Users', centerX, centerY + 18);
        }

        function renderCharts() {
            const usersCanvas = document.getElementById('adminUsersChart');
            const rolesCanvas = document.getElementById('adminRolesChart');

            if (usersCanvas) {
                drawBarChart(usersCanvas, monthlyData);
            }

            if (rolesCanvas) {
                drawDonutChart(rolesCanvas, roleData);
            }
        }

        renderCharts();
        window.addEventListener('resize', renderCharts);
    });
</script>
@endpush

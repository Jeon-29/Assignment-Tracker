@extends('layouts.app')

@section('content')
    @php
        $statusChart = [
            ['label' => 'Completed', 'value' => $statusData['completed'], 'color' => '#4CAF50'],
            ['label' => 'Pending', 'value' => $statusData['pending'], 'color' => '#FFB300'],
            ['label' => 'Overdue', 'value' => $statusData['overdue'], 'color' => '#EF5350'],
        ];

        $miniCards = [
            ['label' => 'Total Assignments', 'value' => $totalAssignments, 'icon' => 'assignment'],
            ['label' => 'Pending', 'value' => $statusData['pending'], 'icon' => 'schedule'],
            ['label' => 'Completed', 'value' => $statusData['completed'], 'icon' => 'task_alt'],
            ['label' => 'Overdue', 'value' => $statusData['overdue'], 'icon' => 'warning'],
        ];
    @endphp

    <div class="stats-shell">
        <div class="mb-2">
            <h2 class="mb-1">Stats</h2>
            <p class="text-muted mb-0">A quick visual summary of how your assignments are moving.</p>
        </div>

        <div class="stats-grid">
            @foreach ($miniCards as $card)
                <div class="card assignment-card p-3" style="background-color: #EDE7F6;">
                    <span class="material-icons mb-3" style="font-size: 30px; color: #6750A4;">{{ $card['icon'] }}</span>
                    <h3 class="fw-bold mb-1">{{ $card['value'] }}</h3>
                    <div class="text-muted small">{{ $card['label'] }}</div>
                </div>
            @endforeach
        </div>

        <div class="row g-4">
            <div class="col-12 col-xl-8">
                <div class="card assignment-card p-4 h-100" style="background-color: #EDE7F6;">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h4 class="fw-semibold mb-1">Monthly workload</h4>
                            <p class="text-muted mb-0">Assignments due across the last seven months.</p>
                        </div>
                        <span class="badge bg-light text-dark">Bar graph</span>
                    </div>
                    <div class="chart-wrap">
                        <canvas id="monthlyAssignmentsChart" aria-label="Monthly assignments chart"></canvas>
                    </div>
                </div>
            </div>

            <div class="col-12 col-xl-4">
                <div class="card assignment-card p-4 h-100" style="background-color: #EDE7F6;">
                    <div class="mb-3">
                        <h4 class="fw-semibold mb-1">Status breakdown</h4>
                        <p class="text-muted mb-0">Current assignment distribution.</p>
                    </div>
                    <div class="chart-wrap" style="height: 250px;">
                        <canvas id="statusBreakdownChart" aria-label="Assignment status breakdown chart"></canvas>
                    </div>
                    <div class="chart-legend">
                        @foreach ($statusChart as $slice)
                            <span>
                                <i style="background: {{ $slice['color'] }};"></i>
                                {{ $slice['label'] }}: {{ $slice['value'] }}
                            </span>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const monthlyData = @json($monthlyData);
            const statusData = @json($statusChart);

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
                const {
                    context,
                    width,
                    height
                } = prepareCanvas(canvas);

                const padding = {
                    top: 20,
                    right: 10,
                    bottom: 40,
                    left: 20
                };
                const chartHeight = height - padding.top - padding.bottom;
                const chartWidth = width - padding.left - padding.right;
                const maxValue = Math.max(...data.map(item => item.count), 1);
                const barWidth = chartWidth / data.length * 0.58;
                const gap = chartWidth / data.length * 0.42;

                context.clearRect(0, 0, width, height);
                context.font = '12px Roboto, sans-serif';
                context.fillStyle = '#7C7496';
                context.strokeStyle = '#E8E2FF';
                context.lineWidth = 1;

                for (let step = 0; step <= 4; step++) {
                    const y = padding.top + chartHeight * (step / 4);
                    context.beginPath();
                    context.moveTo(padding.left, y);
                    context.lineTo(width - padding.right, y);
                    context.stroke();
                }

                data.forEach((item, index) => {
                    const barHeight = maxValue === 0 ? 0 : (item.count / maxValue) * (chartHeight - 12);
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
                const {
                    context,
                    width,
                    height
                } = prepareCanvas(canvas);

                const total = data.reduce((sum, slice) => sum + slice.value, 0);
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

                data.forEach((slice) => {
                    const sliceAngle = (slice.value / total) * Math.PI * 2;
                    context.beginPath();
                    context.moveTo(centerX, centerY);
                    context.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                    context.closePath();
                    context.fillStyle = slice.color;
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
                context.fillText('Assignments', centerX, centerY + 18);
            }

            function renderCharts() {
                const monthlyCanvas = document.getElementById('monthlyAssignmentsChart');
                const statusCanvas = document.getElementById('statusBreakdownChart');

                if (monthlyCanvas) {
                    drawBarChart(monthlyCanvas, monthlyData);
                }

                if (statusCanvas) {
                    drawDonutChart(statusCanvas, statusData);
                }
            }

            renderCharts();
            window.addEventListener('resize', renderCharts);
        });
    </script>
@endpush

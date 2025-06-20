// src/components/PopupChart.jsx
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function PopupChart({ title, data }) {
    const chartRef = useRef();

    useEffect(() => {
        if (!data || !chartRef.current) return;

        new Chart(chartRef.current, {
            type: 'line',
            data: {
                labels: data.map((_, i) => i + 1),
                datasets: [{
                    label: title,
                    data,
                    fill: false,
                    borderColor: '#4e79a7',
                    tension: 0.2,
                }],
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } },
            },
        });
    }, [data]);

    return (
        <canvas ref={chartRef} width="150" height="60"></canvas>
    );
}

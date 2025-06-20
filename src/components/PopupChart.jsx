import React from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip
} from 'chart.js'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip)

export default function PopupChart({ metrics }) {
    const data = {
        labels: ['AI/AN', 'Poverty', 'Income(k)', 'HS %'],
        datasets: [{
            data: metrics,
            borderColor: '#1565c0',
            fill: false,
            tension: 0.3,
            pointRadius: 0
        }]
    }

    const options = {
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } },
        responsive: true,
        maintainAspectRatio: false
    }

    return <div style={{ height: 60 }}><Line data={data} options={options} /></div>
}

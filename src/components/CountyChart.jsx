import React from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement)

export default function CountyChart({ data }) {
    const chartData = {
        labels: ['AI/AN %', 'Poverty %', 'Income', 'HS Grad %'],
        datasets: [
            {
                data,
                fill: false,
                borderColor: '#1976d2',
                tension: 0.2,
                pointRadius: 0
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { display: false },
            y: { display: false }
        },
        elements: {
            line: { borderWidth: 2 }
        }
    }

    return <Line data={chartData} options={options} height={60} />
}

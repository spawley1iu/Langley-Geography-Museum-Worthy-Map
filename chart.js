import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend)

/**
 * Render a pie chart of tribal population or metrics
 * @param {HTMLCanvasElement} canvas - The canvas DOM element to draw on
 * @param {Array} labels - Array of tribal names
 * @param {Array} values - Matching array of numeric values (e.g. population)
 */
export function renderTribalChart(canvas, labels, values) {
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tribal Distribution',
                data: values,
                backgroundColor: labels.map((_, i) =>
                    `hsl(${(i * 137.5) % 360}, 70%, 60%)` // spread colors evenly
                ),
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || ''
                            const value = context.parsed || 0
                            return `${label}: ${value.toLocaleString()}`
                        }
                    }
                }
            }
        }
    })
}

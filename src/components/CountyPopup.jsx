import React, { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale)

const CountyPopup = ({ data }) => {
  const canvasRef = useRef()

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['AI/AN %', 'Poverty %', 'Income/1k', 'HS %'],
        datasets: [{
          data: [
            data.ai_an_pct,
            data.poverty_pct,
            data.median_income / 1000,
            data.hs_pct
          ],
          borderColor: '#333',
          backgroundColor: 'rgba(0,0,0,0.1)',
          tension: 0.3,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    })
  }, [data])

  return (
    <div style={{ padding: '5px', maxWidth: '250px' }}>
      <h4>{data.NAME}, {data.STATE}</h4>
      <ul style={{ padding: 0, listStyle: 'none', margin: '8px 0' }}>
        <li>AI/AN: {data.ai_an_pct}%</li>
        <li>Poverty: {data.poverty_pct}%</li>
        <li>Income: ${data.median_income.toLocaleString()}</li>
        <li>HS Diploma: {data.hs_pct}%</li>
      </ul>
      <canvas ref={canvasRef} width="240" height="60"></canvas>
    </div>
  )
}

export default CountyPopup

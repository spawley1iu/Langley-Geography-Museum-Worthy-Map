import React from 'react'
import PopupChart from './PopupChart'

export default function CountyPopup({ feature }) {
  if (!feature) return null

  const name = feature.get('county_name')
  const aiAn = feature.get('ai_an_pct')
  const poverty = feature.get('poverty_rate')
  const income = feature.get('median_income')
  const education = feature.get('hs_diploma_pct')

  const chartData = [aiAn, poverty, income / 1000, education] // normalize income

  return (
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: '12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        width: 260,
        fontFamily: 'Segoe UI, sans-serif'
      }}>
        <h4 style={{ margin: '4px 0 8px 0' }}>{name}</h4>
        <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: 14 }}>
          <li>AI/AN: {aiAn}%</li>
          <li>Poverty: {poverty}%</li>
          <li>Income: ${income}</li>
          <li>HS Diploma: {education}%</li>
        </ul>
        <div style={{ marginTop: 12 }}>
          <PopupChart metrics={chartData} />
        </div>
      </div>
  )
}

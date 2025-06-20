import React from 'react'
import CountyChart from './CountyChart'

export default function CountyPopup({ feature }) {
    if (!feature) return null

    const props = feature.getProperties ? feature.getProperties() : {}

    const name = props.NAME || 'Unknown County'
    const aiAn = parseFloat(props.ai_an) || 0
    const poverty = parseFloat(props.poverty) || 0
    const income = parseFloat(props.income) || 0
    const hsGrad = parseFloat(props.hs_grad) || 0

    return (
        <div style={{ fontSize: 14, maxWidth: 260 }}>
            <h3 style={{ marginTop: 0 }}>{name}</h3>
            <ul style={{ paddingLeft: 16 }}>
                <li>AI/AN Population: {aiAn.toFixed(1)}%</li>
                <li>Poverty Rate: {poverty.toFixed(1)}%</li>
                <li>Median Income: ${income.toLocaleString()}</li>
                <li>HS Diploma: {hsGrad.toFixed(1)}%</li>
            </ul>
            <CountyChart data={[aiAn, poverty, income, hsGrad]} />
        </div>
    )
}

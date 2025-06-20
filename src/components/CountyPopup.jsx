import React from 'react'
import CountyChart from './CountyChart'

export default function CountyPopup({ feature }) {
    const props = feature.getProperties()

    const aiAn = props.ai_an || 0
    const poverty = props.poverty || 0
    const income = props.income || 0
    const hsGrad = props.hs_grad || 0

    return (
        <div style={{ fontSize: 14 }}>
            <h3>{props.NAME}</h3>
            <ul style={{ paddingLeft: 16 }}>
                <li>AI/AN Population: {aiAn.toFixed(1)}%</li>
                <li>Poverty Rate: {poverty.toFixed(1)}%</li>
                <li>Median Income: ${income.toLocaleString()}</li>
                <li>High School Graduates: {hsGrad.toFixed(1)}%</li>
            </ul>
            <CountyChart data={[aiAn, poverty, income, hsGrad]} />
        </div>
    )
}

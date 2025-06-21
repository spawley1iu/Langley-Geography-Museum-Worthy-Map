import React, { useState } from 'react'

export default function SearchBox({ tribes, onSelect }) {
    const [query, setQuery] = useState('')

    const matches = tribes.filter(name => name.toLowerCase().includes(query.toLowerCase()))

    return (
        <div style={{ padding: 10 }}>
            <input
                type="text"
                placeholder="Search Tribes"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ width: '100%', padding: 8, fontSize: 14 }}
            />
            <ul style={{ maxHeight: 200, overflowY: 'auto', listStyle: 'none', padding: 0 }}>
                {matches.map(name => (
                    <li key={name}>
                        <button onClick={() => onSelect(name)} style={{ width: '100%', padding: 8 }}>
                            {name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

import React from 'react';
import { CATEGORIES, formatCurrency, formatISO } from '../utils';

export default function SummaryStats({ stats, grandTotal, setSelectedDate, setSelectedCategory }) {
  return (
    <div className="summary-grid">
      <div 
        className="glass-panel stat-card cat-grand clickable-card" 
        style={{ gridColumn: '1 / -1' }}
        onClick={() => setSelectedDate(formatISO(new Date()))}
      >
        <div className="stat-header">
          <span className="stat-title">Grand Total (Tanpa Jajan)</span>
        </div>
        <div className="stat-total" style={{ color: '#fff' }}>
          {formatCurrency(grandTotal)}
        </div>
      </div>

      {CATEGORIES.map(cat => {
        const s = stats[cat.id];
        return (
          <div 
            key={cat.id} 
            className={`glass-panel stat-card ${cat.colorClass} clickable-card`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <div className="stat-header">
              <span className="stat-title">{cat.label}</span>
            </div>
            <div className="stat-total">{formatCurrency(s.total)}</div>
            <div className="stat-meta">
              <span>Sisa:</span>
              <span className={`stat-sisa ${s.sisa >= 0 ? 'sisa-positive' : 'sisa-negative'}`}>
                {formatCurrency(s.sisa)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

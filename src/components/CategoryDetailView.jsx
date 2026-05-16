import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { CATEGORIES, formatCurrency, parseLocalDate } from '../utils';

export default function CategoryDetailView({ 
  selectedCategory, 
  setSelectedCategory, 
  periodEntries, 
  stats, 
  setSelectedDate, 
  deleteEntry 
}) {
  const [detailListMode, setDetailListMode] = useState('grouped'); // 'individual' or 'grouped'

  const cat = CATEGORIES.find(c => c.id === selectedCategory);
  if (!cat) return null;
  
  const categoryEntries = periodEntries.filter(e => e.category === selectedCategory);
  const catStats = stats[selectedCategory];

  const groupedEntriesObj = categoryEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = { date: entry.date, amount: 0, notes: [] };
    }
    acc[entry.date].amount += entry.amount;
    if (entry.note) {
      acc[entry.date].notes.push(entry.note);
    }
    return acc;
  }, {});
  const groupedEntries = Object.values(groupedEntriesObj).sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));

  return (
    <div className="category-detail-view" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '0.5rem 0 1.5rem' }}>
        <button className="icon-button" onClick={() => setSelectedCategory(null)}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Detail {cat.label}</h2>
      </div>

      <div className={`glass-panel stat-card ${cat.colorClass}`} style={{ marginBottom: '1.5rem', cursor: 'default' }}>
        <div className="stat-header">
          <span className="stat-title">Pengeluaran {cat.label}</span>
        </div>
        <div className="stat-total">{formatCurrency(catStats.total)}</div>
        <div className="stat-meta">
          <span>Sisa:</span>
          <span className={`stat-sisa ${catStats.sisa >= 0 ? 'sisa-positive' : 'sisa-negative'}`}>
            {formatCurrency(catStats.sisa)}
          </span>
        </div>
      </div>

      <div className="history-section">
        <div className="history-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Semua pengeluaran {cat.label} di periode ini</h2>
          </div>
          {categoryEntries.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.25rem', borderRadius: '12px' }}>
              <button 
                className="glass-button"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: detailListMode === 'individual' ? '' : 'transparent', boxShadow: detailListMode === 'individual' ? '' : 'none' }}
                onClick={() => setDetailListMode('individual')}
              >
                Detail
              </button>
              <button 
                className="glass-button"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: detailListMode === 'grouped' ? '' : 'transparent', boxShadow: detailListMode === 'grouped' ? '' : 'none' }}
                onClick={() => setDetailListMode('grouped')}
              >
                Per Hari
              </button>
            </div>
          )}
        </div>
        
        {categoryEntries.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada pengeluaran buat {cat.label} di periode ini.</p>
          </div>
        ) : (
          <div className="history-list">
            {detailListMode === 'individual' ? (
              categoryEntries.map(entry => (
                <div key={entry.id} className="history-item">
                  <div className="hi-left">
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className={`hi-category ${cat.badgeClass}`}>{cat.label}</span>
                      <span className="hi-date clickable-date" title="Lihat semua pengeluaran hari ini" onClick={() => setSelectedDate(entry.date)}>
                        {format(parseLocalDate(entry.date), 'dd MMMM', { locale: id })}
                      </span>
                    </div>
                    <div className="hi-note">{entry.note}</div>
                  </div>
                  <div className="hi-right">
                    <div className="hi-amount">{formatCurrency(entry.amount)}</div>
                    <button className="hi-delete" title="Delete" onClick={() => deleteEntry(entry.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              groupedEntries.map(group => (
                <div key={group.date} className="history-item">
                  <div className="hi-left">
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className={`hi-category ${cat.badgeClass}`}>{cat.label}</span>
                      <span className="hi-date clickable-date" title="Lihat semua pengeluaran hari ini" onClick={() => setSelectedDate(group.date)}>
                        {format(parseLocalDate(group.date), 'dd MMMM', { locale: id })}
                      </span>
                    </div>
                    <div className="hi-note">{group.notes.join(', ')}</div>
                  </div>
                  <div className="hi-right">
                    <div className="hi-amount">{formatCurrency(group.amount)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

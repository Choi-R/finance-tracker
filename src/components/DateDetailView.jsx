import React, { useRef } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, Trash2, Calendar } from 'lucide-react';
import { CATEGORIES, formatCurrency, parseLocalDate } from '../utils';

export default function DateDetailView({ selectedDate, setSelectedDate, entries, deleteEntry }) {
  const detailDateRef = useRef(null);

  if (!selectedDate) return null;
  
  const dateEntries = entries.filter(e => e.date === selectedDate);
  const dateTotal = dateEntries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="category-detail-view" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '0.5rem 0 1.5rem' }}>
        <button className="icon-button" onClick={() => setSelectedDate(null)}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          Pengeluaran 
          <div style={{ position: 'relative', display: 'inline-block' }} onClick={() => detailDateRef.current?.showPicker()}>
            <div className="glass-input" style={{ width: '14rem', padding: '0.3rem 0.5rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 0, cursor: 'pointer' }}>
              <span>{selectedDate ? format(parseLocalDate(selectedDate), 'dd MMMM yyyy', { locale: id }) : 'Pilih Tanggal'}</span>
              <Calendar size={18} style={{ opacity: 0.7 }} />
            </div>
            <input 
              ref={detailDateRef}
              type="date" 
              value={selectedDate} 
              onChange={e => {
                if (!e.target.value) {
                  setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                } else {
                  setSelectedDate(e.target.value);
                }
              }}
              style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                opacity: 0, WebkitAppearance: 'none', appearance: 'none', 
                color: 'transparent', background: 'transparent', pointerEvents: 'none'
              }}
            />
          </div>
        </h2>
      </div>

      <div className={`glass-panel stat-card cat-grand`} style={{ marginBottom: '1.5rem', cursor: 'default' }}>
        <div className="stat-header">
          <span className="stat-title">Total Hari Ini</span>
        </div>
        <div className="stat-total">{formatCurrency(dateTotal)}</div>
      </div>

      <div className="history-section">
        <div className="history-header">
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Semua pengeluaran tanggal ini</h2>
        </div>
        
        {dateEntries.length === 0 ? (
          <div className="empty-state">
            <p>Tidak ada pengeluaran.</p>
          </div>
        ) : (
          <div className="history-list">
            {dateEntries.map(entry => {
              const catObj = CATEGORIES.find(c => c.id === entry.category) || CATEGORIES[0];
              return (
                <div key={entry.id} className="history-item">
                  <div className="hi-left">
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className={`hi-category ${catObj.badgeClass}`}>{catObj.label}</span>
                      <span className="hi-date clickable-date" title="Per Hari" onClick={() => setSelectedDate(entry.date)}>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

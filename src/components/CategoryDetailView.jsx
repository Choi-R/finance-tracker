import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Trash2, Calendar, Pencil } from 'lucide-react';
import { CATEGORIES, formatCurrency, parseLocalDate, formatDayMonth, formatSlashDate } from '../utils';

export default function CategoryDetailView({ 
  selectedCategory, 
  setSelectedCategory, 
  periodEntries, 
  stats, 
  setSelectedDate, 
  editEntry,
  deleteEntry 
}) {
  const [detailListMode, setDetailListMode] = useState('grouped'); // 'individual' or 'grouped'
  const editDateRef = useRef(null);
  
  const [editingEntry, setEditingEntry] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setEditDate(editingEntry.date);
      setEditCategory(editingEntry.category);
      setEditAmount(editingEntry.amount.toString());
      setEditNote(editingEntry.note || '');
    }
  }, [editingEntry]);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editAmount || isNaN(editAmount) || !editingEntry) return;

    editEntry({
      ...editingEntry,
      date: editDate,
      category: editCategory,
      amount: Number(editAmount),
      note: editNote.trim()
    });

    setEditingEntry(null);
  };

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
                        {formatDayMonth(parseLocalDate(entry.date))}
                      </span>
                    </div>
                    <div className="hi-note">{entry.note}</div>
                  </div>
                  <div className="hi-right">
                    <div className="hi-amount">{formatCurrency(entry.amount)}</div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="hi-edit" title="Edit" onClick={() => setEditingEntry(entry)}>
                        <Pencil size={18} />
                      </button>
                      <button className="hi-delete" title="Delete" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
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
                        {formatDayMonth(parseLocalDate(group.date))}
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

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="modal-overlay open" onClick={() => setEditingEntry(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Pengeluaran</h3>
              <button className="icon-button" onClick={() => setEditingEntry(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tanggal</label>
                  <div style={{ position: 'relative' }} onClick={() => editDateRef.current?.showPicker()}>
                    <div className="glass-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <span>{formatSlashDate(editDate)}</span>
                      <Calendar size={18} style={{ opacity: 0.7 }} />
                    </div>
                    <input 
                      ref={editDateRef}
                      type="date" 
                      value={editDate} 
                      onChange={e => setEditDate(e.target.value)}
                      required
                      style={{ 
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                        opacity: 0, WebkitAppearance: 'none', appearance: 'none', 
                        color: 'transparent', background: 'transparent', pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Kategori</label>
                  <select 
                    className="glass-select" 
                    value={editCategory} 
                    onChange={e => setEditCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Jumlah (Rp)</label>
                  <input 
                    type="number" 
                    className="glass-input" 
                    value={editAmount} 
                    onChange={e => setEditAmount(e.target.value)}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Catatan</label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    value={editNote} 
                    onChange={e => setEditNote(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="glass-button danger" onClick={() => setEditingEntry(null)}>
                  Batal
                </button>
                <button type="submit" className="glass-button">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

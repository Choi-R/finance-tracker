import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Plus, Calendar } from 'lucide-react';
import { CATEGORIES, parseLocalDate } from '../utils';

export default function EntryForm({ isSyncing, addEntry }) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('daily');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const formDateRef = useRef(null);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;

    let sanitizedNote = note.replace(/<[^>]*>?/gm, '').trim();
    if (/^[=+\-@]/.test(sanitizedNote)) {
      sanitizedNote = "'" + sanitizedNote;
    }

    const newEntry = {
      id: uuidv4(),
      date,
      category,
      amount: Number(amount),
      note: sanitizedNote
    };

    addEntry(newEntry);
    setAmount('');
    setNote('');
  };

  return (
    <div className="input-section glass-panel">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Tambah Pengeluaran</h2>
      <form className="entry-form" onSubmit={handleAddEntry}>
        <div className="form-group">
          <label>Tanggal</label>
          <div style={{ position: 'relative' }} onClick={() => formDateRef.current?.showPicker()}>
            <div className="glass-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span>{date ? format(parseLocalDate(date), 'dd/MM/yyyy') : 'DD/MM/YYYY'}</span>
              <Calendar size={18} style={{ opacity: 0.7 }} />
            </div>
            <input 
              ref={formDateRef}
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
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
            value={category} 
            onChange={e => setCategory(e.target.value)}
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
            placeholder="150000"
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Catatan</label>
          <input 
            type="text" 
            className="glass-input" 
            placeholder="Belanja, bensin, dll."
            value={note} 
            onChange={e => setNote(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="glass-button" style={{ marginTop: '0.5rem' }} disabled={isSyncing}>
          <Plus size={20} /> Tambah Catatan
        </button>
      </form>
    </div>
  );
}

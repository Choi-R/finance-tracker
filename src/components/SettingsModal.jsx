import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../utils';

export default function SettingsModal({ 
  isSettingsOpen, 
  setIsSettingsOpen, 
  currentPeriodBudgets, 
  currentPeriod, 
  updateBudget 
}) {
  const [draftBudgets, setDraftBudgets] = useState({});

  useEffect(() => {
    if (isSettingsOpen) {
      setDraftBudgets(currentPeriodBudgets);
    }
  }, [isSettingsOpen, currentPeriodBudgets]);

  const handleSaveBudgets = async () => {
    setIsSettingsOpen(false);
    for (const cat of CATEGORIES) {
      const val = Number(draftBudgets[cat.id] || 0);
      if (val !== currentPeriodBudgets[cat.id]) {
        await updateBudget(cat.id, val);
      }
    }
  };

  return (
    <div className={`modal-overlay ${isSettingsOpen ? 'open' : ''}`} onClick={() => setIsSettingsOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Pengaturan Limit</h3>
          <button className="icon-button" onClick={() => setIsSettingsOpen(false)}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Atur limit untuk tiap kategori. 'Sisa' bakal dihitung dari angka ini. Tinggalin 0 aja kalo nggak pakai limit.
          </p>
          {CATEGORIES.map(cat => (
            <div className="form-group" key={cat.id}>
              <label>Limit {cat.label} buat {currentPeriod.label}</label>
              <input 
                type="number" 
                className="glass-input" 
                value={draftBudgets[cat.id] ?? ''}
                onChange={e => setDraftBudgets(prev => ({ ...prev, [cat.id]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="glass-button" onClick={handleSaveBudgets}>
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';

export default function Header({ 
  isSyncing, 
  currentPeriod, 
  currentPeriodKey, 
  setCurrentPeriodKey, 
  setIsSettingsOpen 
}) {

  const prevPeriod = () => {
    const keyStr = currentPeriodKey.replace('PRD-', '');
    const [y, m] = keyStr.split('-').map(Number);
    const newDate = subMonths(new Date(y, m - 1, 10), 1);
    setCurrentPeriodKey(`PRD-${format(newDate, 'yyyy-MM')}`);
  };

  const nextPeriod = () => {
    const keyStr = currentPeriodKey.replace('PRD-', '');
    const [y, m] = keyStr.split('-').map(Number);
    const newDate = addMonths(new Date(y, m - 1, 10), 1);
    setCurrentPeriodKey(`PRD-${format(newDate, 'yyyy-MM')}`);
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <h1 className="app-title">Finance Tracker</h1>
        {isSyncing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="spinner" style={{
              width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.1)',
              borderTop: '2px solid var(--accent, #6366f1)', borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Menyinkronkan...</span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="period-control">
          <button className="icon-button" onClick={prevPeriod} ><ChevronLeft size={20} /></button>
          <span>{currentPeriod.label}</span>
          <button className="icon-button" onClick={nextPeriod} ><ChevronRight size={20} /></button>
        </div>
        <button className="glass-button glass-button-secondary icon-button" onClick={() => setIsSettingsOpen(true)}>
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}

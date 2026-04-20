import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, isWithinInterval, addMonths, subMonths, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Settings, Plus, Trash2 } from 'lucide-react';
import { CATEGORIES, getPeriodForDate, getPeriodByKey, formatCurrency } from './utils';
import { fetchSheetData, addEntryToSheet, deleteEntryFromSheet, updateBudgetInSheet } from './api';
import { getValidKey, saveKey, clearKey } from './auth';
import './index.css';

export default function App() {
  const [entries, setEntries] = useState(() => {
    const cached = localStorage.getItem('finance_cache_entries');
    return cached ? JSON.parse(cached) : [];
  });
  const [budgetsByPeriod, setBudgetsByPeriod] = useState(() => {
    const cached = localStorage.getItem('finance_cache_budgets');
    return cached ? JSON.parse(cached) : {};
  });
  
  const [isAuthed, setIsAuthed] = useState(() => !!getValidKey());
  const [loginKey, setLoginKey] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [isLoading, setIsLoading] = useState(() => {
    return isAuthed && !localStorage.getItem('finance_cache_entries'); 
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const [currentPeriodKey, setCurrentPeriodKey] = useState(() => {
    return getPeriodForDate(new Date()).monthKey;
  });

  const currentPeriodBudgets = useMemo(() => {
    const defaultBudgets = {
      'daily': 2000000,
      'lain-lain': 0,
      'tagihan': 500000,
      'jajan-suami': 500000,
      'jajan-istri': 500000
    };
    return { ...defaultBudgets, ...(budgetsByPeriod[currentPeriodKey] || {}) };
  }, [budgetsByPeriod, currentPeriodKey]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [detailListMode, setDetailListMode] = useState('grouped'); // 'individual' or 'grouped'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Form State
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('daily');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Fetch data in the background (Stale-While-Revalidate)
  useEffect(() => {
    async function loadData() {
      if (!isAuthed) return;
      if (!isLoading) setIsSyncing(true);
      
      try {
        const data = await fetchSheetData();
        setEntries(data.entries);
        if (data.budgets && Object.keys(data.budgets).length > 0) {
          setBudgetsByPeriod(data.budgets);
        }
      } catch (err) {
        setIsAuthed(false); // Unauthorized or expired
      }
      
      setIsLoading(false);
      setIsSyncing(false);
    }
    loadData();
  }, [isAuthed]);

  // Update local cache whenever state changes
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('finance_cache_entries', JSON.stringify(entries));
    }
  }, [entries]);

  useEffect(() => {
    if (Object.keys(budgetsByPeriod).length > 0) {
      localStorage.setItem('finance_cache_budgets', JSON.stringify(budgetsByPeriod));
    }
  }, [budgetsByPeriod]);

  const currentPeriod = useMemo(() => getPeriodByKey(currentPeriodKey), [currentPeriodKey]);

  // Filter entries for the current period
  const periodEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      // set entryDate to start of day to avoid time issues? The interval checks exact Date.
      // it's safer to just check boundaries: >= start and <= end
      // but date-fns isWithinInterval handles it well if we ensure correct types
      return entryDate >= currentPeriod.start && entryDate <= currentPeriod.end;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries, currentPeriod]);

  // Compute Grand totals & category stats
  const stats = useMemo(() => {
    const defaultStats = CATEGORIES.reduce((acc, cat) => {
      acc[cat.id] = { total: 0, sisa: currentPeriodBudgets[cat.id] || 0 };
      return acc;
    }, {});
    
    periodEntries.forEach(entry => {
      if (defaultStats[entry.category]) {
        defaultStats[entry.category].total += entry.amount;
        defaultStats[entry.category].sisa -= entry.amount;
      }
    });

    return defaultStats;
  }, [periodEntries, currentPeriodBudgets]);

  // The rules stated: Grand total = total of all minus Jajan
  // i.e., Daily + Lain-lain + Tagihan
  const grandTotal = (stats['daily']?.total || 0) + (stats['lain-lain']?.total || 0) + (stats['tagihan']?.total || 0);

  const formatCompact = (num) => {
    if (num === 0) return '-';
    if (num >= 1000000) return (num/1000000).toFixed(1).replace('.0', '') + 'jt';
    if (num >= 1000) return (num/1000).toFixed(0) + 'k';
    return num.toString();
  };

  const recentDaysStats = useMemo(() => {
    // Generate an array of exactly the last 15 days
    const exactLast15Days = Array.from({ length: 15 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
    
    return exactLast15Days.map(date => {
      const dayEntries = periodEntries.filter(e => e.date === date);
      const dailyTotal = dayEntries.filter(e => e.category === 'daily').reduce((sum, e) => sum + e.amount, 0);
      const lainTotal = dayEntries.filter(e => e.category === 'lain-lain').reduce((sum, e) => sum + e.amount, 0);
      const tagihanTotal = dayEntries.filter(e => e.category === 'tagihan').reduce((sum, e) => sum + e.amount, 0);
      
      const dayEntriesFiltered = dayEntries.filter(e => ['daily', 'lain-lain', 'tagihan'].includes(e.category));
      const notes = dayEntriesFiltered.map(e => e.note).filter(Boolean).join(', ');

      return {
        date,
        dailyTotal,
        lainTotal,
        tagihanTotal,
        notes,
        total: dailyTotal + lainTotal + tagihanTotal
      };
    });
  }, [periodEntries]);

  const prevPeriod = () => {
    const [y, m] = currentPeriodKey.split('-').map(Number);
    const newDate = subMonths(new Date(y, m - 1, 10), 1);
    setCurrentPeriodKey(format(newDate, 'yyyy-MM'));
  };

  const nextPeriod = () => {
    const [y, m] = currentPeriodKey.split('-').map(Number);
    const newDate = addMonths(new Date(y, m - 1, 10), 1);
    setCurrentPeriodKey(format(newDate, 'yyyy-MM'));
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;

    const newEntry = {
      id: uuidv4(),
      date,
      category,
      amount: Number(amount),
      note
    };

    // Optimistic Update
    setEntries(prev => [...prev, newEntry]);
    setAmount('');
    setNote('');

    setIsSyncing(true);
    const success = await addEntryToSheet(newEntry);
    if (!success) {
      alert("Gagal menyimpan ke database! Perubahan dibatalkan.");
      setEntries(prev => prev.filter(entry => entry.id !== newEntry.id));
    }
    setIsSyncing(false);
  };

  const handleDeleteEntry = async (id) => {
    if (confirm('Yakin mau hapus pengeluaran ini?')) {
      const entryToRestore = entries.find(e => e.id === id);
      
      // Optimistic delete
      setEntries(prev => prev.filter(e => e.id !== id));
      
      setIsSyncing(true);
      const success = await deleteEntryFromSheet(id);
      if (!success) {
        alert("Gagal menghapus dari database! Perubahan dibatalkan.");
        // Ensure to keep sequence sorted by date
        setEntries(prev => [...prev, entryToRestore].sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      setIsSyncing(false);
    }
  };

  const updateBudget = async (catId, val) => {
    const oldBudgets = { ...budgetsByPeriod };
    
    // Optimistic Update
    setBudgetsByPeriod(prev => {
      const perPeriod = prev[currentPeriodKey] || {};
      return {
        ...prev,
        [currentPeriodKey]: { ...perPeriod, [catId]: val }
      };
    });

    setIsSyncing(true);
    const success = await updateBudgetInSheet(currentPeriodKey, catId, val);
    if (!success) {
      alert("Gagal update limit budget! Perubahan dibatalkan.");
      setBudgetsByPeriod(oldBudgets);
    }
    setIsSyncing(false);
  };

  const renderDetailView = () => {
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    if (!cat) return null;
    
    // Filter to only include category entries
    const categoryEntries = periodEntries.filter(e => e.category === selectedCategory);
    const catStats = stats[selectedCategory];

    // Get grouped entries
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
    const groupedEntries = Object.values(groupedEntriesObj).sort((a, b) => new Date(b.date) - new Date(a.date));

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
                          {format(new Date(entry.date), 'dd MMMM', { locale: id })}
                        </span>
                      </div>
                      <div className="hi-note">{entry.note}</div>
                    </div>
                    <div className="hi-right">
                      <div className="hi-amount">{formatCurrency(entry.amount)}</div>
                      <button className="hi-delete" title="Delete" onClick={() => handleDeleteEntry(entry.id)}>
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
                          {format(new Date(group.date), 'dd MMMM', { locale: id })}
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
  };

  const renderDateDetailView = () => {
    if (!selectedDate) return null;
    
    const dateEntries = periodEntries.filter(e => e.date === selectedDate);
    const dateTotal = dateEntries.reduce((sum, e) => sum + e.amount, 0);

    return (
      <div className="category-detail-view" style={{ animation: 'fadeIn 0.3s ease' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '0.5rem 0 1.5rem' }}>
          <button className="icon-button" onClick={() => setSelectedDate(null)}>
            <ChevronLeft size={24} />
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            Pengeluaran 
            <input 
              type="date" 
              className="glass-input custom-date-input" 
              style={{ width: '13rem', padding: '0.3rem 0.5rem', fontSize: '1.1rem', fontWeight: 700 }}
              value={selectedDate} 
              data-date={selectedDate ? format(new Date(selectedDate), 'dd MMMM yyyy', { locale: id }) : ''}
              onChange={e => setSelectedDate(e.target.value)}
            />
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
                        <span className="hi-date clickable-date" title="Per Hari" onClick={() => setSelectedDate(entry.date)}>{format(new Date(entry.date), 'dd MMMM', { locale: id })}</span>
                      </div>
                      <div className="hi-note">{entry.note}</div>
                    </div>
                    <div className="hi-right">
                      <div className="hi-amount">{formatCurrency(entry.amount)}</div>
                      <button className="hi-delete" title="Delete" onClick={() => handleDeleteEntry(entry.id)}>
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
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginKey) return;
    setIsLoading(true);
    setLoginError(false);
    
    try {
      const data = await fetchSheetData(loginKey);
      saveKey(loginKey);
      setEntries(data.entries);
      if (data.budgets && Object.keys(data.budgets).length > 0) {
        setBudgetsByPeriod(data.budgets);
      }
      setIsAuthed(true);
    } catch (e) {
      setLoginError(true);
    }
    setIsLoading(false);
  };

  if (!isAuthed) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '350px', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Outfit' }}>Vault Access</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="Enter Passkey" 
              value={loginKey}
              onChange={e => setLoginKey(e.target.value)}
              required
              autoFocus
              style={{ textAlign: 'center', letterSpacing: '3px', fontSize: '1.2rem' }}
            />
            {loginError && <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem', margin: '0' }}>Akses ditolak.</p>}
            <button type="submit" className="glass-button" style={{ width: '100%' }} disabled={isLoading}>
              {isLoading ? 'Decrypting...' : 'Unlock'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {isLoading && (
        <div className="loading-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)', zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="spinner" style={{
             width: '40px', height: '40px', border: '5px solid rgba(255,255,255,0.1)',
             borderTop: '5px solid var(--accent)', borderRadius: '50%',
             animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '1rem', fontWeight: 'bold', animation: 'pulse 1.5s infinite ease-in-out' }}>
            Menyinkronkan Data...
          </p>
        </div>
      )}
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

      {selectedDate ? (
        renderDateDetailView()
      ) : selectedCategory ? (
        renderDetailView()
      ) : (
        <>
          <div className="summary-grid">
            <div 
              className="glass-panel stat-card cat-grand clickable-card" 
              style={{ gridColumn: '1 / -1' }}
              onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
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

          <div className="main-grid">
            {/* Form Section */}
            <div className="input-section glass-panel">
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Tambah Pengeluaran</h2>
              <form className="entry-form" onSubmit={handleAddEntry}>
                <div className="form-group">
                  <label>Tanggal</label>
                  <input 
                    type="date" 
                    className="glass-input custom-date-input" 
                    value={date} 
                    data-date={date ? format(new Date(date), 'dd/MM/yyyy') : ''}
                    onChange={e => setDate(e.target.value)}
                    required
                  />
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

            {/* History Section */}
            <div className="history-section">
              <div className="history-header">
                <h2>Ringkasan 15 Hari Terakhir</h2>
              </div>
              
              {recentDaysStats.length === 0 ? (
                <div className="empty-state">
                  <p>Belum ada pengeluaran di periode ini.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.7 }}>Yuk mulai catat pengeluaranmu dari sekarang!</p>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(45px, auto) 45px 45px 45px 45px 1fr', gap: '0.5rem', padding: '0.5rem 0 0.75rem 0', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    <div>Tgl</div>
                    <div style={{ textAlign: 'right' }}>Daily</div>
                    <div style={{ textAlign: 'right' }}>Lain</div>
                    <div style={{ textAlign: 'right' }}>Tagihan</div>
                    <div style={{ textAlign: 'right', color: 'var(--text-primary)' }}>Total</div>
                    <div style={{ marginLeft: '1rem' }}>Catatan</div>
                  </div>
                  
                  {recentDaysStats.map((stat, i) => (
                    <div 
                      key={stat.date} 
                      className="compact-row" 
                      onClick={() => setSelectedDate(stat.date)}
                      title="Lihat detail hari ini"
                      style={{ 
                        cursor: 'pointer',
                        display: 'grid', gridTemplateColumns: 'minmax(45px, auto) 45px 45px 45px 45px 1fr', 
                        gap: '0.5rem', 
                        borderBottom: i === recentDaysStats.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', 
                        alignItems: 'center' 
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{format(new Date(stat.date), 'dd MMM', { locale: id })}</div>
                      <div style={{ textAlign: 'right', fontSize: '0.85rem', color: stat.dailyTotal === 0 ? 'var(--text-secondary)' : '#fff' }}>{formatCompact(stat.dailyTotal)}</div>
                      <div style={{ textAlign: 'right', fontSize: '0.85rem', color: stat.lainTotal === 0 ? 'var(--text-secondary)' : '#fff' }}>{formatCompact(stat.lainTotal)}</div>
                      <div style={{ textAlign: 'right', fontSize: '0.85rem', color: stat.tagihanTotal === 0 ? 'var(--text-secondary)' : '#fff' }}>{formatCompact(stat.tagihanTotal)}</div>
                      <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: stat.total === 0 ? 'var(--text-secondary)' : 'var(--accent, #6366f1)' }}>{formatCompact(stat.total)}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: '1rem' }}>{stat.notes || '-'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Settings Modal Setup */}
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
                  value={currentPeriodBudgets[cat.id]}
                  onChange={e => updateBudget(cat.id, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="glass-button" onClick={() => setIsSettingsOpen(false)}>
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

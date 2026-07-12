import { useState, useEffect, useMemo } from 'react';
import { fetchSheetData, addEntryToSheet, editEntryInSheet, deleteEntryFromSheet, updateBudgetInSheet } from '../api';
import { CATEGORIES, getPeriodForDate, getPeriodByKey, parseLocalDate, formatISO } from '../utils';

export function useFinanceData(isAuthed, setIsAuthed) {
  const [entries, setEntries] = useState(() => {
    const cached = localStorage.getItem('finance_cache_entries');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [budgetsByPeriod, setBudgetsByPeriod] = useState(() => {
    const cached = localStorage.getItem('finance_cache_budgets');
    return cached ? JSON.parse(cached) : {};
  });

  const [isLoading, setIsLoading] = useState(() => {
    return isAuthed && !localStorage.getItem('finance_cache_entries'); 
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const [currentPeriodKey, setCurrentPeriodKey] = useState(() => {
    return getPeriodForDate(new Date()).monthKey;
  });

  const currentPeriod = useMemo(() => getPeriodByKey(currentPeriodKey), [currentPeriodKey]);

  // Fetch data on auth
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
        setIsAuthed(false);
      }
      
      setIsLoading(false);
      setIsSyncing(false);
    }
    loadData();
  }, [isAuthed, isLoading, setIsAuthed]);

  // Sync to local cache
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

  // Derived Data
  const currentPeriodBudgets = useMemo(() => {
    const defaultBudgets = {
      'daily': 2000000,
      'lain-lain': 0,
      'tagihan': 500000,
      'jajan-suami': 500000,
      'jajan-istri': 500000,
      'situasional': 0
    };
    return { ...defaultBudgets, ...(budgetsByPeriod[currentPeriodKey] || {}) };
  }, [budgetsByPeriod, currentPeriodKey]);

  const periodEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = parseLocalDate(entry.date);
      return entryDate >= currentPeriod.start && entryDate <= currentPeriod.end;
    }).sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
  }, [entries, currentPeriod]);

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

  const grandTotal = (stats['daily']?.total || 0) + (stats['lain-lain']?.total || 0) + (stats['tagihan']?.total || 0);

  const recentDaysStats = useMemo(() => {
    const exactLast7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return formatISO(d);
    });
    
    return exactLast7Days.map(date => {
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

  // Handlers
  const addEntry = async (newEntry) => {
    // Optimistic Update
    setEntries(prev => [...prev, newEntry]);
    setIsSyncing(true);
    const success = await addEntryToSheet(newEntry);
    if (!success) {
      alert("Gagal menyimpan ke database! Perubahan dibatalkan.");
      setEntries(prev => prev.filter(entry => entry.id !== newEntry.id));
    }
    setIsSyncing(false);
  };

  const deleteEntry = async (id) => {
    if (confirm('Yakin mau hapus pengeluaran ini?')) {
      const entryToRestore = entries.find(e => e.id === id);
      // Optimistic delete
      setEntries(prev => prev.filter(e => e.id !== id));
      setIsSyncing(true);
      const success = await deleteEntryFromSheet(id);
      if (!success) {
        alert("Gagal menghapus dari database! Perubahan dibatalkan.");
        setEntries(prev => [...prev, entryToRestore].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)));
      }
      setIsSyncing(false);
    }
  };

  const editEntry = async (updatedEntry) => {
    const originalEntry = entries.find(e => e.id === updatedEntry.id);
    if (!originalEntry) return;
    // Optimistic Update
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    setIsSyncing(true);
    const success = await editEntryInSheet(updatedEntry);
    if (!success) {
      alert("Gagal memperbarui data di database! Perubahan dibatalkan.");
      setEntries(prev => prev.map(e => e.id === updatedEntry.id ? originalEntry : e));
    }
    setIsSyncing(false);
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

  return {
    entries,
    setEntries,
    budgetsByPeriod,
    setBudgetsByPeriod,
    isLoading,
    isSyncing,
    currentPeriodKey,
    setCurrentPeriodKey,
    currentPeriod,
    currentPeriodBudgets,
    periodEntries,
    stats,
    grandTotal,
    recentDaysStats,
    addEntry,
    editEntry,
    deleteEntry,
    updateBudget
  };
}

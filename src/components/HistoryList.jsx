import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { parseLocalDate } from '../utils';

export default function HistoryList({ recentDaysStats, entries, setSelectedDate }) {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const matched = entries.filter(e => e.note && e.note.toLowerCase().includes(query));
    
    const grouped = matched.reduce((acc, entry) => {
      if (!acc[entry.date]) {
         acc[entry.date] = { date: entry.date, dailyTotal: 0, lainTotal: 0, tagihanTotal: 0, situasionalTotal: 0, notes: [], total: 0 };
      }
      if (entry.category === 'daily') acc[entry.date].dailyTotal += entry.amount;
      else if (entry.category === 'lain-lain') acc[entry.date].lainTotal += entry.amount;
      else if (entry.category === 'tagihan') acc[entry.date].tagihanTotal += entry.amount;
      else if (entry.category === 'situasional') acc[entry.date].situasionalTotal += entry.amount;
      
      if (['daily', 'lain-lain', 'tagihan', 'situasional'].includes(entry.category)) {
        acc[entry.date].total += entry.amount;
      }
      acc[entry.date].notes.push(entry.note);
      return acc;
    }, {});
    
    return Object.values(grouped)
      .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))
      .slice(0, 10)
      .map(item => ({
         ...item,
         notes: item.notes.join(', ')
      }));
  }, [searchQuery, entries]);

  const formatCompact = (num) => {
    if (num === 0) return '-';
    if (num >= 1000000) return (num/1000000).toFixed(1).replace('.0', '') + 'jt';
    if (num >= 1000) return (num/1000).toFixed(0) + 'k';
    return num.toString();
  };

  const renderStatsList = (statsList) => (
    <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(45px, auto) 45px 45px 45px 45px 1fr', gap: '0.5rem', padding: '0.5rem 0 0.75rem 0', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
        <div>Tgl</div>
        <div style={{ textAlign: 'right' }}>Daily</div>
        <div style={{ textAlign: 'right' }}>Lain</div>
        <div style={{ textAlign: 'right' }}>Tagihan</div>
        <div style={{ textAlign: 'right', color: 'var(--text-primary)' }}>Total</div>
        <div style={{ marginLeft: '1rem' }}>Catatan</div>
      </div>
      
      {statsList.map((stat, i) => (
        <div 
          key={stat.date} 
          className="compact-row" 
          onClick={() => setSelectedDate(stat.date)}
          title="Lihat detail hari ini"
          style={{ 
            cursor: 'pointer',
            display: 'grid', gridTemplateColumns: 'minmax(45px, auto) 45px 45px 45px 45px 1fr', 
            gap: '0.5rem', 
            borderBottom: i === statsList.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', 
            alignItems: 'center' 
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{format(parseLocalDate(stat.date), 'dd MMM', { locale: id })}</div>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: stat.dailyTotal === 0 ? 'var(--text-secondary)' : '#fff' }}>{formatCompact(stat.dailyTotal)}</div>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: stat.lainTotal === 0 ? 'var(--text-secondary)' : '#fff' }}>{formatCompact(stat.lainTotal)}</div>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: stat.tagihanTotal === 0 ? 'var(--text-secondary)' : '#fff' }}>{formatCompact(stat.tagihanTotal)}</div>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: stat.total === 0 ? 'var(--text-secondary)' : 'var(--accent, #6366f1)' }}>{formatCompact(stat.total)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: '1rem' }}>{stat.notes || '-'}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="history-section">
      <div className="history-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>{searchQuery ? 'Hasil Pencarian' : 'Ringkasan 7 Hari Terakhir'}</h2>
        <input 
          type="text" 
          className="glass-input" 
          placeholder="Cari catatan..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '200px', padding: '0.4rem 0.8rem', fontSize: '0.9rem', margin: 0 }}
        />
      </div>
      
      {searchQuery ? (
        searchResults.length === 0 ? (
          <div className="empty-state">
            <p>Tidak ada hasil yang cocok dengan "{searchQuery}".</p>
          </div>
        ) : (
          renderStatsList(searchResults)
        )
      ) : (
        recentDaysStats.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada pengeluaran di periode ini.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.7 }}>Yuk mulai catat pengeluaranmu dari sekarang!</p>
          </div>
        ) : (
          renderStatsList(recentDaysStats)
        )
      )}
    </div>
  );
}

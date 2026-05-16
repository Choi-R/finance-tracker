import React, { useState } from 'react';
import './index.css';

import { useFinanceData } from './hooks/useFinanceData';
import { useAuth } from './hooks/useAuth';

import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import SummaryStats from './components/SummaryStats';
import EntryForm from './components/EntryForm';
import HistoryList from './components/HistoryList';
import CategoryDetailView from './components/CategoryDetailView';
import DateDetailView from './components/DateDetailView';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isAuthed, setIsAuthed] = useState(() => !!localStorage.getItem('vault_auth'));

  const financeData = useFinanceData(isAuthed, setIsAuthed);
  const authProps = useAuth(financeData.setEntries, financeData.setBudgetsByPeriod, isAuthed, setIsAuthed);
  
  if (!authProps.isAuthed) {
    return <AuthScreen {...authProps} />;
  }

  return (
    <div className="app-container">
      {financeData.isLoading && (
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

      <Header 
        isSyncing={financeData.isSyncing}
        currentPeriod={financeData.currentPeriod}
        currentPeriodKey={financeData.currentPeriodKey}
        setCurrentPeriodKey={financeData.setCurrentPeriodKey}
        setIsSettingsOpen={setIsSettingsOpen}
      />

      {selectedDate ? (
        <DateDetailView 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          entries={financeData.entries}
          deleteEntry={financeData.deleteEntry}
        />
      ) : selectedCategory ? (
        <CategoryDetailView 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          periodEntries={financeData.periodEntries}
          stats={financeData.stats}
          setSelectedDate={setSelectedDate}
          deleteEntry={financeData.deleteEntry}
        />
      ) : (
        <>
          <SummaryStats 
            stats={financeData.stats}
            grandTotal={financeData.grandTotal}
            setSelectedDate={setSelectedDate}
            setSelectedCategory={setSelectedCategory}
          />
          <div className="main-grid">
            <EntryForm 
              isSyncing={financeData.isSyncing}
              addEntry={financeData.addEntry}
            />
            <HistoryList 
              recentDaysStats={financeData.recentDaysStats}
              entries={financeData.entries}
              setSelectedDate={setSelectedDate}
            />
          </div>
        </>
      )}

      <SettingsModal 
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        currentPeriodBudgets={financeData.currentPeriodBudgets}
        currentPeriod={financeData.currentPeriod}
        updateBudget={financeData.updateBudget}
      />
    </div>
  );
}

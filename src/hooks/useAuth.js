import { useState } from 'react';
import { getValidKey, saveKey } from '../auth';
import { fetchSheetData } from '../api';

export function useAuth(setEntries, setBudgetsByPeriod, isAuthed, setIsAuthed) {
  const [loginKey, setLoginKey] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginKey) return;
    setIsLoadingAuth(true);
    setLoginError(false);
    
    try {
      const data = await fetchSheetData(loginKey);
      saveKey(loginKey);
      setEntries(data.entries);
      if (data.budgets && Object.keys(data.budgets).length > 0) {
        setBudgetsByPeriod(data.budgets);
      }
      setIsAuthed(true);
    } catch (err) {
      setLoginError(true);
    }
    setIsLoadingAuth(false);
  };

  return {
    isAuthed,
    setIsAuthed,
    loginKey,
    setLoginKey,
    loginError,
    isLoadingAuth,
    handleLogin
  };
}

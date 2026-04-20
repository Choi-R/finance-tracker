const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export function getValidKey() {
  const saved = localStorage.getItem('vault_auth');
  if (!saved) return null;

  try {
    const { key, expiry } = JSON.parse(saved);
    if (Date.now() > expiry) {
      localStorage.removeItem('vault_auth');
      return null;
    }
    return key;
  } catch (e) {
    return null;
  }
}

export function saveKey(inputKey) {
  const authData = {
    key: inputKey,
    expiry: Date.now() + ONE_WEEK
  };
  localStorage.setItem('vault_auth', JSON.stringify(authData));
}

export function clearKey() {
  localStorage.removeItem('vault_auth');
  localStorage.removeItem('finance_cache_entries');
  localStorage.removeItem('finance_cache_budgets');
}

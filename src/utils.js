import { startOfMonth, endOfMonth, setDate, isBefore, addMonths, subMonths, format } from 'date-fns';
import { id } from 'date-fns/locale';

export const CATEGORIES = [
  { id: 'daily', label: 'Daily', badgeClass: 'cat-badge-daily', colorClass: 'cat-daily' },
  { id: 'lain-lain', label: 'Lain-Lain', badgeClass: 'cat-badge-lain-lain', colorClass: 'cat-lain-lain' },
  { id: 'tagihan', label: 'Tagihan, Iuran', badgeClass: 'cat-badge-tagihan', colorClass: 'cat-tagihan' },
  { id: 'jajan-suami', label: 'Jajan Suami', badgeClass: 'cat-badge-jajan-suami', colorClass: 'cat-jajan-suami' },
  { id: 'jajan-istri', label: 'Jajan Istri', badgeClass: 'cat-badge-jajan-istri', colorClass: 'cat-jajan-istri' }
];

// Calculate period based on the 10th of the month cutoff
export const getPeriodForDate = (dateObj) => {
  const day = dateObj.getDate();
  // If the day is before the 10th, the period "started" in the previous month
  const baseMonth = day < 10 ? subMonths(dateObj, 1) : dateObj;
  
  const start = setDate(baseMonth, 10);
  const end = setDate(addMonths(baseMonth, 1), 9);
  
  return {
    start,
    end,
    // Month name based on the baseMonth (which is the month of the 10th)
    monthKey: format(baseMonth, 'yyyy-MM'),
    label: `${format(start, 'dd MMMM yyyy', { locale: id })} - ${format(end, 'dd MMMM yyyy', { locale: id })}`
  };
};

export const getPeriodByKey = (monthKeyStr) => {
  const [year, month] = monthKeyStr.split('-').map(Number);
  const baseMonth = new Date(year, month - 1, 10);
  
  const start = setDate(baseMonth, 10);
  const end = setDate(addMonths(baseMonth, 1), 9);
  
  return {
    start,
    end,
    monthKey: monthKeyStr,
    label: `${format(start, 'dd MMMM yyyy', { locale: id })} - ${format(end, 'dd MMMM yyyy', { locale: id })}`
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

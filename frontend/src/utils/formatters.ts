/**
 * Centralized Indian Localization, Financial Calculations & Currency Utilities for BorrowBuy
 */

/**
 * Format a number into Indian Rupees (INR) with proper Indian numbering grouping (Lakhs, Crores).
 * Example: 500 -> ₹500, 1500 -> ₹1,500, 100000 -> ₹1,00,000
 */
export function formatINR(amount: number, forceDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const hasDecimals = amount % 1 !== 0 || forceDecimals;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return formatted;
}

/**
 * Format a date in Indian standard notation (e.g. "14 Nov 2026").
 */
export function formatDateIN(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(d);
}

/**
 * Format date & time explicitly in India Standard Time (IST).
 * Example: "14 Nov 2026, 03:30 PM IST"
 */
export function formatDateTimeIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '—';

  const formatted = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(d);

  return `${formatted} IST`;
}

/**
 * Format a date range cleanly (e.g. "14 Nov – 18 Nov 2026").
 */
export function formatDateRangeIN(startDate: string | Date, endDate: string | Date): string {
  const start = formatDateIN(startDate);
  const end = formatDateIN(endDate);
  return `${start} → ${end}`;
}

/**
 * Format Indian mobile phone number into readable format.
 * Example: "+91 98765 43210"
 */
export function formatPhoneIN(phone?: string | null): string {
  if (!phone) return '+91 —';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

/**
 * Centralized authoritative calculation of rental charges and deposit breakdown.
 * Shared mathematical model to prevent frontend/backend discrepancy.
 */
export function calculateRentalFinancials(dailyPrice: number, totalDays: number, securityDeposit: number) {
  const days = Math.max(1, Math.round(totalDays));
  const rentalTotal = Math.round(Number(dailyPrice) * days * 100) / 100;
  const deposit = Math.round(Number(securityDeposit) * 100) / 100;
  const convenienceFee = 0; // ₹0 subscription/platform fee
  const totalAmount = Math.round((rentalTotal + deposit + convenienceFee) * 100) / 100;

  return {
    dailyPrice: Number(dailyPrice),
    totalDays: days,
    rentalTotal,
    securityDeposit: deposit,
    convenienceFee,
    totalAmount,
    refundableAmount: deposit,
  };
}

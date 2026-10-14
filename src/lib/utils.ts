import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strict Indian Rupee Formatter:
 * Uses en-IN locale with currency 'INR' and no decimals by default.
 * Example: formatINR(125000) => "₹1,25,000"
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Global alias ensuring legacy formatCurrency calls render INR
export const formatCurrency = formatINR;

/**
 * IST (Asia/Kolkata) Date & Time formatters
 * Formats like: "Fri, 17 Oct, 6:30 PM IST"
 */
export function formatISTDateTime(dateOrIso: string | Date): string {
  try {
    const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).formatToParts(d);

    const weekday = parts.find((p) => p.type === 'weekday')?.value || '';
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value || '';

    return `${weekday}, ${day} ${month}, ${hour}:${minute} ${dayPeriod} IST`;
  } catch {
    return String(dateOrIso);
  }
}

export function formatISTDate(dateOrIso: string | Date): string {
  try {
    const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateOrIso);
  }
}

export function formatISTTime(dateOrIso: string | Date): string {
  try {
    const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
    return (
      new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(d) + ' IST'
    );
  } catch {
    return String(dateOrIso);
  }
}

export function formatDate(dateString: string): string {
  return formatISTDate(dateString);
}

export function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatISTDate(dateString);
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Indian Phone Validation: starts with 6-9, followed by 9 digits
export function validateIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return /^[6-9]\d{9}$/.test(cleaned);
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(cleaned.substring(2));
  }
  return false;
}

// UPI ID Validation: e.g. name@bank, phone@paytm, user@oksbi
export function validateUPI(upi: string): boolean {
  return /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,49}$/.test(upi.trim());
}

// Indian Financial System Code (IFSC): 4 uppercase letters, '0', 6 alphanumeric characters
export function validateIFSC(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase());
}

/**
 * Generates and triggers download of an .ics calendar file
 */
export function downloadICS({
  title,
  description,
  startDateTime,
  durationMinutes,
  location = 'SolveBridge Live Session Room',
}: {
  title: string;
  description: string;
  startDateTime: Date | string;
  durationMinutes: number;
  location?: string;
}) {
  const start = typeof startDateTime === 'string' ? new Date(startDateTime) : startDateTime;
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const formatICSDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SolveBridge//Session Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:solvebridge-${Date.now()}@solvebridge.in`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `SolveBridge-Session-${Date.now()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

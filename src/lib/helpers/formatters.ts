import { format } from "date-fns";
import { ar } from "date-fns/locale";

/**
 * Format a date string to Arabic format with Gregorian calendar
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string in Arabic
 */
export const formatDate = (dateString: string | Date): string => {
  try {
    return format(new Date(dateString), "d MMMM yyyy", { locale: ar });
  } catch {
    return typeof dateString === 'string' ? dateString : dateString.toISOString();
  }
};

/**
 * Format a date with Gregorian calendar using toLocaleDateString
 * @param date - Date string or Date object
 * @param options - Optional Intl.DateTimeFormatOptions (calendar is forced to 'gregory')
 * @returns Formatted date string in Arabic with Gregorian calendar
 */
export const formatDateGregorian = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-SA-u-nu-latn', {
      calendar: 'gregory',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    });
  } catch {
    return typeof date === 'string' ? date : date.toISOString();
  }
};

/**
 * Format a date in short format (DD/MM/YYYY) with Gregorian calendar
 * @param date - Date string or Date object
 * @returns Short formatted date string
 */
export const formatDateShort = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-SA-u-nu-latn', {
      calendar: 'gregory',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return typeof date === 'string' ? date : date.toISOString();
  }
};

/**
 * Format a date in long format with full month name
 * @param date - Date string or Date object
 * @returns Long formatted date string
 */
export const formatDateLong = (date: string | Date): string => {
  return formatDateGregorian(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date and time with Gregorian calendar
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-SA-u-nu-latn', {
      calendar: 'gregory',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return typeof date === 'string' ? date : date.toISOString();
  }
};

/**
 * Format date with weekday name
 * @param date - Date string or Date object
 * @returns Formatted date string with weekday
 */
export const formatDateWithWeekday = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-SA-u-nu-latn', {
      calendar: 'gregory',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return typeof date === 'string' ? date : date.toISOString();
  }
};

/**
 * Format date for display in forms and inputs (YYYY-MM-DD)
 * @param date - Date string or Date object
 * @returns ISO date string (YYYY-MM-DD)
 */
export const formatDateISO = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch {
    return typeof date === 'string' ? date : date.toISOString();
  }
};

/**
 * Format relative time (e.g., "منذ 5 دقائق", "قبل ساعتين")
 * @param date - Date string or Date object
 * @returns Relative time string in Arabic
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'الآن';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : minutes === 2 ? 'دقيقتين' : 'دقائق'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `قبل ${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتين' : 'ساعات'}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `قبل ${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومين' : 'أيام'}`;
    } else {
      return formatDateLong(dateObj);
    }
  } catch {
    return typeof date === 'string' ? date : date.toISOString();
  }
};

/**
 * Get Arabic label for project status
 * @param status - Project status
 * @returns Arabic label
 */
export const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    new: "جديد",
    processing: "قيد التجهيز",
    ready: "جاهز",
  };
  return statusMap[status] || status;
};

/**
 * Get badge variant for project status
 * @param status - Project status
 * @returns Badge variant
 */
export const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
  const variantMap: Record<string, "default" | "secondary" | "outline"> = {
    new: "secondary",
    processing: "default",
    ready: "outline",
  };
  return variantMap[status] || "default";
};

/**
 * Format a number using English numerals
 * @param num - Number to format
 * @returns Formatted number string with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Format token count to human-readable format
 * @param tokens - Number of tokens
 * @returns Formatted string (e.g., "50K", "3M")
 */
export const formatTokens = (tokens: number): string => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toLocaleString('en-US')}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toLocaleString('en-US')}K`;
  }
  return tokens.toLocaleString('en-US');
};


/**
 * Centralized locale configuration for the application
 * This file contains all locale-related settings including calendar type,
 * number format, currency, and date/time formatting options.
 */

/**
 * Calendar configuration
 */
export const CALENDAR = {
  TYPE: 'gregory' as const, // Gregorian calendar (not Hijri)
  NUMBERING_SYSTEM: 'latn' as const, // Latin/Western numerals (0-9)
} as const;

/**
 * Locale strings for formatting
 */
export const LOCALE = {
  /**
   * Primary locale for date formatting
   * ar-SA: Arabic (Saudi Arabia)
   * u-nu-latn: Use Latin numerals
   */
  DATE: 'ar-SA-u-nu-latn' as const,
  
  /**
   * Locale for number formatting
   * en-US: English (United States) ensures Western numerals and comma separators
   */
  NUMBER: 'en-US' as const,
} as const;

/**
 * Currency configuration
 */
export const CURRENCY = {
  CODE: 'USD' as const,
  SYMBOL: '$' as const,
  DECIMALS: 2,
} as const;

/**
 * Common date format options presets
 */
export const DATE_FORMAT_OPTIONS = {
  /**
   * Long format: "26 نوفمبر 2025"
   */
  LONG: {
    calendar: CALENDAR.TYPE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  } as Intl.DateTimeFormatOptions,

  /**
   * Short format: "26/11/2025"
   */
  SHORT: {
    calendar: CALENDAR.TYPE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  } as Intl.DateTimeFormatOptions,

  /**
   * With time: "26 نوفمبر 2025، 14:30"
   */
  WITH_TIME: {
    calendar: CALENDAR.TYPE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  } as Intl.DateTimeFormatOptions,

  /**
   * With weekday: "الأربعاء، 26 نوفمبر 2025"
   */
  WITH_WEEKDAY: {
    calendar: CALENDAR.TYPE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  } as Intl.DateTimeFormatOptions,
} as const;

/**
 * Helper to create custom date format options with calendar and numbering system
 */
export const createDateFormatOptions = (
  options: Intl.DateTimeFormatOptions = {}
): Intl.DateTimeFormatOptions => ({
  calendar: CALENDAR.TYPE,
  ...options,
});

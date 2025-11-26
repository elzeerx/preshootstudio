import { format } from "date-fns";
import { ar } from "date-fns/locale";

/**
 * Format a date string to Arabic format
 * @param dateString - ISO date string
 * @returns Formatted date string in Arabic
 */
export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "d MMMM yyyy", { locale: ar });
  } catch {
    return dateString;
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


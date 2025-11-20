/**
 * Helper functions for determining content freshness based on research timestamps
 */

/**
 * Checks if content was generated before the most recent research run
 * @param contentTimestamp - When the content was last generated
 * @param researchTimestamp - When research was last run
 * @returns true if content is outdated (needs regeneration)
 */
export const isContentOutdated = (
  contentTimestamp: string | null,
  researchTimestamp: string | null
): boolean => {
  if (!contentTimestamp || !researchTimestamp) {
    return false;
  }

  try {
    const contentDate = new Date(contentTimestamp);
    const researchDate = new Date(researchTimestamp);
    return contentDate < researchDate;
  } catch {
    return false;
  }
};

/**
 * Gets the appropriate badge text for outdated content
 */
export const getOutdatedBadgeText = (): string => {
  return "بحاجة للتحديث";
};

/**
 * Gets the short badge text for outdated content (mobile/tablet)
 */
export const getOutdatedBadgeTextShort = (): string => {
  return "تحديث";
};

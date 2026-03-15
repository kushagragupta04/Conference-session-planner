/**
 * Formats a PostgreSQL INTERVAL object or string into a human-readable duration.
 * @param {string|object} duration 
 * @returns {string}
 */
export const formatDuration = (duration) => {
  if (!duration) return 'N/A';
  
  if (typeof duration === 'string') {
    // If it's already a string like "45 minutes" or "01:00:00"
    return duration;
  }
  
  if (typeof duration === 'object') {
    const parts = [];
    if (duration.hours) parts.push(`${duration.hours}h`);
    if (duration.minutes) parts.push(`${duration.minutes}m`);
    if (duration.seconds && !duration.hours && !duration.minutes) parts.push(`${duration.seconds}s`);
    
    return parts.length > 0 ? parts.join(' ') : '0m';
  }
  
  return String(duration);
};

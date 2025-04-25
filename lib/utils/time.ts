/**
 * Parses a combined day and time range string into its components.
 * Handles common abbreviations like 'MW', 'TTh', 'MWF'.
 * 
 * Example input: "MW 10:00AM - 11:20AM"
 * Example output: { days: ['M', 'W'], startTime: '10:00AM', endTime: '11:20AM' }
 * 
 * @param timeString - The combined time string to parse, or undefined.
 * @returns An object containing an array of days, start time string, and end time string.
 *          Returns empty values if the input is invalid or undefined.
 */
export function parseTimeString(timeString: string | undefined): { days: string[]; startTime: string; endTime: string } {
  if (!timeString) {
    return { days: [], startTime: '', endTime: '' };
  }

  const [daysStr, timeRange] = timeString.split(' ');
  if (!timeRange) {
    return { days: [], startTime: '', endTime: '' };
  }

  const [startTime, endTime] = timeRange.split(' - ');
  
  const dayMap: { [key: string]: string[] } = {
    'MW': ['M', 'W'],
    'TTh': ['T', 'Th'],
    'MWF': ['M', 'W', 'F']
  };

  return {
    days: dayMap[daysStr] || [daysStr],
    startTime: startTime || '',
    endTime: endTime || ''
  };
}

/**
 * Converts a time string in 12-hour AM/PM format to a numerical 24-hour format.
 * The numerical value represents hours, with minutes as a fraction of an hour.
 * 
 * Example input: "1:30PM"
 * Example output: 13.5
 * 
 * Example input: "10:00AM"
 * Example output: 10.0
 * 
 * Handles 12 AM (returns 0) and 12 PM (returns 12).
 * 
 * @param time - The time string to convert (e.g., "1:30PM"), or undefined.
 * @returns The time as a number in 24-hour format (e.g., 13.5), or 0 if input is invalid/undefined.
 */
export function convertTo24Hour(time: string | undefined): number {
  if (!time) return 0;

  const match = time.match(/(\d+):(\d+)\s*([AP]M)/i);
  if (!match) return 0;

  const [_, hours, minutes, period] = match;
  let hour = parseInt(hours);
  
  if (period.toUpperCase() === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period.toUpperCase() === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return hour + parseInt(minutes) / 60;
}
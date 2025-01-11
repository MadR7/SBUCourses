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
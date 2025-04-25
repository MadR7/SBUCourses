/**
 * A mapping from letter grades to specific hex color codes.
 * Used for consistently coloring grade representations, particularly in charts.
 * The comments indicate the semantic meaning associated with each color choice.
 */
export const gradeColorMap: { [key: string]: string } = {
  'A': '#00A878',   // Deep green: success, excellence, achievement
  'B': '#368CBF',   // Strong blue: stability, trust, good performance
  'C': '#FFA41B',   // Amber: average performance, caution
  'D': '#FF4B1F',   // Orange-red: serious concern, near failing
  'F': '#E71D36',   // Bright red: failure, danger, stop
  'I': '#9381FF',   // Purple: incomplete, pending, mystery
  'P': '#7D83FF',   // Blue-purple: passing, acceptable
  'S': '#70A288',   // Sage green: satisfactory, adequate
  'U': '#B76D68',   // Muted red: unsatisfactory but not as severe as F
  'W': '#6C757D',   // Gray: withdrawn, neutral
  'A-': '#2D936C',  // Slightly muted green: still excellent but slightly less intense
  'B+': '#368CBF',  // Bright blue: competence, reliability, slightly below top tier
  'B-': '#5C85AD',  // Muted blue: slightly decreased performance but still good
  'C+': '#FFB627',  // Bright amber: warning, average performance with potential
  'C-': '#FF9505',  // Dark amber: slightly below average, increased caution
  'D+': '#FF6B35',  // Light orange-red: concern, risk of failure
  'NC': '#495057'   // Dark gray: no credit, finality
};

/**
 * An array defining the canonical sort order for letter grades.
 * Used to ensure grades are displayed and sorted logically (e.g., in charts).
 */
export const gradeOrder = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "I", "P", "S", "U", "W", "NC"];

/**
 * A mapping derived from `gradeOrder`, associating each letter grade with its numerical sort index.
 * This provides an efficient lookup for sorting grades according to the `gradeOrder` array.
 */
export const gradeOrderMap = gradeOrder.reduce((acc: { [key: string]: number }, grade, index) => {
  acc[grade] = index;
  return acc;
}, {}); 
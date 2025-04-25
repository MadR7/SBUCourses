import { useMemo } from 'react';
import { type Section } from '@/types/Section';

/**
 * Custom hook to extract and memoize a unique list of semesters from an array of sections.
 * 
 * Filters out null values and returns a stable array reference unless the input sections change.
 * 
 * @param sections - An array of Section objects.
 * @returns A memoized array of unique semester strings.
 */
export const useSemesters = (sections: Section[]): string[] => {
  return useMemo(() => {
    const uniqueSemesters = [...new Set(sections
        .map(section => section.semester)
        .filter((semester): semester is string => semester !== null)
    )];
    // Consider sorting semesters here if desired (e.g., chronologically)
    return uniqueSemesters;
  }, [sections]);
};

/**
 * Custom hook to extract and memoize a unique list of instructor names from an array of sections.
 * 
 * Filters out null values and returns a stable array reference unless the input sections change.
 * 
 * @param sections - An array of Section objects.
 * @returns A memoized array of unique instructor name strings.
 */
export const useInstructors = (sections: Section[]): string[] => {
  return useMemo(() => {
    const uniqueInstructors = [...new Set(sections
      .map(section => section.instructor_name)
      .filter((instructor): instructor is string => instructor !== null)
    )];
    // Consider sorting instructors alphabetically if desired
    // return uniqueInstructors.sort();
    return uniqueInstructors;
  }, [sections]);
}; 
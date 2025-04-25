import { useMemo } from 'react';
import { type Section } from '@/types/Section';

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
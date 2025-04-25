/**
 * Represents the data for a specific section of a course offered in a past semester.
 * Includes details about the offering and aggregated grade distribution data.
 */
export interface Section {
    /**
     * Unique identifier for this specific section offering (typically BigInt from database).
     */
    section_id: bigint;
    /**
     * Identifier linking this section back to its parent course (e.g., "CSE310").
     */
    course_id: string;
    /**
     * The code identifying this section within the course (e.g., "01", "R02").
     */
    section_code: string | null;
    /**
     * The type of section (e.g., "LEC" for Lecture, "REC" for Recitation).
     */
    section_type: string | null;
    /**
     * The semester in which this section was offered (e.g., "Spring 2023").
     */
    semester: string | null;
    /**
     * The name of the instructor who taught this section.
     */
    instructor_name: string | null;
    /**
     * The total number of students enrolled or seats available in this section (typically BigInt from database).
     */
    total_seats: bigint | null;
    /**
     * A JSON object mapping letter grades (string keys) to the count (number values) of students 
     * who received that grade in this section. Example: `{"A": 10, "B": 15}`
     */
    grade_count: JSON;
    /**
     * A JSON object mapping letter grades (string keys) to the percentage (number values) of students
     * who received that grade in this section. Example: `{"A": 33.3, "B": 50.0}`
     */
    grade_percentage: JSON;
}
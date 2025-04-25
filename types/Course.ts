/**
 * Represents the detailed information for a single course offering.
 * Mirrors the structure of course data retrieved from the backend/database.
 */
export interface Course {
  /**
   * The abbreviated code for the department offering the course (e.g., "CSE", "AMS").
   */
  Department_Code: string | null;
  /**
   * The full name of the department (e.g., "Computer Science").
   */
  Department: string | null;
  /**
   * The numerical identifier for the course within its department (e.g., "114", "310").
   */
  Course_Number: string | null;
  /**
   * The official title of the course (e.g., "Introduction to Object-Oriented Programming").
   */
  Title: string | null;
  /**
   * The catalog description of the course content.
   */
  Description: string | null;
  /**
   * The number of credits awarded for completing the course. Stored as BigInt from Prisma, may be null.
   */
  Credits: bigint | null;
  /**
   * A textual description of the prerequisite courses or requirements.
   */
  Prerequisites: string | null;
  /**
   * A textual description of any corequisite courses or requirements.
   */
  Corequisites: string | null;
  /**
   * An array of Stony Brook Curriculum (SBC) codes fulfilled by the course (e.g., ["STEM+", "TECH"]).
   */
  SBCs: string[];
  /**
   * A unique identifier for the course, typically formed by concatenating Department_Code and Course_Number (e.g., "CSE114").
   */
  course_id: string;
}
export interface Course {
  Department_Code: string | null;
  Department: string | null;
  Course_Number: string | null;
  Title: string | null;
  Description: string | null;
  Credits: bigint | null;
  Prerequisites: string | null;
  Corequisites: string | null;
  SBCs: string[];
  id: string;
}
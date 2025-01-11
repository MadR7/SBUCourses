export interface Course {
  Department_Code: string;
  Department: string;
  Course_Number: string;
  Title: string;
  Description: string;
  Credits: bigint;
  Prerequisites: string;
  Corequisites: string;
  SBCs: string[];
  id: string;
}
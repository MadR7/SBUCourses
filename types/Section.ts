export interface Section {
    section_id: bigint;
    course_id: string;
    section_code: string | null;
    section_type: string | null;
    semester: string | null;
    instructor_name: string | null;
    total_seats: bigint | null
    grade_count: JSON;
    grade_percentage: JSON;
}
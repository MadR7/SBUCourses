"use client";

import { Star, Info } from "lucide-react";
import { type Course } from "@/types/Course";
import { memo } from "react";
import { useCallback } from "react";
import {VList} from "virtua"

/**
 * Props for the CourseList component.
 * @property courses - Array of course objects to display.
 * @property isSelected - Boolean indicating if the courses in this list are considered 'selected' (affects star icon style).
 * @property onToggleCourse - Callback function triggered when the star icon is clicked.
 * @property onInfoClick - Callback function triggered when the main course item area is clicked.
 */
interface CourseListProps {
  courses: Course[];
  isSelected: boolean;
  onToggleCourse: (course: Course) => void;
  onInfoClick: (course: Course) => void;
}

/**
 * Props for the CourseItem component.
 * @property course - The course object to render.
 * @property isSelected - Boolean indicating if this specific course is considered 'selected'.
 * @property onToggle - Callback function for the star icon click.
 * @property onInfo - Callback function for the main item area click.
 */
interface CourseItemProps {
  course: Course;
  isSelected: boolean;
  onToggle: (course: Course) => void;
  onInfo: (course: Course) => void;
}

/**
 * Memoized component representing a single row in the course list.
 * Displays course title, number, and SBCs.
 * Provides interactive elements to toggle selection (star) and view details (main area).
 */
const CourseItem = memo(
  function CourseItem({
    course, 
    isSelected,
    onToggle,
    onInfo
  }: CourseItemProps) {
    const handleToggle = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onToggle(course);
    }, [course, onToggle]);
  
    const handleInfo = useCallback(() => {
      onInfo(course);
    }, [course, onInfo]);
    return (
      <div
            key={course.course_id}
            className="grid grid-cols-[auto,1fr,auto] gap-4 p-4 bg-card text-card-foreground rounded-lg hover:bg-muted transition-colors group"
          >
            <Star 
              className={`w-5 h-5 cursor-pointer ${
                isSelected ? 'text-[rgb(var(--sbu-red))]' : 'text-muted-foreground group-hover:text-[rgb(var(--sbu-red))]'
              }`}
              onClick={handleToggle}
            />
            
            <div 
              className="grid grid-cols-[1fr,auto,auto] gap-8 cursor-pointer"
              onClick={handleInfo}
            >
              <div>
                <h3 className="font-bold">{course.Title}</h3>
                <p className="text-sm text-muted-foreground">{course.Course_Number}</p>
              </div>
            </div>
              
            <div className="bg-background p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">SBCs</p>
              {course.SBCs.join() !== "" ? <p className="text-sm font-semibold text-green-600">{course.SBCs.join()}</p>: <p className="text-xs">None</p>}             
            </div>
          </div>
)})

/**
 * Memoized component that renders a virtualized list of courses.
 * Uses the `virtua` library (VList) for efficient rendering of potentially large lists.
 * 
 * @param courses - Array of course objects to display.
 * @param isSelected - Passed down to CourseItem to indicate selection state.
 * @param onToggleCourse - Callback passed down to CourseItem for star icon clicks.
 * @param onInfoClick - Callback passed down to CourseItem for main area clicks.
 * @returns JSX element containing the virtualized list.
 */
export const CourseList = memo(function CourseList({ courses, isSelected, onToggleCourse, onInfoClick }: CourseListProps) {
  return (
    <VList style={{height: "90vh"}}>
      <div className="space-y-2">
        {courses.map((course) => (
          <CourseItem 
            key={course.course_id}
            course={course}
            isSelected={isSelected}
            onToggle={onToggleCourse}
            onInfo={onInfoClick}
          />
        ))}
      </div>
    </VList>
  );
})
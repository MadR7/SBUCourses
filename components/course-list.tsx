"use client";

import { Star, Info } from "lucide-react"; // Info unused
import { type Course } from "@/types/Course";
import { memo } from "react";
import { useCallback } from "react";
import {VList} from "virtua" // Virtual list component

/**
 * Props for the CourseList component.
 */
interface CourseListProps {
  /** Array of course objects to display. */
  courses: Course[];
  /** Indicates if the courses in this list instance are considered 'selected'. */
  isSelected: boolean; // Note: This prop seems tied to the commented-out selection feature.
  /** Callback function triggered when a course's selection state is toggled (e.g., clicking the star). */
  onToggleCourse: (course: Course) => void;
  /** Callback function triggered when the info action is initiated for a course (e.g., clicking the course row). */
  onInfoClick: (course: Course) => void;
}

/**
 * Props for the CourseItem component.
 */
interface CourseItemProps {
  /** The course data to render. */
  course: Course;
  /** Indicates if this specific course item is considered 'selected'. */
  isSelected: boolean;
  /** Callback function triggered when the toggle action (star icon) is clicked. */
  onToggle: (course: Course) => void;
  /** Callback function triggered when the info action (main row) is clicked. */
  onInfo: (course: Course) => void;
}

/**
 * Memoized component representing a single course item in the list.
 * Displays course title, number, and SBCs, with interactive elements for selection and info.
 *
 * @component
 * @param {CourseItemProps} props - The props for the component.
 * @returns {JSX.Element} The rendered course item row.
 */
const CourseItem = memo(
  function CourseItem({
    course,
    isSelected,
    onToggle,
    onInfo
  }: CourseItemProps) {

    /**
     * Handles the toggle action (clicking the star icon).
     * Prevents the click event from propagating to the parent info click handler.
     * Calls the onToggle callback with the course data.
     */
    const handleToggle = useCallback((e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering handleInfo when star is clicked
      onToggle(course);
    }, [course, onToggle]);

    /**
     * Handles the info action (clicking the main course row area).
     * Calls the onInfo callback with the course data.
     */
    const handleInfo = useCallback(() => {
      onInfo(course);
    }, [course, onInfo]);

    return (
      <div
            key={course.course_id} // Key is essential for list rendering
            className="grid grid-cols-[auto,1fr,auto] gap-4 p-4 bg-card text-card-foreground rounded-lg hover:bg-muted transition-colors group"
          >
            {/* Star icon for selection/toggling */}
            <Star
              className={`w-5 h-5 cursor-pointer ${
                isSelected ? 'text-[rgb(var(--sbu-red))]' : 'text-muted-foreground group-hover:text-[rgb(var(--sbu-red))]'
              }`}
              onClick={handleToggle}
            />

            {/* Main clickable area for course info */}
            <div
              className="grid grid-cols-[1fr,auto,auto] gap-8 cursor-pointer"
              onClick={handleInfo} // Trigger info action on click
            >
              <div>
                <h3 className="font-bold">{course.Title}</h3>
                <p className="text-sm text-muted-foreground">{course.Course_Number}</p>
              </div>
            </div>
              
            <div className="bg-background p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">SBCs</p>
              {course.SBCs.join() !== "" ? <p className="text-sm font-semibold text-green-600">{course.SBCs.join(', ')}</p>: <p className="text-xs">None</p>}             
            </div>
          </div>
    )
})

/**
 * Memoized component that renders a virtualized list of courses.
 * Uses the `virtua` library (VList) for efficient rendering of potentially long lists.
 *
 * @component
 * @param {CourseListProps} props - The props for the component.
 * @returns {JSX.Element} The rendered virtualized list of courses.
 */
export const CourseList = memo(function CourseList({ courses, isSelected, onToggleCourse, onInfoClick }: CourseListProps) {
  return (
    // VList handles rendering only visible items for performance.
    // Height is set to 90vh to fill most of the viewport.
    <VList style={{height: "90vh"}}>
      {/* The immediate child of VList is measured; items are rendered inside. */}
      <div className="space-y-2">
        {/* Map through courses and render a CourseItem for each */}
        {courses.map((course) => (
          <CourseItem
            key={course.course_id} // Essential key prop for list items
            course={course}
            isSelected={isSelected} // Pass down selection status
            onToggle={onToggleCourse} // Pass down toggle callback
            onInfo={onInfoClick} // Pass down info callback
          />
        ))}
      </div>
    </VList>
  );
})
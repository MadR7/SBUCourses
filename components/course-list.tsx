"use client";

import { Star, Info } from "lucide-react";
import { type Course } from "@/types/Course";
import { memo } from "react";

interface CourseListProps {
  courses: Course[];
  isSelected: boolean;
  onToggleCourse: (course: Course) => void;
  onInfoClick: (course: Course) => void;
}
interface CourseItemProps {
  course: Course;
  isSelected: boolean;
  onToggle: (course: Course) => void;
  onInfo: (course: Course) => void;
}

const CourseItem = memo(
  function CourseItem({
    course, 
    isSelected,
    onToggle,
    onInfo
  }: CourseItemProps) {
    return (
      <div
            key={course.id}
            className="grid grid-cols-[auto,1fr,auto] gap-4 p-4 bg-card text-card-foreground rounded-lg hover:bg-muted transition-colors group"
          >
            <Star 
              className={`w-5 h-5 cursor-pointer ${
                isSelected ? 'text-[rgb(var(--sbu-red))]' : 'text-muted-foreground group-hover:text-[rgb(var(--sbu-red))]'
              }`}
              onClick={() => onToggle(course)}
            />
            
            <div 
              className="grid grid-cols-[1fr,auto,auto] gap-8 cursor-pointer"
              onClick={() => onToggle(course)}
            >
              <div>
                <h3 className="font-bold">{course.Title}</h3>
                <p className="text-sm text-muted-foreground">{course.Course_Number}</p>
              </div>
            </div>

            <Info 
              className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" 
              onClick={() => onInfo(course)}
            />
          </div>
)})

export function CourseList({ courses, isSelected, onToggleCourse, onInfoClick }: CourseListProps) {
  return (
    <div className="space-y-2">
      {courses.map((course) => (
        <CourseItem 
          key={course.id}
          course={course}
          isSelected={isSelected}
          onToggle={onToggleCourse}
          onInfo={onInfoClick}
        />
      ))}
    </div>
  );
}
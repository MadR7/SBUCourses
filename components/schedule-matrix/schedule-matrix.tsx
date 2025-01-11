// "use client";

// import { useState, useCallback } from "react";
// import { X } from "lucide-react";
// import { TimeColumn } from "./time-column";
// import { MatrixCell } from "./matrix-cell";
// import { type Course } from "@/types/Course";
// import { parseTimeString, convertTo24Hour } from "@/lib/utils/time";

// const DAYS = ["M", "T", "W", "Th", "F"];

// interface ScheduleMatrixProps {
//   selectedCourses: Course[];
//   onClose: () => void;
// }

// export function ScheduleMatrix({ selectedCourses, onClose }: ScheduleMatrixProps) {
//   const [hoveredCourse, setHoveredCourse] = useState<Course | null>(null);

//   const getCourseForCell = useCallback((day: string, hour: number) => {
//     return selectedCourses.find(course => {
//       if (!course?.time) return false;
      
//       const { days, startTime, endTime } = parseTimeString(course.time);
//       const startHour = convertTo24Hour(startTime);
//       const endHour = convertTo24Hour(endTime);
      
//       return days.includes(day) && hour >= startHour && hour < endHour;
//     });
//   }, [selectedCourses]);

//   return (
//     <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50">
//       <div className="container mx-auto px-4 py-6 max-w-7xl">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-semibold">Schedule Matrix</h2>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-800 rounded-full"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="flex">
//           <TimeColumn />
//           <div className="flex-1 grid grid-cols-5 gap-px">
//             {DAYS.map((day) => (
//               <div key={day} className="text-center">
//                 <div className="mb-4 font-medium">{day}</div>
//                 {Array.from({ length: 14 }, (_, i) => i + 7).map((hour) => {
//                   const course = getCourseForCell(day, hour);
//                   return (
//                     <MatrixCell
//                       key={`${day}-${hour}`}
//                       course={course}
//                       isHighlighted={hoveredCourse?.id === course?.id}
//                     />
//                   );
//                 })}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
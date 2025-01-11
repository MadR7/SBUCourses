// import { type Course } from "@/types/Course";

// interface MatrixCellProps {
//   course?: Course;
//   isHighlighted?: boolean;
// }

// export function MatrixCell({ course, isHighlighted }: MatrixCellProps) {
//   if (!course) return <div className="h-20 border border-gray-800" />;

//   return (
//     <div 
//       className={`h-20 p-2 rounded-md ${
//         isHighlighted ? 'bg-[#FF6B6B] text-white' : 'bg-gray-800'
//       }`}
//     >
//       {/* <div className="text-sm font-medium">{course.code}</div>
//       <div className="text-xs opacity-75">{course.instructor}</div> */}
//     </div>
//   );
// }
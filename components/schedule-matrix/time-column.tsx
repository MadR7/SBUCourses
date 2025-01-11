// export function TimeColumn() {
//   const times = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

//   return (
//     <div className="w-16">
//       {times.map((hour) => (
//         <div key={hour} className="h-20 border-b border-gray-800 text-xs text-gray-400 relative">
//           <span className="absolute -top-2.5">{hour % 12 || 12}{hour < 12 ? 'AM' : 'PM'}</span>
//         </div>
//       ))}
//     </div>
//   );
// }
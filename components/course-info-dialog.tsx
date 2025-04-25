import React, { memo, useEffect, useMemo, useState, useRef, useCallback } from "react";
import { type Course } from "@/types/Course";
import { type Section } from "@/types/Section";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";

// Import extracted components, hooks, and types
import LoadingSkeleton from './course-info/loading-skeleton';
import PrevClasses from './course-info/prev-classes';
import ProfessorCard from './course-info/professor-card';
import { useSemesters, useInstructors } from '@/lib/hooks/use-course-info-hooks';
import { Bar, BarChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { type professors } from "@prisma/client";
import { Cell } from 'recharts';
import SyllabiCard from './syllabi-card';

interface CourseInfoDialogProps {
  popUp: boolean;
  course: Course | null;
  handleClose: () => void;
}

export const CourseInfoDialog = memo(function CourseInfoDialog({ popUp, course, handleClose }: CourseInfoDialogProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>(["course-info"]);
  const professorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [openProfessor, setOpenProfessor] = useState<string | null>(null);

  // --- Event Handlers ---
  const handleInstructorClick = useCallback((instructorName: string) => {
    if (instructorName === 'TBA') return;

    const instructorId = `professor-card-${instructorName.replace(/\\s+/g, '-')}`;
    setOpenProfessor(instructorName);

    setActiveAccordionItems(prevItems => {
      if (prevItems.includes("professors")) {
        return prevItems;
      }
      return [...prevItems, "professors"];
    });

    setTimeout(() => {
      const professorElement = professorRefs.current[instructorId];
      if (professorElement) {
        professorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        console.warn(`Could not find professor element for ID: ${instructorId}`);
      }
    }, 100);
  }, []);

  const handleDialogClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Stop propagation if the click is inside the dialog content
    e.stopPropagation();
  };

  // --- Effects ---
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    }
    if (popUp) {
      window.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Disable body scroll
      return () => {
        window.removeEventListener("keydown", handleEscapeKey);
        document.body.style.overflow = 'unset'; // Re-enable body scroll
      };
    }
  }, [popUp, handleClose]);

  useEffect(() => {
    const fetchSections = async () => {
      if (course?.course_id) {
        setLoading(true);
        setSections([]);
        setActiveAccordionItems(["course-info"]);
        setOpenProfessor(null);
        try {
          // Use relative path for API route
          const response = await fetch(`/api/sections/${encodeURIComponent(course.course_id)}`);
          if (!response.ok) {
            throw new Error('Failed to fetch sections');
          }
          const data = await response.json();
          setSections(data);
        } catch (error) {
          console.error('Error fetching sections:', error);
          // Optionally, set an error state here to display to the user
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSections();
  }, [course?.course_id]);

  // --- Hooks for derived data ---
  const semesters = useSemesters(sections);
  const instructors = useInstructors(sections);

  // --- Render Logic ---
  if (!popUp) return null; // Don't render anything if popUp is false

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
      onClick={handleClose} // Close dialog on backdrop click
      aria-modal="true" // Accessibility
      role="dialog"
    >
      <div
        onClick={handleDialogClick} // Prevent closing when clicking inside content
        className="bg-card border rounded-lg shadow-xl text-card-foreground w-[95%] max-w-4xl h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b">
          <div className="text-lg text-center font-bold">
            {course ? course.Course_Number : (
              <div className="h-7 w-36 bg-muted rounded animate-pulse mx-auto" /> // Centered skeleton
            )}
          </div>
          {/* Optional: Add a close button here */}
          {/* <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">&times;</button> */}
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-6 pt-4"> {/* Added pt-4 */}
          {course ? (
            <Accordion
              value={activeAccordionItems}
              onValueChange={setActiveAccordionItems}
              type="multiple"
              className="space-y-4"
            >
              {/* Course Information Section */}
              <AccordionItem value="course-info" className="border-none">
                <AccordionTrigger className="text-base font-semibold py-2 hover:no-underline data-[state=open]:text-primary">Course Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2"> {/* Added pt-2 */}
                    <div>
                      <h3 className="font-semibold text-lg">{course.Title}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-background p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">SBCs</p>
                          <p className="text-md font-semibold text-green-600">{course.SBCs?.join(', ') || 'None'}</p>
                        </div>
                        <div className="bg-background p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Credits:</p>
                          <p className="text-md font-semibold text-primary">{course.Credits?.toString() ?? 'N/A'}</p>
                        </div>
                    </div>
                    <div className="bg-background p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Prerequisites:</p>
                      <p className="text-md font-semibold text-primary">{course.Prerequisites || 'None'}</p>
                    </div>
                    <div className="bg-background p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-semibold">{course.Department}</p>
                    </div>
                    <div className="bg-background p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-semibold">{course.Description || 'No description available.'}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Past Classes Section */}
              <AccordionItem value="sections" className="border-none">
                <AccordionTrigger className="text-base font-semibold py-2 hover:no-underline data-[state=open]:text-primary">Past Classes</AccordionTrigger>
                <AccordionContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : sections.length > 0 ? (
                    <div className="space-y-2 pt-2"> {/* Added pt-2 */}
                      <PrevClasses
                        sections={sections}
                        semesters={semesters}
                        instructors={instructors}
                        onInstructorClick={handleInstructorClick}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No past section data available for this course.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Past Professors Section */}
              <AccordionItem value="professors" className="border-none">
                <AccordionTrigger className="text-base font-semibold py-2 hover:no-underline data-[state=open]:text-primary">Past Professors</AccordionTrigger>
                <AccordionContent>
                  {instructors.length > 0 ? (
                     <div className="space-y-2 pt-2"> {/* Added pt-2 */}
                        {instructors.map((instructor) => {
                          const professorId = `professor-card-${instructor.replace(/\\s+/g, '-')}`;
                          return (
                            <ProfessorCard
                              key={instructor}
                              instructor={instructor}
                              isOpen={openProfessor === instructor}
                              onToggle={setOpenProfessor}
                              professorId={professorId}
                              professorRef={(el) => professorRefs.current[professorId] = el}
                            />
                          );
                        })}
                     </div>
                  ) : (
                     <div className="text-center py-6 text-muted-foreground">
                       No past professor data available for this course.
                     </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Past Syllabi Section */}
              <AccordionItem value="syllabi" className="border-none">
                <AccordionTrigger className="py-2">Past Syllabi</AccordionTrigger>
                <AccordionContent>
                  <SyllabiCard courseNumber={course?.Course_Number} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <LoadingSkeleton /> // Use the imported skeleton
          )}
        </div>
      </div>
    </div>
  );
});

export default CourseInfoDialog;
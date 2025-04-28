import React, { memo, useEffect, useMemo, useState, useRef, useCallback } from "react";
import { type Course } from "@/types/Course";
import { type Section } from "@/types/Section";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Loader2, ExternalLink, AlertCircle } from "lucide-react";
// Import extracted components, hooks, and types
import LoadingSkeleton from './course-info/loading-skeleton';
import PrevClasses from './course-info/prev-classes';
import ProfessorCard from './course-info/professor-card';
import { useSemesters, useInstructors } from '@/lib/hooks/use-course-info-hooks';
import { Bar, BarChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { type professors } from "@prisma/client";
import { Cell } from 'recharts';
import SyllabiCard from './syllabi-card';

/**
 * Structure for Reddit link objects fetched from the API.
 * @interface RedditLink
 * @property {string} url - URL to the Reddit post/comment.
 * @property {string} [title] - Title of the Reddit post (optional).
 */
interface RedditLink {
    /** URL to the Reddit post/comment. */
    url: string;
    /** Title of the Reddit post (optional). */
    title?: string;
    // Add other fields if they exist in your JSON data
}

/**
 * Props for CourseInfoDialog.
 */
interface CourseInfoDialogProps {
  /** Controls dialog visibility. */
  popUp: boolean;
  /** Course data to display (null if none selected). */
  course: Course | null;
  /** Callback to close the dialog. */
  handleClose: () => void;
}

/**
 * Memoized modal dialog displaying detailed course information.
 * Fetches related data (sections, Reddit links) and uses an accordion layout.
 *
 * @component
 * @param {CourseInfoDialogProps} props Component props.
 * @returns {JSX.Element | null} Rendered dialog or null.
 */
export const CourseInfoDialog = memo(function CourseInfoDialog({ popUp, course, handleClose }: CourseInfoDialogProps) {
  // --- Sections State ---
  /** State holding the array of fetched past sections for the course. */
  const [sections, setSections] = useState<Section[]>([]);
  /** State indicating if past sections are currently being fetched. */
  const [loading, setLoading] = useState(false); // Sections loading state

  // --- UI State ---
  /** State holding the values (ids) of the currently open accordion items. */
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>(["course-info"]);
  /** Ref object to store references to ProfessorCard elements for scrolling. */
  const professorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  /** State storing the name of the currently expanded professor card, or null if none. */
  const [openProfessor, setOpenProfessor] = useState<string | null>(null);

  // --- Reddit Links State ---
  /** State holding the array of fetched Reddit links. */
  const [redditLinks, setRedditLinks] = useState<RedditLink[]>([]);
  /** State indicating if Reddit links are currently being fetched. */
  const [redditLoading, setRedditLoading] = useState(false);
  /** State storing any error message from fetching Reddit links. */
  const [redditError, setRedditError] = useState<string | null>(null);

  // --- Event Handlers ---

  /**
   * Prevents dialog closure when clicking inside the dialog content area.
   * This stops the `onClick` handler on the backdrop from firing.
   * @param {React.MouseEvent<HTMLDivElement>} e The click event.
   */
  const handleDialogClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  /**
   * Handles clicking an instructor name. Opens the 'professors' accordion,
   * sets the open professor state, and scrolls the professor's card into view.
   * @param {string} instructorName The name of the instructor clicked.
   */
  const handleInstructorClick = useCallback((instructorName: string) => {
    if (instructorName === 'TBA') return;

    const instructorId = `professor-card-${instructorName.replace(/\s+/g, '-')}`;
    setOpenProfessor(instructorName);

    // Ensure professors accordion is open
    setActiveAccordionItems(prevItems =>
        prevItems.includes("professors") ? prevItems : [...prevItems, "professors"]
    );

    // Scroll professor card into view (with delay)
    setTimeout(() => {
      professorRefs.current[instructorId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  // --- Effects ---

  /**
   * Effect for Escape key handling and body scroll management.
   * Adds/removes keydown listener and toggles body overflow style based on `popUp` state.
   */
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    }
    if (popUp) {
      window.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener("keydown", handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [popUp, handleClose]);

  /**
   * Effect to fetch past sections data when the `course.course_id` changes.
   * Updates sections state and handles loading/error states.
   * Resets related state, handles loading/error states.
   */
  useEffect(() => {
    const fetchSections = async () => {
      if (course?.course_id) {
        setLoading(true);
        setSections([]);
        setActiveAccordionItems(["course-info"]);
        setOpenProfessor(null);
        try {
          const response = await fetch(`/api/sections/${encodeURIComponent(course.course_id)}`);
          if (!response.ok) throw new Error(`HTTP error ${response.status}`);
          const data: Section[] = await response.json();
          setSections(data);
        } catch (error) {
          console.error('Error fetching sections:', error);
          setSections([]);
        } finally {
          setLoading(false);
        }
      } else {
         setSections([]);
         setLoading(false);
      }
    };
    fetchSections();
  }, [course?.course_id]);

  /**
   * Effect to fetch Reddit links related to the course when the `course.Course_Number` changes.
   * Sets loading and error states accordingly.
   */
  useEffect(() => {
    /** Fetches Reddit links from the API. */
    const fetchRedditLinks = async () => {
      // Ensure course number exists before fetching
      if (!course?.Course_Number) {
        setRedditError("Course number not available.");
        setRedditLinks([]);
        return;
      }

      setRedditLoading(true);
      setRedditError(null);
      setRedditLinks([]); // Clear previous links

      try {
        const response = await fetch(`/api/reddit-links/${course.Course_Number}`);
        if (!response.ok) {
          // Try to get error details, default to status text
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          // Check for specific 'not found' message from API
          if (response.status === 404 && errorData.message === 'No Reddit links found for this course') {
            setRedditLinks([]); // Treat as no links found, not an error
          } else {
            throw new Error(errorData.message || 'Failed to fetch');
          }
        } else {
          const data = await response.json();
          // Check if post_data exists and is a non-empty string
          if (data.post_data && typeof data.post_data === 'string') {
            try {
              // Parse the JSON string inside post_data
              const parsedLinks: RedditLink[] = JSON.parse(data.post_data);
              setRedditLinks(parsedLinks);
            } catch (parseError) {
              console.error("Error parsing Reddit links JSON:", parseError);
              throw new Error('Failed to parse Reddit link data.');
            }
          } else {
            // Handle cases where post_data is missing, null, or not a string
            setRedditLinks([]);
          }
        }
      } catch (error: any) {
        console.error("Error fetching Reddit links:", error);
        setRedditError(error.message || "An unknown error occurred");
        setRedditLinks([]); // Ensure links are cleared on error
      } finally {
        setRedditLoading(false);
      }
    };

    fetchRedditLinks();
  }, [course?.Course_Number]); // Dependency: runs when course number changes

  // --- Hooks for derived data ---
  const semesters = useSemesters(sections);
  const instructors = useInstructors(sections);

  // --- Render Logic ---
  if (!popUp) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Dialog Content */}
      <div
        onClick={handleDialogClick}
        className="bg-card border rounded-lg shadow-xl text-card-foreground w-[95%] max-w-4xl h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="text-lg text-center font-bold">
            {course ? course.Course_Number : <div className="h-7 w-36 bg-muted rounded animate-pulse mx-auto" />}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 pb-6 pt-4">
          {course ? (
            <Accordion
              value={activeAccordionItems}
              onValueChange={setActiveAccordionItems}
              type="multiple"
              className="space-y-4"
            >
              {/* --- Accordion Items --- */}
               {/* Course Information Section */}
               <AccordionItem value="course-info" className="border-none">
                 <AccordionTrigger className="text-base font-semibold py-2 hover:no-underline data-[state=open]:text-primary">Course Information</AccordionTrigger>
                 <AccordionContent>
                   <div className="space-y-4 pt-2">
                     <div><h3 className="font-semibold text-lg">{course.Title}</h3></div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {/* Details: Credits, SBCs, Department */}
                        <div className="bg-background p-3 rounded-lg">
                         <p className="text-sm text-muted-foreground">Credits</p>
                         {/* Fix: Convert bigint to string for rendering */}
                         <p className="font-semibold">{course.Credits?.toString() ?? 'N/A'}</p>
                       </div>
                       <div className="bg-background p-3 rounded-lg">
                         <p className="text-sm text-muted-foreground">SBCs</p>
                         <p className="font-semibold">{course.SBCs?.join(', ') || <span className="text-xs text-muted-foreground italic">None</span>}</p>
                        </div>
                       <div className="bg-background p-3 rounded-lg">
                         <p className="text-sm text-muted-foreground">Department</p>
                         <p className="font-semibold">{course.Department}</p>
                       </div>
                     </div>
                     {/* Description */}
                     <div className="bg-background p-3 rounded-lg">
                       <p className="text-sm text-muted-foreground">Description</p>
                       <p className="font-semibold">{course.Description || 'No description available.'}</p>
                     </div>
                   </div>
                 </AccordionContent>
               </AccordionItem>

               {/* Past Classes Section */}
               <AccordionItem value="past-classes" className="border-none">
                 <AccordionTrigger className="text-base font-semibold py-2 hover:no-underline data-[state=open]:text-primary">Past Classes</AccordionTrigger>
                 <AccordionContent>
                   {loading ? (
                     <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                   ) : sections.length > 0 ? (
                     <PrevClasses
                       sections={sections}
                       semesters={semesters}
                       instructors={instructors} // Pass instructors derived from useInstructors hook
                       onInstructorClick={handleInstructorClick}
                     />
                   ) : (
                     <p className="text-muted-foreground">No previous sections found for this course.</p>
                   )}
                 </AccordionContent>
               </AccordionItem>

               {/* Past Professors Section (renders ProfessorCard components) */}
               <AccordionItem value="professors" className="border-none">
                 <AccordionTrigger className="text-base font-semibold py-2 hover:no-underline data-[state=open]:text-primary">Past Professors</AccordionTrigger>
                 <AccordionContent>
                    {loading ? (
                      <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : instructors.length > 0 ? (
                      <div className="space-y-2 pt-2">
                         {instructors.map((instructor) => {
                           // Generate a unique ID for linking and scrolling
                           const professorId = `professor-card-${instructor.replace(/\s+/g, '-')}`;
                           return (
                             <ProfessorCard
                               key={instructor}
                               instructor={instructor}
                               isOpen={openProfessor === instructor}
                               onToggle={setOpenProfessor}
                               professorId={professorId}
                               // Store ref in professorRefs map
                               professorRef={(el) => professorRefs.current[professorId] = el}
                             /> );
                         })}
                      </div>
                    ) : (
                       <div className="text-center py-6 text-muted-foreground">No past professor data.</div>
                    )}
                 </AccordionContent>
               </AccordionItem>

               {/* Reddit Links Section (fetches and displays links) */}
               <AccordionItem value="reddit-links" className="border-none">
                 <AccordionTrigger className="text-base font-semibold py-2 hover:no-underline data-[state=open]:text-primary">Reddit Links</AccordionTrigger>
                 <AccordionContent>
                    {/* Show loader while fetching */}
                    {redditLoading ? (
                      <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : redditError ? (
                      // Show error message if fetch failed
                      <div className="flex items-center justify-center py-6 text-destructive"><AlertCircle className="w-5 h-5 mr-2" /><span>{redditError}</span></div>
                    ) : redditLinks.length > 0 ? (
                      // Display list of links if available
                      <div className="space-y-2 pt-2">
                        {redditLinks.map((link, index) => (
                          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-background rounded-lg border hover:bg-muted/50 group">
                            <span className="truncate flex-1 mr-2 text-sm font-medium text-primary group-hover:underline">{link.title || link.url}</span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                          </a> ))}
                      </div>
                    ) : (
                      // Show message if no links were found
                      <div className="text-center py-6 text-muted-foreground">No Reddit links found.</div>
                    )}
                 </AccordionContent>
               </AccordionItem>

               {/* Past Syllabi Section (renders SyllabiCard component) */}
               <AccordionItem value="syllabi" className="border-none">
                 <AccordionTrigger className="text-base font-semibold py-2 hover:no-underline data-[state=open]:text-primary">Past Syllabi</AccordionTrigger>
                 <AccordionContent>
                   <SyllabiCard courseNumber={course?.Course_Number} />
                 </AccordionContent>
               </AccordionItem>
            </Accordion>
          ) : (
            <LoadingSkeleton /> // Loading skeleton
          )}
        </div>
      </div>
    </div>
  );
});

export default CourseInfoDialog;
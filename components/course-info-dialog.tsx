import { getSectionsByCourse } from "@/lib/data";
import { type Course } from "@/types/Course";
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { type Section } from "@/types/Section";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { Bar, BarChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { type professors } from "@prisma/client";
import { Cell } from 'recharts';
import SyllabiCard from './syllabi-card';

interface CourseInfoDialogProps {
  popUp: boolean;
  course: Course | null;
  handleClose: () => void;
}
const gradeColorMap: { [key: string]: string } = {
  'A': '#00A878',   // Deep green: success, excellence, achievement
  'B': '#368CBF',   // Strong blue: stability, trust, good performance
  'C': '#FFA41B',   // Amber: average performance, caution
  'D': '#FF4B1F',   // Orange-red: serious concern, near failing
  'F': '#E71D36',   // Bright red: failure, danger, stop
  'I': '#9381FF',   // Purple: incomplete, pending, mystery
  'P': '#7D83FF',   // Blue-purple: passing, acceptable
  'S': '#70A288',   // Sage green: satisfactory, adequate
  'U': '#B76D68',   // Muted red: unsatisfactory but not as severe as F
  'W': '#6C757D',   // Gray: withdrawn, neutral
  'A-': '#2D936C',  // Slightly muted green: still excellent but slightly less intense
  'B+': '#368CBF',  // Bright blue: competence, reliability, slightly below top tier
  'B-': '#5C85AD',  // Muted blue: slightly decreased performance but still good
  'C+': '#FFB627',  // Bright amber: warning, average performance with potential
  'C-': '#FF9505',  // Dark amber: slightly below average, increased caution
  'D+': '#FF6B35',  // Light orange-red: concern, risk of failure
  'NC': '#495057'   // Dark gray: no credit, finality
};
const gradeOrder = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "I", "P", "S", "U", "W", "NC"];
const gradeOrderMap = gradeOrder.reduce((acc: { [key: string]: number }, grade, index) => {
  acc[grade] = index;
  return acc;
}, {});

export const useSemesters = (sections: Section[]): string[] => {
  return useMemo(() => {
    const uniqueSemesters = [...new Set(sections
        .map(section => section.semester)
        .filter((semester): semester is string => semester !== null)
    )];

    return uniqueSemesters
  }, [sections]);
};

export const useInstructors = (sections: Section[]): string[] => {
  return useMemo(() => {
    
    const uniqueInstructors = [...new Set(sections
      .map(section => section.instructor_name)
      .filter((instructor): instructor is string => instructor !== null)
    )];
    return uniqueInstructors;
  }, [sections]);
}

export const CourseInfoDialog = memo(function CourseInfoDialog({ popUp, course, handleClose }: CourseInfoDialogProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div>
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-background p-3 rounded-lg">
          <div className="h-4 w-16 bg-muted rounded animate-pulse mb-2" />
          <div className="h-6 w-24 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="bg-background p-3 rounded-lg">
          <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
          <div className="h-6 w-20 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>

      <div className="bg-background p-3 rounded-lg">
        <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
        <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
      </div>

      <div className="bg-background p-3 rounded-lg">
        <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {   
                handleClose()
        }
    }
    if (popUp) {
        window.addEventListener("keydown", handleEscapeKey)
        return () => {
          window.removeEventListener("keydown", handleEscapeKey)
        }
    }            
  })
  useEffect(() => {
    const fetchSections = async () => {
      if (course?.course_id) {
        setLoading(true);
        try {
          const response = await fetch(`/api/sections/${encodeURIComponent(course.course_id)}`);
          if (!response.ok) {
            throw new Error('Failed to fetch sections');
          }
          const data = await response.json();
          setSections(data);
        } catch (error) {
          console.error('Error fetching sections:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSections();
  }, [course?.course_id]);
  useEffect(() => {
    // When dialog opens, disable scrolling
    if (popUp) {
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup: re-enable scrolling when dialog closes
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [popUp]);
  const semesters = useSemesters(sections);
  const instructors = useInstructors(sections)
  const SectionCard = ({ section }: {section: Section}) => (
    <Accordion type="single" defaultValue="section-info" collapsible className="space-y-4">
      <div className="bg-background p-4 rounded-lg mb-2">
        <AccordionItem value="section-info" className="border-none">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <span className="font-semibold">{section.section_code}</span>
              <span className="ml-2 text-sm text-muted-foreground">{section.section_type}</span>
              {section.section_code && section.section_code.includes('90') && <span className="italic text-xs"> (SUNY KOREA)</span>}
            </div>
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded mt-2 md:mt-0">
              {section.semester}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Instructor: {section.instructor_name || 'TBA'}
          </div>
        </AccordionItem>
        <AccordionItem value="grade-info" className="border-none">
          <AccordionTrigger className="py-2">Grades</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 mb-4 md:mb-0">
                <h3 className="text-center font-semibold mb-2">Number of Students: {section.total_seats?.toString()}</h3>
                <div className="h-64 mr-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(section.grade_count)
                                    .map(([key, value]) => ({ grade: key, Count: value }))
                                    .sort((a, b) => gradeOrderMap[a.grade] - gradeOrderMap[b.grade])}>
                      <XAxis dataKey="grade" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color:'rgba(0, 0, 0, 1)', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#8884d8' }}
                        cursor={false}
                      />
                      <Legend />
                      <Bar dataKey="Count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(section.grade_percentage)
                          .filter(([key, value]) => value > 0) // Filter out zero values
                          .map(([key, value]) => ({ name: key, value, fill: gradeColorMap[key] }))
                          .sort((a, b) => gradeOrderMap[a.name] - gradeOrderMap[b.name])}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value}%`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#8884d8' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </div>
    </Accordion>
  );
  const ProfessorCard = ({ instructor }: { instructor: string }) => {
    const [professorData, setProfessorData] = useState<professors | null>(null);
    const [loadingProf, setLoadingProf] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchProfessorDataFromApi = async () => {
        if (!instructor || instructor === 'TBA') {
          setProfessorData(null);
          setError("Instructor name not available.");
          setLoadingProf(false); // Stop loading if no instructor
          return;
        }
        setLoadingProf(true);
        setError(null);
        try {
          // Fetch data from the API route
          const response = await fetch(`/api/professors/${encodeURIComponent(instructor)}`);

          if (!response.ok) {
            // Handle HTTP errors (like 404 Not Found, 500 Internal Server Error)
            const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty object
            setError(errorData.error || `Error: ${response.statusText} (${response.status})`);
            setProfessorData(null);
          } else {
            const data = await response.json();
            setProfessorData(data);
          }
        } catch (err) {
          console.error("Failed to fetch professor data:", err);
          setError("Failed to load professor data. Check network connection.");
          setProfessorData(null);
        } finally {
          setLoadingProf(false);
        }
      };

      fetchProfessorDataFromApi();
    }, [instructor]);

    const ratingData = useMemo(() => {
      if (!professorData) return [];
      return [
        { name: 'Awesome 5', count: professorData.rating_5_count ?? 0, color: '#3b82f6' }, // Blue
        { name: 'Great 4', count: professorData.rating_4_count ?? 0, color: '#3b82f6' }, // Blue
        { name: 'Good 3', count: professorData.rating_3_count ?? 0, color: '#3b82f6' }, // Blue
        { name: 'OK 2', count: professorData.rating_2_count ?? 0, color: '#3b82f6' }, // Blue
        { name: 'Awful 1', count: professorData.rating_1_count ?? 0, color: '#3b82f6' }, // Blue
      ];
    }, [professorData]);

    const totalRatings = useMemo(() => {
      return ratingData.reduce((sum, item) => sum + item.count, 0);
    }, [ratingData]);

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const percentage = totalRatings > 0 ? ((payload[0].value / totalRatings) * 100).toFixed(1) : 0;
        return (
          <div className="bg-background p-2 border rounded shadow-lg">
            <p className="font-semibold">{`${label}`}</p>
            <p className="text-sm text-muted-foreground">{`Count: ${payload[0].value}`}</p>
            <p className="text-sm text-muted-foreground">{`Percentage: ${percentage}%`}</p>
          </div>
        );
      }
      return null;
    };


    return (
      <Accordion type="single" collapsible className="w-full mb-2" >
        <AccordionItem value="professor-info" className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="bg-background px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-muted/50">
              <div className="flex justify-between items-center w-full">
                 <p className="font-semibold">{instructor}</p>
                 {loadingProf && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-background p-4">
              {error && <p className="text-sm text-destructive text-center py-4">{error}</p>}
              {professorData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Avg Rating</p>
                      <p className="text-lg font-bold text-primary">
                        {professorData.avg_rating?.toFixed(1) ?? 'N/A'}
                        <span className="text-xs font-normal"> / 5.0</span>
                      </p>
                    </div>
                     <div className="bg-muted/30 p-3 rounded-lg">
                       <p className="text-xs text-muted-foreground">Difficulty</p>
                       <p className="text-lg font-bold text-primary">
                         {professorData.difficulty_avg?.toFixed(1) ?? 'N/A'}
                         <span className="text-xs font-normal"> / 5.0</span>
                      </p>
                     </div>
                    <div className="bg-muted/30 p-3 rounded-lg col-span-2 md:col-span-1">
                      <p className="text-xs text-muted-foreground">Would Take Again</p>
                       <p className="text-lg font-bold text-primary">
                         {professorData.would_take_again_percent?.toFixed(0) ?? 'N/A'}%
                       </p>
                    </div>
                   </div>

                  {totalRatings > 0 ? (
                    <div>
                      <h4 className="font-semibold mb-2 text-center">Rating Distribution ({totalRatings} ratings)</h4>
                       <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={ratingData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}/>
                              <Bar dataKey="count" barSize={20} radius={[4, 4, 4, 4]}>
                                 {ratingData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                 ) : (
                   <p className="text-sm text-muted-foreground text-center">No rating distribution data available.</p>
                 )}

                  {professorData.rmp_link && (
                    <Button variant="link" asChild className="p-0 h-auto">
                       <a href={professorData.rmp_link} target="_blank" rel="noopener noreferrer">
                         View on RateMyProfessors
                       </a>
                    </Button>
                  )}
                </div>
              )}
            </AccordionContent>
         </AccordionItem>
      </Accordion>
    );
  };
  const PrevClasses = ({ sections, semesters}: { sections: Section[], semesters: string[], instructors: string[]}) => {
    const [openSem, setOpenSem] = React.useState(false)
    const [valueSem, setValueSem] = React.useState("")
    const [openInstructor, setOpenInstructor] = React.useState(false)
    const [valueInstructor, setValueInstructor] = React.useState("")
    const filteredSections = useMemo(() => {
      if (!valueSem) return [];
      if (!valueInstructor){
        return sections.filter((section) => section.semester === valueSem);
      }else{
        return sections.filter((section) => section.semester === valueSem && section.instructor_name === valueInstructor);
      }
      
    }, [sections, valueSem, valueInstructor]);
    return (
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col md:flex-row ">
          <Popover open={openSem} onOpenChange={setOpenSem}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSem}
                className="flex md:mr-2 justify-between"
              >
                {valueSem
                  ? semesters.find((semester) => semester === valueSem)
                  : "Select semester..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search semester..." />
                <CommandList>
                  <CommandEmpty>No semesters found.</CommandEmpty>
                  <CommandGroup>
                    {semesters.map((semester) => (
                      <CommandItem
                        key={semester}
                        value={semester}
                        onSelect={(currentValue) => {
                          setValueSem(currentValue === valueSem ? "" : currentValue)
                          setOpenSem(false)
                        }}
                      >
                        {semester}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Popover open={openInstructor} onOpenChange={setOpenInstructor}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openInstructor}
              className="flex justify-between"
            >
              {valueInstructor
                ? instructors.find((instructor) => instructor === valueInstructor)
                : "Select instructor..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex p-0">
            <Command>
              <CommandInput placeholder="Search instructor..." />
              <CommandList>
                <CommandEmpty>No instructors found.</CommandEmpty>
                <CommandGroup>
                  {instructors.map((instructor) => (
                    <CommandItem
                      key={instructor}
                      value={instructor}
                      onSelect={(currentValue) => {
                        setValueInstructor(currentValue === valueInstructor ? "" : currentValue)
                        setOpenInstructor(false)
                      }}
                    >
                      {instructor}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        </div>
        <div>
          {
            filteredSections.map((section) => (
              <SectionCard key={section.section_id} section={section} />
          ))}
        </div>
      </div>
    );
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-card border-white border-2 text-card-foreground w-[100%] h-[90%] md:w-[75%] md:h-[80%] overflow-hidden flex flex-col">
        <div className="px-6 py-4">
          <div className="text-lg flex justify-center font-bold">
            {course ? course.Course_Number : (
              <div className="h-7 w-36 bg-muted rounded animate-pulse" />
            )}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-6 pb-6">
          {course ? (
            <Accordion defaultValue="course-info" type="single" collapsible className="space-y-4">
              <AccordionItem value="course-info" className="border-none">
                <AccordionTrigger className="py-2">Course Information</AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">{course.Title}</h3>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex flex-row space-x-4">
                            <div className="bg-background p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">SBCs</p>
                            <p className="text-md font-semibold text-green-600">{course.SBCs.join()}</p>
                            </div>
                            
                            <div className="bg-background p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">Credits:</p>
                            {course.Prerequisites ? 
                              <p className="text-md font-semibold text-blue-600">{course.Credits?.toString()}</p> : 
                              <p className="text-md font-semibold text-blue-600">None</p>
                            }
                            </div>
                          </div>
                          <div className="bg-background p-3 rounded-lg flex-grow">
                          <p className="text-sm text-muted-foreground">Prerequisites:</p>
                          {course.Prerequisites ? 
                            <p className="text-md font-semibold text-blue-600">{course.Prerequisites}</p> : 
                            <p className="text-md font-semibold text-blue-600">None</p>
                          }
                          </div>
                        </div>
                        

                        <div className="bg-background p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Department</p>
                          <p className="font-semibold">{course.Department}</p>
                        </div>
                        <div className="bg-background p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="font-semibold">{course.Description}</p>
                        </div>
                      </div>
                  </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sections" className="border-none">
                <AccordionTrigger className="py-2">Past Classes</AccordionTrigger>
                <AccordionContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : sections.length > 0 ? (
                    <div className="space-y-2">
                      
                      <PrevClasses sections={sections} semesters={semesters} instructors={instructors}/>
                      
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No sections available for this course
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="professors" className="border-none">
                  <AccordionTrigger className="py-2">Past Professors</AccordionTrigger>
                  <AccordionContent>
                    {instructors.map((instructor) => (
                      <ProfessorCard key={instructor} instructor={instructor} />
                    ))}
                  </AccordionContent>
              </AccordionItem>
              <AccordionItem value="syllabi" className="border-none">
                <AccordionTrigger className="py-2">Past Syllabi</AccordionTrigger>
                <AccordionContent>
                  <SyllabiCard courseNumber={course?.Course_Number} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <LoadingSkeleton />
          )}
        </div>
      </div>
      </div>
  );
});

export default CourseInfoDialog;
import { getSectionsByCourse } from "@/lib/data";
import { type Course } from "@/types/Course";
import { type Section } from "@/types/Section";
import React, { memo, useEffect, useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";
import { Loader2 } from "lucide-react";
import { Bar, BarChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
interface CourseInfoDialogProps {
  popUp: boolean;
  course: Course | null;
  handleClose: () => void;
}
const gradeColors = [
  "#8884d8", // A
  "#82ca9d", // B
  "#ffc658", // C
  "#ff8042", // D
  "#d0ed57", // F
  "#a4de6c", // I
  "#8dd1e1", // P
  "#d88884", // S
  "#888888", // U
  "#bdbdbd", // W
  "#84d8d8", // A-
  "#d884d8", // B+
  "#84d884", // B-
  "#d8d884", // C+
  "#d8d884", // C-
  "#d88484", // D+
  "#d8d884"  // NC
];
const gradeOrder = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "I", "P", "S", "U", "W", "NC"];
const gradeOrderMap = gradeOrder.reduce((acc: { [key: string]: number }, grade, index) => {
  acc[grade] = index;
  return acc;
}, {});


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
  
  const SectionCard = ({ section }: {section: Section}) => (
    <Accordion type="single" defaultValue="section-info" collapsible className="space-y-4">
      <div className="bg-background p-4 rounded-lg mb-2">
        <AccordionItem value="section-info" className="border-none">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <span className="font-semibold">{section.section_code}</span>
              <span className="ml-2 text-sm text-muted-foreground">{section.section_type}</span>
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
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px' }}
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
                          .map(([key, value], index) => ({ name: key, value, fill: gradeColors[index] }))
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
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm"
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
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-background p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">SBCs</p>
                            <p className="text-lg font-semibold text-green-600">{course.SBCs.join()}</p>
                          </div>
                          <div className="bg-background p-3 rounded-lg">
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
                <AccordionTrigger className="py-2">Previous Classes</AccordionTrigger>
                <AccordionContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : sections.length > 0 ? (
                    <div className="space-y-2">
                      {sections.map((section) => (
                        <SectionCard key={section.section_id.toString()} section={section} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No sections available for this course
                    </div>
                  )}
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
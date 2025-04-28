import React from 'react';
import { type Section } from '@/types/Section';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Bar, BarChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { gradeColorMap, gradeOrderMap } from '@/lib/constants/grades';

/**
 * Props for the SectionCard component.
 *
 * @interface SectionCardProps
 * @property {Section} section - The section data object to display.
 * @property {(instructor: string) => void} onInstructorClick - Callback function executed when the instructor's name is clicked. Passes the instructor's name.
 */
interface SectionCardProps {
  section: Section;
  onInstructorClick: (instructor: string) => void;
}

/**
 * A card component that displays detailed information about a specific course section.
 * It shows the section code, type, semester, and instructor (clickable).
 * Includes an accordion section revealing grade distribution data visualized with
 * Bar and Pie charts using the Recharts library.
 *
 * @component
 * @param {SectionCardProps} props - The props for the component.
 * @returns {JSX.Element} The rendered SectionCard component.
 */
export const SectionCard = ({ section, onInstructorClick }: SectionCardProps) => (
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
          Instructor:{" "}
          {section.instructor_name && section.instructor_name !== 'TBA' ? (
            <button
              onClick={() => onInstructorClick(section.instructor_name!)}
              className="text-primary underline hover:text-primary/80 focus:outline-none focus:ring-1 focus:ring-primary rounded px-0.5 py-0"
            >
              {section.instructor_name}
            </button>
          ) : (
            section.instructor_name || 'TBA'
          )}
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
                  <BarChart data={Object.entries(section.grade_count || {})
                                  .map(([key, value]) => ({ grade: key, Count: value as number }))
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
                      data={Object.entries(section.grade_percentage || {})
                        .filter(([key, value]) => (value as number) > 0) // Filter out zero values
                        .map(([key, value]) => ({ name: key, value: value as number, fill: gradeColorMap[key] }))
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

export default SectionCard; 
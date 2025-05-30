import React, { useMemo, useState } from 'react';
import { type Section } from '@/types/Section';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import SectionCard from './section-card'; // Import the extracted component
import { cn } from "@/lib/utils";

/**
 * Props for the PrevClasses component.
 *
 * @interface PrevClassesProps
 * @property {Section[]} sections - An array of section objects representing past classes.
 * @property {string[]} semesters - An array of unique semester strings available for filtering.
 * @property {string[]} instructors - An array of unique instructor names available for filtering.
 * @property {(instructor: string) => void} onInstructorClick - Callback function triggered when an instructor's name is clicked in a SectionCard.
 */
interface PrevClassesProps {
  sections: Section[];
  semesters: string[];
  instructors: string[];
  onInstructorClick: (instructor: string) => void;
}

/**
 * Displays a list of past sections for a course, with filtering options.
 * Allows users to filter the displayed sections by semester and/or instructor
 * using interactive dropdown menus.
 *
 * @component
 * @param {PrevClassesProps} props - The props for the component.
 * @returns {JSX.Element} The rendered PrevClasses component with filters and section list.
 */
export const PrevClasses = ({ sections, semesters, instructors, onInstructorClick }: PrevClassesProps) => {
  // State for controlling the semester dropdown popover
  const [openSem, setOpenSem] = useState(false);
  // State for the currently selected semester value
  const [valueSem, setValueSem] = useState("");
  // State for controlling the instructor dropdown popover
  const [openInstructor, setOpenInstructor] = useState(false);
  // State for the currently selected instructor value
  const [valueInstructor, setValueInstructor] = useState("");

  /**
   * Memoized computation of sections filtered by the selected semester and instructor.
   * Re-calculates only when sections, selected semester, or selected instructor changes.
   * @returns {Section[]} The array of sections matching the current filter criteria.
   */
  const filteredSections = useMemo(() => {
    // Start with all sections if no semester is selected, otherwise filter by semester
    let semesterFiltered = valueSem ? sections.filter((section) => section.semester === valueSem) : sections;

    // If an instructor is also selected, filter further
    if (valueInstructor) {
      return semesterFiltered.filter((section) => section.instructor_name === valueInstructor);
    } else {
      return semesterFiltered; // Return only semester-filtered (or all if no semester selected)
    }
  }, [sections, valueSem, valueInstructor]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        {/* Semester Dropdown */}
        <Popover open={openSem} onOpenChange={setOpenSem}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openSem}
              className="w-full md:w-[200px] justify-between"
            >
              {valueSem || "Select semester..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search semester..." />
              <CommandList>
                <CommandEmpty>No semesters found.</CommandEmpty>
                <CommandGroup>
                  {/* Add an option to clear selection */}
                  <CommandItem
                      key="clear-semester"
                      value=""
                      onSelect={() => {
                        setValueSem("");
                        setOpenSem(false);
                      }}
                    >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        valueSem === "" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Semesters
                  </CommandItem>
                  {semesters.map((semester) => (
                    <CommandItem
                      key={semester}
                      value={semester}
                      onSelect={(currentValue) => {
                        setValueSem(currentValue === valueSem ? "" : currentValue);
                        setOpenSem(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          valueSem === semester ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {semester}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Instructor Dropdown */}
        <Popover open={openInstructor} onOpenChange={setOpenInstructor}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openInstructor}
              className="w-full md:w-[250px] justify-between"
            >
              {valueInstructor || "Select instructor..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Search instructor..." />
              <CommandList>
                <CommandEmpty>No instructors found.</CommandEmpty>
                <CommandGroup>
                   {/* Add an option to clear selection */}
                   <CommandItem
                      key="clear-instructor"
                      value=""
                      onSelect={() => {
                        setValueInstructor("");
                        setOpenInstructor(false);
                      }}
                    >
                     <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          valueInstructor === "" ? "opacity-100" : "opacity-0"
                        )}
                      />
                    All Instructors
                   </CommandItem>
                  {instructors.map((instructor) => (
                    <CommandItem
                      key={instructor}
                      value={instructor}
                      onSelect={(currentValue) => {
                        setValueInstructor(currentValue === valueInstructor ? "" : currentValue);
                        setOpenInstructor(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          valueInstructor === instructor ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {instructor}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Display Filtered Sections */}
      <div className="space-y-2">
        {filteredSections.length > 0 ? (
            // Render a SectionCard for each section matching the filter criteria
            filteredSections.map((section) => (
              <SectionCard key={section.section_id} section={section} onInstructorClick={onInstructorClick} />
            ))
          ) : (
            // Display message if no sections match the filter
            <p className="text-center text-muted-foreground py-4">No sections match the current filter.</p>
          )
        }
      </div>
    </div>
  );
};

export default PrevClasses; 
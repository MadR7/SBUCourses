'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CourseList } from '@/components/course-list'
import FilterScreen from '@/components/filter-screen'
import { useDebounce } from '@/hooks/use-debounce'
import { type Course } from '@/types/Course'
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react'
import { CourseInfoDialog } from '@/components/course-info-dialog'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Props for the CoursePage component.
 * @property initialCourses - The initial list of courses fetched by the parent server component.
 * @property initialDepartments - The list of all available department codes.
 * @property initialSBCs - The list of all available SBC codes.
 */
interface CourseSearchProps {
    initialCourses: Course[]
    initialDepartments: (string | null)[]
    initialSBCs: string[]
}

/**
 * Client-side component responsible for displaying courses and handling user interactions 
 * like searching, filtering, and viewing course details.
 * 
 * It receives initial data from its parent server component (`app/page.tsx`) and manages 
 * filtering state by synchronizing it with URL search parameters. Updates to filters 
 * trigger a URL change, causing the parent component to refetch data and pass updated 
 * `initialCourses` back down.
 * 
 * @param initialCourses - The initial list of courses to display, potentially pre-filtered by the server based on initial URL params.
 * @param initialDepartments - List of all available departments for the filter UI.
 * @param initialSBCs - List of all available SBCs for the filter UI.
 * @returns JSX element containing the interactive course search and display interface.
 */
export function CoursePage({ initialCourses, initialDepartments, initialSBCs }: CourseSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentMajors = useMemo(() => searchParams.get("majors")?.split(",").filter(Boolean) || [], [searchParams]);
    const currentSBCs = useMemo(() => searchParams.get("sbcs")?.split(",").filter(Boolean) || [], [searchParams]);
    const currentSearch = searchParams.get("search") || "";

    const [searchInput, setSearchInput] = useState(currentSearch);
    const debouncedSearchInput = useDebounce(searchInput, 250).trim();

    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const [selectedCourseInfo, setSelectedCourseInfo] = useState<Course | null>(null);
    const [showSelectedCourses, setShowSelectedCourses] = useState(true);
    const [filterScreen, setFilterScreen] = useState(false);
    const [popUp, setPopUp] = useState(false);

    const toggleCourse = useCallback((course: Course) => {
        // if (selectedCourses.includes(course)){
        //     setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
        // }else{
        //     setSelectedCourses([...selectedCourses, course]);
        // }
    }, []);

    const handleCourseInfo = useCallback((course: Course) => {
        setPopUp(true);
        setSelectedCourseInfo(course);
    }, []);

    const handleCloseCourseInfo = useCallback(() => {
        setSelectedCourseInfo(null);
    }, []);

    const updateFilters = useCallback(
        (majors: string[], sbcs: string[], search?: string) => {
            const params = new URLSearchParams();

            if (majors.length){
                params.set("majors", majors.join(","));
            } else {
                params.delete("majors");
            }
            if (sbcs.length){
                params.set("sbcs", sbcs.join(","));
            } else {
                params.delete("sbcs");
            }
            if (search){
                params.set("search", search);
            } else {
                params.delete("search");
            }

            router.replace(`/?${params.toString()}`, { scroll: false });
        }, 
        [router]
    );

    const handleFilterClick = () => setFilterScreen(true);

    const handleMajorsChange = useCallback(
        (majors: string[]) => {
            updateFilters(majors, currentSBCs, debouncedSearchInput);
        },
        [updateFilters, currentSBCs, debouncedSearchInput]
    );

    const handleSBCsChange = useCallback(
        (sbcs: string[]) => {
            updateFilters(currentMajors, sbcs, debouncedSearchInput);
        },
        [updateFilters, currentMajors, debouncedSearchInput]
    );

    const handleSearchChange = useCallback(
        (search: string) => {
            setSearchInput(search);
        },
        []
    );
    useEffect(() => {
        updateFilters(currentMajors, currentSBCs, debouncedSearchInput);
    }, [debouncedSearchInput, currentMajors, currentSBCs, updateFilters]);
    
    useEffect(() => {
        if (!searchParams.get("search")) {
            setSearchInput("");
            updateFilters(currentMajors, currentSBCs, "");
        }
    }, [searchParams, currentMajors, currentSBCs, updateFilters]);
    

    const availableCourses = useMemo(
        () =>
            initialCourses.filter(
                (course) => !selectedCourses.some((selected) => selected.course_id === course.course_id)
            ),
        [initialCourses, selectedCourses]
    );
    const handlePopUpClose = () => {
        setPopUp(false);
        handleCloseCourseInfo();
    }
    return (
        <div>
            {popUp && <CourseInfoDialog popUp={popUp} course={selectedCourseInfo} handleClose={handlePopUpClose}/>}
            {filterScreen && <FilterScreen initialDepartments={initialDepartments} initialSBCs={initialSBCs} filterScreen={filterScreen} setFilterScreen={setFilterScreen} setMajorsSelected={handleMajorsChange} setSBCSelected={handleSBCsChange} />}
            <div>
                {/* <section className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {selectedCourses.length > 0 && (
                        <div className="mb-6">
                            <div 
                                className="flex items-center gap-2 cursor-pointer mb-2"
                                onClick={() => setShowSelectedCourses(!showSelectedCourses)}
                            >
                                <h2 className="text-lg font-semibold">Your Courses</h2>
                                {showSelectedCourses ? (
                                <ChevronUp className="w-4 h-4" />
                                ) : (
                                <ChevronDown className="w-4 h-4" />
                                )}
                            </div>
                            {showSelectedCourses && (
                                <CourseList 
                                    courses={selectedCourses}
                                    isSelected={true} 
                                    onToggleCourse={toggleCourse}
                                    onInfoClick={handleCourseInfo}
                                />
                            )}
                        </div>
                    )}
                    </div>
                </section> */}

                <section>
                    <div className="relative flex flex-row items-center justify-center mb-4">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses, descriptions, etc"
                            className="w-full bg-gray-100 text-black pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                            onChange={(e) => handleSearchChange(e.target.value)}
                            value={searchInput}
                        />
                        <button onClick={handleFilterClick}><SlidersHorizontal className="w-8 h-8 ml-2"/></button>
                    </div>
                    <CourseList 
                        courses={availableCourses}
                        isSelected={false}
                        onToggleCourse={toggleCourse}
                        onInfoClick={handleCourseInfo}
                    />

                    
                </section>
            </div>
            
        </div>
    )
}

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CourseList } from '@/components/course-list'
import FilterScreen from '@/components/filter-screen'
import { useDebounce } from '@/hooks/use-debounce'
import { type Course } from '@/types/Course'
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react'
import { CourseInfoDialog } from '@/components/course-info-dialog'
import { useRouter, useSearchParams } from 'next/navigation'

interface CourseSearchProps {
    initialCourses: Course[]
    initialDepartments: (string | null)[]
    initialSBCs: string[]
}

export function CoursePage({ initialCourses, initialDepartments, initialSBCs }: CourseSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentMajors = useMemo(() => searchParams.get("majors")?.split(",").filter(Boolean) || [], [searchParams]);
    const currentSBCs = useMemo(() => searchParams.get("sbcs")?.split(",").filter(Boolean) || [], [searchParams]);
    const currentSearch = searchParams.get("search") || "";

    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const [selectedCourseInfo, setSelectedCourseInfo] = useState<Course | null>(null);
    const [showSelectedCourses, setShowSelectedCourses] = useState(true);
    const [filterScreen, setFilterScreen] = useState(false);

    const toggleCourse = (course: Course) => {
    if (selectedCourses.includes(course)){
        setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    }else{
        setSelectedCourses([...selectedCourses, course]);
    }
    };

    const updateFilters = useCallback(
        (majors: string[], sbcs: string[], search?: string) => {
            const params = new URLSearchParams();

            if (majors.length){
                params.set("majors", majors.join(","));
            }else{
                params.delete("majors");
            }
            if (sbcs.length){
                params.set("sbcs", sbcs.join(","));
            }else{
                params.delete("sbcs");
            }
            if (search){
                params.set("search", search);
            }else{
                params.delete("search");
            }

            router.replace(`/?${params.toString()}`, { scroll: false });
        }, 
        [router, searchParams]
    );
    

    const handleFilterClick = () => setFilterScreen(true);
    
    const handleMajorsChange = useCallback(
        (majors: string[]) => {
            updateFilters(majors, currentSBCs, currentSearch);
        },
        [updateFilters, currentSBCs, currentSearch]
    )

    const handleSBCsChange = useCallback(
        (sbcs: string[]) => {
            updateFilters(currentMajors, sbcs, currentSearch);
        },
        [updateFilters, currentMajors, currentSearch]
    )

    const handleSearchChange = useCallback(
        (search: string) => {
            updateFilters(currentMajors, currentSBCs, search);
        },
        [updateFilters, currentMajors, currentSBCs]
    )

    const availableCourses = useMemo(
        () =>
            initialCourses.filter(
                (course) => !selectedCourses.some((selected) => selected.id === course.id)
            ),
        [initialCourses, selectedCourses]
    );
        
    return (
        <div>
            {filterScreen && <FilterScreen initialDepartments={initialDepartments} initialSBCs={initialSBCs} filterScreen={filterScreen} setFilterScreen={setFilterScreen} setMajorsSelected={handleMajorsChange} setSBCSelected={handleSBCsChange} />}
            <div>
                <section className="mb-8">
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
                            onInfoClick={setSelectedCourseInfo}
                            />
                        )}
                        </div>
                    )}
                        
                    </div>
                </section>

                <section>
                    <div className="relative flex flex-row items-center justify-center mb-4">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                        type="text"
                        placeholder="Search courses, sbcs, etc"
                        className="w-full bg-gray-100 text-black pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                        onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        <button onClick={handleFilterClick}><SlidersHorizontal className="w-8 h-8 ml-2"/></button>
                    </div>
                    <CourseList 
                        courses={availableCourses}
                        isSelected={false}
                        onToggleCourse={toggleCourse}
                        onInfoClick={setSelectedCourseInfo}

                    />
                </section>
            </div>
            <CourseInfoDialog
                course={selectedCourseInfo}
                isOpen={!!selectedCourseInfo}
                onClose={() => setSelectedCourseInfo(null)}
            />
    </div>
    )
}
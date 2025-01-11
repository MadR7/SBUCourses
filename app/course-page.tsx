'use client'

import { useCallback, useEffect, useState } from 'react'
import { CourseList } from '@/components/course-list'
import FilterScreen from '@/components/filter-screen'
import { useDebounce } from '@/hooks/use-debounce'
import { type Course } from '@/types/Course'
import { useCourseStore } from '@/stores/courseStore'
import { useFilterStore } from '@/stores/filterStore'
import {
    parseAsArrayOf,
    parseAsString,
    useQueryState,
  } from "nuqs";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react'
import { CourseInfoDialog } from '@/components/course-info-dialog'

interface CourseSearchProps {
    initialDepartments: (string | null)[]
    initialSBCs: string[]
}

export function CoursePage({ initialDepartments, initialSBCs }: CourseSearchProps) {

    const [majorsSelected, setMajorSelected] = useQueryState(
        "majors",
        parseAsArrayOf(parseAsString).withDefault([])
      );
    const [sbcsSelected, setSBCSelected] = useQueryState(
    "sbcs",
    parseAsArrayOf(parseAsString).withDefault([])
    );
    const {
    courses,
    selectedCourses,
    selectedCourseInfo,
    showSelectedCourses,
    fetchCourses,
    courseActions
    } = useCourseStore();

    const {
    search,
    filterScreen,
    filterActions,
    } = useFilterStore();

    const debouncedSearch = useDebounce(search, 150)
    const toggleCourse = (course: Course) => {
    if (selectedCourses.includes(course)){
        courseActions.setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    }else{
        courseActions.setSelectedCourses([...selectedCourses, course]);
    }
    };
    const handleFilterClick = () => filterActions.setFilterScreen(true);
    useEffect(() => {
        fetchCourses({sbc:sbcsSelected, department: majorsSelected, search: debouncedSearch});
    }, [fetchCourses, sbcsSelected, majorsSelected, debouncedSearch]);
    const availableCourses = courses.filter(
        course => !selectedCourses.some(selected => selected.id === course.id)
    );
        
    return (
        <div>
            {filterScreen && <FilterScreen initialDepartments={initialDepartments} initialSBCs={initialSBCs} setMajorsSelected={setMajorSelected} setSBCSelected={setSBCSelected} />}
            <div>
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {selectedCourses.length > 0 && (
                        <div className="mb-6">
                        <div 
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => courseActions.setShowSelectedCourses(!showSelectedCourses)}
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
                            onInfoClick={courseActions.setSelectedCourseInfo}
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
                        onChange={(e) => filterActions.setSearch(e.target.value)}
                        />
                        <button onClick={handleFilterClick}><SlidersHorizontal className="w-8 h-8 ml-2"/></button>
                    </div>
                    <CourseList 
                        courses={availableCourses}
                        isSelected={false}
                        onToggleCourse={toggleCourse}
                        onInfoClick={courseActions.setSelectedCourseInfo}

                    />
                </section>
            </div>
            <CourseInfoDialog
                course={selectedCourseInfo}
                isOpen={!!selectedCourseInfo}
                onClose={() => courseActions.setSelectedCourseInfo(null)}
            />
    </div>
    )
}